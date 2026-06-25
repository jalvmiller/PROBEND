import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
// import { authService } from '../services/authService';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await authService.login(username, password);
      console.log(res);

    } catch (error) {
      console.error(error);
      setError('Email ou senha incorretos');

    } finally {
      setLoading(false);
    }
  }

  /*
    flex = flexbox 
    items-center, justify-center = centralizar verticalmente e horizontalmente
    min-h screen = a altura da div vai ser de no mínimo 100% da altura da tela
    p-4 = paddind interno de 4px
    bg-slate-100 = cor de fundo da div (cinza claro)
    w-full max-w-md = a largura da div vai ser de no máximo 100% da tela 
    p-8 bg-white rounded-lg shadow-md = padding interno de 8px, cor de fundo branca, bordas arredondadas e sombra

    focus = o focus é um estado que é ativado quando um usuário clica ou navega para dentro do campo, 
    e os estilos aplicados dentro de focus são os estilos que serão aplicados no campo quando ele estiver em foco,
    no caso, focus:outline-none remove a borda padrão do campo, e focus:ring-2 focus:ring-blue-500 adiciona
    uma borda azul de 2px quando o campo estiver em foco.
    text-sm = text size small, dimensão do texto para 14px
    mb-2 = margin bottom de 2*4px=8px, adiciona um espaço no fundo do elemento.
    */
  return (
    <form onSubmit={handleLogin}>
      <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Login</h2>

          {error && <p className='text-red-500 mb-4 text-sm text-center bg-red-50 p-2 rounded'>{error}</p>}

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
              {/* relative faz com que o botão de mostrar senha fique dentro do input
                  um elemento relative serve como ponto de origem para os elementos filhos
                  absolutos, nesse caso o botão é absolute então ele vai ser posicionado em relação ao seu pai relative.
                  Ou seja, ele usará dos limites impostos pelo pai (relative)
              */}
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10'
                placeholder="Inserir sua senha"
                required
              />
              {/* pr-10 = padding right de 10px, coloca um espaçamento interno no lado direito do input.
                  Usado para que o icone do olho não fique colado no texto
              */}
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
            {loading ? 'Conectando...' : 'Entrar'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default Login;