import { createContext, useState, useEffect } from 'react';

// O contexto em si. Ele servirá como a "nuvem" de dados.
export const AuthContext = createContext(null);

// Provider, é o componente que gerencia os estados
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // O useEffect roda uma única vez quando a aplicação inicia no navegador
  useEffect(() => {
    // Busca se existe um token salvo no localStorage do navegador
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('username');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser({ username: savedUser });
    }

    setLoading(false); // Finalizou a checagem inicial
  }, []);

  // Função disparada no login bem-sucedido
  const login = (jwtToken, username) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('username', username);
    setToken(jwtToken);
    setUser({ username });
  };

  // Função disparada no logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
  };

  // Enquanto estiver verificando o localStorage, mostrar um loading na tela
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <p className="text-slate-600 font-semibold">Carregando sessão...</p>
      </div>
    );
  }

  // Retornar o Provider passando os dados e funções que qualquer componente filho poderá usar
  // o !!token é uma forma de converter o token em boolean, ou seja, se o token existir
  // ele será true, se não existir ele será false
  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}