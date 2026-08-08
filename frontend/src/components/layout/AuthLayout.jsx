import React from 'react';
import { BookOpen } from 'lucide-react';

// AuthLayout — layout das páginas públicas (Login e Register)
// Estrutura: painel decorativo esquerdo + card de formulário direito
export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-zinc-950">

      {/* ── Painel decorativo — escondido em mobile ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden bg-zinc-900">

        {/* Grade de pontos decorativa */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #818cf8 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Glow ambient indigo */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo no topo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <BookOpen size={18} className="text-white" />
          </div>
          <span
            className="text-2xl font-bold tracking-widest bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent"
            style={{ fontFamily: '"Sora", sans-serif' }}
          >
            PROBEND
          </span>
        </div>

        {/* Tagline central */}
        <div className="relative space-y-4">
          <h2
            className="text-4xl font-bold text-zinc-100 leading-tight"
            style={{ fontFamily: '"Sora", sans-serif' }}
          >
            Organize seus estudos.<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Domine as provas.
            </span>
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed max-w-sm">
            Gerencie e revise questões de concursos com eficiência. 
            Acompanhe seu progresso e identifique os pontos a melhorar.
          </p>

          {/* Badges de feature */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['Questões filtradas', 'Sistema de upvotes', 'Controle de progresso'].map((feat) => (
              <span
                key={feat}
                className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Rodapé do painel */}
        <p className="relative text-xs text-zinc-600">
          © {new Date().getFullYear()} PROBEND — Plataforma de estudos
        </p>
      </div>

      {/* ── Painel do formulário ── */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12 bg-zinc-950">

        {/* Card do formulário */}
        <div className="w-full max-w-md">

          {/* Logo visível apenas em mobile */}
          <div className="flex lg:hidden items-center gap-2.5 justify-center mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BookOpen size={16} className="text-white" />
            </div>
            <span
              className="text-xl font-bold tracking-widest bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent"
              style={{ fontFamily: '"Sora", sans-serif' }}
            >
              PROBEND
            </span>
          </div>

          {/* Card com glassmorphism suave */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
            {/* Linha decorativa superior */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent rounded-full" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
