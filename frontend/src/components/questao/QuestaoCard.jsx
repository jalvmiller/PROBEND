import { Link } from 'react-router-dom';
import BotaoExcluir from "../ui/BotaoExcluir";
import { ThumbsUp, CheckCircle, Clock, Edit2, User, Calendar, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import QuestaoEditModal from './QuestaoEditModal';
import { useState, useEffect } from 'react';
import { renderizarTextoMath } from '../../utils/mathRenderer';
import { questaoService } from '../../services/questaoService';
import Role from '../ui/Role';
import { useToastContext } from '../../contexts/ToastContext';
import { useDificuldade } from '../../hooks/useDificuldade';

function QuestaoCard({ questao, onExcluir, onEditarSucesso, meusUpvotes }) {
    const { user } = useAuth();
    const { showToast } = useToastContext();
    const [modalEditOpen, setModalEditOpen] = useState(false);
    const [expandido, setExpandido] = useState(false);
    const [upvotesCount, setUpvotesCount] = useState(questao.upvotes || 0);
    const [isUpvoted, setIsUpvoted] = useState(false);

    useEffect(() => {
        if (meusUpvotes && meusUpvotes.includes(questao.id)) {
            setIsUpvoted(true);
        } else {
            setIsUpvoted(false);
        }
    }, [meusUpvotes, questao.id]);

    const handleUpvote = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            showToast('Você precisa estar logado para dar upvote!', 'info');
            return;
        }

        try {
            const resultado = await questaoService.upvoteQuestao(questao.id);
            setUpvotesCount(resultado.upvotes);
            setIsUpvoted(resultado.upvoted);
        } catch (err) {
            console.error("Erro ao dar upvote:", err);
        }
    };

    const { textoDificuldade, badgesDificuldade, glowDificuldade, hoverBorderDificuldade } = useDificuldade(questao.dificuldade);

    const isAutor = user && questao.autor && questao.autor.username === user.username;

    // Formatar data de inserção
    const formatarData = (dataStr) => {
        if (!dataStr) return "Não informada";
        try {
            const data = new Date(dataStr);
            return data.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return "Não informada";
        }
    };

    return (
        <div
            className={`group relative overflow-hidden bg-white dark:bg-slate-800/90 p-6 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-700/60 ${hoverBorderDificuldade} mb-4 transition-all duration-300 hover:shadow-md hover:scale-[1.005]`}
            role="article"
            aria-label={`Questão de ${questao.materia}${questao.assunto ? `, ${questao.assunto}` : ''}, dificuldade ${textoDificuldade}, ${questao.solucionada ? 'solucionada' : 'pendente'}`}
        >
            {/* Spotlight Gradient de Dificuldade */}
            <div className={`absolute -top-16 -right-16 w-36 h-36 rounded-full ${glowDificuldade} blur-2xl pointer-events-none transition-all duration-500 group-hover:scale-125`} />

            {/* Linha superior: Matéria/Assunto e Status/Dificuldade */}
            <div className='flex flex-wrap justify-between items-start gap-2 mb-3'>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/70 px-2.5 py-1 rounded-md">
                        {questao.materia}
                    </span>
                    {questao.assunto && (
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-700/60">
                            {questao.assunto}
                        </span>
                    )}
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${badgesDificuldade}`}>
                        {textoDificuldade}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {questao.solucionada ? (
                        <span className='text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold'>
                            <CheckCircle size={14} /> Solucionada
                        </span>
                    ) : (
                        <span className='text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold'>
                            <Clock size={14} /> Pendente
                        </span>
                    )}
                </div>
            </div>

            {/* Enunciado truncado com "..." se passar do limite de seu espaço */}
            {/* line-clamp-2 condicionado pelo clique do usuário*/}
            <h2
                onClick={() => setExpandido(!expandido)}
                className={`text-lg font-semibold text-slate-800 dark:text-slate-100 transition-all duration-300 cursor-pointer ${expandido ? '' : 'line-clamp-2'
                    }`}
                title="Clique para expandir ou recolher o enunciado"
            >
                {renderizarTextoMath(questao.enunciado)}
            </h2>

            {/* Metadados: Autor, Role, Resoluções, Data de inserção */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <User size={14} className="text-slate-400 dark:text-slate-400/80" />
                    <span>Autor: <span className="font-semibold text-slate-700 dark:text-slate-200">{questao.autor?.nome || questao.autor?.username || 'Anônimo'}</span></span>
                    <Role usuario={questao.autor} />
                </div>
                <div className="flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-slate-400 dark:text-slate-400/80" />
                    <span>Resoluções: <span className="font-semibold text-slate-700 dark:text-slate-200">{questao.numeroResolucoes ?? 0}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400 dark:text-slate-400/80" />
                    <span>Inserida em: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatarData(questao.dataInsercao)}</span></span>
                </div>
            </div>

            {/* Ações */}
            <div className="mt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-700/60 pt-4">
                <div className="flex gap-2">
                    {/* Botão de Upvote */}
                    <button
                        onClick={handleUpvote}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border ${
                            isUpvoted
                                ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 hover:bg-blue-100'
                                : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={isUpvoted ? "Remover Upvote" : "Dar Upvote"}
                        aria-pressed={isUpvoted}
                        aria-label={`${upvotesCount} upvotes. ${isUpvoted ? 'Clique para remover seu upvote' : 'Clique para dar upvote'}`}
                    >
                        <ThumbsUp size={14} className={isUpvoted ? "fill-current text-blue-600 dark:text-blue-400" : ""} />
                        <span>{upvotesCount}</span>
                    </button>

                    {isAutor && (
                        <>
                            <button
                                onClick={() => setModalEditOpen(true)}
                                className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg text-xs font-bold transition"
                                title="Editar Questão"
                            >
                                <Edit2 size={14} />
                                Editar
                            </button>
                            <BotaoExcluir idQuestao={questao.id} aoExcluirSucesso={onExcluir} />
                        </>
                    )}
                </div>

                <Link
                    to={`/questoes/${questao.id}`}
                    className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition inline-flex items-center gap-1.5 text-center shadow-xs"
                >
                    Responder
                </Link>
            </div>

            {/* Modal de Edição */}
            {modalEditOpen && (
                <QuestaoEditModal
                    questao={questao}
                    isOpen={modalEditOpen}
                    onClose={() => setModalEditOpen(false)}
                    onSalvarSucesso={onEditarSucesso}
                />
            )}
        </div>
    );
}

export default QuestaoCard;