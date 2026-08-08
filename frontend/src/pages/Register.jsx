import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';

function Register() {
  const [nome, setNome]         = useState('');
  const [email, setEmail]       = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await authService.register(username, password, nome, email);
      await login();
      navigate('/');
    } catch (error) {
      console.error(error);
      setError('Erro ao realizar o cadastro. Tente outro username.');
    } finally {
      setLoading(false);
    }
  };

  // Classe reutilizável para os inputs
  const inputClass =
    'w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm ' +
    'placeholder:text-zinc-700 ' +
    'focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 ' +
    'transition-all duration-200';

  const labelClass = 'block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5';

  return (
    <AuthLayout>
      <form onSubmit={handleRegister} className="space-y-4">

        {/* Título */}
        <div className="mb-6">
          <h2
            className="text-2xl font-bold text-zinc-100"
            style={{ fontFamily: '"Sora", sans-serif' }}
          >
            Criar conta
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Preencha os dados para se cadastrar</p>
        </div>

        {/* Erro */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400" />
            {error}
          </div>
        )}

        {/* Nome */}
        <div>
          <label className={labelClass}>Nome Completo</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputClass}
            placeholder="Seu nome completo"
            required
          />
        </div>

        {/* E-mail */}
        <div>
          <label className={labelClass}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="seu@email.com"
            required
          />
        </div>

        {/* Username */}
        <div>
          <label className={labelClass}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
            placeholder="seu_username"
            required
          />
        </div>

        {/* Senha */}
        <div>
          <label className={labelClass}>Senha</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-11`}
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
          id="btn-register-submit"
          disabled={loading}
          className="w-full py-2.5 mt-2 rounded-xl font-semibold text-sm text-white
            bg-gradient-to-r from-indigo-500 to-violet-600
            hover:from-indigo-400 hover:to-violet-500
            hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
            transition-all duration-200 cursor-pointer"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>

        {/* Link para login */}
        <p className="text-center text-sm text-zinc-500">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            Faça login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Register;
