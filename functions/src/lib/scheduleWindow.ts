import { FieldValue, Firestore } from "firebase-admin/firestore";

type ActivityType = "chat" | "lesson";
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

interface WeeklyBlock {
  day: DayKey;
  time: string;
  type: ActivityType;
  durationMinutes: number;
}

interface MarkScheduleWindowInput {
  db: Firestore;
  uid: string;
  sessionId: string;
  sessionType: ActivityType;
  startedAt: Date;
  toleranceWindowMinutes?: number;
}

const DAY_TO_WEEKDAY: Record<DayKey, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
};

function parseWeeklyBlocks(raw: unknown): WeeklyBlock[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const block = item as Record<string, unknown>;

      const day = block.day;
      const time = block.time;
      const type = block.type;
      const durationMinutes = block.durationMinutes;

      if (
        typeof day !== "string" ||
        !(day in DAY_TO_WEEKDAY) ||
        typeof time !== "string" ||
        !/^([01]\d|2[0-3]):(00|15|30|45)$/.test(time) ||
        (type !== "chat" && type !== "lesson")
      ) {
        return null;
      }

      return {
        day: day as DayKey,
        time,
        type,
        durationMinutes:
          typeof durationMinutes === "number" && durationMinutes > 0
            ? durationMinutes
            : 15,
      } satisfies WeeklyBlock;
    })
    .filter((item): item is WeeklyBlock => item !== null);
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildScheduledDate(baseDate: Date, weekday: number, time: string): Date {
  const date = new Date(baseDate);
  date.setHours(0, 0, 0, 0);

  const weekdayDiff = weekday - date.getDay();
  date.setDate(date.getDate() + weekdayDiff);

  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export async function markScheduleLogForSessionStart({
  db,
  uid,
  sessionId,
  sessionType,
  startedAt,
  toleranceWindowMinutes = 75,
}: MarkScheduleWindowInput): Promise<void> {
  const userRef = db.doc(`users/${uid}`);
  const userSnap = await userRef.get();
  if (!userSnap.exists) return;

  const weeklyBlocks = parseWeeklyBlocks(userSnap.data()?.weeklyBlocks);
  if (weeklyBlocks.length === 0) return;

  const candidates = weeklyBlocks
    .filter((block) => block.type === sessionType)
    .flatMap((block) => {
      const weekday = DAY_TO_WEEKDAY[block.day];
      return [-1, 0, 1].map((dayOffset) => {
        const base = new Date(startedAt);
        base.setDate(base.getDate() + dayOffset);
        const scheduledAt = buildScheduledDate(base, weekday, block.time);
        const diffMinutes = Math.abs(startedAt.getTime() - scheduledAt.getTime()) / 60000;
        return { block, scheduledAt, diffMinutes };
      });
    });

  if (candidates.length === 0) return;

  candidates.sort((a, b) => a.diffMinutes - b.diffMinutes);
  const nearest = candidates[0];

  if (nearest.diffMinutes > toleranceWindowMinutes) {
    await db.collection(`users/${uid}/scheduleAlerts`).add({
      sessionId,
      sessionType,
      reason: "outside_tolerance_window",
      nearestDiffMinutes: Math.round(nearest.diffMinutes),
      toleranceWindowMinutes,
      startedAt: startedAt.toISOString(),
      createdAt: FieldValue.serverTimestamp(),
    });
    return;
  }

  const scheduledDate = toIsoDate(nearest.scheduledAt);
  const logId = `${scheduledDate}_${nearest.block.time}`;

  await db.doc(`users/${uid}/scheduleLogs/${logId}`).set(
    {
      scheduledDate,
      scheduledTime: nearest.block.time,
      type: nearest.block.type,
      durationMinutes: nearest.block.durationMinutes,
      status: "completed",
      sessionId,
      completedAt: FieldValue.serverTimestamp(),
      toleranceWindowMinutes,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
