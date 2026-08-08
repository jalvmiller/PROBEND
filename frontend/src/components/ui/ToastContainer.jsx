import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

// Mapeamento de tipo → ícone e classes de cor
const ESTILOS = {
    success: {
        icone: CheckCircle,
        bar:   'bg-emerald-500',
        bg:    'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/40',
        texto: 'text-slate-800 dark:text-slate-100',
        icon:  'text-emerald-500',
    },
    error: {
        icone: XCircle,
        bar:   'bg-red-500',
        bg:    'bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/40',
        texto: 'text-slate-800 dark:text-slate-100',
        icon:  'text-red-500',
    },
    info: {
        icone: Info,
        bar:   'bg-blue-500',
        bg:    'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/40',
        texto: 'text-slate-800 dark:text-slate-100',
        icon:  'text-blue-500',
    },
    loading: {
        icone: null,
        bar:   'bg-slate-400',
        bg:    'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700',
        texto: 'text-slate-800 dark:text-slate-100',
        icon:  'text-slate-400',
    },
};

function Toast({ toast, onRemove }) {
    const [saindo, setSaindo] = useState(false);

    const handleClose = () => {
        setSaindo(true);
        setTimeout(() => onRemove(toast.id), 300);
    };

    useEffect(() => {
        // Aciona a animação de saída ~300ms antes do toast ser removido
        const timer = setTimeout(() => setSaindo(true), 3700);
        return () => clearTimeout(timer);
    }, []);

    const estilo = ESTILOS[toast.tipo] ?? ESTILOS.info;
    const Icone  = estilo.icone;

    return (
        <div
            className={[
                // Estrutura do card
                'relative flex items-start gap-3 w-80 rounded-xl shadow-lg border overflow-hidden',
                'px-4 py-3 pr-10',
                estilo.bg,
                // Animação de entrada/saída via Tailwind
                'transition-all duration-300',
                saindo
                    ? 'opacity-0 translate-x-full'
                    : 'opacity-100 translate-x-0',
            ].join(' ')}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            {/* Barra lateral colorida */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${estilo.bar} rounded-l-xl`} />

            {/* Ícone */}
            <div className={`flex-shrink-0 mt-0.5 ${estilo.icon}`}>
                {Icone ? (
                    <Icone size={18} />
                ) : (
                    // Spinner para loading
                    <span className="inline-block w-[18px] h-[18px] border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                )}
            </div>

            {/* Mensagem */}
            <span className={`flex-1 text-sm leading-snug ${estilo.texto}`}>
                {toast.mensagem}
            </span>

            {/* Botão fechar */}
            <button
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={handleClose}
                aria-label="Fechar notificação"
            >
                <X size={14} />
            </button>
        </div>
    );
}

/**
 * Container posicionado no canto inferior direito da tela.
 * Renderiza todos os toasts ativos.
 *
 * z-50 garante que fique acima da ModeStatusBar (z-40) e de outros
 * elementos fixos da UI.
 */
export default function ToastContainer({ toasts, onRemove }) {
    return (
        <div
            className="fixed bottom-14 right-4 z-50 flex flex-col gap-2 items-end"
            aria-label="Notificações"
        >
            {toasts.map(t => (
                <Toast key={t.id} toast={t} onRemove={onRemove} />
            ))}
        </div>
    );
}
