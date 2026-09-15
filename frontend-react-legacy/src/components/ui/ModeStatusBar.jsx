import { useAccessibility } from '../../contexts/AccessibilityContext';

/**
 * ModeStatusBar
 *
 * Barra de status no rodapé da tela para o modo Vim.
 * Exibe o modo atual: [ NORMAL ] ou [ INSERT ]
 *
 * Usa a mesma família de fontes (font-sans) do projeto para harmonizar com a UI.
 * Posicionada em z-40 (abaixo de modais z-50).
 */
export default function ModeStatusBar() {
    const { mode, vimAtivo } = useAccessibility();

    if (!vimAtivo) return null;

    const isNormal = mode === 'normal';

    return (
        <div
            className={[
                'fixed bottom-0 left-0 right-0 z-40',
                'flex items-center justify-between px-5 py-2',
                'font-sans text-xs font-medium tracking-wide',
                isNormal
                    ? 'bg-slate-900 text-slate-100 border-t border-slate-800'
                    : 'bg-emerald-900 text-emerald-100 border-t border-emerald-800',
                'shadow-lg transition-colors duration-200',
            ].join(' ')}
            aria-live="polite"
            aria-label={`Modo Vim atual: ${isNormal ? 'normal' : 'inserção'}`}
        >
            <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                    isNormal ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                    {isNormal ? 'NORMAL' : 'INSERT'}
                </span>
                <span className="font-semibold text-slate-200">
                    {isNormal ? 'Modo de Navegação' : 'Modo de Inserção'}
                </span>
            </div>
            <span className="text-slate-400 text-xs">
                {isNormal
                    ? 'WASD / HJKL navegar · Enter interagir · i / Esc alternar modo · T ajuda'
                    : 'Digite livremente · Esc para voltar ao modo Normal'}
            </span>
        </div>
    );
}
