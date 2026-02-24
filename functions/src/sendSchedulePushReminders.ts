import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as webpush from "web-push";

type ActivityType = "chat" | "lesson";
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

interface WeeklyBlock {
  day: DayKey;
  time: string;
  type: ActivityType;
}

interface SubscriptionDoc {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface TimeParts {
  dayKey: DayKey;
  time: string;
  isoDate: string;
}

const webPushPublicKey = defineSecret("WEB_PUSH_PUBLIC_KEY");
const webPushPrivateKey = defineSecret("WEB_PUSH_PRIVATE_KEY");
const webPushSubject = defineSecret("WEB_PUSH_SUBJECT");
const DEFAULT_TIMEZONE = "America/Asuncion";

const WEEKDAY_MAP: Record<string, DayKey> = {
  Sun: "sun",
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
};

function parseWeeklyBlocks(raw: unknown): WeeklyBlock[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const value = item as Record<string, unknown>;
      if (
        (value.day !== "mon" &&
          value.day !== "tue" &&
          value.day !== "wed" &&
          value.day !== "thu" &&
          value.day !== "fri" &&
          value.day !== "sat" &&
          value.day !== "sun") ||
        typeof value.time !== "string" ||
        !/^([01]\d|2[0-3]):(00|15|30|45)$/.test(value.time) ||
        (value.type !== "chat" && value.type !== "lesson")
      ) {
        return null;
      }

      return {
        day: value.day,
        time: value.time,
        type: value.type,
      } as WeeklyBlock;
    })
    .filter((item): item is WeeklyBlock => item !== null);
}

function toTimeParts(date: Date, timezone: string): TimeParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const lookup = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  const weekdayRaw = lookup("weekday");
  const dayKey = WEEKDAY_MAP[weekdayRaw] ?? "mon";
  const year = lookup("year");
  const month = lookup("month");
  const day = lookup("day");
  const hour = lookup("hour");
  const minute = lookup("minute");

  return {
    dayKey,
    time: `${hour}:${minute}`,
    isoDate: `${year}-${month}-${day}`,
  };
}

function payloadFor(type: ActivityType, phase: "pre" | "now"): { title: string; body: string; url: string } {
  if (phase === "pre") {
    return {
      title: "Lembrete de estudo",
      body: `Daqui a 5 minutos: seu bloco de ${type === "chat" ? "chat" : "lição"} começa`,
      url: type === "chat" ? "/chat" : "/lessons",
    };
  }

  return {
    title: "Hora de estudar!",
    body: `Hora de estudar! Seu bloco de ${type === "chat" ? "chat" : "lição"} começa agora.`,
    url: type === "chat" ? "/chat" : "/lessons",
  };
}

async function sendToSubscriptions(
  uid: string,
  subscriptions: SubscriptionDoc[],
  payload: { title: string; body: string; url: string },
): Promise<void> {
  const db = getFirestore();

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
      } catch (error: unknown) {
        const statusCode =
          typeof error === "object" && error !== null && "statusCode" in error
            ? Number((error as { statusCode: number }).statusCode)
            : undefined;

        if (statusCode === 404 || statusCode === 410) {
          const stale = await db
            .collection(`users/${uid}/pushSubscriptions`)
            .where("endpoint", "==", subscription.endpoint)
            .get();
          await Promise.all(stale.docs.map((item) => item.ref.delete()));
        } else {
          console.error("Push send failed:", { uid, statusCode, error });
        }
      }
    }),
  );
}

export const dispatchSchedulePushReminders = onSchedule(
  {
    schedule: "every 5 minutes",
    timeZone: DEFAULT_TIMEZONE,
    secrets: [webPushPublicKey, webPushPrivateKey, webPushSubject],
    region: "us-east1",
  },
  async () => {
    const publicKey = webPushPublicKey.value();
    const privateKey = webPushPrivateKey.value();
    const subject = webPushSubject.value() || "mailto:no-reply@espanhol.local";

    if (!publicKey || !privateKey) {
      console.warn("WEB_PUSH_PUBLIC_KEY/WEB_PUSH_PRIVATE_KEY are not configured.");
      return;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const db = getFirestore();
    const userSnaps = await db.collection("users").get();
    const now = new Date();
    const plusFive = new Date(now.getTime() + 5 * 60 * 1000);

    for (const userDoc of userSnaps.docs) {
      const uid = userDoc.id;
      const userData = userDoc.data() as Record<string, unknown>;
      const timezone =
        typeof userData.timezone === "string" && userData.timezone.length > 0
          ? userData.timezone
          : DEFAULT_TIMEZONE;

      const blocks = parseWeeklyBlocks(userData.weeklyBlocks);
      if (blocks.length === 0) continue;

      const current = toTimeParts(now, timezone);
      const soon = toTimeParts(plusFive, timezone);
      const due = blocks.flatMap((block) => {
        const events: Array<{ phase: "pre" | "now"; block: WeeklyBlock; date: string }> = [];
        if (block.day === current.dayKey && block.time === current.time) {
          events.push({ phase: "now", block, date: current.isoDate });
        }
        if (block.day === soon.dayKey && block.time === soon.time) {
          events.push({ phase: "pre", block, date: soon.isoDate });
        }
        return events;
      });

      if (due.length === 0) continue;

      const subsSnap = await db.collection(`users/${uid}/pushSubscriptions`).get();
      const subscriptions = subsSnap.docs
        .map((item) => item.data() as Partial<SubscriptionDoc>)
        .filter(
          (item): item is SubscriptionDoc =>
            typeof item.endpoint === "string" &&
            !!item.keys &&
            typeof item.keys.p256dh === "string" &&
            typeof item.keys.auth === "string",
        );
      if (subscriptions.length === 0) continue;

      for (const event of due) {
        const dispatchId = `${event.date}_${event.block.time}_${event.phase}`;
        const dispatchRef = db.doc(`users/${uid}/notificationDispatch/${dispatchId}`);
        const alreadyDispatched = await dispatchRef.get();
        if (alreadyDispatched.exists) continue;

        const payload = payloadFor(event.block.type, event.phase);
        await sendToSubscriptions(uid, subscriptions, payload);

        await dispatchRef.set({
          scheduledDate: event.date,
          scheduledTime: event.block.time,
          phase: event.phase,
          type: event.block.type,
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    }
  },
);
