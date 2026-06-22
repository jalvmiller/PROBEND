import { useState } from "react";
import { questaoService } from "../services/questaoService";

// 
// 

function QuestaoForm({ SalvarSucesso }) {

  const [novaQuestao, setNovaQuestao] = useState({
    enunciado: "",
    materia: "",
    assunto: "",
    dificuldade: "0",
    fonte: "",
    trechoCodigo: "",
    linguagemCodigo: ""
  });

  const handleSalvar = async (e) => {
    e.preventDefault();

    try {
      const dadosSalvos = await questaoService.salvar(novaQuestao);
      // Avisar o componente pai (App.js) que a questão foi salvo, enviar o novo objeto
      SalvarSucesso(dadosSalvos);
      // Limpar formulário para o próximo POST
      setNovaQuestao({
        enunciado: "",
        materia: "",
        assunto: "",
        dificuldade: "0",
        fonte: "",
        trechoCodigo: "",
        linguagemCodigo: ""
      });

      alert("Questão salva com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao conectar com o Spring. Verifique o console.");
    }
  };

  return (
    <form onSubmit={handleSalvar} className="bg-white p-6 rounded-lg shadow-md mb-8 w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Nova Questão</h2>

      <textarea
        className="w-full p-2 border rounded mb-3"
        placeholder="Digite o enunciado:"
        value={novaQuestao.enunciado}
        onChange={(e) => setNovaQuestao({ ...novaQuestao, enunciado: e.target.value })}
        required
      />

      <div className="flex gap-4 mb-4">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="Matéria (ex: Java)"
          value={novaQuestao.materia}
          onChange={(e) => setNovaQuestao({ ...novaQuestao, materia: e.target.value })}
          required
        />

        <input
          className="flex-1 p-2 border rounded"
          placeholder="Assunto"
          value={novaQuestao.assunto}
          onChange={(e) => setNovaQuestao({ ...novaQuestao, assunto: e.target.value })}
        />

        <select
          className="p-2 border rounded"
          value={novaQuestao.dificuldade}
          onChange={(e) => setNovaQuestao({ ...novaQuestao, dificuldade: e.target.value })}
        >
          <option value="0">Fácil</option>
          <option value="1">Médio</option>
          <option value="2">Difícil</option>
        </select>
      </div>

      <input
        className="w-full p-2 border rounded mb-4"
        placeholder="Fonte (ex: Livro X, Aula Y)"
        value={novaQuestao.fonte}
        onChange={(e) => setNovaQuestao({ ...novaQuestao, fonte: e.target.value })}
      />

      <textarea
        className="w-full p-2 border rounded mb-3"
        placeholder="Trecho de código (opcional)"
        value={novaQuestao.trechoCodigo}
        onChange={(e) => setNovaQuestao({ ...novaQuestao, trechoCodigo: e.target.value })}
        rows="4"
      />

      <select
        className="w-full p-2 border rounded mb-4"
        value={novaQuestao.linguagemCodigo}
        onChange={(e) => setNovaQuestao({ ...novaQuestao, linguagemCodigo: e.target.value })}
      >
        <option value="">Sem linguagem</option>
        <option value="java">Java</option>
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
        <option value="cpp">C++</option>
        <option value="csharp">C#</option>
        <option value="sql">SQL</option>
      </select>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 w-full">
        Adicionar Questão
      </button>
    </form>
  );
};

export default QuestaoForm;