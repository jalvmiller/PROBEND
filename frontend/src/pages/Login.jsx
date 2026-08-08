import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';

function Login() {
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('user123');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await authService.login(username, password);
      await login();
      navigate('/');
    } catch (error) {
      console.error(error);
      setError('Username ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleLogin} className="space-y-5">

        {/* Título */}
        <div className="mb-6">
          <h2
            className="text-2xl font-bold text-zinc-100"
            style={{ fontFamily: '"Sora", sans-serif' }}
          >
            Bem-vindo de volta
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Acesse sua conta para continuar</p>
        </div>

        {/* Erro */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400" />
            {error}
          </div>
        )}

        {/* Badge de credenciais de teste */}
        <div className="p-3.5 rounded-xl bg-indigo-500/8 border border-indigo-500/15">
          <p className="text-xs font-semibold text-indigo-400 mb-2 tracking-wide uppercase">
            Credenciais de teste (seeder no BD)
          </p>
          <div className="flex items-center gap-4 font-mono text-xs text-zinc-400">
            <span>
              <span className="text-zinc-600">usuário:</span>{' '}
              <strong className="text-indigo-300">user</strong>
            </span>
            <span className="text-zinc-700">·</span>
            <span>
              <span className="text-zinc-600">senha:</span>{' '}
              <strong className="text-indigo-300">user123</strong>
            </span>
          </div>
        </div>

        {/* Campo: Username */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm
              placeholder:text-zinc-700
              focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20
              transition-all duration-200"
            placeholder="seu_username"
            required
          />
        </div>

        {/* Campo: Senha */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 pr-11 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm
                placeholder:text-zinc-700
                focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20
                transition-all duration-200"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-600 hover:text-zinc-300 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Botão submit */}
        <button
          type="submit"
          id="btn-login-submit"
          disabled={loading}
          className="w-full py-2.5 mt-2 rounded-xl font-semibold text-sm text-white
            bg-gradient-to-r from-indigo-500 to-violet-600
            hover:from-indigo-400 hover:to-violet-500
            hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
            transition-all duration-200 cursor-pointer"
        >
          {loading ? 'Conectando...' : 'Entrar'}
        </button>

        {/* Link para registro */}
        <p className="text-center text-sm text-zinc-500">
          Não tem uma conta?{' '}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            Cadastre-se
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;