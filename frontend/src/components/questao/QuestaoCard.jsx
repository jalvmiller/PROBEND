import { Link } from 'react-router-dom';
import BotaoExcluir from "../ui/BotaoExcluir";
import { CheckCircle, Clock, Edit2, User, Calendar, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import QuestaoEditModal from './QuestaoEditModal';
import { useState } from 'react';

function QuestaoCard({ questao, onExcluir, onEditarSucesso }) {
    const { user } = useAuth();
    const [modalEditOpen, setModalEditOpen] = useState(false);

    const coresDificuldade =
        questao.dificuldade === 2 ? 'border-red-500' :
            questao.dificuldade === 1 ? 'border-yellow-500' : 'border-green-500';

    const textoDificuldade =
        questao.dificuldade === 2 ? 'Difícil' :
            questao.dificuldade === 1 ? 'Médio' : 'Fácil';

    const badgesDificuldade =
        questao.dificuldade === 2 ? 'bg-red-50 text-red-700 border-red-200' :
            questao.dificuldade === 1 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200';

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
        } catch (e) {
            return "Não informada";
        }
    };

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-lg border-l-8 ${coresDificuldade} mb-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]`}>
            {/* Linha superior: Matéria/Assunto e Status/Dificuldade */}
            <div className='flex flex-wrap justify-between items-start gap-2 mb-3'>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        {questao.materia}
                    </span>
                    {questao.assunto && (
                        <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                            {questao.assunto}
                        </span>
                    )}
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${badgesDificuldade}`}>
                        {textoDificuldade}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {questao.solucionada ? (
                        <span className='text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold'>
                            <CheckCircle size={14} /> Solucionada
                        </span>
                    ) : (
                        <span className='text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold'>
                            <Clock size={14} /> Pendente
                        </span>
                    )}
                </div>
            </div>

            {/* Enunciado truncado com "..." se passar do limite de seu espaço */}
            <h2 className="text-lg font-semibold text-slate-800 line-clamp-2 hover:line-clamp-none transition-all duration-300 cursor-pointer" title="Clique para expandir o enunciado">
                {questao.enunciado}
            </h2>

            {/* Metadados: Autor, Resoluções, Data de inserção */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                    <User size={14} className="text-slate-400" />
                    <span>Autor: <span className="font-semibold text-slate-700">{questao.autor?.nome || questao.autor?.username || 'Anônimo'}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-slate-400" />
                    <span>Resoluções: <span className="font-semibold text-slate-700">{questao.numeroResolucoes ?? 0}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    <span>Inserida em: <span className="font-semibold text-slate-700">{formatarData(questao.dataInsercao)}</span></span>
                </div>
            </div>

            {/* Ações */}
            <div className="mt-4 flex justify-between items-center border-t border-slate-50 pt-4">
                <div className="flex gap-2">
                    {isAutor && (
                        <>
                            <button
                                onClick={() => setModalEditOpen(true)}
                                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition"
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
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition inline-flex items-center gap-1.5 text-center">
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