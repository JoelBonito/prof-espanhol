import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Select';
import { auth, db } from '../lib/firebase';
import {
  ensurePushSubscription,
  getPushPermission,
  isPushSupported,
} from '../features/notifications/push';

type ActivityType = 'chat' | 'lesson';
type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

interface WeeklyBlock {
  day: DayKey;
  time: string;
  type: ActivityType;
  durationMinutes: number;
}

interface ParsedState {
  slots: Record<string, ActivityType>;
  hasSchedule: boolean;
}

const DAYS: Array<{ key: DayKey; label: string; weekday: number }> = [
  { key: 'mon', label: 'Seg', weekday: 1 },
  { key: 'tue', label: 'Ter', weekday: 2 },
  { key: 'wed', label: 'Qua', weekday: 3 },
  { key: 'thu', label: 'Qui', weekday: 4 },
  { key: 'fri', label: 'Sex', weekday: 5 },
  { key: 'sat', label: 'Sáb', weekday: 6 },
  { key: 'sun', label: 'Dom', weekday: 0 },
];

const SLOT_MINUTES = 15;
const MIN_BLOCKS = 3;
const TOLERANCE_MINUTES = 75;

function slotToTime(slotIndex: number): string {
  const hour = Math.floor(slotIndex / 4);
  const minutes = (slotIndex % 4) * SLOT_MINUTES;
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function timeToSlot(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23) return null;
  if (![0, 15, 30, 45].includes(minutes)) return null;
  return hours * 4 + minutes / SLOT_MINUTES;
}

function getSlotKey(day: DayKey, slot: number): string {
  return `${day}-${slot}`;
}

function parseStoredSchedule(rawData: unknown): ParsedState {
  if (!rawData || typeof rawData !== 'object') {
    return { slots: {}, hasSchedule: false };
  }

  const data = rawData as Record<string, unknown>;
  const slots: Record<string, ActivityType> = {};
  const weeklyBlocks = data.weeklyBlocks;

  if (Array.isArray(weeklyBlocks)) {
    for (const item of weeklyBlocks) {
      if (!item || typeof item !== 'object') continue;
      const block = item as Record<string, unknown>;
      const day = block.day;
      const time = block.time;
      const type = block.type;
      if (
        typeof day === 'string' &&
        DAYS.some((d) => d.key === day) &&
        typeof time === 'string' &&
        (type === 'chat' || type === 'lesson')
      ) {
        const slot = timeToSlot(time);
        if (slot === null) continue;
        slots[getSlotKey(day as DayKey, slot)] = type;
      }
    }

    return { slots, hasSchedule: Object.keys(slots).length > 0 };
  }

  const legacySchedule = data.scheduleWeekly;
  if (legacySchedule && typeof legacySchedule === 'object') {
    for (const [day, times] of Object.entries(legacySchedule as Record<string, unknown>)) {
      if (!DAYS.some((d) => d.key === day)) continue;
      if (!Array.isArray(times)) continue;
      for (const time of times) {
        if (typeof time !== 'string') continue;
        const slot = timeToSlot(time);
        if (slot === null) continue;
        slots[getSlotKey(day as DayKey, slot)] = 'lesson';
      }
    }
  }

  return { slots, hasSchedule: Object.keys(slots).length > 0 };
}

function nextDateForWeekday(base: Date, weekday: number, offsetDays = 0): Date {
  const date = new Date(base);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);

  const delta = (weekday - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + delta);
  return date;
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

async function markPastMissedSlots(uid: string, blocks: WeeklyBlock[]) {
  const logsRef = collection(db, 'users', uid, 'scheduleLogs');
  const now = new Date();

  for (const block of blocks) {
    const weekday = DAYS.find((d) => d.key === block.day)?.weekday ?? 1;

    for (let offset = -7; offset <= 0; offset += 1) {
      const date = nextDateForWeekday(now, weekday, offset);
      const [hours, minutes] = block.time.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);

      const slotEndsAt = new Date(date.getTime() + block.durationMinutes * 60 * 1000);
      if (slotEndsAt >= now) continue;

      const scheduledDate = toIsoDate(date);
      const logId = `${scheduledDate}_${block.time}`;
      const logRef = doc(logsRef, logId);
      const snap = await getDoc(logRef);

      if (snap.exists()) continue;

      await setDoc(logRef, {
        scheduledDate,
        scheduledTime: block.time,
        status: 'missed',
        sessionId: null,
        completedAt: null,
        toleranceWindowMinutes: TOLERANCE_MINUTES,
        type: block.type,
        durationMinutes: block.durationMinutes,
        updatedAt: serverTimestamp(),
      });
    }
  }
}

