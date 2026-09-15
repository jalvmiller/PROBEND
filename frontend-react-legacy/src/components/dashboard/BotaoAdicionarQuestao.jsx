import { Plus, X } from 'lucide-react';

// Botão flutuante para abrir/fechar o formulário de nova questão
function BotaoAdicionarQuestao({ onClick, mostrarForm }) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <button
                onClick={onClick}
                id="btn-adicionar-questao"
                className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-sm text-white
                    shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95
                    border border-white/10 backdrop-blur-md cursor-pointer
                    ${mostrarForm
                        ? 'bg-red-500/80 hover:bg-red-500 shadow-red-500/30 border-red-400/20'
                        : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-indigo-500/40'
                    }`}
            >
                {mostrarForm ? <X size={18} /> : <Plus size={18} />}
                <span>{mostrarForm ? 'Fechar formulário' : 'Nova questão'}</span>
            </button>
        </div>
    );
}

export default BotaoAdicionarQuestao;

