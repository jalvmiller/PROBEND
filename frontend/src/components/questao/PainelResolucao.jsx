import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToastContext } from '../../contexts/ToastContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { renderizarTextoMath as previewMath } from '../../utils/mathRenderer';

/**
 * PainelResolucao — Formulário de Resolução com Live Preview
 *
 * ── Decisão de design: sem campo de código, sem tabs ─────────────
 * Quem define o tipo de conteúdo (código vs. LaTeX/texto) é o
 * AUTOR DA QUESTÃO ao criá-la — não quem está respondendo.
 * Por isso, o formulário de resposta só expõe o campo de texto.
 * O live preview fica sempre visível abaixo do textarea, sem
 * precisar de tabs que alternam entre "escrever" e "ver".
 */
export default function PainelResolucao({ questaoId, onResolucaoEnviada }) {
    const { user } = useAuth();
    const { showToast } = useToastContext();
    const { vimAtivo }  = useAccessibility();
    const [conteudo, setConteudo] = useState('');
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            showToast('Você precisa estar logado para enviar uma resolução.', 'info');
            return;
        }
        if (!conteudo.trim()) {
            showToast('O campo de resolução não pode estar vazio.', 'error');
            return;
        }
        try {
            setEnviando(true);
            const response = await api.post(`/questoes/${questaoId}/resolucoes`, {
                conteudo,
            });
            onResolucaoEnviada(response.data);
            setConteudo('');
            showToast('Resolução enviada com sucesso!', 'success');
        } catch {
            showToast('Erro ao enviar resolução. Tente novamente.', 'error');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div
            className="flex flex-col h-full overflow-y-auto bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800"
            role="complementary"
            aria-label="Formulário de resolução"
        >
            {/* Cabeçalho do painel */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex-shrink-0">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                    Sua Resolução
                </h2>
            </div>

            {!user ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">
                        Você precisa estar logado para enviar uma resolução.
                    </p>
                    <a
                        href="/login"
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition"
                    >
                        Fazer Login
                    </a>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className={`flex flex-col flex-1 p-5 gap-4 ${vimAtivo ? 'pb-16' : 'pb-6'}`}>
                    {/* Campo de texto principal */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Resolução <span className="normal-case font-normal text-slate-400">(suporta LaTeX)</span>
                    </label>
                    <textarea
                        className="w-full min-h-[160px] resize-y rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 text-sm leading-relaxed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        value={conteudo}
                        onChange={e => setConteudo(e.target.value)}
                        placeholder={'Explique sua resolução...\nEx: A integral $$\\int_0^\\infty e^{-x^2}dx$$ vale...'}
                        aria-label="Campo de resolução com suporte a LaTeX"
                        required
                    />
                </div>

                {/* Live Preview — sem scrollbars desnecessárias */}
                {conteudo.trim() && (
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Preview
                        </span>
                        <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/10 p-4 text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap text-sm overflow-hidden break-words max-w-full">
                            {previewMath(conteudo)}
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-2">
                    <button
                        type="submit"
                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                            enviando
                                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md'
                        }`}
                        disabled={enviando}
                        aria-label={enviando ? 'Enviando resolução...' : 'Enviar resolução'}
                    >
                        {enviando ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Enviando...
                            </span>
                        ) : 'Enviar Resolução'}
                    </button>
                </div>
            </form>
            )}
        </div>
    );
}
