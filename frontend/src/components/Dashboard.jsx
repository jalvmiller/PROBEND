import { Plus } from 'lucide-react';
import { useState } from 'react';
import QuestaoForm from './QuestaoForm';
import QuestaoCard from './QuestaoCard';
import { useQuestoes } from '../hooks/useQuestoes';

function Dashboard() {
  // Estado para controlar se o formulário está visível
  const [mostrarForm, setMostrarForm] = useState(false);

  // Pega as questões do hook
  const { listaQuestoes, carregando, erro, removerDaLista, atualizarLista } = useQuestoes();

  // Quando uma questão é salva com sucesso, fecha o formulário
  const handleSalvarQuestao = (questao) => {
    atualizarLista(questao);
    setMostrarForm(false); // Fecha o formulário
  };

  return (
    <div className="space-y-6">
      {/* Header da Dashboard */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Questões</h2>
      </div>

      {/* Botão de Adicionar Questão */}
      <div className="flex justify-end">
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          <Plus size={20} />
          {mostrarForm ? 'Cancelar' : 'Adicionar Questão'}
        </button>
      </div>

      {/* Formulário (aparece/desaparece ao clicar) */}
      {mostrarForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Nova Questão</h3>
          <QuestaoForm SalvarSucesso={handleSalvarQuestao} />
        </div>
      )}

      {/* Bloco contendo a lista de questões */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Cabeçalho do bloco */}
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            {listaQuestoes.length} Questão(ões)
          </h3>
        </div>

        {/* Conteúdo do bloco */}
        <div className="space-y-4">
          {carregando ? (
            // Animação enquanto carrega
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600" />
            </div>
          ) : erro ? (
            // Caso haja erro
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center">
              <p>{erro}</p>
            </div>
          ) : listaQuestoes.length === 0 ? (
            // Caso não haja questões
            <div className="text-center text-slate-500 py-10">
              <p>Nenhuma questão foi encontrada.</p>
              <p className="text-sm mt-2">Clique em "Adicionar Questão" para criar uma!</p>
            </div>
          ) : (
            // Lista de questões
            listaQuestoes.map((questao) => (
              <QuestaoCard
                key={questao.id}
                questao={questao}
                onExcluir={() => removerDaLista(questao.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
