import { ArrowRight, BookOpen, BrainCircuit, Sparkles, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#2B2D42] text-[#F7F7F9] selection:bg-[#4381C1]/30 font-roboto">
      {/* Navbar simplificada */}
      <nav className="border-b border-[#F7F7F9]/10 bg-[#2B2D42]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              
              <img src="/logo-puro-vetor.svg" alt="PROBEND Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-xl text-[#F7F7F9] tracking-tight">PROBEND</span>
          </div>
          <button className="text-sm font-semibold text-[#F7F7F9]/70 hover:text-[#F7F7F9] transition-colors">
            Entrar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        
        {/* Fundo Cinematográfico (Nova Versão Mais Robusta) */}
        <div className="absolute top-0 left-0 w-full h-full md:w-[65%] overflow-hidden pointer-events-none select-none flex items-center z-0">
          {/* A Logo real gigante empurrada para a esquerda */}
          <img src="/logo-puro-vetor.svg" alt="Background Logo" className="w-[500px] h-[500px] md:w-[900px] md:h-[900px] opacity-[0.15] -ml-[250px] md:-ml-[350px] drop-shadow-2xl flex-shrink-0 object-contain" />
          
          {/* Gradiente único que apaga a logo gradativamente misturando-a com o fundo escuro */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2B2D42]/50 to-[#2B2D42]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4381C1]/10 border border-[#4381C1]/20 text-[#4381C1] text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles size={18} /> Novo Sistema 2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-[#F7F7F9] tracking-tighter mb-6 leading-tight">
            Gestão de Questões <br className="hidden md:block" />
            <span className="text-[#41E2BA]">
              Simples e Inteligente.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#F7F7F9]/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            O PROBEND é a plataforma definitiva para professores e instituições gerenciarem seus bancos de questões com validação de regras de negócio avançadas e segurança robusta.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#4381C1] hover:bg-[#4381C1]/90 text-[#F7F7F9] font-bold transition-all shadow-lg shadow-[#4381C1]/25 active:scale-95">
              Começar Agora <ArrowRight size={18} />
            </button>
            <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-black/20 hover:bg-black/40 text-[#F7F7F9] font-bold transition-all border border-[#F7F7F9]/10 active:scale-95">
              Ver Demonstração
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 py-20 border-t border-[#F7F7F9]/10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-black/10 backdrop-blur-sm border border-[#F7F7F9]/10 p-8 rounded-2xl hover:border-[#4381C1]/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-[#4381C1]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit size={24} className="text-[#4381C1]" />
              </div>
              <h3 className="text-xl font-bold text-[#F7F7F9] mb-3">Validação Inteligente</h3>
              <p className="text-[#F7F7F9]/70 text-sm leading-relaxed">
                Nosso motor Spring Boot impede o cadastro de alternativas duplicadas e garante que questões difíceis sempre tenham fontes confiáveis.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-black/10 backdrop-blur-sm border border-[#F7F7F9]/10 p-8 rounded-2xl hover:border-[#41E2BA]/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-[#41E2BA]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen size={24} className="text-[#41E2BA]" />
              </div>
              <h3 className="text-xl font-bold text-[#F7F7F9] mb-3">Níveis de Dificuldade</h3>
              <p className="text-[#F7F7F9]/70 text-sm leading-relaxed">
                Organize seu banco de questões categorizando por matérias e dificuldades (Fácil, Médio e Difícil), facilitando a montagem de provas.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-black/10 backdrop-blur-sm border border-[#F7F7F9]/10 p-8 rounded-2xl hover:border-[#F7E733]/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-[#F7E733]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} className="text-[#F7E733]" />
              </div>
              <h3 className="text-xl font-bold text-[#F7F7F9] mb-3">Segurança Total</h3>
              <p className="text-[#F7F7F9]/70 text-sm leading-relaxed">
                Arquitetura construída com JWT (JSON Web Tokens) e Spring Security, garantindo que apenas usuários autorizados alterem os dados.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}