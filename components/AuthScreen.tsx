import React, { useState } from "react";
import { 
  Trophy, 
  Crown, 
  ShieldCheck, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Flame, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  Star,
  Activity,
  Dices,
  Eye,
  CheckCircle2
} from "lucide-react";
import { User } from "../types";

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
  onAdminQuickLogin: () => void;
}

export default function AuthScreen({ onAuthSuccess, onAdminQuickLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [favoriteTeam, setFavoriteTeam] = useState("");
  const [preferredMarket, setPreferredMarket] = useState("Ambas Marcam");
  const [planOfInterest, setPlanOfInterest] = useState("free");
  const [experienceLevel, setExperienceLevel] = useState("Iniciante");
  const [isAgreed, setIsAgreed] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const topTeams = [
    "Flamengo",
    "Palmeiras",
    "São Paulo",
    "Corinthians",
    "Vasco da Gama",
    "Grêmio",
    "Cruzeiro",
    "Atlético Mineiro",
    "Botafogo",
    "Fluminense",
    "Real Madrid",
    "Barcelona",
    "Manchester City",
    "Arsenal",
    "Chelsea"
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem("banca_forte_user", JSON.stringify(data.user));
        onAuthSuccess(data.user);
      } else {
        setErrorMessage(data.error || "Ocorreu um erro ao fazer login.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      setErrorMessage("Por favor, preencha Nome e E-mail.");
      return;
    }

    if (!isAgreed) {
      setErrorMessage("Você precisa aceitar os termos de uso.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          favoriteTeam,
          preferredMarket,
          planOfInterest,
          experienceLevel
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        localStorage.setItem("banca_forte_user", JSON.stringify(data.user));
        onAuthSuccess(data.user);
      } else {
        setErrorMessage(data.error || "Erro ao realizar cadastro.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Falha na conexão ao criar a conta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-yellow-500/5 blur-[150px] pointer-events-none" />
      
      {/* Container */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        
        {/* Left Side: Brand Marketing Panel */}
        <div className="md:col-span-5 p-8 flex flex-col justify-between bg-gradient-to-b from-zinc-900 to-zinc-950 border-r border-zinc-900/60 relative">
          <div className="space-y-6">
            {/* Header / Brand */}
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-yellow-500 to-emerald-600 rounded-2xl blur opacity-30" />
                <img
                  src="/src/assets/images/banca_forte_logo_1783876743440.jpg"
                  alt="Banca Forte Logo"
                  className="relative h-12 w-12 rounded-2xl object-cover border-2 border-yellow-500/40"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-yellow-400 via-yellow-200 to-emerald-400 bg-clip-text text-transparent">
                  BANCA FORTE
                </h1>
                <p className="text-[9px] font-extrabold tracking-[0.18em] text-zinc-500 uppercase font-mono">
                  SISTEMA DE PREDIÇÕES IA
                </p>
              </div>
            </div>

            {/* Core Selling Points */}
            <div className="space-y-4 pt-4">
              <p className="text-sm text-zinc-400 leading-relaxed">
                Junte-se à maior comunidade de análise esportiva automatizada por Inteligência Artificial do Brasil.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                    <ShieldCheck size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">100% Auditado</h4>
                    <p className="text-[10px] text-zinc-400">Resultados e estatísticas de palpites totalmente públicos e verificáveis.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 mt-0.5">
                    <Crown size={14} className="fill-yellow-400/20" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Grupo VIP no Telegram</h4>
                    <p className="text-[10px] text-zinc-400">Disparos instantâneos de bilhetes prontos, bingo do dia e entradas ao vivo.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-0.5">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Jogos e Times Reais</h4>
                    <p className="text-[10px] text-zinc-400">Análise profunda de partidas reais de hoje, com dados estatísticos autênticos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time stats display */}
          <div className="mt-8 pt-6 border-t border-zinc-900 space-y-3">
            <h5 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-1">
              <Activity size={10} className="text-yellow-500" /> STATUS DA OPERAÇÃO HOJE
            </h5>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-900">
                <p className="text-xs font-mono text-zinc-400">Assertividade</p>
                <p className="text-sm font-black text-emerald-400">78% a 84%</p>
              </div>
              <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-900">
                <p className="text-xs font-mono text-zinc-400">Green Mensal</p>
                <p className="text-sm font-black text-yellow-400">+145.5 U</p>
              </div>
            </div>
            
            <div className="p-2.5 bg-yellow-500/5 rounded-xl border border-yellow-500/10 text-[10px] text-zinc-400 leading-normal flex items-center gap-2">
              <Flame size={12} className="text-yellow-500 animate-pulse flex-shrink-0" />
              <span>Dica: Assinantes do <strong>Plano VIP</strong> têm direito a análises exclusivas geradas pela IA do Gemini.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="md:col-span-7 p-8 flex flex-col justify-center">
          
          {/* Header Toggle tabs */}
          <div className="flex bg-zinc-900/60 border border-zinc-900 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setErrorMessage(null); }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                isLogin ? "bg-yellow-500 text-black shadow-md font-extrabold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              ENTRAR NA CONTA
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setErrorMessage(null); }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                !isLogin ? "bg-yellow-500 text-black shadow-md font-extrabold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              CRIAR CONTA NOVA
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <span className="text-sm">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form container */}
          {isLogin ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-black tracking-tight text-white">Acesse o Painel</h3>
                <p className="text-xs text-zinc-400">Insira seu e-mail cadastrado para ter acesso imediato aos palpites.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider block">Endereço de E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@seuemail.com"
                    className="w-full bg-zinc-900/40 border border-zinc-800 text-sm text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-yellow-500/70 focus:bg-zinc-900 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black text-xs py-3.5 px-4 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
              >
                {isLoading ? "Entrando..." : "Acessar Sistema"} <ArrowRight size={14} />
              </button>

              <div className="pt-4 border-t border-zinc-900/60 mt-4 space-y-2">
                <p className="text-[11px] text-zinc-500 text-center">
                  Novo por aqui? Clique em <strong className="text-yellow-500 cursor-pointer" onClick={() => setIsLogin(false)}>Criar Conta Nova</strong> acima para ganhar acesso gratuito instantâneo.
                </p>
                <div className="flex justify-center gap-4 text-[10px] text-zinc-400">
                  <button
                    type="button"
                    onClick={onAdminQuickLogin}
                    className="text-emerald-400 hover:underline font-extrabold uppercase font-mono"
                  >
                    ⚡ Entrar como Administrador (Demo)
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Registration Form with Advanced/Extra Options */
            <form onSubmit={handleRegister} className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-lg font-black tracking-tight text-white">Criar Cadastro no Banca Forte</h3>
                <p className="text-xs text-zinc-400">Preencha seus dados para receber dicas, estatísticas personalizadas e muito mais.</p>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Nome Completo</label>
                  <div className="relative">
                    <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full bg-zinc-900/40 border border-zinc-800 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-yellow-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">E-mail de Cadastro</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemplo@seuemail.com"
                      className="w-full bg-zinc-900/40 border border-zinc-800 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-yellow-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Phone/WhatsApp */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    WhatsApp <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 rounded uppercase tracking-wider font-extrabold">Dica</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(DD) 99999-9999"
                      className="w-full bg-zinc-900/40 border border-zinc-800 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-yellow-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Favorite Team */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Time do Coração</label>
                  <select
                    value={favoriteTeam}
                    onChange={(e) => setFavoriteTeam(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-yellow-500 transition-all font-medium"
                  >
                    <option value="" disabled className="bg-zinc-950">Selecione seu time...</option>
                    {topTeams.map((team) => (
                      <option key={team} value={team} className="bg-zinc-950">{team}</option>
                    ))}
                    <option value="Outro" className="bg-zinc-950">Outro Clube</option>
                  </select>
                </div>

                {/* Preferred Betting Market */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Mercado de Preferência</label>
                  <select
                    value={preferredMarket}
                    onChange={(e) => setPreferredMarket(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-yellow-500 transition-all font-medium"
                  >
                    <option value="Ambas Marcam" className="bg-zinc-950">Ambas Equipes Marcam</option>
                    <option value="Resultado Final (Vitória)" className="bg-zinc-950">Resultado Final (1X2)</option>
                    <option value="Over 2.5 Gols" className="bg-zinc-950">Mais de 2.5 Gols (Over)</option>
                    <option value="Escanteios" className="bg-zinc-950">Escanteios (Cantos)</option>
                    <option value="Dupla Chance" className="bg-zinc-950">Dupla Chance (Empate/Time)</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Experiência em Apostas</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-yellow-500 transition-all font-medium"
                  >
                    <option value="Iniciante" className="bg-zinc-950">Iniciante (Vou devagar)</option>
                    <option value="Intermediário" className="bg-zinc-950">Intermediário (Já sei as regras)</option>
                    <option value="Profissional" className="bg-zinc-950">Profissional / Trader Esportivo</option>
                  </select>
                </div>
              </div>

              {/* Plan of Interest Selection Section */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">Selecione seu Plano Inicial de Interesse</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlanOfInterest("free")}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      planOfInterest === "free"
                        ? "bg-zinc-900 border-zinc-600 text-white"
                        : "bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <p className="text-[9px] font-black">GRATUITO</p>
                    <p className="text-[11px] font-black mt-0.5">R$ 0,00</p>
                    <p className="text-[8px] text-zinc-500 leading-tight mt-1">Dicas básicas diárias</p>
                    {planOfInterest === "free" && (
                      <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanOfInterest("mensal")}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      planOfInterest === "mensal"
                        ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-400"
                        : "bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <p className="text-[9px] font-black">VIP MENSAL</p>
                    <p className="text-[11px] font-black mt-0.5">R$ 49,90</p>
                    <p className="text-[8px] text-zinc-500 leading-tight mt-1">Acesso completo VIP</p>
                    {planOfInterest === "mensal" && (
                      <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanOfInterest("trimestral")}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      planOfInterest === "trimestral"
                        ? "bg-yellow-500/10 border-yellow-500/60 text-yellow-400"
                        : "bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <span className="absolute -top-1.5 left-2 bg-yellow-500 text-black text-[7px] font-black px-1.5 rounded-full uppercase tracking-wider">
                      Forte 🔥
                    </span>
                    <p className="text-[9px] font-black">VIP TRIMESTRE</p>
                    <p className="text-[11px] font-black mt-0.5">R$ 119,90</p>
                    <p className="text-[8px] text-zinc-500 leading-tight mt-1">Mais recomendado</p>
                    {planOfInterest === "trimestral" && (
                      <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanOfInterest("anual")}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      planOfInterest === "anual"
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                        : "bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <p className="text-[9px] font-black">VIP ANUAL</p>
                    <p className="text-[11px] font-black mt-0.5">R$ 299,95</p>
                    <p className="text-[8px] text-zinc-500 leading-tight mt-1">Melhor economia</p>
                    {planOfInterest === "anual" && (
                      <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer mt-1 select-none">
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-800 text-yellow-500 bg-zinc-900 accent-yellow-500 focus:ring-0"
                />
                <span className="text-[10px] text-zinc-400 leading-normal">
                  Aceito os Termos de Uso e Política de Privacidade do Banca Forte. Estou ciente de que as predições são baseadas em análises de probabilidade esportiva e que não há promessa de ganhos garantidos.
                </span>
              </label>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoading ? "Criando Conta..." : "Concluir Meu Cadastro"} <CheckCircle2 size={14} />
              </button>

              <div className="pt-2 text-center">
                <p className="text-[10px] text-zinc-500">
                  Já possui conta cadastrada? <span className="text-yellow-500 hover:underline font-bold cursor-pointer" onClick={() => setIsLogin(true)}>Faça Login</span>
                </p>
              </div>
            </form>
          )}

        </div>

      </div>

      {/* Trust seal footer */}
      <div className="mt-6 flex items-center gap-4 text-zinc-600 text-[10px] uppercase tracking-wider font-mono">
        <span className="flex items-center gap-1">🛡️ SERVIDORES SEGUROS</span>
        <span>•</span>
        <span className="flex items-center gap-1">🔒 CRIPTOGRAFIA SSL 256-BIT</span>
        <span>•</span>
        <span className="flex items-center gap-1">⚡ CONEXÃO DIRETA COM TELEGRAM</span>
      </div>
    </div>
  );
}
