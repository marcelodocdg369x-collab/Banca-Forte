import React, { useState } from "react";
import { Crown, AlertTriangle, ShieldCheck, Check, Clipboard, Calendar, Flame, Dices, ArrowRight, History, HelpCircle, Share2, DollarSign } from "lucide-react";
import { Bingo, User } from "../types";

interface BingoViewProps {
  bingos: Bingo[];
  currentUser: User | null;
  isPremium: boolean;
  onOpenSubscription: () => void;
}

export default function BingoView({ bingos, currentUser, isPremium, onOpenSubscription }: BingoViewProps) {
  const [activeBingoIndex, setActiveBingoIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const [stake, setStake] = useState<number>(5);

  // Active bingos are for the current day (date: "2026-07-12")
  const todayDateStr = "2026-07-12";
  const activeBingos = bingos.filter((b) => b.date === todayDateStr);
  const pastBingos = bingos.filter((b) => b.date !== todayDateStr);

  // Split active bingos into free and premium
  const freeBingos = activeBingos.filter((b) => !b.isPremium);
  const premiumBingos = activeBingos.filter((b) => b.isPremium);

  const isDuploBingoUser = currentUser?.subscriptionType === 'duplo_bingo';

  // Allowed list of bingos based on premium status
  // Free gets only free bingos (1 bingo)
  // Duplo Bingo gets free + 1 premium bingo (2 bingos)
  // Premium gets free + premium bingos (1 + 4 = 5 bingos)
  const allowedBingos = isPremium 
    ? [...freeBingos, ...premiumBingos] 
    : isDuploBingoUser 
      ? [...freeBingos, ...premiumBingos.slice(0, 1)] 
      : freeBingos;

  const lockedPremiumBingos = premiumBingos.filter(b => !allowedBingos.includes(b));

  const handleCopyCode = (bingo: Bingo) => {
    // Generate a beautiful simulated booking code for any bookmaker
    const randomCode = "BF-" + bingo.id.toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000);
    navigator.clipboard.writeText(randomCode);
    setCopiedId(bingo.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareText = (bingo: Bingo) => {
    const randomCode = "BF-" + bingo.id.toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000);
    let message = `🎰 *BINGO DO LEÃO DO DIA* 🎰\n`;
    message += `🔥 *Odd Total:* @${bingo.totalOdd.toFixed(2)}\n`;
    message += `📅 *Data:* ${bingo.date}\n\n`;
    message += `⚽ *JOGOS COMBINADOS (${bingo.selections.length}):*\n`;
    
    bingo.selections.forEach((sel, idx) => {
      message += `${idx + 1}) ${sel.homeTeam} x ${sel.awayTeam} ➔ *${sel.market}* (Odd @${sel.odd.toFixed(2)})\n`;
    });
    
    message += `\n🎫 *Código do Bilhete:* ${randomCode}\n`;
    message += `🦁 _Banca Forte - O Melhor App de Análises Esportivas!_`;

    navigator.clipboard.writeText(message);
    setCopiedShareId(bingo.id);
    setTimeout(() => setCopiedShareId(null), 2000);
  };

  const getRiskLevel = (length: number) => {
    if (length <= 5) {
      return {
        label: "Risco Alto",
        color: "text-amber-500 font-bold",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        desc: "Retorno excelente com risco equilibrado para múltiplas.",
        width: "w-[40%]"
      };
    } else if (length <= 7) {
      return {
        label: "Risco Extremo",
        color: "text-orange-500 font-bold",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20",
        desc: "Odd altíssima. Ideal para apostas recreativas de valor simbólico.",
        width: "w-[70%]"
      };
    } else {
      return {
        label: "Risco Lendário 💀",
        color: "text-red-500 font-bold",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
        desc: "Super multiplicador. Use apenas trocos ou moedas da sua banca!",
        width: "w-[100%]"
      };
    }
  };

  const selectedBingo = allowedBingos[activeBingoIndex] || allowedBingos[0];

  return (
    <div className="space-y-6" id="bingo-view-section">
      
      {/* 1. Top Header & Warning Banner */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-black">
              <Dices size={14} className="animate-bounce" /> Bingo do Dia (Múltiplas de Elite)
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              O BINGO DO LEÃO 🦁
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Combinamos de <span className="text-yellow-400 font-bold">5 a 10 palpites</span> altamente estudados de forma simultânea. Acertar todas as seleções resulta em lucros monumentais com odds gigantescas!
            </p>
          </div>

          <div className="bg-zinc-900/40 p-2 rounded-2xl border border-zinc-800 flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 border border-yellow-500/20">
              <Dices size={20} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-black">Sua Cota Diária</p>
              <p className="text-xs font-black text-white">
                {isPremium 
                  ? "5 de 5 Bingos Liberados" 
                  : isDuploBingoUser 
                    ? "2 de 5 Bingos Liberados" 
                    : "1 de 5 Bingos Disponíveis"
                }
              </p>
            </div>
          </div>
        </div>

        {/* RISK MANAGEMENT WARNING - MANDATORY BY USER */}
        <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex items-start gap-3.5">
          <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-black text-yellow-400 uppercase tracking-wide">Gestão de Banca Necessária (Alerta de Risco)</p>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Como o Bingo do Dia envolve múltiplas seleções combinadas, o risco de perda é <span className="text-yellow-400 font-bold">extremamente elevado</span>. Recomendamos arriscar <span className="text-yellow-400 font-bold">pouco valor</span> (menos de 1% ou moedas da sua banca) neste tipo de aposta. O objetivo é buscar um retorno massivo expondo um valor insignificante!
            </p>
          </div>
        </div>
      </div>

      {/* 2. Bingo Switcher Tabs (1 Free and 4 VIP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Bingo Selector Menu */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">Bingos Disponíveis Hoje</p>
          
          <div className="space-y-2">
            {allowedBingos.map((bingo, idx) => (
              <button
                key={bingo.id}
                onClick={() => setActiveBingoIndex(idx)}
                className={`w-full p-4 rounded-2xl text-left border transition-all relative overflow-hidden flex items-center justify-between cursor-pointer ${
                  activeBingoIndex === idx
                    ? "bg-zinc-900 border-yellow-500/40 shadow-lg shadow-yellow-500/5"
                    : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/30"
                }`}
              >
                {bingo.isPremium && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[8px] font-black px-2 py-0.5 rounded-bl-lg flex items-center gap-0.5 shadow-sm">
                    <Crown size={8} /> VIP
                  </div>
                )}
                
                <div className="space-y-1.5 pr-4">
                  <p className={`text-xs font-black truncate ${activeBingoIndex === idx ? "text-yellow-400" : "text-zinc-300"}`}>
                    {bingo.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} /> {bingo.date}
                    </span>
                    <span>•</span>
                    <span className="text-zinc-400 font-bold font-mono">{bingo.selections.length} Jogos</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[9px] text-zinc-500 uppercase font-black">Odd Total</p>
                  <p className="text-sm font-black text-green-400 font-mono">@{bingo.totalOdd.toFixed(2)}</p>
                </div>
              </button>
            ))}

            {/* Locked Premium Bingos if user is Free */}
            {!isPremium && (
              <div className="space-y-2 mt-2 pt-2 border-t border-zinc-900">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider px-1">🔒 Bingos Premium Restantes</p>
                
                {lockedPremiumBingos.map((bingo, idx) => (
                  <div
                    key={bingo.id}
                    onClick={onOpenSubscription}
                    className="w-full p-4 rounded-2xl bg-zinc-950/20 border border-zinc-900/60 opacity-60 flex items-center justify-between cursor-pointer hover:opacity-100 hover:border-yellow-500/30 hover:bg-zinc-900/20 transition-all"
                  >
                    <div className="space-y-1.5 pr-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-zinc-400">Bingo VIP #{idx + (isDuploBingoUser ? 2 : 1)}</span>
                        <span className="bg-yellow-500/10 text-yellow-500 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Crown size={7} /> VIP
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                        <Calendar size={10} /> {todayDateStr} • {bingo.selections.length} Seleções
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[9px] text-zinc-600 uppercase font-black">Odd Estimada</p>
                      <p className="text-sm font-black text-yellow-500/40 font-mono">@{bingo.totalOdd.toFixed(2)}</p>
                    </div>
                  </div>
                ))}

                {/* Upgrade callout card */}
                <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent border border-yellow-500/10 p-4 rounded-2xl text-center space-y-3 mt-4">
                  <p className="text-xs font-bold text-yellow-400 flex items-center justify-center gap-1">
                    <Crown size={12} /> Desbloqueie 5 Bingos Diários
                  </p>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Assine o Plano VIP hoje e tenha acesso imediato aos 5 Bingos com altas taxas de assertividade e odds brutas!
                  </p>
                  <button
                    onClick={onOpenSubscription}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black text-[11px] py-2 rounded-xl transition-all cursor-pointer"
                  >
                    ASSINAR PLANO PREMIUM
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Selected Bingo Details */}
        <div className="lg:col-span-8">
          {selectedBingo ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-xl flex flex-col h-full">
              
              {/* Card Header */}
              <div className="p-6 border-b border-zinc-900 bg-zinc-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-md font-black text-white tracking-wide uppercase">
                      {selectedBingo.title}
                    </h3>
                    {selectedBingo.isPremium && (
                      <span className="px-2 py-0.5 rounded bg-yellow-500 text-black text-[9px] font-black flex items-center gap-0.5">
                        <Crown size={9} /> VIP
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 font-medium">
                    <Calendar size={11} /> Cadastrado em {new Date(selectedBingo.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <div className="text-right">
                    <p className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">ODD TOTAL COMBINADA</p>
                    <p className="text-2xl font-black text-green-400 font-mono">@{selectedBingo.totalOdd.toFixed(2)}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-black rounded-lg border border-yellow-500/20 uppercase tracking-wider font-mono">
                    {selectedBingo.status}
                  </span>
                </div>
              </div>

              {/* Card Body: Grid with Selections (Left) and Return Simulator & Risk Meter (Right) */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                {/* Selections list (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Seleções Incluídas ({selectedBingo.selections.length})</p>
                    <span className="text-[10px] text-zinc-500">Múltipla 100% Analisada</span>
                  </div>

                  <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                    {selectedBingo.selections.map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-3.5 bg-zinc-900/40 hover:bg-zinc-900/70 rounded-2xl border border-zinc-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-start gap-3 text-left">
                          <span className="flex items-center justify-center h-6 w-6 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-black shrink-0 font-mono mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="space-y-1">
                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase">{item.championship}</p>
                            <p className="text-xs font-black text-white">
                              {item.homeTeam} <span className="text-zinc-500 font-normal">vs</span> {item.awayTeam}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-900">
                          <div className="text-left sm:text-right">
                            <p className="text-[9px] text-zinc-500 uppercase font-black">Palpite Sugerido</p>
                            <p className="text-xs font-black text-yellow-400">{item.market}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-zinc-500 uppercase font-black">Odd</p>
                            <p className="text-xs font-black font-mono text-zinc-300">@{item.odd.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Return Simulator & Risk Assessment (5 cols) */}
                <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
                  
                  {/* Risk-o-Meter */}
                  {(() => {
                    const risk = getRiskLevel(selectedBingo.selections.length);
                    return (
                      <div className={`p-4 rounded-2xl border ${risk.bgColor} ${risk.borderColor} space-y-3 text-left`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black text-zinc-400">Classificação de Risco</span>
                          <span className={`text-xs font-black uppercase ${risk.color}`}>{risk.label}</span>
                        </div>
                        
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${risk.color.includes('amber') ? 'bg-amber-500 w-[40%]' : risk.color.includes('orange') ? 'bg-orange-500 w-[70%]' : 'bg-red-500 w-full'}`} />
                        </div>

                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                          {risk.desc}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Return Calculator */}
                  <div className="bg-zinc-900/30 border border-zinc-900 p-4.5 rounded-2xl space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                        <DollarSign size={14} className="text-green-400" /> Simulador de Retorno
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono font-bold">@ {selectedBingo.totalOdd.toFixed(2)}</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium">Sua Entrada (Aposta):</span>
                        <span className="text-yellow-400 font-black font-mono">R$ {stake.toFixed(2)}</span>
                      </div>

                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={stake}
                        onChange={(e) => setStake(Number(e.target.value))}
                        className="w-full accent-yellow-500 cursor-pointer h-1.5 bg-zinc-900 rounded-lg outline-none"
                      />

                      {/* Quick presets */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {[2, 5, 10, 20].map((val) => (
                          <button
                            key={val}
                            onClick={() => setStake(val)}
                            className={`py-1.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                              stake === val
                                ? "bg-yellow-500 text-black border-yellow-500"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            R$ {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3.5 border-t border-zinc-900 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] text-zinc-500 uppercase font-black">LUCRO ESTIMADO</p>
                        <p className="text-lg font-mono font-black text-green-400">
                          R$ {((stake * selectedBingo.totalOdd) - stake).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-[9px] text-zinc-500 uppercase font-black">RETORNO TOTAL</p>
                        <p className="text-xs font-mono font-bold text-zinc-300">
                          R$ {(stake * selectedBingo.totalOdd).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dica Especial Section */}
                  <div className="bg-zinc-900/10 p-3.5 rounded-2xl border border-zinc-900 flex items-start gap-3 text-left">
                    <HelpCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-wider">A Dica de Ouro do Leão 🦁</h4>
                      <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">
                        Bingo do Dia acumula de 5 a 10 seleções. O segredo é ter paciência: arrisque sempre pequenas quantias! Se bater apenas um bingo por semana, seu retorno cobrirá todas as entradas anteriores com sobra de lucros gigantescos.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Card Footer: Booking Code Copier & WhatsApp Share */}
              <div className="p-6 border-t border-zinc-900 bg-zinc-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-xs font-black text-zinc-300">Pronto para Copiar nas Casas?</p>
                  <p className="text-[10px] text-zinc-500">Utilize o código gerado ou compartilhe com seu grupo no WhatsApp/Telegram.</p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => handleCopyCode(selectedBingo)}
                    className="flex-1 sm:flex-none bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs px-5 py-3 rounded-xl transition-all border border-zinc-800 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    {copiedId === selectedBingo.id ? (
                      <>
                        <Check size={14} className="text-green-400" />
                        CÓDIGO COPIADO!
                      </>
                    ) : (
                      <>
                        <Clipboard size={14} className="text-yellow-400" />
                        GERAR CÓDIGO DO BILHETE
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleShareText(selectedBingo)}
                    className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    title="Compartilhar no WhatsApp / Telegram"
                  >
                    {copiedShareId === selectedBingo.id ? (
                      <>
                        <Check size={14} className="text-green-400" />
                        <span className="text-[10px] font-bold">COPIADO!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={14} className="text-yellow-400" />
                        <span className="text-[10px] font-bold">COMPARTILHAR</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-12 text-center space-y-3">
              <Dices size={40} className="text-zinc-600 mx-auto" />
              <h3 className="text-md font-bold text-zinc-300">Sem Bingos Disponíveis</h3>
              <p className="text-xs text-zinc-500">Nenhum Bingo foi publicado hoje ainda.</p>
            </div>
          )}
        </div>

      </div>

      {/* 3. Past Bingo History Section */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <History size={16} className="text-yellow-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Histórico de Bingos Resolvidos</h3>
        </div>

        {pastBingos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastBingos.map((bingo) => (
              <div 
                key={bingo.id}
                className="bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 p-5 rounded-2xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-white">{bingo.title}</p>
                      <p className="text-[10px] text-zinc-500">{bingo.date}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-black border ${
                      bingo.status === "GREEN" 
                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {bingo.status === "GREEN" ? "🎉 GREEN" : "❌ RED"}
                    </span>
                  </div>

                  {/* Summary list of games */}
                  <div className="space-y-1.5 bg-black/20 p-3 rounded-xl border border-zinc-900/60 text-[10px] text-zinc-400">
                    {bingo.selections.slice(0, 4).map((sel, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="truncate max-w-[160px] text-zinc-300 font-medium">
                          {sel.homeTeam} vs {sel.awayTeam}
                        </span>
                        <span className="text-yellow-400/95 font-semibold shrink-0">{sel.market}</span>
                      </div>
                    ))}
                    {bingo.selections.length > 4 && (
                      <p className="text-[9px] text-zinc-500 text-center pt-1 border-t border-zinc-900/40">
                        + {bingo.selections.length - 4} palpites combinados no bilhete
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-900/60 pt-3 text-[10px]">
                  <span className="text-zinc-500 font-medium">Multiplicador do Bingo:</span>
                  <span className="font-black text-green-400 font-mono">@{bingo.totalOdd.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 text-center py-4">Nenhum bingo resolvido no histórico recente.</p>
        )}
      </div>

    </div>
  );
}
