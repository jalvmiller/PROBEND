import { Trash2 } from "lucide-react";
import { questaoService } from "../../services/questaoService";
import { useToastContext } from "../../contexts/ToastContext";

function BotaoExcluir({ idQuestao, aoExcluirSucesso }) {
    const { showToast } = useToastContext();

    // Função que lida com o handle, ou apertar do botão
    const handleDeletar = async () => {
        if (!window.confirm("Tem certeza que quer deletar a questão?")) return;

        try {
            // Delegação da chamada para a service
            await questaoService.excluir(idQuestao);

            // Se o Spring respondeu com sucesso, avisamos o componente pai
            aoExcluirSucesso(idQuestao);
            showToast('Questão removida com sucesso!', 'success');
        } catch (err) {
            console.error("Erro ao deletar:", err);
            showToast('Erro ao excluir. O servidor pode estar offline ou o ID não existe.', 'error');
        }
    };

    // Retorno em si do .jsx, é só o componente.. o tratamento do botão fica aqui por conveniência    
    return (
        <button
            onClick={handleDeletar}
            className="flex items-center gap-1 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-xs font-bold border border-red-200 dark:border-red-900/40 transition-colors cursor-pointer"
            title="Excluir Questão"
            aria-label="Excluir Questão"
        >
            <Trash2 size={14} />
            Excluir
        </button>
    );
}

export default BotaoExcluir;