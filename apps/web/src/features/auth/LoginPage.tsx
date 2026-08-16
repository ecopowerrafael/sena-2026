import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Building2, KeyRound, Loader2, LogIn, Mail, ShieldCheck } from "lucide-react";
import { ApiRequestError } from "../../services/apiClient";
import { DEFAULT_PATH } from "../../routes/senaRoutes";
import { useAuth } from "./AuthProvider";

export const LoginPage: React.FC = () => {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? DEFAULT_PATH;

  if (!isLoading && user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.body.message
          : "Não foi possível entrar. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full max-w-sm">
        {/* Marca */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/20 text-lg tracking-wider">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white tracking-wide text-base">SENA</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-1.5 py-0.5 rounded-md border border-amber-500/30">
                CRM 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Imóveis • Locações • Loteamentos
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h1 className="text-lg font-bold text-white tracking-tight">Acessar o painel</h1>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            Use as credenciais da sua imobiliária para continuar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide"
              >
                E-mail
              </label>
              <div className="relative mt-1.5">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@senaimoveis.com.br"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide"
              >
                Senha
              </label>
              <div className="relative mt-1.5">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-sm shadow-md shadow-amber-500/20 transition-all disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Sessão protegida por cookie seguro e auditoria de acessos.</span>
          </div>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <Building2 className="w-3.5 h-3.5" />
          SENA Imóveis • Plataforma Imobiliária Integrada
        </p>
      </div>
    </div>
  );
};
