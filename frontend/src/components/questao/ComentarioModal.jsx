import { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { questaoService } from '../../services/questaoService';
import UsuarioAvatar from '../ui/UsuarioAvatar';
import DataFormatada from '../ui/DataFormatada';
import { useToastContext } from '../../contexts/ToastContext';

/**
 * ComentarioModal
 *
 * Modal para leitura (pública) e criação (autenticada) de comentários em uma resolução.
 * Recebe: resolucaoId, nomeAutorResolucao, onFechar
 */
export default function ComentarioModal({ resolucaoId, nomeAutorResolucao, onFechar }) {
    const { user } = useAuth();
    const { showToast } = useToastContext();
    const [comentarios, setComentarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [novoComentario, setNovoComentario] = useState('');
    const [enviando, setEnviando] = useState(false);
    const inputRef = useRef(null);
    const backdropRef = useRef(null);

    // Carrega comentários ao abrir
    useEffect(() => {
        const carregar = async () => {
            try {
                setCarregando(true);
                const lista = await questaoService.listarComentarios(resolucaoId);
                setComentarios(lista);
            } catch {
                showToast('Erro ao carregar comentários.', 'error');
            } finally {
                setCarregando(false);
            }
        };
        carregar();
    }, [resolucaoId]);

    // Foca o input de comentário ao abrir (se logado)
    useEffect(() => {
        if (user && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [user, carregando]);

    // Fecha com Esc
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onFechar(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onFechar]);

    const handleEnviar = async (e) => {
        e.preventDefault();
        if (!novoComentario.trim()) return;
        try {
            setEnviando(true);
            const salvo = await questaoService.postarComentario(resolucaoId, novoComentario.trim());
            setComentarios(prev => [...prev, salvo]);
            setNovoComentario('');
            showToast('Comentário adicionado!', 'success');
        } catch {
            showToast('Erro ao enviar comentário.', 'error');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            ref={backdropRef}
            onClick={(e) => { if (e.target === backdropRef.current) onFechar(); }}
            role="dialog"
            aria-modal="true"
            aria-label={`Comentários da resolução de ${nomeAutorResolucao}`}
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/60 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/60 flex-shrink-0">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm truncate pr-2">
                        <MessageSquare size={18} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        <span className="truncate">Comentários · resolução de <strong className="font-semibold">{nomeAutorResolucao}</strong></span>
                    </div>
                    <button
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 flex-shrink-0"
                        onClick={onFechar}
                        aria-label="Fechar modal de comentários"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Lista de comentários */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[160px]" aria-label="Lista de comentários" aria-live="polite">
                    {carregando ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : comentarios.length === 0 ? (
                        <p className="text-center py-12 text-slate-400 dark:text-slate-400 text-sm">Nenhum comentário ainda. Seja o primeiro!</p>
                    ) : (
                        comentarios.map(c => (
                            <div key={c.id} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60" role="article" aria-label={`Comentário de ${c.autor?.nome || c.autor?.username}`}>
                                <UsuarioAvatar usuario={c.autor} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{c.autor?.nome || c.autor?.username}</span>
                                        {c.dataCriacao && <DataFormatada data={c.dataCriacao} />}
                                    </div>
                                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{c.conteudo}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Form de novo comentário */}
                {user ? (
                    <form className="flex items-center gap-3 p-4 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/60 flex-shrink-0" onSubmit={handleEnviar}>
                        <UsuarioAvatar usuario={user} size="sm" />
                        <input
                            ref={inputRef}
                            className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            type="text"
                            value={novoComentario}
                            onChange={e => setNovoComentario(e.target.value)}
                            placeholder="Adicionar um comentário..."
                            disabled={enviando}
                            aria-label="Campo para adicionar comentário"
                        />
                        <button
                            type="submit"
                            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                            disabled={enviando || !novoComentario.trim()}
                            aria-label="Enviar comentário"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                ) : (
                    <p className="p-4 text-center text-xs text-slate-400 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/60 flex-shrink-0">
                        Faça login para adicionar um comentário.
                    </p>
                )}
            </div>
        </div>
    );
}
