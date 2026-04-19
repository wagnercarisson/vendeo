import { Sora } from "next/font/google";

const brandFont = Sora({
  subsets: ["latin"],
  weight: ["700", "800"],
});

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo/Brand */}
        <div className={`${brandFont.className} text-6xl font-bold text-white`}>
          VENDEO
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">
            🛠️ Sistema em Manutenção
          </h1>
          <p className="text-xl text-purple-200">
            Estamos melhorando o Vendeo para você!
          </p>
        </div>

        {/* Details */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-4 text-white">
          <div className="space-y-2">
            <p className="text-lg font-semibold">
              O que estamos fazendo:
            </p>
            <ul className="text-left space-y-2 text-purple-100">
              <li>✨ Novo motor de composição visual</li>
              <li>🎨 Sistema de identidade visual inteligente</li>
              <li>🚀 Melhorias de performance</li>
              <li>🔧 Otimizações no banco de dados</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/20">
            <p className="text-sm text-purple-200">
              Previsão de retorno: <strong className="text-white">em breve</strong>
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="text-purple-200">
          <p>
            Dúvidas urgentes?{" "}
            <a
              href="mailto:contato@vendeo.tech"
              className="text-white underline hover:text-purple-100 transition-colors"
            >
              Entre em contato
            </a>
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center items-center space-x-2">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
