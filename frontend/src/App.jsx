// import
// não mais -> import './App.css'
import { useQuestoes } from "./hooks/useQuestoes";
import QuestaoCard from "./components/QuestaoCard";
import QuestaoForm from "./components/QuestaoForm";

// Componente
function App() {

  // Resgatando todas as variáveis e funções que vão ser usadas aqui da pasta Hooks
  // App.jsx é o componente principal.. começa com o import do hook de questões e recebe uma série de "estados" 
  // São eles, loading; erro; lista de cards; card para cada questão; 
  // passa o removerDaLista para o card por meio de prop (onExcluir)
  const { listaQuestoes, carregando, erro, removerDaLista, atualizarLista } = useQuestoes();

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">PROBEND</h1>

      {/* Chama o componente e passa a função via Prop */}
      <QuestaoForm SalvarSucesso={atualizarLista} />
      <div className="max-w-2xl w-full">
        {/* esse className é do React*/}

        {/* array de objetos em uma lista de componentes*/}
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
          // Caso nenhum dos casos anteriores ocorra, puxar a lista de questões da API do backend e mapear para cada 
          // elemento QuestaoCard:
          // Lista de questões:
          listaQuestoes.map((questao) => {
            console.log("Objeto:", questao);
            return (
              <QuestaoCard
                key={questao.id}
                questao={questao}
                onExcluir={removerDaLista}
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