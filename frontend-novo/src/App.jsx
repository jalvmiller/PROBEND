// import
// não mais -> import './App.css'
import QuestaoCard from "./components/QuestaoCard";

// Componente
function App() {


  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">PROBEND</h1>

      <div className="max-w-2xl w-full">
        {/* como se fosse uma tag HTML:*/}
        <QuestaoCard
          enunciado="O que é o Polimorfismo no Java?"
          materia="Programação Orientada a Objetos"
          dificuldade="Fácil"
        />

        <QuestaoCard
          enunciado="Como funciona o Garbage Collector do Java 25?"
          materia="Arquitetura de Sistemas"
          dificuldade="Difícil"
        />
      </div>
    </div>
  )
}

// export
export default App;