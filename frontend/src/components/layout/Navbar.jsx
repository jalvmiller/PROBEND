// import dos ícones
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getMediaUrl } from '../../utils/urlUtils';

// Navbar fica no topo da página
// Função que recebe prop onMenuClick, quando alguém clica no botão do menu chama essa função
function Navbar({ onMenuClick }) {
	const { user, logout } = useAuth();
	// sem destruct; retorna uma String
	const avatarUrl = getMediaUrl(user?.avatar);

	return (
		// bg-white dark:bg-[#161e2e] -> fundo claro / escuro
		// shadow-xs dark:shadow-black/40 -> sombra embaixo da barra
		// border-b                       -> borda na parte inferior
		<nav className="flex-shrink-0 bg-white dark:bg-[#161e2e] border-b border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-black/40 transition-colors">
			{/*
				max-w-full      -> largura máxima total
				px-5            -> espaçamento horizontal interno no eixo X
				py-3            -> espaçamento vertical interno no eixo Y
				flex            -> flexbox para alinhar elementos na linha
				items-center    -> alinhar verticalmente ao centro
				justify-between -> justificar na linha, espaçar usando os extremos
			*/}
			<div className="max-w-full px-5 py-3 flex items-center justify-between gap-4">

				{/* 
					Botão de menu para mobile (hamburger)
					chama a função onMenuClick quando é clicado
					aria-label        -> "Abrir menu", acessibilidade para leitor de tela
					lg:hidden         -> esconde o botão em telas grandes (lg) já que a sidebar fica visível
					p-2               -> padding de 0.5rem no botão
					rounded-lg        -> bordas arredondadas
				*/}
				<button
					onClick={onMenuClick}
					className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					aria-label="Abrir menu"
				>
					<Menu size={22} />
				</button>

				{/* Logo / Título */}
				<div className="flex items-center gap-2.5">
					{/* Ícone de marca */}
					<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
						<span className="text-white font-bold text-xs leading-none">PB</span>
					</div>
					<h1
						className="text-xl font-bold tracking-widest"
						style={{ fontFamily: '"Sora", sans-serif' }}
					>
						<span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
							PROBEND
						</span>
					</h1>
				</div>

				{/* Área do usuário / Botões de login e logout */}
				{user ? (
					<div className="flex items-center gap-3">
						{/* Pill com avatar + nome do usuário */}
						<div className="flex items-center gap-2.5 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 pl-1.5 pr-4 py-1 rounded-full backdrop-blur-sm">
							{/* Avatar */}
							<div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-900/60 flex items-center justify-center ring-2 ring-indigo-500/30 flex-shrink-0">
								{avatarUrl ? (
									<img
										src={avatarUrl}
										alt={user.nome || 'Usuários'}
										className="w-full h-full object-cover"
									/>
								) : (
									<User size={15} className="text-indigo-500 dark:text-indigo-300" />
								)}
							</div>
							<span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block truncate max-w-[9rem]">
								{user.nome}
							</span>
						</div>

						{/* Botão Sair / Logout */}
						<button
							onClick={logout}
							className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg border border-transparent hover:border-red-500/20 transition-all duration-200 font-medium"
						>
							<LogOut size={15} />
							<span className="hidden sm:inline">Sair</span>
						</button>
					</div>
				) : (
					/* Espaço vazio colocado na direita da navbar para balancear */
					<div className="w-10" />
				)}
			</div>
		</nav>
	);
}

export default Navbar;