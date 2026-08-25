import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Configuracoes from "./pages/Configuracoes";
import QuestaoDetalhes from "./components/questao/QuestaoDetalhes";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/layout/PrivateRoute";
import { ToastProvider } from "./contexts/ToastContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import ModeStatusBar from "./components/ui/ModeStatusBar";
import KeyboardHelpOverlay from "./components/ui/KeyboardHelpOverlay";
import { useVimNavigation } from "./hooks/useVimNavigation";

/**
 * VimNavigationController — componente interno que inicializa o hook de navegação.
 * Separado para ter acesso ao contexto de acessibilidade via AccessibilityProvider.
 */
function VimNavigationController() {
	const [helpAberto, setHelpAberto] = useState(false);

	useVimNavigation({
		onToggleHelp: () => setHelpAberto(prev => !prev),
	});

	return (
		<>
			<KeyboardHelpOverlay aberto={helpAberto} onFechar={() => setHelpAberto(false)} />
			<ModeStatusBar />
		</>
	);
}

function App() {
	/* 
	BrowserRouter é um componente que cria o ambiente de navegação para a aplicação.
	Ele diz para o navegador qual tela carregar para cada endereço.. 
	ex: Se for "/login" carrega o Login, se for "/register" carrega o Register
    
	Routes funciona como um painel de controle que verifica qual é a URL da barra
	de endereço, e procura de cima pra baixo qual é a rota correspondente.
    
	Rota Pública = qualquer pessoa acessa e, quando a URL corresponde, a tela vai
	ser limpa e vai renderizar só o card de Login.. não vai usar menus ou o header
    
	Rota Privada = só usuários autenticados acessam e,
	se a URL for a raiz (/) então o react deve carregar o componente
	Layout. O Layout por fora é "invisível", ele só existe para abrigar as rotas que precisam 
	dele. É aqui dentro do Layout que fica o menu e o header. Então, ao entrar na raiz, 
	o usuário vê o menu e o header e, no meio deles, aparece o Dashboard.
	*/
	return (
		<AuthProvider>
			<AccessibilityProvider>
				<ToastProvider>
					<BrowserRouter>
						{/* Controla a navegação por teclado estilo Vim globalmente */}
						<VimNavigationController />

						<Routes>
							{/* Rotas Públicas */}
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />

							{/* Rotas Privadas */}
							<Route
								path="/questoes/:id"
								element={
									<PrivateRoute>
										<Layout fullHeight>
											<QuestaoDetalhes />
										</Layout>
									</PrivateRoute>
								}
							/>
							<Route
								path="/configuracoes"
								element={
									<PrivateRoute>
										<Layout>
											<Configuracoes />
										</Layout>
									</PrivateRoute>
								}
							/>
							<Route
								path="/"
								element={
									<PrivateRoute>
										<Layout>
											<Dashboard />
										</Layout>
									</PrivateRoute>
								}
							/>
						</Routes>
					</BrowserRouter>
				</ToastProvider>
			</AccessibilityProvider>
		</AuthProvider>
	);
}

export default App;