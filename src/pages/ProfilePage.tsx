import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../app/providers/AuthProvider';
import type { UserProfile, SpanishLevel } from '../types';
import { Icon } from '../components/ui/Icon';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        displayName: '',
        username: '',
        phone: '',
        level: 'A1' as SpanishLevel | null,
        bio: ''
    });

    useEffect(() => {
        async function loadProfile() {
            const uid = user?.uid;
            if (!uid) {
                setLoading(false);
                return;
            }

            try {
                const docRef = doc(db, 'users', uid);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data() as UserProfile;
                    setProfile(data);
                    setFormData({
                        displayName: data.displayName || auth.currentUser?.displayName || '',
                        username: data.username || '',
                        phone: data.phone || '',
                        level: data.level || 'A1',
                        bio: data.bio || ''
                    });
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setLoading(false);
            }
        }

        void loadProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        
        setSaving(true);
        setSuccessMessage('');
        
        try {
            const docRef = doc(db, 'users', uid);
            await updateDoc(docRef, {
                displayName: formData.displayName,
                username: formData.username,
                phone: formData.phone,
                bio: formData.bio
            });
            
            setProfile(prev => prev ? { ...prev, ...formData } as UserProfile : null);
            setSuccessMessage('Perfil atualizado com sucesso!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            alert('Erro ao salvar as alterações.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/auth/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    // Get display values
    const displayName = formData.displayName || profile?.displayName || auth.currentUser?.displayName || 'Usuário';
    const email = profile?.email || auth.currentUser?.email || '';
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="min-h-[calc(100vh-64px)] xl:min-h-screen pb-24 md:pb-8">
            {/* MOBILE VIEW */}
            <div className="xl:hidden flex flex-col px-5 pt-8 space-y-8">
                {/* Header Mobile */}
                <header className="flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="text-white hover:text-primary-400 transition-colors">
                        <Icon name="arrow_back" size={24} />
                    </button>
                    <h1 className="font-display text-xl font-bold text-white tracking-wide">Configurações de Perfil</h1>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-app-bg shadow-glow-orange disabled:opacity-50 transition-opacity"
                    >
                        {saving ? (
                           <div className="w-4 h-4 border-2 border-app-bg/30 border-t-app-bg rounded-full animate-spin" />
                        ) : (
                           <Icon name="check" size={18} />
                        )}
                    </button>
                </header>

                {successMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm text-center font-medium animate-in fade-in slide-in-from-top-4">
                        {successMessage}
                    </div>
                )}

                {/* Avatar Mobile */}
                <div className="flex flex-col items-center mt-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-surface-dark to-app-bg border-2 border-primary-500/30 shadow-glow-orange flex items-center justify-center overflow-hidden">
                            <span className="text-4xl font-display font-bold text-white">{initial}</span>
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-app-bg border-[3px] border-app-bg shadow-lg">
                            <Icon name="edit" size={16} />
                        </button>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white mt-4">{displayName.split(' ')[0]}</h2>
                    <div className="flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-primary-500/10 border border-primary-500/20">
                        <Icon name="stars" size={14} className="text-primary-500" />
                        <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Membro Premium</span>
                    </div>
                </div>

                {/* Form Mobile */}
                <div className="glass-panel p-5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Icon name="person" size={20} className="text-primary-500" />
                        <h3 className="font-display text-lg font-bold text-white">Conta</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Nome Completo</label>
                            <input 
                                type="text" 
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                className="w-full bg-surface-dark border border-border-subtle rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">E-mail</label>
                            <input 
                                type="email" 
                                value={email} 
                                disabled
                                className="w-full bg-surface-dark/50 border border-border-subtle/50 rounded-xl px-4 py-3 text-sm text-text-secondary cursor-not-allowed" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Nome de Usuário</label>
                            <input 
                                type="text" 
                                name="username"
                                value={formData.username} 
                                onChange={handleChange}
                                className="w-full bg-surface-dark border border-border-subtle rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Telefone</label>
                            <input 
                                type="tel" 
                                name="phone"
                                value={formData.phone} 
                                onChange={handleChange}
                                placeholder="+55 11 99999-9999"
                                className="w-full bg-surface-dark border border-border-subtle rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Nível de Espanhol</label>
                            <select 
                                name="level"
                                value={formData.level || 'A1'}
                                disabled
                                className="w-full bg-surface-dark/50 border border-border-subtle/50 rounded-xl px-4 py-3 text-sm text-text-secondary cursor-not-allowed appearance-none"
                            >
                                <option value="A1">Básico (A1)</option>
                                <option value="A2">Básico (A2)</option>
                                <option value="B1">Intermediário (B1)</option>
                                <option value="B2">Intermediário (B2)</option>
                                <option value="C1">Avançado (C1)</option>
                                <option value="C2">Avançado (C2)</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Bio Personalizada</label>
                            <textarea 
                                rows={3} 
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Conte um pouco sobre seus objetivos..."
                                className="w-full bg-surface-dark border border-border-subtle rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Logout Mobile */}
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#1A1515] hover:bg-red-500/10 border border-red-500/20 text-red-400 font-bold transition-colors mt-8">
                    <Icon name="logout" size={20} />
                    <span>Sair da Conta</span>
                </button>
                <div className="text-center pb-4">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Premium Version 2.4.0</span>
                </div>
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden xl:flex flex-col max-w-[1200px] mx-auto pt-8 px-8 2xl:px-12">
                {/* Header Desktop */}
                <header className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <h1 className="font-display text-3xl font-bold text-white tracking-wide">Configurações da Conta</h1>
                        {successMessage && (
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-xs font-semibold animate-in fade-in zoom-in">
                                {successMessage}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-primary-500 hover:bg-primary-600 text-app-bg font-bold px-6 py-2.5 rounded-xl shadow-glow-orange transition-all active:scale-95 disabled:opacity-70 disabled:hover:bg-primary-500 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-app-bg/30 border-t-app-bg rounded-full animate-spin" />
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <span>Salvar Alterações</span>
                            )}
                        </button>
                    </div>
                </header>

                <div className="flex gap-10 items-start">
                    {/* Sidebar Desktop */}
                    <aside className="w-64 flex-shrink-0 space-y-6">
                        <div>
                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 ml-2">Preferências</p>
                            <nav className="space-y-1">
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-500/10 text-primary-500 font-semibold border border-primary-500/20 transition-colors text-left">
                                    <Icon name="person" size={20} />
                                    <span>Perfil e Conta</span>
                                </button>
                            </nav>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-dark hover:bg-red-500/10 border border-border-subtle hover:border-red-500/30 text-red-400 font-semibold transition-colors">
                                <Icon name="logout" size={20} />
                                <span>Sair da Conta</span>
                            </button>
                        </div>
                    </aside>

                    {/* Main Content Desktop */}
                    <main className="flex-1 space-y-8 glass-panel p-8 rounded-[2rem]">
                        {/* Profile Header Card */}
                        <div className="flex items-center gap-8">
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-surface-dark to-app-bg border-2 border-primary-500/30 shadow-glow-orange flex items-center justify-center overflow-hidden">
                                    <span className="text-5xl font-display font-bold text-white">{initial}</span>
                                </div>
                                <button className="absolute bottom-1 right-1 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-app-bg border-[3px] border-app-bg shadow-lg hover:scale-110 transition-transform">
                                    <Icon name="edit" size={16} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <h2 className="font-display text-3xl font-bold text-white">{displayName}</h2>
                                <p className="text-sm text-text-secondary">{email}</p>
                                <div className="flex items-center gap-3 pt-1">
                                    <span className="px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10">
                                        Conta Verificada
                                    </span>
                                    <span className="px-2 py-0.5 rounded border border-primary-500/30 text-primary-500 text-[10px] font-bold uppercase tracking-wider bg-primary-500/10">
                                        Plano Anual
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Form Grid Desktop */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-secondary ml-1">Nome Completo</label>
                                <input 
                                    type="text" 
                                    name="displayName"
                                    value={formData.displayName} 
                                    onChange={handleChange}
                                    className="w-full bg-surface-dark border border-border-subtle rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-secondary ml-1">Nome de Usuário</label>
                                <input 
                                    type="text" 
                                    name="username"
                                    value={formData.username} 
                                    onChange={handleChange}
                                    className="w-full bg-surface-dark border border-border-subtle rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors" 
                                />
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-xs font-semibold text-text-secondary ml-1">Email Principal</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    disabled
                                    className="w-full bg-surface-dark/50 border border-border-subtle/50 rounded-xl px-4 py-3.5 text-sm text-text-secondary cursor-not-allowed" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-secondary ml-1">Telefone</label>
                                <input 
                                    type="tel" 
                                    name="phone"
                                    value={formData.phone} 
                                    onChange={handleChange}
                                    placeholder="+55 11 99999-9999"
                                    className="w-full bg-surface-dark border border-border-subtle rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-secondary ml-1">Nível de Espanhol</label>
                                <select 
                                    name="level"
                                    value={formData.level || 'A1'}
                                    disabled
                                    className="w-full bg-surface-dark/50 border border-border-subtle/50 rounded-xl px-4 py-3.5 text-sm text-text-secondary cursor-not-allowed appearance-none"
                                >
                                    <option value="A1">Básico (A1)</option>
                                    <option value="A2">Básico (A2)</option>
                                    <option value="B1">Intermediário (B1)</option>
                                    <option value="B2">Intermediário (B2)</option>
                                    <option value="C1">Avançado (C1)</option>
                                    <option value="C2">Avançado (C2)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-xs font-semibold text-text-secondary ml-1">Bio Personalizada</label>
                                <textarea 
                                    rows={3} 
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Conte um pouco sobre seus objetivos com o espanhol..."
                                    className="w-full bg-surface-dark border border-border-subtle rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors resize-none"
                                />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
