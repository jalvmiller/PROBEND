// import
import './App.css'

// Componente
function App() {


  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center p-6">

      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-l-8 border-blue-500">
        <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
          Java+Spring
        </span>

        <h1 className="text-2xl font-black text-gray-800 mt-2 mb-4">
          Confg.
        </h1>

        <p className="text-gray-600 leading-relaxed mb-6">
          CARD
        </p>

        ,<button className="w-full bg-blue-600 hover:bg-blue-700 text-white
                           font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg">
                            Muita coisa inline
        </button>
      </div>
    </div>
  )
}

// export
export default App