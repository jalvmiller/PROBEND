import { useState, useEffect } from 'react';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { questaoService } from '../../services/questaoService';
import { renderizarTextoMath } from '../../utils/mathRenderer';
import CodeBlock from '../../utils/CodeBlock';
import Role from '../ui/Role';
import UsuarioAvatar from '../ui/UsuarioAvatar';
import DataFormatada from '../ui/DataFormatada';
import ComentarioModal from './ComentarioModal';
import { useToastContext } from '../../contexts/ToastContext';

function ResolucaoCard({ resolucao, meusUpvotes }) {
    const { user } = useAuth();
    const { showToast } = useToastContext();
    const [upvotesCount, setUpvotesCount] = useState(resolucao.upvotes || 0);
    const [isUpvoted, setIsUpvoted] = useState(false);
    const [modalComentariosAberto, setModalComentariosAberto] = useState(false);
    // A quantidade de comentários é carregada otimizada diretamente do backend via @Formula
    const [qtdComentarios, setQtdComentarios] = useState(resolucao.qtdComentarios ?? 0);

    useEffect(() => {
        if (meusUpvotes && meusUpvotes.includes(resolucao.id)) {
            setIsUpvoted(true);
        } else {
            setIsUpvoted(false);
        }
    }, [meusUpvotes, resolucao.id]);

    const handleUpvote = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            showToast('Você precisa estar logado para dar upvote!', 'info');
            return;
        }

        try {
            const resultado = await questaoService.upvoteResolucao(resolucao.id);
            setUpvotesCount(resultado.upvotes);
            setIsUpvoted(resultado.upvoted);
        } catch (err) {
            console.error("Erro ao dar upvote na resolução:", err);
            showToast('Erro ao registrar upvote.', 'error');
        }
    };

    return (
        // Janela do Card de Resolução
        <div className='bg-white dark:bg-slate-800/90 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-700/60 p-6 space-y-4 transition hover:shadow-md transition-colors duration-300'>
            <div className='flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-2'>
                {/* Informações sobre quem postou a resolução */}
                <div className='flex items-center space-x-3'>
                    <UsuarioAvatar usuario={resolucao.autor} size="md" />

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className='text-sm font-semibold text-slate-600 dark:text-slate-400'>
                                Respondido por: <span className='text-slate-800 dark:text-slate-200'>{resolucao.autor?.nome || resolucao.autor?.username}</span>
                            </span>
                            <Role usuario={resolucao.autor} />
                        </div>
                        {resolucao.dataCriacao && (
                            <DataFormatada data={resolucao.dataCriacao} />
                        )}
                    </div>
                </div>

                {/* Botão de Upvote */}
                <button
                    onClick={handleUpvote}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border ${isUpvoted
                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 hover:bg-blue-100'
                        : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    title={isUpvoted ? "Remover Upvote" : "Dar Upvote"}
                    aria-pressed={isUpvoted}
                    aria-label={`${upvotesCount} upvotes. ${isUpvoted ? 'Clique para remover seu upvote' : 'Clique para dar upvote'}`}
                >
                    <ThumbsUp size={20} className={isUpvoted ? "fill-current text-blue-600 dark:text-blue-400" : ""} />
                    <span className="text-sm font-bold">{upvotesCount}</span>
                </button>

                {/* Botão de Comentários */}
                <button
                    onClick={() => setModalComentariosAberto(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label={`Ver ${qtdComentarios ?? '...'} comentários desta resolução`}
                    title="Ver comentários"
                >
                    <MessageSquare size={16} />
                    <span>{qtdComentarios !== null ? qtdComentarios : '...'}</span>
                </button>
            </div>

            {/* Renderização do conteúdo da resolução
            * leading-relaxed aumenta o espaçamento entre linhas para melhor leitura
            * o leading-relaxed seta a altura da linha com 1.625 ou 162.5% do tamanho da fonte
            * desse modo o texto fica menos "apertado"
            * o whitespace-pre-wrap mantém a formatação do texto (incluindo quebras de linha)
            * sendo que o conteúdo vem do banco de dados com quebras de linha \n         
            */}
            <div className='text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap transition-colors duration-300'>
                {renderizarTextoMath(resolucao.conteudo)}
            </div>

            {/* Renderização do trecho de código (se houver) */}
            {resolucao.trechoCodigo && (
                <CodeBlock
                    code={resolucao.trechoCodigo}
                    language={resolucao.linguagemCodigo}
                />
            )}

            {/* Modal de comentários */}
            {modalComentariosAberto && (
                <ComentarioModal
                    resolucaoId={resolucao.id}
                    nomeAutorResolucao={resolucao.autor?.nome || resolucao.autor?.username || 'Anônimo'}
                    onFechar={() => {
                        setModalComentariosAberto(false);
                        // Atualiza contagem após fechar o modal
                        questaoService.listarComentarios(resolucao.id)
                            .then(lista => setQtdComentarios(lista.length))
                            .catch(() => {});
                    }}
                />
            )}
        </div>
    );
}

export default ResolucaoCard;