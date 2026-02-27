import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import type { UserProgress, CEFRLevel } from '../types/progress';

const TTL_MS = 5 * 60 * 1000;
interface CachedProgressData { data: UserProgress; fetchedAt: number; uid: string }
let progressCache: CachedProgressData | null = null;

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function trend(current: number, previous: number): 'up' | 'down' | 'stable' {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'stable';
}

export function useProgressData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const user = auth.currentUser;
      if (!user) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }

      if (
        progressCache &&
        progressCache.uid === user.uid &&
        Date.now() - progressCache.fetchedAt < TTL_MS
      ) {
        setData(progressCache.data);
        setLoading(false);
        return;
      }

      try {
        // Latest 2 completed diagnostics from the correct subcollection
        const diagRef = collection(db, 'users', user.uid, 'diagnostics');
        const diagSnap = await getDocs(
          query(
            diagRef,
            where('status', '==', 'completed'),
            orderBy('completedAt', 'desc'),
            limit(2),
          ),
        );

        const latest = diagSnap.docs[0]?.data() ?? null;
        const previous = diagSnap.docs[1]?.data() ?? null;

        const grammarScore: number = latest?.grammarScore ?? 0;
        const listeningScore: number = latest?.listeningScore ?? 0;
        const pronunciationScore: number = latest?.pronunciationScore ?? 0;
        const level = (latest?.levelAssigned ?? 'A1') as CEFRLevel;

        const prevGrammar: number = previous?.grammarScore ?? grammarScore;
        const prevListening: number = previous?.listeningScore ?? listeningScore;
        const prevPronunciation: number = previous?.pronunciationScore ?? pronunciationScore;

        // Weekly activity — query scheduleLogs for current Mon–Sun window
        const monday = getMondayOfWeek(new Date());
        const nextMonday = new Date(monday);
        nextMonday.setDate(monday.getDate() + 7);

        const logsSnap = await getDocs(
          query(
            collection(db, 'users', user.uid, 'scheduleLogs'),
            where('scheduledDate', '>=', toIsoDate(monday)),
            where('scheduledDate', '<', toIsoDate(nextMonday)),
          ),
        );

        const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const weekMap: Record<string, { completed: number; scheduled: number }> = {};
        for (const logDoc of logsSnap.docs) {
          const log = logDoc.data();
          const dateStr = typeof log.scheduledDate === 'string' ? log.scheduledDate : null;
          if (!dateStr) continue;
          const [y, m, d] = dateStr.split('-').map(Number);
          const dayLabel = DAY_NAMES[new Date(y, m - 1, d).getDay()];
          if (!weekMap[dayLabel]) weekMap[dayLabel] = { completed: 0, scheduled: 0 };
          weekMap[dayLabel].scheduled++;
          if (log.status === 'completed') weekMap[dayLabel].completed++;
        }

        const WEEK_ORDER = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        const weeklyActivity = WEEK_ORDER.map((day) => ({
          day,
          completed: weekMap[day]?.completed ?? 0,
          scheduled: weekMap[day]?.scheduled ?? 0,
        }));

        // Phonemes from latest diagnostic
        const rawPhonemes: unknown[] = Array.isArray(latest?.phonemesToWork)
          ? (latest.phonemesToWork as unknown[])
          : [];
        const phonemes = rawPhonemes
          .filter((p): p is string => typeof p === 'string')
          .map((phoneme) => ({
            phoneme,
            status: 'pending' as const,
            attempts: 0,
            accuracy: 0,
          }));

        const result: UserProgress = {
          grammar: {
            score: grammarScore,
            level,
            trend: trend(grammarScore, prevGrammar),
            lastChange: grammarScore - prevGrammar,
          },
          vocabulary: {
            score: listeningScore,
            level,
            trend: trend(listeningScore, prevListening),
            lastChange: listeningScore - prevListening,
          },
          pronunciation: {
            score: pronunciationScore,
            level,
            trend: trend(pronunciationScore, prevPronunciation),
            lastChange: pronunciationScore - prevPronunciation,
          },
          phonemes,
          weeklyActivity,
        };

        progressCache = { data: result, fetchedAt: Date.now(), uid: user.uid };
        setData(result);
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError('Erro ao carregar dados de progresso');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
