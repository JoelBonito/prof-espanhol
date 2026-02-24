import { useLocation, useNavigate } from 'react-router';
import { SessionSummary } from '../features/chat/components/SessionSummary';
import type { SessionSummaryData } from '../features/chat/lib/sessionSummary';

export default function SessionSummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state as SessionSummaryData | null;

  // Guard: if no data was passed, redirect to home
  if (!data) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <SessionSummary
      data={data}
      onDone={() => navigate('/', { replace: true })}
    />
  );
}
