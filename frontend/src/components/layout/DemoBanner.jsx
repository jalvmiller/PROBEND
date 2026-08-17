import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

/**
 * Banner informativo exibido quando o usuário está em modo visitante efêmero.
 * Aparece no topo do conteúdo principal e convida o usuário a fazer login
 * para ter acesso completo com a conta demo
 */
function DemoBanner() {
  const navigate = useNavigate();

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 mb-4 rounded-xl bg-gradient-to-r from-indigo-50/90 via-violet-50/80 to-purple-50/90 dark:from-indigo-950/40 dark:via-violet-950/30 dark:to-purple-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs backdrop-blur-xs transition-colors"
    >
      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Sparkles size={14} />
        </span>
        <span>
          <strong className="font-semibold text-indigo-900 dark:text-indigo-100">Modo Demo</strong>
          {' — '}
          Você está em uma sessão temporária. Suas alterações são visíveis{' '}
          <span className="font-medium text-indigo-700 dark:text-indigo-300 underline decoration-indigo-300 dark:decoration-indigo-700 underline-offset-2">
            apenas para você
          </span>{' '}
          e resetadas a cada 30min
        </span>
      </div>

      <button
        onClick={() => navigate('/login')}
        className="inline-flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-semibold shadow-xs hover:shadow-indigo-500/25 transition-all cursor-pointer"
        aria-label="Entrar com credenciais de demonstração"
      >
        <span>Entrar como demo</span>
        <ArrowRight size={13} />
      </button>
    </div>
  );
}

export default DemoBanner;

