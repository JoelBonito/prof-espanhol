import { useState, type FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router';
import { auth } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Email ou senha incorretos.');
      } else if (code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Aguarde alguns minutos.');
      } else {
        setError('Erro ao entrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg px-4 py-8 relative overflow-hidden">
      {/* Mesh Gradient Background (Stitch Style) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-500/15 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-600/10 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo + Heading */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex justify-center mb-6">
            <img
              src="/brand/elite-espanhol-logo-full.svg"
              alt="Elite Español"
              className="h-[100px] md:h-[160px] w-auto object-contain drop-shadow-[0_0_32px_rgba(255,138,66,0.3)] transition-transform duration-700 hover:scale-105"
            />
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary tracking-tight">
            ¡Hola!
          </h1>
          <p className="text-text-secondary text-lg font-medium opacity-80">
            Accede a tu experiencia premium
          </p>
        </div>

        {/* Form Card (Premium Stitch Version) */}
        <div className="premium-card p-8 space-y-6 relative group overflow-hidden">
          {/* Subtle light reflection finish */}
          <div className="absolute -inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/30 to-transparent pointer-events-none group-hover:via-primary-400/60 transition-all duration-700" />

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-text-secondary ml-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="bg-surface-dark/40 border-white/5 focus:border-primary-500/50 focus:ring-primary-500/20 h-12"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label htmlFor="password" className="block text-sm font-semibold text-text-secondary">
                  Contraseña
                </label>
                <button type="button" className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium">
                  ¿Olvidaste la senha?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-surface-dark/40 border-white/5 focus:border-primary-500/50 focus:ring-primary-500/20 h-12"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="glass-panel border-error/30 bg-error/10 p-3 rounded-xl animate-scale-in">
                <p className="text-sm text-error font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-error" />
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                isLoading={loading}
                className="w-full h-12 shadow-glow-orange hover:shadow-glow-orange/60 active:scale-[0.98] transition-all duration-300 font-bold text-lg"
              >
                Entrar
              </Button>
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-text-muted">
                ¿Aún no tienes cuenta?{" "}
                <button type="button" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                  Regístrate aquí
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
