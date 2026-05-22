// import
// não mais -> import './App.css'
import { useState, useEffect } from "react";
import axios from "axios";
import QuestaoCard from "./components/QuestaoCard";

// Componente
function App() {

  // useState, primeira iteração com simulação de busca no backend via java/spring
  //       getter             setter          lista vazia
  const [listaQuestoes, setListaQuestoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null); // Estado p/ erros

  useEffect(() => {
    const carregarDadosBanco = async () => {

      try {
        setCarregando(true);
        setErro(null); // Resetar antes de buscar
        // context-path = api
        const resposta = await axios.get("http://localhost:8080/api/questoes");

        // captura do JSON pelo useState
        setListaQuestoes(resposta.data);
      } catch (err) {

        console.error("Erro ao conectar no Spring", err);
        setErro("O servidor não está ligado");

      } finally {
        setCarregando(false);
      }
    };

    carregarDadosBanco();

  }, []); // array vazio no final, ele indica que esse trecho deve ser executado "onLoad"



  // == Teste, sem uso de arquivo externo jsx == Teste, sem uso de arquivo externo jsx == Teste, sem uso de arquivo externo jsx ==
  // == Teste, sem uso de arquivo externo jsx == Teste, sem uso de arquivo externo jsx == Teste, sem uso de arquivo externo jsx ==
  // == Teste, sem uso de arquivo externo jsx == Teste, sem uso de arquivo externo jsx == Teste, sem uso de arquivo externo jsx ==

  const [novaQuestao, setNovaQuestao] = useState({
    enunciado: "",
    materia: "",
    dificuldade: "0",
    alternativaCorreta: "",
    alternativaIncorreta1: "",
    alternativaIncorreta2: "",
    alternativaIncorreta3: ""
  });


  const handleSalvar = async (e) => {
    e.preventDefault();

    try {
      const resposta = await axios.post("http://localhost:8080/api/questoes", novaQuestao);

      setListaQuestoes([...listaQuestoes, resposta.data]);

      setNovaQuestao({ enunciado: "", materia: "", dificuldade: "0" });
      alert("Questão salva");
    } catch (err) {
      console.error("Erro ", err);
    }
  };



  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">PROBEND</h1>

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



      <div className="max-w-2xl w-full">
        {/* como se fosse uma tag HTML:*/}
        {/* array de objetos em uma lista de componentes*/}
        {/* listaQuestoes.map((questao)), mapeamento de cada item do array para um componente QuestaoCard*/}

        {carregando ? (
          // Animação enquanto não carrega
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600">
            </div>
          </div>

        ) : erro ? (
          // Caso ocorra um erro:
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center">
            <p>{erro}</p>
          </div>

        ) : listaQuestoes.length === 0 ? (
          // Caso nenhuma questão seja encontrada:
          <div className="text-center text-slate-500 py-10">
            <p>Nenhuma questão foi encontrada.</p>
          </div>

        ) : (
          // Lista de questões:
          listaQuestoes.map((questao) => {
            console.log("Objeto:", questao);
            return (
              <QuestaoCard
                key={questao.id}
                enunciado={questao.enunciado}
                materia={questao.materia}
                dificuldade={questao.dificuldade}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

// export
export default App;