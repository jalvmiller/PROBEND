import { Link } from 'react-router-dom';
import BotaoExcluir from "./BotaoExcluir";
import { CheckCircle, Clock } from 'lucide-react';

function QuestaoCard({ questao, onExcluir }) {

    const coresDificuldade =
        questao.dificuldade === 2 ? 'border-red-500' :
            questao.dificuldade === 1 ? 'border-yellow-500' : 'border-green-500';

    // lembrar que não pode usar aspas e sim crase backtick `

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-lg border-l-8 ${coresDificuldade} mb-4 transition-transform hover:scale-[1.02]`}>
            <div className='flex justify-between items-start'>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {questao.materia}
                </span>

                {questao.solucionada ? (
                    <span className='text-green-600 flex items-center gap-1 text-xs font-bold'>
                        <CheckCircle size={14} /> Solucionada
                    </span>
                ) : (
                    <span className='text-amber-600 flex items-center gap-1 text-xs font-bold'>
                        <Clock size={14} /> Pendente
                    </span>
                )}
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mt-2">
                {questao.enunciado}
            </h2>

            <div className="mt-4 flex justify-end items-center gap-4">
                <BotaoExcluir idQuestao={questao.id} aoExcluirSucesso={onExcluir} />

                <Link
                    to={`/questoes/${questao.id}`}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition inline-block text-center">
                    Responder
                </Link>
            </div>
        </div>
    );
}

export default QuestaoCard;