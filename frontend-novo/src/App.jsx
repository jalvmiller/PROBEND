// import
// não mais -> import './App.css'
import { useState, useEffect } from "react";
import QuestaoCard from "./components/QuestaoCard";

// Componente
function App() {

  // useState, primeira iteração com simulação de busca no backend via java/spring
  //       getter             setter          lista vazia
  const [listaQuestoes, setListaQuestoes] = useState([]);
  const [carregando, setCarregando] = useState(true); 

  useEffect(() => {
    console.log("Buscando..");

    setTimeout(() => {
      const resultQuestoes = [
      { id: 1, enunciado: "oq e um bean", materia: "spring", dificuldade: "Fácil"},
      { id: 2, enunciado: "2+2", materia: "matematica", dificuldade: "Fácil"}
    ];

    // atualização de estado. O react percebe a mudança e plota na hora   setListaQuestoes(resultQuestoes);
    setListaQuestoes(resultQuestoes);
    setCarregando(false);

    }, 2000)
  }, []); // array vazio no final, ele indica que esse trecho deve ser executado "onLoad"




  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">PROBEND</h1>


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
        ) : (
          listaQuestoes.map((questao) => {
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