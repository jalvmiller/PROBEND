import { useState } from 'react';
import QuestaoForm from './QuestaoForm';
import QuestaoList from '../components/questao/QuestaoList';
import { useQuestoes } from '../hooks/useQuestoes';
import PainelEstatisticas from '../components/dashboard/PainelEstatisticas';
import BotaoAdicionarQuestao from '../components/dashboard/BotaoAdicionarQuestao';
import { Search } from 'lucide-react';

function Dashboard() {
	const [mostrarForm, setMostrarForm] = useState(false);
	const [termoBusca, setTermoBusca]   = useState('');

	const { listaQuestoes, carregando, erro, removerDaLista, atualizarLista, pesquisar, editarNaLista, meusUpvotes } = useQuestoes();

	const handleSalvarQuestao = (questao) => {
		atualizarLista(questao);
		setMostrarForm(false);
	};

	return (
		<div className="space-y-5 pb-24">

			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2
						className="text-2xl font-bold text-zinc-100"
						style={{ fontFamily: '"Sora", sans-serif' }}
					>
						Questões
					</h2>
					<p className="text-sm text-zinc-500 mt-0.5">
						{listaQuestoes.length > 0
							? `${listaQuestoes.length} questão${listaQuestoes.length !== 1 ? 'ões' : ''} cadastrada${listaQuestoes.length !== 1 ? 's' : ''}`
							: 'Nenhuma questão cadastrada ainda'
						}
					</p>
				</div>
			</div>

			{/* Painel de estatísticas */}
			<PainelEstatisticas listaQuestoes={listaQuestoes} />

			{/* Formulário de nova questão (condicional) */}
			{mostrarForm && (
				<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl shadow-black/20">
					<h3
						className="text-lg font-bold text-zinc-100 mb-5"
						style={{ fontFamily: '"Sora", sans-serif' }}
					>
						Nova Questão
					</h3>
					<QuestaoForm SalvarSucesso={handleSalvarQuestao} />
				</div>
			)}

			{/* Barra de pesquisa */}
			<div className="relative">
				<Search
					size={16}
					className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
				/>
				<input
					type="text"
					placeholder="Pesquisar por enunciado, matéria, assunto ou fonte…"
					className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl
						text-zinc-100 text-sm placeholder:text-zinc-600
						focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15
						transition-all duration-200"
					value={termoBusca}
					onChange={(e) => {
						setTermoBusca(e.target.value);
						pesquisar(e.target.value);
					}}
				/>
			</div>

			{/* Listagem de questões */}
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
