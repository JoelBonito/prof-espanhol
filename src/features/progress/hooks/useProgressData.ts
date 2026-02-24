import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import { UserProgress, CEFRLevel } from '../types/progress';

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

            try {
                const userRef = doc(db, 'users', user.uid);
                await getDoc(userRef);

                // Get Diagnostic scores as baseline
                const diagRef = collection(db, 'diagnostics');
                const q = query(diagRef, where('uid', '==', user.uid), orderBy('timestamp', 'desc'), limit(1));
                const diagSnap = await getDocs(q);
                const lastDiag = !diagSnap.empty ? diagSnap.docs[0].data() : null;

                // Mock/Calculate progress based on history
                // In a real app, we would aggregate sessions
                const mockData: UserProgress = {
                    grammar: {
                        score: lastDiag?.grammarScore || 65,
                        level: (lastDiag?.cefrLevel as CEFRLevel) || 'A2',
                        trend: 'up',
                        lastChange: 12
                    },
                    vocabulary: {
                        score: (lastDiag?.vocabularyScore || 58),
                        level: (lastDiag?.cefrLevel as CEFRLevel) || 'A2',
                        trend: 'stable',
                        lastChange: 3
                    },
                    pronunciation: {
                        score: lastDiag?.pronunciationScore || 52,
                        level: (lastDiag?.cefrLevel as CEFRLevel) || 'A2',
                        trend: 'up',
                        lastChange: 15
                    },
                    phonemes: [
                        { phoneme: 'r', status: 'improved', attempts: 45, accuracy: 88 },
                        { phoneme: 'j', status: 'improved', attempts: 30, accuracy: 82 },
                        { phoneme: 'rr', status: 'pending', attempts: 50, accuracy: 45 },
                        { phoneme: 'ñ', status: 'pending', attempts: 20, accuracy: 38 },
                        { phoneme: 'z', status: 'untested', attempts: 0, accuracy: 0 },
                    ],
                    weeklyActivity: [
                        { day: 'Seg', completed: 1, scheduled: 1 },
                        { day: 'Ter', completed: 0, scheduled: 1 },
                        { day: 'Qua', completed: 2, scheduled: 2 },
                        { day: 'Qui', completed: 1, scheduled: 1 },
                        { day: 'Sex', completed: 0, scheduled: 1 },
                        { day: 'Sáb', completed: 3, scheduled: 2 },
                        { day: 'Dom', completed: 0, scheduled: 0 },
                    ]
                };

                setData(mockData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching progress:', err);
                setError('Erro ao carregar dados de progresso');
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return { data, loading, error };
}
