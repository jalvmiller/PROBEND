import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
// import { authService } from '../services/authService';

function Register() {
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      console.log('Registrando:', { username, password, nome });
    } catch (error) {
      console.error(error);
      setError('Erro ao realizar o cadastro. Tente outro username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Cadastro</h2>

          {error && <p className='text-red-500 mb-4 text-sm text-center bg-red-50 p-2 rounded'>{error}</p>}

          <div className='mb-4'>
            <label className="block text-slate-700 text-sm font-semibold mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className='w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder="Inserir seu nome"
              required
            />
          </div>

          <div className='mb-4'>
            <label className="block text-slate-700 text-sm font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder="Inserir seu username"
              required
            />
          </div>

          <div className='mb-6'>
            <label className="block text-slate-700 text-sm font-semibold mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10'
                placeholder="Inserir sua senha"
                required
              />
              <button
                type="button"
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 cursor-pointer'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 transition duration-200'
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default Register;