export default function SchedulePage() {
  const [slots, setSlots] = useState<Record<string, ActivityType>>({});
  const [activeType, setActiveType] = useState<ActivityType>('lesson');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [hasSavedSchedule, setHasSavedSchedule] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(
    'unsupported',
  );
  const [pushSaving, setPushSaving] = useState(false);

  const dragMode = useRef<'add' | 'remove' | null>(null);
  const pointerDown = useRef(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slotCount = useMemo(() => Object.keys(slots).length, [slots]);

  const weeklyBlocks = useMemo<WeeklyBlock[]>(
    () =>
      Object.entries(slots)
        .map(([key, type]) => {
          const [day, slotRaw] = key.split('-');
          const slot = Number(slotRaw);
          if (!DAYS.some((d) => d.key === day) || Number.isNaN(slot)) return null;
          return {
            day: day as DayKey,
            time: slotToTime(slot),
            type,
            durationMinutes: SLOT_MINUTES,
          };
        })
        .filter((item): item is WeeklyBlock => item !== null)
        .sort((a, b) => {
          const dayDiff =
            DAYS.findIndex((d) => d.key === a.day) - DAYS.findIndex((d) => d.key === b.day);
          if (dayDiff !== 0) return dayDiff;
          return a.time.localeCompare(b.time);
        }),
    [slots],
  );

  const persistSchedule = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setUnauthenticated(true);
      return false;
    }

    if (slotCount < MIN_BLOCKS) {
      setErrorMessage('Minimo de 3 blocos por semana para garantir progresso');
      setMessage(null);
      return false;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const scheduleMap: Record<string, string[]> = DAYS.reduce((acc, day) => {
        acc[day.key] = weeklyBlocks.filter((block) => block.day === day.key).map((block) => block.time);
        return acc;
      }, {} as Record<string, string[]>);

      await updateDoc(doc(db, 'users', uid), {
        weeklyBlocks,
        scheduleWeekly: scheduleMap,
        scheduleMinBlocks: MIN_BLOCKS,
        updatedAt: serverTimestamp(),
      });

      await markPastMissedSlots(uid, weeklyBlocks);

      setHasSavedSchedule(true);
      setDirty(false);
      setMessage('Agenda salva com sucesso.');
      return true;
    } catch (error) {
      console.error('Failed to save schedule:', error);
      setErrorMessage('Nao foi possivel salvar sua agenda. Tente novamente.');
      setMessage(null);
      return false;
    } finally {
      setSaving(false);
    }
  }, [slotCount, weeklyBlocks]);

  useEffect(() => {
    let active = true;
    const uid = auth.currentUser?.uid;

    if (!uid) {
      setUnauthenticated(true);
      setLoading(false);
      return;
    }

    const userId = uid;

    async function loadSchedule() {
      try {
        const userSnap = await getDoc(doc(db, 'users', userId));
        const parsed = parseStoredSchedule(userSnap.data());
        if (!active) return;
        setSlots(parsed.slots);
        setHasSavedSchedule(parsed.hasSchedule);
      } catch (error) {
        console.error('Failed to load schedule:', error);
        if (!active) return;
        setErrorMessage('Nao foi possivel carregar sua agenda.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSchedule();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setPushSupported(isPushSupported());
    setPushPermission(getPushPermission());
  }, []);

  useEffect(() => {
    if (!hasSavedSchedule || !dirty || slotCount < MIN_BLOCKS) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      void persistSchedule();
    }, 700);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [dirty, hasSavedSchedule, persistSchedule, slotCount]);

  const applySlotChange = (day: DayKey, slot: number) => {
    const key = getSlotKey(day, slot);
    setSlots((prev) => {
      const next = { ...prev };
      const exists = key in next;

      if (dragMode.current === 'remove') {
        if (exists) delete next[key];
      } else {
        next[key] = activeType;
      }

      return next;
    });
    setDirty(true);
  };

  const handlePointerDown = (day: DayKey, slot: number) => {
    pointerDown.current = true;
    const key = getSlotKey(day, slot);
    const exists = key in slots;
    dragMode.current = exists ? 'remove' : 'add';
    applySlotChange(day, slot);
  };

  const handlePointerEnter = (day: DayKey, slot: number) => {
    if (!pointerDown.current || !dragMode.current) return;
    applySlotChange(day, slot);
  };

  const enablePushNotifications = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setErrorMessage('Faça login para ativar notificações.');
      return;
    }

    setPushSaving(true);
    const result = await ensurePushSubscription(uid);
    setPushSaving(false);
    setPushPermission(getPushPermission());

    if (!result.ok) {
      if (result.reason === 'missing_vapid') {
        setErrorMessage('Configuração de push ausente (VITE_WEB_PUSH_PUBLIC_KEY).');
        return;
      }
      if (result.reason === 'denied') {
        setErrorMessage(
          'Notificações bloqueadas no navegador. Ative nas configurações do iPad/Safari.',
        );
        return;
      }
      if (result.reason === 'unsupported') {
        setErrorMessage('Este navegador não suporta Web Push.');
        return;
      }
      setErrorMessage('Não foi possível ativar as notificações.');
      return;
    }

    setMessage('Notificações ativadas: lembretes em T-5 min e no início do bloco.');
  };

  const stopPaint = () => {
    pointerDown.current = false;
    dragMode.current = null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-bold text-neutral-900">Minha Agenda</h1>
        <Card className="p-6">
          <p className="text-sm text-neutral-500">Carregando agenda semanal...</p>
        </Card>
      </div>
    );
  }

  if (unauthenticated) {
    return (
      <EmptyState
        icon="lock"
        title="Entre na sua conta"
        description="Faça login para configurar sua agenda semanal."
      />
    );
  }

  return (
    <div className="space-y-5" onPointerUp={stopPaint} onPointerLeave={stopPaint}>
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-neutral-900">Minha Agenda</h1>
        <p className="font-body text-neutral-500">
          Defina blocos fixos de 15 minutos. Minimo de 3 blocos por semana.
        </p>
      </header>

      <Card className="p-5 md:p-6 space-y-4">
        <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-body text-sm font-semibold text-neutral-900">Lembretes Push</p>
              <p className="font-body text-xs text-neutral-600">
                Receba notificações 5 minutos antes e no horário exato do bloco.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  !pushSupported || pushPermission === 'denied'
                    ? 'overdue'
                    : pushPermission === 'granted'
                      ? 'completed'
                      : 'pending'
                }
              >
                {pushPermission === 'granted'
                  ? 'Ativado'
                  : pushPermission === 'denied'
                    ? 'Bloqueado'
                    : !pushSupported
                      ? 'Indisponível'
                      : 'Pendente'}
              </Badge>
              <Button
                variant="secondary"
                onClick={enablePushNotifications}
                disabled={!pushSupported || pushPermission === 'granted'}
                isLoading={pushSaving}
              >
                Ativar
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="info">{slotCount} blocos</Badge>
            <span className="text-sm text-neutral-600">Cada bloco = 15 minutos</span>
          </div>
          <div className="w-full sm:w-48">
            <Select
              label="Tipo de bloco"
              value={activeType}
              onChange={(event) => setActiveType(event.target.value as ActivityType)}
            >
              <option value="lesson">Lição</option>
              <option value="chat">Chat</option>
            </Select>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white overflow-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[72px_repeat(7,minmax(90px,1fr))] border-b border-neutral-200 bg-neutral-50 sticky top-0 z-10">
              <div className="text-xs font-semibold text-neutral-500 px-2 py-2">Hora</div>
              {DAYS.map((day) => (
                <div key={day.key} className="text-xs font-semibold text-neutral-700 px-2 py-2 text-center">
                  {day.label}
                </div>
              ))}
            </div>

            {Array.from({ length: 96 }).map((_, slot) => {
              const showHourLabel = slot % 4 === 0;
              return (
                <div
                  key={slot}
                  className="grid grid-cols-[72px_repeat(7,minmax(90px,1fr))] border-b border-neutral-100"
                >
                  <div className="text-[11px] text-neutral-500 px-2 py-1.5 border-r border-neutral-100">
                    {showHourLabel ? slotToTime(slot) : ''}
                  </div>
                  {DAYS.map((day) => {
                    const key = getSlotKey(day.key, slot);
                    const type = slots[key];
                    const isActive = Boolean(type);

                    return (
                      <button
                        key={key}
                        type="button"
                        onPointerDown={() => handlePointerDown(day.key, slot)}
                        onPointerEnter={() => handlePointerEnter(day.key, slot)}
                        className={[
                          'h-6 border-r border-neutral-100 transition-colors touch-none',
                          isActive
                            ? type === 'chat'
                              ? 'bg-primary-500/70'
                              : 'bg-success/60'
                            : 'bg-white hover:bg-neutral-100',
                        ].join(' ')}
                        aria-label={`${day.label} ${slotToTime(slot)} ${isActive ? `selecionado (${type})` : 'vazio'}`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <span className="inline-block w-3 h-3 rounded bg-success/60" />
            Lição
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <span className="inline-block w-3 h-3 rounded bg-primary-500/70" />
            Chat
          </div>
          <div className="text-xs text-neutral-500">Toque e arraste para marcar ou remover.</div>
        </div>

        {errorMessage && (
          <Card status="error" className="p-4">
            <p className="text-sm text-neutral-700">{errorMessage}</p>
          </Card>
        )}

        {message && (
          <Card status="success" className="p-4">
            <p className="text-sm text-neutral-700">{message}</p>
          </Card>
        )}

        <div className="flex justify-end">
          <Button onClick={() => void persistSchedule()} isLoading={saving}>
            Salvar Agenda
          </Button>
        </div>
      </Card>
    </div>
  );
}
