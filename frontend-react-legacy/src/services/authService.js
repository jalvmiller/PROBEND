import api from './api';

export const authService = {
  // Realiza a chamada de login enviando as credenciais esperadas pelo backend (LoginRequest)
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  // Realiza o cadastro enviando os dados esperados pelo backend (RegisterRequest)
  register: async (username, password, nome, email) => {
    const response = await api.post('/auth/register', { username, password, nome, email });
    return response.data;
  },

  // Cria uma sessao de visitante efemera — sem credenciais.
  // O backend gera uma conta visitor_<uuid> com JWT de 24h.
  visitorSession: async () => {
    const response = await api.post('/auth/visitor-session');
    return response.data;
  },
};

