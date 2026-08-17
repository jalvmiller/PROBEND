import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { authService } from '../services/authService';
// Importa a instância do Axios configurada
// com interceptor de requisições

// O contexto em si. Ele servirá como a "nuvem" de dados.
export const AuthContext = createContext(null);

// Provider, é o componente que gerencia os estados
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      setIsAuthenticated(true);
      // Guarda o objeto usuário completo
    } catch (err) {
      // 401 e 403 são retornos normais do Spring Security quando o usuário não possui sessão ativa
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error("Erro ao buscar os dados do usuário logado", err);
      }
      setUser(null);
      setIsAuthenticated(false);
      // Retorna o status para o chamador decidir se cria sessão de visitante
      return err.response?.status;
    }
  };

  // O useEffect roda uma única vez quando a aplicação inicia no navegador.
  // Se não houver sessão ativa (401), cria automaticamente uma sessão de visitante.
  useEffect(() => {
    const initSession = async () => {
      const status = await fetchCurrentUser();
      if (status === 401 || status === 403) {
        try {
          // Cria conta efêmera visitor_<uuid> no backend e recebe cookie JWT de 24h
          await authService.visitorSession();
          // Busca os dados do visitante recém-criado
          await fetchCurrentUser();
        } catch (err) {
          console.error("Erro ao criar sessão de visitante:", err);
        }
      }
      setLoading(false);
    };
    initSession();
  }, []);

  // Função disparada no login bem-sucedido
  const login = async () => {
    // Busca pós-login para retornar dados do usuário
    await fetchCurrentUser();
  };

  // Função disparada no logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  // Flag derivada: true se a conta atual é uma sessão de visitante efêmera
  const isVisitor = Boolean(user?.username?.startsWith('visitor_'));

  // Enquanto estiver verificando a sessão do usuário, mostrar um loading na tela
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <p className="text-slate-600 font-semibold">Carregando sessão...</p>
      </div>
    );
  }

  // Retornar o Provider passando os dados e funções que qualquer componente filho poderá usar
  return (
    <AuthContext.Provider value={{ user, setUser, token: null, isAuthenticated, isVisitor, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}