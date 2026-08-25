import { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

const ATALHOS = [
    { tecla: 'J / S / ↓',    descricao: 'Ir para a próxima questão' },
    { tecla: 'K / W / ↑',    descricao: 'Ir para a questão anterior' },
    { tecla: 'Enter',        descricao: 'Abrir questão selecionada' },
    { tecla: 'F',            descricao: 'Ler conteúdo focado em voz alta' },
    { tecla: 'T',            descricao: 'Abrir / fechar este painel' },
    { tecla: 'Esc',          descricao: 'Entrar no modo de inserção' },
    { tecla: 'Esc (insert)', descricao: 'Sair do modo de inserção' },
];

/**
 * KeyboardHelpOverlay
 *
 * Modal de ajuda de atalhos de teclado, ativado pela tecla T no Normal Mode.
 * Fecha ao pressionar T novamente, Esc, ou clicar fora.
 */
export default function KeyboardHelpOverlay({ aberto, onFechar }) {
    // Fecha com Esc estando no overlay (antes do handler global do vim)
    useEffect(() => {
        if (!aberto) return;
        const handler = (e) => {
            if (e.key === 'Escape' || e.key === 't' || e.key === 'T') {
                e.preventDefault();
                e.stopPropagation();
                onFechar();
            }
        };
        window.addEventListener('keydown', handler, { capture: true });
        return () => window.removeEventListener('keydown', handler, { capture: true });
    }, [aberto, onFechar]);

    if (!aberto) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onFechar}
            role="dialog"
            aria-modal="true"
            aria-label="Atalhos de teclado"
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/60 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/60">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-base">
                        <Keyboard size={18} className="text-indigo-600 dark:text-indigo-400" />
                        <span>Atalhos de Teclado</span>
                    </div>
                    <button
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60"
                        onClick={onFechar}
                        aria-label="Fechar painel de atalhos"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Modo */}
                <div className="flex items-center justify-center gap-3 px-5 py-3 bg-slate-100/50 dark:bg-slate-900/40 text-xs font-mono border-b border-slate-100 dark:border-slate-700/60">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold">NORMAL</span>
                    <span className="text-slate-400">↔</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold">-- INSERT --</span>
                </div>

                {/* Lista de atalhos */}
                <div className="px-5 py-3 max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm">
                        <tbody>
                            {ATALHOS.map(({ tecla, descricao }) => (
                                <tr key={tecla} className="border-b border-slate-100 dark:border-slate-700/60 last:border-none">
                                    <td className="py-2.5 pr-3 w-36">
                                        <kbd className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono text-xs border border-slate-200 dark:border-slate-700/60 shadow-xs font-semibold">
                                            {tecla}
                                        </kbd>
                                    </td>
                                    <td className="py-2.5 text-slate-600 dark:text-slate-400 text-xs">{descricao}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className="px-5 py-3 bg-slate-50/50 dark:bg-slate-900/60 text-center text-xs text-slate-400 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60">
                    Pressione <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-900 font-mono text-[11px]">T</kbd> ou <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-900 font-mono text-[11px]">Esc</kbd> para fechar
                </p>
            </div>
        </div>
    );
}
