import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { doc, getDoc } from 'firebase/firestore';
import { SessionSummary } from '../features/chat/components/SessionSummary';
import {
  hydrateSessionSummary,
  type AdaptiveEvaluationData,
  type SessionSummaryData,
} from '../features/chat/lib/sessionSummary';
import { auth, db } from '../lib/firebase';

interface StoredSessionSummaryPayload {
  durationMs?: number | null;
  phonemesCorrected?: string[] | null;
  phonemesPending?: string[] | null;
  overallScore?: number | null;
  totalCorrections?: number | null;
  messageCount?: number | null;
  adaptiveEvaluation?: AdaptiveEvaluationData;
}

export default function SessionSummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fallback = location.state as SessionSummaryData | null;
  const [data, setData] = useState<SessionSummaryData | null>(fallback);

  const sessionId = useMemo(
    () => searchParams.get('sessionId') ?? fallback?.sessionId ?? null,
    [searchParams, fallback?.sessionId],
  );

  useEffect(() => {
    if (!sessionId) {
      navigate('/', { replace: true });
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      if (!fallback) navigate('/auth/login', { replace: true });
      return;
    }

    getDoc(doc(db, 'users', uid, 'sessions', sessionId))
      .then((snap) => {
        if (!snap.exists()) return;
        const payload = snap.data() as StoredSessionSummaryPayload;
        setData((current) => hydrateSessionSummary(sessionId, payload, current ?? fallback));
      })
      .catch((error) => {
        console.error('Failed to load session summary:', error);
      });
  }, [navigate, sessionId, fallback]);

  // Guard: if no data was passed, redirect to home
  if (!data) {
    return <div className="min-h-dvh bg-chat-bg" />;
  }

  return (
    <SessionSummary
      data={data}
      onDone={() => navigate('/', { replace: true })}
    />
  );
}
