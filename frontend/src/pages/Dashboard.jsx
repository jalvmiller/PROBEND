import { useState } from 'react';
import QuestaoForm from './QuestaoForm';
import QuestaoList from '../components/questao/QuestaoList';
import { useQuestoes } from '../hooks/useQuestoes';
import PainelEstatisticas from '../components/dashboard/PainelEstatisticas';
import BotaoAdicionarQuestao from '../components/dashboard/BotaoAdicionarQuestao';
import { Search } from 'lucide-react';

function Dashboard() {
	// Estado para controlar se o formulário está visível
	const [mostrarForm, setMostrarForm] = useState(false);
	const [termoBusca, setTermoBusca]   = useState('');

	// Pega os métodos relacionados ao objeto questões pelo hook
	const { listaQuestoes, carregando, erro, removerDaLista, atualizarLista, pesquisar, editarNaLista, meusUpvotes } = useQuestoes();

	const handleSalvarQuestao = (questao) => {
		atualizarLista(questao);
		setMostrarForm(false); // Fecha o formulário
	};

	return (
		<div className="space-y-5 pb-24">

			{/* Header da Dashboard */}
			<div className="flex items-center justify-between">
				<div>
					<h2
						className="text-2xl font-bold text-slate-900 dark:text-slate-100"
						style={{ fontFamily: '"Sora", sans-serif' }}
					>
						Questões
					</h2>
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
						{listaQuestoes.length > 0
							? `${listaQuestoes.length} questão${listaQuestoes.length !== 1 ? 'ões' : ''} cadastrada${listaQuestoes.length !== 1 ? 's' : ''}`
							: 'Nenhuma questão cadastrada ainda'
						}
					</p>
				</div>
			</div>

			{/* Painel de estatísticas */}
			<PainelEstatisticas listaQuestoes={listaQuestoes} />

			{/* Formulário (aparece/desaparece ao clicar) */}
			{mostrarForm && (
				<div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-6 shadow-xl transition-colors">
					<h3
						className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-5"
						style={{ fontFamily: '"Sora", sans-serif' }}
					>
						Nova Questão
					</h3>
					<QuestaoForm SalvarSucesso={handleSalvarQuestao} />
				</div>
			)}

			{/* Barra de Pesquisa */}
			<div className="relative">
				<Search
					size={16}
					className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 pointer-events-none"
				/>
				<input
					type="text"
					placeholder="Pesquisar por enunciado, matéria, assunto ou fonte…"
					className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 rounded-xl
						text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-400
						focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15
						transition-all duration-200"
					value={termoBusca}
					onChange={(e) => {
						setTermoBusca(e.target.value);
						pesquisar(e.target.value);
					}}
				/>
			</div>

			{/* Listagem de questões com busca e paginação separada */}
			<QuestaoList
				key={termoBusca}
				listaQuestoes={listaQuestoes}
				carregando={carregando}
				erro={erro}
				onExcluir={removerDaLista}
				onEditarSucesso={editarNaLista}
				meusUpvotes={meusUpvotes}
			/>

			{/* Botão flutuante */}
			<BotaoAdicionarQuestao
				onClick={() => setMostrarForm(!mostrarForm)}
				mostrarForm={mostrarForm}
			/>
		</div>
	);
}

export default Dashboard;
