// import
// não mais -> import './App.css'
import { useState, useEffect } from "react";
import axios from "axios";
import QuestaoCard from "./components/QuestaoCard";
import QuestaoForm from "./components/QuestaoForm";

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



  // Chamada pelo QuestaoForm quando um POST for bem-sucedido
  const atualizarLista = (novaQuestao) => {
    // Nova questão no início da lista para o usuário ver na hora
    setListaQuestoes([novaQuestao, ...listaQuestoes]);
  };

  

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">PROBEND</h1>

      {/* Chama o componente e passa a função via Prop */}
      <QuestaoForm SalvarSucesso={atualizarLista} />


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