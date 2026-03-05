// import
// não mais -> import './App.css'
import { useState } from "react";
import QuestaoCard from "./components/QuestaoCard";

// Componente
function App() {

  // useState, primeira iteração com simulação de busca no backend via java/spring
  //       getter             setter          lista vazia
  const [listaQuestoes, setListaQuestoes] = useState([]);

  // simulação
  const buscaQuestoes = () => {
    const resultQuestoes = [
      { id: 1, enunciado: "oq e um bean", materia: "spring", dificuldade: "Fácil"},
      { id: 2, enunciado: "2+2", materia: "matematica", dificuldade: "Fácil"}
    ];

    // atualização de estado. O react percebe a mudança e plota na hora
    setListaQuestoes(resultQuestoes);
  };


  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">PROBEND</h1>


      <button
        onClick={buscaQuestoes}
        className="mb-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all"
      >
        Carregar informações!
      </button>



      <div className="max-w-2xl w-full">
        {/* como se fosse uma tag HTML:*/}
        {/* array de objetos em uma lista de componentes*/}
        {/* listaQuestoes.map((questao)), mapeamento de cada item do array para um componente QuestaoCard*/}
        
        {listaQuestoes === 0 ? (
          <p className="text-gray-500 text-center bold">O banco de questões está vazio.</p>
        ) : (
        listaQuestoes.map((questao) => (
        <QuestaoCard
          key={questao.id} // OBRIGATÓRIO USAR NO REACT, igual ao @Id do JPA
          enunciado={questao.enunciado}
          materia={questao.materia}
          dificuldade={questao.dificuldade}
        />
        )))}


      </div>
    </div>
  )
}

// export
export default App;