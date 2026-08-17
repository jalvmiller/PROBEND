import { Sparkles } from 'lucide-react';

/**
 * Banner informativo exibido no topo do conteúdo principal.
 * Notifica o usuário de que ele está em um ambiente de demonstração,
 * onde quaisquer alterações (questões, resoluções, novos usuários)
 * ficam isoladas e o banco de dados é resetado a cada 30 minutos.
 */
function DemoBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 px-4 py-2.5 mb-4 rounded-xl bg-gradient-to-r from-indigo-50/90 via-violet-50/80 to-purple-50/90 dark:from-indigo-950/40 dark:via-violet-950/30 dark:to-purple-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs backdrop-blur-xs transition-colors"
    >
      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 shrink-0">
        <Sparkles size={14} />
      </span>
      <p className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed">
        <strong className="font-semibold text-indigo-900 dark:text-indigo-100">Modo Demo</strong>
        {' — '}
        Você está em um ambiente de demonstração. Quaisquer alterações realizadas (criação de questões, resoluções ou novos cadastros) são isoladas na sua visão e o banco de dados é resetado a cada 30min.
      </p>
    </div>
  );
}

export default DemoBanner;


