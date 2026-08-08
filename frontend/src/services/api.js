import axios from 'axios';

// Helper para ler cookies nativos do navegador
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Cria uma única instância do Axios que vai ser usada por todos os services
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

let csrfPromise = null;

// Interceptor de requisição: garante que o cookie XSRF-TOKEN exista antes de requisições mutantes
api.interceptors.request.use(async (config) => {
  const method = (config.method || '').toUpperCase();
  const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  const isCsrfEndpoint = config.url && config.url.includes('/auth/csrf');

  if (isMutating && !isCsrfEndpoint && !getCookie('XSRF-TOKEN')) {
    if (!csrfPromise) {
      csrfPromise = api.get('/auth/csrf').catch((err) => {
        console.warn('Não foi possível obter o cookie CSRF:', err?.message || err);
      }).finally(() => {
        csrfPromise = null;
      });
    }
    await csrfPromise;
  }

  // Garantir que o token seja enviado caso o Axios não o pegue automaticamente
  const csrfToken = getCookie('XSRF-TOKEN');
  if (csrfToken && isMutating) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      // Se não for a rota de verificar sessão ou login, desloga e redireciona
      if (!url.includes('/auth/me') && !url.includes('/auth/login') && !url.includes('/auth/csrf')) {
        // Remove cookies (opcional, pois o backend cuida do JWT, mas ajuda a limpar)
        document.cookie = 'AUTH_TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
