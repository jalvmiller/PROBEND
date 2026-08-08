import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getMediaUrl } from '../../utils/urlUtils';

// Navbar fixa no topo da aplicação
function Navbar({ onMenuClick }) {
	const { user, logout } = useAuth();
	const avatarUrl = getMediaUrl(user?.avatar);

	return (
		<nav className="flex-shrink-0 bg-zinc-900 border-b border-zinc-800 shadow-lg shadow-black/30">
			<div className="max-w-full px-5 py-3 flex items-center justify-between gap-4">

				{/* Botão hamburger — apenas mobile */}
				<button
					onClick={onMenuClick}
					className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
					aria-label="Abrir menu"
				>
					<Menu size={22} />
				</button>

				{/* Logo */}
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

				{/* Área do usuário */}
				{user ? (
					<div className="flex items-center gap-3">
						{/* Pill com avatar + nome */}
						<div className="flex items-center gap-2.5 bg-zinc-800/70 border border-zinc-700/50 pl-1.5 pr-4 py-1 rounded-full backdrop-blur-sm">
							{/* Avatar */}
							<div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-900/60 flex items-center justify-center ring-2 ring-indigo-500/30 flex-shrink-0">
								{avatarUrl ? (
									<img
										src={avatarUrl}
										alt={user.nome || 'Usuário'}
										className="w-full h-full object-cover"
									/>
								) : (
									<User size={15} className="text-indigo-300" />
								)}
							</div>
							<span className="text-sm font-medium text-zinc-200 hidden sm:block truncate max-w-[9rem]">
								{user.nome}
							</span>
						</div>

						{/* Botão sair */}
						<button
							onClick={logout}
							className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg border border-transparent hover:border-red-500/20 transition-all duration-200 font-medium"
						>
							<LogOut size={15} />
							<span className="hidden sm:inline">Sair</span>
						</button>
					</div>
				) : (
					<div className="w-10" />
				)}
			</div>
		</nav>
	);
}

export default Navbar;