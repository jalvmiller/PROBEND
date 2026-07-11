import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import QuestaoForm from './QuestaoForm';
import QuestaoCard from '../components/questao/QuestaoCard';
import { useQuestoes } from '../hooks/useQuestoes';

function Dashboard() {
	// Estado para controlar se o formulário está visível
	const [mostrarForm, setMostrarForm] = useState(false);
	// Estado local para o termo
	const [termoBusca, setTermoBusca] = useState('');

	// Pega os métodos relacionados ao objeto questões pelo hook
	const { listaQuestoes, carregando, erro, removerDaLista, atualizarLista, pesquisar, editarNaLista } = useQuestoes();

	// Quando uma questão é salva com sucesso, fecha o formulário
	const handleSalvarQuestao = (questao) => {
		atualizarLista(questao);
		setMostrarForm(false); // Fecha o formulário
	};

	return (
		<div className="space-y-6">
			{/* Header da Dashboard */}
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Questões</h2>
			</div>

			<div className="flex justify-end">
				<button
					onClick={() => setMostrarForm(!mostrarForm)}
					className={`flex items-center gap-2 text-white px-6 py-3 rounded-lg transition font-semibold ${
						mostrarForm ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
					}`}
				>
					{mostrarForm ? <X size={20} /> : <Plus size={20} />}
					{mostrarForm ? 'Cancelar' : 'Adicionar Questão'}
				</button>
			</div>

			{/* Formulário (aparece/desaparece ao clicar) */}
			{mostrarForm && (
				<div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-transparent dark:border-slate-800 transition-colors">
					<h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Nova Questão</h3>
					<QuestaoForm SalvarSucesso={handleSalvarQuestao} />
				</div>
			)}

			{/* Barra de Pesquisa */}
			<div className='bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 border border-transparent dark:border-slate-800 transition-colors'>
				<input
					type="text"
					placeholder='Pesquisar por enunciado, matéria, assunto ou fonte'
					className='w-full p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-transparent transition-colors'
					value={termoBusca}
					onChange={(e) => {
						setTermoBusca(e.target.value);
						pesquisar(e.target.value);
					}}
				/>
			</div>

			{/* Bloco contendo a lista de questões */}
			<div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-transparent dark:border-slate-800 transition-colors">
				{/* Cabeçalho do bloco */}
				<div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
					<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
						{listaQuestoes.length} Questão(ões)
					</h3>
				</div>

				{/* Conteúdo do bloco */}
				<div className="space-y-4">
					{carregando ? (
						// Animação enquanto carrega
						<div className="flex justify-center items-center h-40">
							<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600" />
						</div>
					) : erro ? (
						// Caso haja erro
						<div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded text-center">
							<p>{erro}</p>
						</div>
					) : listaQuestoes.length === 0 ? (
						// Caso não haja questões
						<div className="text-center text-slate-500 dark:text-slate-400 py-10">
							<p>Nenhuma questão foi encontrada.</p>
							<p className="text-sm mt-2">Clique em "Adicionar Questão" para criar uma!</p>
						</div>
					) : (
						// Lista de questões
						listaQuestoes.map((questao) => (
							<QuestaoCard
								key={questao.id}
								questao={questao}
								onExcluir={() => removerDaLista(questao.id)}
								onEditarSucesso={editarNaLista}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
}

export default Dashboard;
