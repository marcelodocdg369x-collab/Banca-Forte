import React from "react";
import { Crown, Trophy, TrendingUp, ArrowRight, Check, X, ShieldAlert, Sparkles, BookOpen, Lightbulb, Smartphone, ShieldCheck } from "lucide-react";
import { Prediction, SystemStats, ReadySlip } from "../types";

const logoImg = "/src/assets/images/banca_forte_logo_1783876743440.jpg";

interface DashboardProps {
  stats: SystemStats;
  predictions: Prediction[];
  readySlips: ReadySlip[];
  isPremium: boolean;
  onOpenSubscription: () => void;
  onSelectTab: (tab: string) => void;
  onViewPrediction: (prediction: Prediction) => void;
  onOpenDownloadModal: () => void;
}

export default function Dashboard({
  stats,
  predictions,
  readySlips,
  isPremium,
  onOpenSubscription,
  onSelectTab,
  onViewPrediction,
  onOpenDownloadModal
}: DashboardProps) {
  // Find the top/highlight prediction (e.g., highest confidence or premium with high odd)
  const highlightPrediction = predictions.find(p => p.status === "PENDENTE") || predictions[0];
  
  // Outstanding/featured pending predictions
  const featuredGames = predictions
    .filter(p => p.status === "PENDENTE")
    .slice(0, 3);

  // Best ready slip of the day
  const latestReadySlip = readySlips.find(s => s.status === "PENDENTE") || readySlips[0];

  const [telegramLink, setTelegramLink] = React.useState("https://t.me/+ExemploGrupoBancaForte");

  React.useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && data.telegramLink) {
          setTelegramLink(data.telegramLink);
        }
      })
      .catch(err => console.error("Erro ao carregar link do Telegram:", err));
  }, []);

  return (
    <div className="space-y-8">
      {/* 1. Header Banner Principal Simplificado e Explicativo */}
      {highlightPrediction ? (
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border-2 border-yellow-500/30 p-6 md:p-8 shadow-2xl">
          {/* Decorative subtle ambient lights */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-0 bottom-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between gap-6">
            <div className="space-y-4 flex-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3.5 py-1.5 rounded-full uppercase">
                <Trophy size={14} className="text-yellow-400 animate-pulse" /> Palpite de Ouro (Destaque do Dia)
              </span>
              
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono font-bold">
                  🏆 {highlightPrediction.championship} • 📅 {highlightPrediction.date} às {highlightPrediction.time}
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-white mt-1 leading-tight flex items-center gap-2 flex-wrap">
                  <span>{highlightPrediction.homeTeam}</span>
                  <span className="text-yellow-500 text-sm md:text-lg">X</span>
                  <span>{highlightPrediction.awayTeam}</span>
                </h2>
              </div>

              {/* Box de palpite direta e simples de ler */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">👉 O que Apostar:</p>
                  <p className="text-md font-black text-emerald-400 mt-1">
                    {highlightPrediction.isPremium && !isPremium ? "🔓 Conteúdo Exclusivo VIP" : highlightPrediction.market}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">📈 Retorno (Odd):</p>
                  <p className="text-md font-black text-yellow-400 mt-1">
                    {highlightPrediction.isPremium && !isPremium ? "R$ --" : `x${highlightPrediction.odd.toFixed(2)}`}
                  </p>
                  <p className="text-[9px] text-zinc-500 leading-tight">Retorna R$ {highlightPrediction.odd.toFixed(2)} para cada R$ 1,00 apostado</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">🔥 Chance de Acerto:</p>
                  <p className="text-md font-black text-white mt-1">
                    {highlightPrediction.confidence}% <span className="text-xs text-yellow-400">Excelente</span>
                  </p>
                </div>
              </div>

              {/* Análise Traduzida e Amigável */}
              <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-1 text-zinc-300">
                  <Lightbulb size={14} className="text-yellow-400" /> Por que apostar nessa dica?
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed italic">
                  "{highlightPrediction.analysis}"
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => onViewPrediction(highlightPrediction)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs px-6 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/20"
                >
                  Ver Dica Completa <ArrowRight size={14} />
                </button>
                {highlightPrediction.isPremium && !isPremium && (
                  <span className="text-xs text-yellow-400 font-bold flex items-center gap-1 bg-yellow-500/10 px-3.5 py-2.5 rounded-xl border border-yellow-500/20">
                    <Crown size={12} className="fill-yellow-400 animate-pulse" /> Exclusivo VIP
                  </span>
                )}
              </div>
            </div>

            {/* Sidebar de Convite Simplificado */}
            <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl w-full lg:w-72 flex flex-col justify-between text-center relative overflow-hidden group">
              <div className="space-y-3">
                <div className="relative h-18 w-18 mx-auto">
                  {/* Glowing halo behind logo */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                  <div className="relative h-18 w-18 rounded-2xl overflow-hidden border-2 border-yellow-500/40 shadow-lg shadow-yellow-500/10">
                    <img
                      src={logoImg}
                      alt="Banca Forte Logo"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Verified tag overlay */}
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black rounded-full p-0.5 border border-black flex items-center justify-center shadow-md">
                    <ShieldCheck size={11} className="stroke-[3.5]" />
                  </div>
                </div>
                <h3 className="text-md font-black text-yellow-400">Grupo VIP Banca Forte</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tenha acesso imediato a todas as análises ocultas, palpites com odds de alta lucratividade e bilhetes, pela nossa equipe de especialista.
                </p>
              </div>

              <div className="mt-4">
                {!isPremium ? (
                  <button
                    onClick={onOpenSubscription}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Crown size={14} className="fill-black" /> QUERO SER PREMIUM
                  </button>
                ) : (
                  <div className="text-xs text-emerald-400 font-black flex items-center justify-center gap-1 bg-emerald-500/10 py-2.5 rounded-xl border border-emerald-500/20">
                    <Check size={14} /> VIP ATIVADO • APROVEITE!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-zinc-900 rounded-2xl text-zinc-500">
          Carregando dicas de hoje...
        </div>
      )}

      {/* 2. Grid de Resultados Traduzido (Linguagem Amigável para Leigos) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-yellow-500/10 transition-all">
          <div>
            <p className="text-zinc-400 text-xs font-bold">🎯 Acertos Recentes</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">{stats.accuracyRate}%</p>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Acertamos {Math.round(stats.accuracyRate / 10)} de cada 10 palpites sugeridos.</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-yellow-500/10 transition-all">
          <div>
            <p className="text-zinc-400 text-xs font-bold">✅ Palpites Ganhos (Greens)</p>
            <p className="text-3xl font-black text-white mt-1">{stats.greensCount}</p>
          </div>
          <p className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
            <Check size={10} className="bg-emerald-500/20 rounded-full p-0.5" /> Lucro consolidado no bolso!
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-yellow-500/10 transition-all">
          <div>
            <p className="text-zinc-400 text-xs font-bold">❌ Palpites Perdidos (Reds)</p>
            <p className="text-3xl font-black text-zinc-500 mt-1">{stats.redsCount}</p>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Protegemos seu saldo contra perdas bruscas.</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-yellow-500/10 transition-all">
          <div>
            <p className="text-zinc-400 text-xs font-bold">📈 Retorno Médio (Odd Média)</p>
            <p className="text-3xl font-black text-yellow-400 mt-1">x{stats.oddAverage.toFixed(2)}</p>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Suas apostas rendem mais de {((stats.oddAverage - 1) * 100).toFixed(0)}% de média.</p>
        </div>
      </div>

      {/* 2.5 Telegram Promo Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950/40 to-zinc-950 border border-sky-500/30 p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 group">
        <div className="absolute right-0 top-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row relative z-10">
          <div className="relative p-4 bg-sky-500/15 text-sky-400 rounded-2xl border border-sky-500/20 shrink-0 shadow-lg shadow-sky-500/5 group-hover:scale-105 transition-all duration-300">
            {/* High fidelity Telegram Icon SVG */}
            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.7 3.96-.98 5.46-.12.63-.35.84-.57.86-.48.04-.84-.32-1.3-.62-.73-.48-1.14-.78-1.85-1.25-.82-.54-.29-.83.18-1.32.12-.13 2.27-2.08 2.31-2.25.01-.02.01-.1-.05-.15-.06-.05-.14-.03-.21-.02-.09.02-1.5 1.01-4.24 2.87-.4.28-.76.41-1.08.4-.35-.01-1.02-.2-1.52-.36-.61-.2-1.1-.31-1.06-.65.02-.18.27-.36.75-.55 2.93-1.27 4.88-2.11 5.86-2.51 2.8-.1.14-.58.31-1.12.31.25.01.57.07.82.19l.23.11c.21.15.35.39.38.65z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
          </div>
          <div>
            <h3 className="text-md font-black text-white uppercase tracking-wider font-mono flex items-center justify-center md:justify-start gap-2">
              Grupo Grátis do Telegram
              <span className="bg-sky-500 text-black font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Entrar Agora</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mt-1.5 max-w-2xl">
              Entre em nosso grupo oficial do Telegram clicando no botão ao lado. Receba palpites diários extras, análises de última hora, alertas instantâneos de gols e interaja com milhares de apostadores em tempo real!
            </p>
          </div>
        </div>

        <a
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 w-full md:w-auto bg-sky-500 hover:bg-sky-400 text-black font-black text-xs px-8 py-4 rounded-xl transition-all uppercase tracking-wider shrink-0 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transform hover:-translate-y-0.5 duration-200"
        >
          {/* Send-styled tiny icon */}
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.7 3.96-.98 5.46-.12.63-.35.84-.57.86-.48.04-.84-.32-1.3-.62-.73-.48-1.14-.78-1.85-1.25-.82-.54-.29-.83.18-1.32.12-.13 2.27-2.08 2.31-2.25.01-.02.01-.1-.05-.15-.06-.05-.14-.03-.21-.02-.09.02-1.5 1.01-4.24 2.87-.4.28-.76.41-1.08.4-.35-.01-1.02-.2-1.52-.36-.61-.2-1.1-.31-1.06-.65.02-.18.27-.36.75-.55 2.93-1.27 4.88-2.11 5.86-2.51 2.8-.1.14-.58.31-1.12.31.25.01.57.07.82.19l.23.11c.21.15.35.39.38.65z" />
          </svg>
          Entrar Automatico no Grupo
        </a>
      </div>

      {/* 3. Seções Principais: Mais Dicas & Bilhete Pronto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colunas 1 e 2: Mais palpites para hoje */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-black text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 animate-ping" />
              Mais Jogos e Dicas de Hoje
            </h3>
            <button
              onClick={() => onSelectTab("predictions")}
              className="text-xs text-yellow-400 hover:text-yellow-300 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Ver todos ({predictions.length}) <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredGames.map(pred => {
              const needsVip = pred.isPremium && !isPremium;
              return (
                <div
                  key={pred.id}
                  onClick={() => onViewPrediction(pred)}
                  className={`bg-zinc-900/40 hover:bg-zinc-900 border ${
                    pred.isPremium ? "border-yellow-500/20 hover:border-yellow-500/40" : "border-zinc-800 hover:border-zinc-700"
                  } p-4 rounded-2xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group`}
                >
                  {/* Premium Badge */}
                  {pred.isPremium && (
                    <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] font-extrabold px-2.5 py-0.5 rounded-bl-lg flex items-center gap-0.5 uppercase tracking-wider">
                      <Crown size={8} className="fill-black" /> VIP
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-500 font-mono font-bold truncate">{pred.championship}</p>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-100 group-hover:text-yellow-400 transition-colors">
                        {pred.homeTeam} <span className="text-zinc-500 text-xs">vs</span> {pred.awayTeam}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-900/80 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase font-bold">O que apostar:</p>
                      <p className="text-xs font-black text-emerald-400 truncate max-w-[140px]">
                        {needsVip ? "🔒 Exclusivo VIP" : pred.market}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold">Multiplicador:</p>
                      <p className="text-xs font-black text-yellow-400">
                        {needsVip ? "🔒" : `x${pred.odd.toFixed(2)}`}
                      </p>
                    </div>
                  </div>

                  {needsVip && (
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                      <Crown size={22} className="text-yellow-400 fill-yellow-400 mb-1 animate-bounce" />
                      <p className="text-xs font-black text-yellow-400">Conteúdo para VIPs</p>
                      <p className="text-[10px] text-zinc-400">Clique para ver planos de assinatura</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna 3: Bilhete Pronto do Dia */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-black text-white flex items-center gap-1.5">
              <Trophy size={16} className="text-yellow-400" />
              Bilhete Pronto do Dia
            </h3>
            <button
              onClick={() => onSelectTab("readySlips")}
              className="text-xs text-yellow-400 hover:text-yellow-300 font-bold cursor-pointer"
            >
              Ver todos
            </button>
          </div>

          {latestReadySlip ? (
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-yellow-500/30 rounded-2xl p-5 space-y-4 relative overflow-hidden shadow-xl">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg font-mono ${
                  latestReadySlip.isPremium
                    ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black border border-yellow-500/10 font-bold"
                    : "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                }`}>
                  {latestReadySlip.isPremium ? "🏆 MÚLTIPLA VIP 💎" : "MÚLTIPLA SELECIONADA"}
                </span>
                <span className="text-xs text-zinc-500 font-mono">{latestReadySlip.date}</span>
              </div>

              <div>
                <h4 className="text-md font-extrabold text-white flex items-center gap-1">
                  {latestReadySlip.isPremium && <Crown size={14} className="text-yellow-400 fill-yellow-400 shrink-0" />}
                  {latestReadySlip.title}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Nossa melhor combinação de palpites reunida em um único bilhete pronto para multiplicar seus ganhos!
                </p>
              </div>

              {/* Display items of the slip */}
              <div className="space-y-2.5 bg-black/40 border border-zinc-900 p-3 rounded-xl relative overflow-hidden">
                {latestReadySlip.predictionIds.map((predId, idx) => {
                  const matchPred = predictions.find(p => p.id === predId);
                  const isLocked = latestReadySlip.isPremium && !isPremium;

                  return (
                    <div key={predId} className="flex items-center justify-between text-xs border-b border-zinc-900/60 pb-2 last:border-0 last:pb-0">
                      <div className="max-w-[170px]">
                        <p className={`font-bold text-zinc-200 truncate ${isLocked ? "blur-[5px] select-none text-zinc-600" : ""}`}>
                          {isLocked ? "Time Secreto vs Time Oculto" : (matchPred ? `${matchPred.homeTeam} X ${matchPred.awayTeam}` : `Jogo Selecionado ${idx + 1}`)}
                        </p>
                        <p className={`text-[10px] text-emerald-400 truncate font-semibold ${isLocked ? "blur-[4px] select-none text-emerald-950" : ""}`}>
                          Palpite: {isLocked ? "Entrada Ultra Secreta" : (matchPred ? matchPred.market : "Apostar no Mercado")}
                        </p>
                      </div>
                      <span className={`font-mono text-yellow-400 font-bold bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 ${isLocked ? "blur-[4px] select-none text-yellow-950" : ""}`}>
                        x{isLocked ? "1.80" : (matchPred ? matchPred.odd.toFixed(2) : "1.80")}
                      </span>
                    </div>
                  );
                })}

                {latestReadySlip.isPremium && !isPremium && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[3.5px] rounded-xl flex flex-col items-center justify-center p-4 text-center">
                    <Crown size={16} className="text-yellow-500 mb-1" />
                    <span className="text-[9px] font-black text-yellow-500 uppercase tracking-wider">Conteúdo VIP Oculto</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
                  <p className="text-[9px] text-zinc-500 uppercase font-bold">Ganho Total</p>
                  <p className="text-sm font-black text-yellow-400">x{latestReadySlip.totalOdd.toFixed(2)}</p>
                </div>
                <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
                  <p className="text-[9px] text-zinc-500 uppercase font-bold">Sugerido</p>
                  <p className="text-sm font-bold text-white">R$ {latestReadySlip.suggestedValue}</p>
                </div>
                <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
                  <p className="text-[9px] text-emerald-400 uppercase font-bold">Retorno Estimado</p>
                  <p className="text-sm font-black text-emerald-400">R$ {latestReadySlip.estimatedProfit.toFixed(0)}</p>
                </div>
              </div>

              {latestReadySlip.isPremium && !isPremium ? (
                <button
                  onClick={onOpenSubscription}
                  className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs py-3 rounded-xl transition-all shadow-lg hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Crown size={14} className="fill-black animate-pulse" /> Desbloquear Bilhete VIP
                </button>
              ) : (
                <button
                  onClick={() => onSelectTab("readySlips")}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs py-3 rounded-xl transition-all shadow-lg shadow-yellow-500/10 cursor-pointer text-center"
                >
                  Copiar e Apostar Bilhete
                </button>
              )}
            </div>
          ) : (
            <div className="p-6 text-center bg-zinc-900 rounded-2xl text-zinc-500 text-xs">
              Nenhum bilhete pronto sugerido para hoje ainda.
            </div>
          )}
        </div>

      </div>

      {/* 4. Banner de Download do Aplicativo Móvel */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-green-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="absolute right-0 top-0 w-32 h-full bg-green-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row group">
          <div className="relative h-16 w-16 shrink-0">
            {/* Glowing active ring around logo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-yellow-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10">
              <img
                src={logoImg}
                alt="Banca Forte Logo"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black rounded-full p-0.5 border border-black flex items-center justify-center shadow-md">
              <ShieldCheck size={10} className="stroke-[3.5]" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-md md:text-lg font-black text-white flex items-center justify-center md:justify-start gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Instale o App Banca Forte (Android & iOS)
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Navegação ultra-veloz, notificações instantâneas de novos greens e palpites salvos no bolso sem gastar franquia de internet!
            </p>
          </div>
        </div>

        <button
          onClick={onOpenDownloadModal}
          className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white font-black text-xs px-6 py-3.5 rounded-xl transition-all transform hover:scale-105 shadow-xl shadow-green-600/20 whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
        >
          <Smartphone size={14} /> BAIXAR PARA ANDROID / IOS
        </button>
      </div>

      {/* 5. CTA de Assinatura Premium Promocional */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-zinc-950 to-zinc-950 border border-yellow-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="absolute left-0 top-0 w-32 h-full bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-md md:text-lg font-black text-white flex items-center justify-center md:justify-start gap-2">
              <Crown className="text-yellow-400 fill-yellow-400 animate-bounce" size={20} />
              Aumente seus acertos e junte-se ao time VIP!
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Libere palpites premium de alto valor, análises de inteligência artificial de última geração e bilhetes prontos multiplicados para maximizar seus ganhos mensais. Apenas nesta semana com preço promocional de lançamento!
            </p>
          </div>

          <button
            onClick={onOpenSubscription}
            className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs px-6 py-3.5 rounded-xl transition-all transform hover:scale-105 shadow-xl shadow-yellow-500/20 whitespace-nowrap cursor-pointer"
          >
            QUERO ACESSAR AS DICAS VIP
          </button>
        </div>
      )}
    </div>
  );
}
