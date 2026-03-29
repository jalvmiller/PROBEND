import { useState } from "react";
import axios from "axios";


function QuestaoForm( { SalvarSucesso }) {

    const [novaQuestao, setNovaQuestao] = useState ({
        enunciado: "",
        materia: "",
        dificuldade: "0",
        alternativaCorreta: "",
        alternativaIncorreta1: "",
        alternativaIncorreta2: "",
        alternativaIncorreta3: ""
    });

//     const handleSalvar = async (e) => {
//     e.preventDefault();

//     try {
//       const resposta = await axios.post("http://localhost:8080/api/questoes", novaQuestao);

//       setListaQuestoes([...listaQuestoes, resposta.data]);

//       setNovaQuestao({ enunciado: "", materia: "", dificuldade: "0" });
//       alert("Questão salva");
//     } catch (err) {
//       console.error("Erro ", err);
//     }
//   };

    const handleSalvar = async (e) => {
        e.preventDefault();

        try {
            //const resposta = await axios.post("http://localhost:8080/api/questoes", novaQuestao);
            const resposta = await axios.post(`${import.meta.env.VITE_API_URL}/questoes`, novaQuestao);

            // Avisar o componente pai (App.js) que a questão foi salvo, enviar o novo objeto
            SalvarSucesso(resposta.data);

            // Limpar formulário para o próximo POST
            setNovaQuestao({ 
                enunciado: "", 
                materia: "", 
                dificuldade: "0",
                alternativaCorreta: "",
                alternativaIncorreta1: "",
                alternativaIncorreta2: "",
                alternativaIncorreta3: ""
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
          className="w-full p-2 border rounded mb-2"
          placeholder="Alternativa Correta"
          value={novaQuestao.alternativaCorreta}
          onChange={(e) => setNovaQuestao({ ...novaQuestao, alternativaCorreta: e.target.value })}
          required
        />

       <input
          className="w-full p-2 border rounded mb-2"
          placeholder="Alternativa Incorreta 1"
          value={novaQuestao.alternativaIncorreta1}
          onChange={(e) => setNovaQuestao({ ...novaQuestao, alternativaIncorreta1: e.target.value })}
          required
        />

       <input
          className="w-full p-2 border rounded mb-2"
          placeholder="Alternativa Incorreta 2"
          value={novaQuestao.alternativaIncorreta2}
          onChange={(e) => setNovaQuestao({ ...novaQuestao, alternativaIncorreta2: e.target.value })}
          required
        />

       <input
          className="w-full p-2 border rounded mb-2"
          placeholder="Alternativa Incorreta 3"
          value={novaQuestao.alternativaIncorreta3}
          onChange={(e) => setNovaQuestao({ ...novaQuestao, alternativaIncorreta3: e.target.value })}
          required
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 w-full">
          Adicionar Questão
        </button>
      </form>
    );
};

export default QuestaoForm;