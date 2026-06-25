import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  /* 
  BrowserRouter é um componente que cria o ambiente de navegação para a aplicação.
  Ele diz para o navegador qual tela carregar para cada endereço.. 
  ex: Se for "/login" carrega o Login, se for "/register" carrega o Register
  
  Routes funciona como um painel de controle que verifica qual é a URL da barra
  de endereço, e procura de cima pra baixo qual é a rota correspondente.
  
  Rota pública = se a URL for login, o react carrega o componente Login
  como o element recebe o componente direto, isso significa que a tela inteira vai
  ser limpa e vai renderizar só o card de Login.. não vai usar menus ou o header
  
  Rota Privada = só usuários autenticados acessam e,
  se a URL for a raiz (/) então o react deve carregar o componente
  Layout. O Layout por fora é "invisível", ele só existe para abrigar as rotas que precisam 
  dele. É aqui dentro do Layout que fica o menu e o header. Então, ao entrar na raiz, 
  o usuário vê o menu e o header e, no meio deles, aparece o Dashboard.
  */
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas Privadas (dentro do Layout) */}
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter >
  );
}

export default App;