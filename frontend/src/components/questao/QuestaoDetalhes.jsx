import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { renderizarTextoMath } from '../../utils/mathRenderer';
import { getMediaUrl } from '../../utils/urlUtils';
import CodeBlock from '../../utils/CodeBlock';
import { ArrowLeft, CheckCircle, Clock, ThumbsUp } from 'lucide-react';
import ResolucaoCard from './ResolucaoCard';
import PainelResolucao from './PainelResolucao';
import { questaoService } from '../../services/questaoService';
import Role from '../ui/Role';
import UsuarioAvatar from '../ui/UsuarioAvatar';
import DataFormatada from '../ui/DataFormatada';
import { useToastContext } from '../../contexts/ToastContext';

// ─────────────────────────────────────────────────────────────────
// Constantes de layout do painel
// ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'probend_panel_width';
const DEFAULT_LEFT_PCT = 50;
const MIN_LEFT_PCT = 25;
const MAX_LEFT_PCT = 75;

import { useDificuldade } from '../../hooks/useDificuldade';
import { SCROLLBAR_CLASSES } from '../../utils/scrollbarUtils';

// ─────────────────────────────────────────────────────────────────
// Componente principal — QuestaoDetalhes com Split-Pane
// ─────────────────────────────────────────────────────────────────
function QuestaoDetalhes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToastContext();

    const [questao, setQuestao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resolucoes, setResolucoes] = useState([]);
    const [upvotesCount, setUpvotesCount] = useState(0);
    const [isUpvoted, setIsUpvoted] = useState(false);
    const [meusUpvotesResolucoes, setMeusUpvotesResolucoes] = useState([]);

    // ── Split-pane resize ──────────────────────────────────────────
    const [leftPct, setLeftPct] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? Number(saved) : DEFAULT_LEFT_PCT;
    });
    const isDragging = useRef(false);
    const containerRef = useRef(null);

    const onResizerMouseDown = useCallback((e) => {
        e.preventDefault();
        isDragging.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDragging.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const rawPct = ((e.clientX - rect.left) / rect.width) * 100;
            const clamped = Math.min(MAX_LEFT_PCT, Math.max(MIN_LEFT_PCT, rawPct));
            setLeftPct(clamped);
        };
        const onMouseUp = () => {
            if (!isDragging.current) return;
            isDragging.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            setLeftPct(prev => {
                localStorage.setItem(STORAGE_KEY, String(prev));
                return prev;
            });
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    // ── Carregamento de dados ──────────────────────────────────────
    useEffect(() => {
        const carregarDados = async () => {
            try {
                setLoading(true);
                setError('');
                const responseQuestao = await api.get(`/questoes/${id}`);
                setQuestao(responseQuestao.data);
                setUpvotesCount(responseQuestao.data.upvotes || 0);
                const responseResolucoes = await api.get(`/questoes/${id}/resolucoes`);
                setResolucoes(responseResolucoes.data);
                if (user) {
                    const upvotesQ = await questaoService.getMeusUpvotes();
                    setIsUpvoted(upvotesQ.includes(Number(id)));
                    const upvotesR = await questaoService.getMeusUpvotesResolucoes();
                    setMeusUpvotesResolucoes(upvotesR);
                }
            } catch {
                setError('Não foi possível carregar os detalhes desta questão.');
            } finally {
                setLoading(false);
            }
        };
        carregarDados();
    }, [id, user]);

    // ── Handlers ──────────────────────────────────────────────────
    const handleAlternarSolucionada = async () => {
        if (!user) {
            showToast('Você precisa estar logado para alterar o status da questão.', 'info');
            return;
        }
        // Lê o status atual da questão e inverte
        const novoStatus = !questao.solucionada;
        try {
            const response = await api.put(`/questoes/${id}/solucionada?status=${novoStatus}`);
            // A API deve retornar o objeto questão atualizado.
            // Se retornar apenas um boolean/void, atualizamos o estado local manualmente.
            if (response.data && typeof response.data === 'object') {
                setQuestao(response.data);
            } else {
                // Fallback: atualiza apenas o campo solucionada no estado local
                setQuestao(prev => ({ ...prev, solucionada: novoStatus }));
            }
            showToast(
                novoStatus ? 'Questão marcada como solucionada!' : 'Questão desmarcada como solucionada.',
                'success'
            );
        } catch {
            showToast('Erro ao alterar status. Só o autor pode fazer isso.', 'error');
        }
    };

    const handleUpvoteQuestao = async () => {
        if (!user) { showToast('Você precisa estar logado para dar upvote!', 'info'); return; }
        try {
            const resultado = await questaoService.upvoteQuestao(id);
            setUpvotesCount(resultado.upvotes);
            setIsUpvoted(resultado.upvoted);
            showToast(resultado.upvoted ? 'Upvote adicionado!' : 'Upvote removido.', 'success');
        } catch {
            showToast('Erro ao registrar upvote.', 'error');
        }
    };

    const handleResolucaoEnviada = (novaResolucao) => {
        setResolucoes(prev => [novaResolucao, ...prev]);
    };

    const { textoDificuldade, badgesDificuldade } = useDificuldade(questao?.dificuldade);
    const isAutor = user && questao?.autor && questao.autor.username === user.username;

    // ── Carregando ────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full" aria-label="Detalhes da questão">
            {/* ── TOPBAR ────────────────────────────────────────────
                Linha 1: botão Voltar (ação de navegação)
                Linha 2: badges de contexto (matéria, assunto, dificuldade, status)
                Linha 3 (dentro do painel): autor + data

                Separar o "Voltar" dos badges evita que a barra fique
                poluída numa única linha e melhora a hierarquia visual.
            ──────────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 bg-white dark:bg-[#161e2e] border-b border-slate-200 dark:border-slate-800 px-5 pt-3 pb-2 space-y-2 transition-colors">
                {/* Linha 1: Voltar */}
                <div>
                    <button
                        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                        onClick={() => navigate('/')}
                        aria-label="Voltar para o Dashboard"
                    >
                        <ArrowLeft size={16} /> Voltar
                    </button>
                </div>

                {/* Linha 2: badges (matéria · assunto · dificuldade · status) */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/60 px-2.5 py-1 rounded-md">
                        {questao?.materia}
                    </span>
                    {questao?.assunto && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-700/60">
                            {questao.assunto}
                        </span>
                    )}
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${badgesDificuldade}`}>
                        {textoDificuldade}
                    </span>
                    {questao?.solucionada ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 px-2.5 py-1 rounded-full">
                            <CheckCircle size={12} /> Solucionada
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-2.5 py-1 rounded-full">
                            <Clock size={12} /> Pendente
                        </span>
                    )}
                </div>
            </div>

            {error && (
                <div className="mx-5 mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-900/40">
                    {error}
                </div>
            )}

            {/* ── CORPO: Split-pane ─────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden" ref={containerRef}>

                {/* ── PAINEL ESQUERDO ── */}
                <div
                    className={`flex flex-col overflow-y-auto ${SCROLLBAR_CLASSES}`}
                    style={{ width: `${leftPct}%` }}
                    role="main"
                    aria-label="Enunciado da questão e resoluções"
                >
                    <div className="p-6 space-y-5">
                        {/* Autor — linha abaixo dos badges, dentro do painel */}
                        <div className="flex items-center gap-3">
                            <UsuarioAvatar usuario={questao?.autor} size="md" />
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                        Criado por: <span className="text-slate-800 dark:text-slate-200">{questao?.autor?.nome || questao?.autor?.username || 'Anônimo'}</span>
                                    </span>
                                    <Role usuario={questao?.autor} />
                                </div>
                                {questao?.dataInsercao && <DataFormatada data={questao.dataInsercao} />}
                            </div>
                        </div>

                        {/* Enunciado */}
                        <div className="text-slate-800 dark:text-slate-100 leading-relaxed text-base whitespace-pre-wrap">
                            {renderizarTextoMath(questao?.enunciado)}
                        </div>

                        {/* Imagem */}
                        {questao?.imagemUrl && (
                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/60 shadow-sm p-2 bg-slate-50 dark:bg-slate-900/40">
                                <img src={getMediaUrl(questao.imagemUrl)} alt="Imagem da questão" className="max-h-72 mx-auto object-contain rounded" />
                            </div>
                        )}

                        {/* Código da questão (definido pelo autor ao criar) */}
                        {questao?.trechoCodigo && (
                            <CodeBlock code={questao.trechoCodigo} language={questao.linguagemCodigo} />
                        )}

                        {/* Fonte */}
                        {questao?.fonte && (
                            <p className="text-xs text-slate-400 dark:text-slate-400/80 italic">Fonte: {questao.fonte}</p>
                        )}

                        {/* Ações */}
                        <div className="flex flex-wrap gap-2 pt-1">
                            <button
                                onClick={handleUpvoteQuestao}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer border ${
                                    isUpvoted
                                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50'
                                        : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60'
                                }`}
                                aria-pressed={isUpvoted}
                                aria-label={`${upvotesCount} upvotes. ${isUpvoted ? 'Clique para remover seu upvote' : 'Clique para dar upvote'}`}
                            >
                                <ThumbsUp size={16} className={isUpvoted ? 'fill-current' : ''} />
                                {upvotesCount} {upvotesCount === 1 ? 'Upvote' : 'Upvotes'}
                            </button>

                            {isAutor && (
                                <button
                                    onClick={handleAlternarSolucionada}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition cursor-pointer ${
                                        questao?.solucionada
                                            ? 'bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                    aria-label={questao?.solucionada ? 'Desmarcar como solucionada' : 'Marcar como solucionada'}
                                >
                                    <CheckCircle size={14} />
                                    {questao?.solucionada ? 'Desmarcar' : 'Marcar como solucionada'}
                                </button>
                            )}
                        </div>

                        {/* Divider + Resoluções */}
                        <div className="border-t border-slate-100 dark:border-slate-700/60 pt-4">
                            <h3 className="text-slate-700 dark:text-slate-200 text-base font-bold mb-3" id="resolucoes-titulo">
                                Resoluções ({resolucoes.length})
                            </h3>
                            {resolucoes.length === 0 ? (
                                <div className="text-slate-400 dark:text-slate-400 text-center py-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/60 text-sm">
                                    Nenhuma resolução ainda. Seja o primeiro!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {resolucoes.map(r => (
                                        <ResolucaoCard
                                            key={r.id}
                                            resolucao={r}
                                            meusUpvotes={meusUpvotesResolucoes}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RESIZER HANDLE ── */}
                <div
                    className="w-1.5 flex-shrink-0 bg-slate-200 dark:bg-slate-700/60 hover:bg-indigo-400 dark:hover:bg-indigo-500 cursor-col-resize transition-colors duration-150 flex items-center justify-center group"
                    onMouseDown={onResizerMouseDown}
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Arraste para redimensionar os painéis"
                    title="Arraste para redimensionar"
                >
                    <div className="flex flex-col gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <span className="w-0.5 h-1 bg-current rounded-full" />
                        <span className="w-0.5 h-1 bg-current rounded-full" />
                        <span className="w-0.5 h-1 bg-current rounded-full" />
                    </div>
                </div>

                {/* ── PAINEL DIREITO ── */}
                <div
                    className="flex-1 overflow-hidden"
                    style={{ width: `${100 - leftPct}%` }}
                >
                    <PainelResolucao
                        questaoId={id}
                        onResolucaoEnviada={handleResolucaoEnviada}
                    />
                </div>
            </div>
        </div>
    );
}

export default QuestaoDetalhes;