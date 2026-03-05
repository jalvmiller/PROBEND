// import
// não mais -> import './App.css'
import QuestaoCard from "./components/QuestaoCard";

// Componente
function App() {

  const listaQuestoes = [
    { /* OBJ 1 */
      id: 101,
      enunciado: "O que acontece se uma execção não for capturada?",
      materia: "Java Exception",
      dificuldade: "Fácil"
    },
    { /* OBJ 2 */
      id: 102,
      enunciado: "Conceito de imutabilidade de Strings",
      materia: "Java",
      dificuldade: "Médio"
    },
    { /* OBJ 3 */
      id: 103,
      enunciado: "Explique o que é o ciclo de vida de um singleton bean",
      materia: "Spring",
      dificuldade: "Difícil"
    }
  ];


  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">PROBEND</h1>

      <div className="max-w-2xl w-full">
        {/* como se fosse uma tag HTML:*/}
        {/* array de objetos em uma lista de componentes*/}
        {/* listaQuestoes.map((questao)), mapeamento de cada item do array para um componente QuestaoCard*/}
        
        
        {listaQuestoes.map((questao) => (
        <QuestaoCard
          key={questao.id} // OBRIGATÓRIO USAR NO REACT, igual ao @Id do JPA
          enunciado={questao.enunciado}
          materia={questao.materia}
          dificuldade={questao.dificuldade}
        />
        ))}


      </div>
    </div>
  )
}

// export
export default App;