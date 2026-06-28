// import do ícone
import { Menu } from 'lucide-react';
import { LogOut } from 'lucide-react';
import useAuth from "../hooks/useAuth";

// Navbar fica no topo da página
// Função que recebe prop onMenuClick, quando alguém clica no botão do menu
// chama essa função
function Navbar({ onMenuClick }) {

  const { user, logout } = useAuth();

  return (
    // bg blue 600 -> fundo azul
    // text white  -> texto branco
    // shadow lg   -> sombra embaixo da barra
    <nav className="bg-blue-600 text-white shadow-lg">

      {/*
            max-w-7xl       -> largura máxima
            mx-auto         -> centralizar horizontalmente
            px-4            -> espaçamento horizontal interno 1 rem no eixo x
            py-4            -> espaçamento vertical interno de 1 rem no eixo y
            flex            -> flexbox para alinhar elementos na linha
            items-center    -> alinhar verticalmente ao centro
            justify-between -> justificar na linha, espaçar usando os extremos 
         */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* 
            Botão de menu para mobile
            chama a função quando é clicado
            aria-label        ->"Abrir Menu", acessibilidade para leitor de tela
            lg:hidden         -> esconde o botão quando tem tela grande(lg)
            já que em tela grande geralmente a sidebar fica visível e não precisa de nav
            p-2               -> padding de 0.5 rem no botão
            hover:bg-blue-700 -> quando passa o mouse, muda para azul mais escuro
            rounded só deixa as bordas arredondadas
        */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-blue-700 rounded"
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>

        {/* Logo/Titulo */}
        <h1 className="text-2xl font-bold">PROBEND</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:inline">Olá, {user.nome}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1 
                text-sm bg-blue-700 hover:bg-blue-800
                px-3 py-2 rounded 
                transition font-semibold">
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        ) : (
          <div className='w-10' />
        )}
        {/* Espaço vazio colocado na direita da navbar para balancear */}
      </div>
    </nav>
  );
}

export default Navbar;
