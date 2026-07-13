import React, { useState } from "react";
import { Ticket, Copy, CheckCircle, HelpCircle, Lock, Crown } from "lucide-react";
import { ReadySlip, Prediction } from "../types";

interface ReadySlipsViewProps {
  readySlips: ReadySlip[];
  predictions: Prediction[];
  isPremium: boolean;
  onOpenSubscription: () => void;
}

export default function ReadySlipsView({
  readySlips,
  predictions,
  isPremium,
  onOpenSubscription
}: ReadySlipsViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTicket = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          🎫 Bilhetes Prontos do Dia
        </h2>
        <p className="text-xs text-zinc-400">
          Gostaria de poupar tempo? Copie os bilhetes prontos que nossa equipe montou combinando os melhores palpites. Basta copiar e colar na sua casa de apostas.
        </p>
      </div>

      {readySlips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {readySlips.map((slip) => {
            const hasGreen = slip.status === "GREEN";
            const hasRed = slip.status === "RED";
            const isPendente = slip.status === "PENDENTE";
            const isLocked = slip.isPremium && !isPremium;

            const statusClass = hasGreen
              ? "border-emerald-500/40 bg-emerald-950/20"
              : hasRed
              ? "border-zinc-800 bg-zinc-950/10"
              : isLocked
              ? "border-amber-500/20 bg-zinc-950/60 shadow-lg shadow-amber-500/5"
              : "border-yellow-500/30 bg-zinc-900/60";

            return (
              <div
                key={slip.id}
                className={`relative border rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-xl transition-all hover:scale-[1.01] ${statusClass}`}
              >
                {/* Visual Status stamp or VIP stamp */}
                {slip.isPremium && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Crown size={10} className="fill-black" /> EXCLUSIVO VIP 💎
                  </div>
                )}

                {hasGreen && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    GANHO ✅
                  </div>
                )}
                {hasRed && (
                  <div className="absolute top-4 right-4 bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    PERDIDO ❌
                  </div>
                )}
                {isPendente && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ATIVO ⏳
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pt-3">
                    <Ticket className="text-yellow-400" size={20} />
                    <h3 className="text-md font-extrabold text-white">{slip.title}</h3>
                  </div>

                  <p className="text-xs text-zinc-400">
                    Este bilhete contém {slip.predictionIds.length} jogos combinados para multiplicar a cotação final.
                  </p>

                  {/* Coupon layout container */}
                  <div className="border-t-2 border-b-2 border-dashed border-zinc-800 py-3 my-2 space-y-3 bg-black/40 px-3 rounded-xl relative">
                    {slip.predictionIds.map((predId, idx) => {
                      const matchPred = predictions.find((p) => p.id === predId);
                      const showDetails = !isLocked;

                      return (
                        <div
                          key={predId}
                          className="flex justify-between items-start gap-4 text-xs pb-3 border-b border-zinc-900 last:border-0 last:pb-0"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-zinc-500">Jogo {idx + 1}</span>
                              <p className={`font-bold text-zinc-200 transition-all ${!showDetails ? "blur-[5px] select-none text-zinc-600" : ""}`}>
                                {showDetails
                                  ? (matchPred ? `${matchPred.homeTeam} vs ${matchPred.awayTeam}` : "Evento Selecionado")
                                  : "Time Secreto vs Time Oculto"}
                              </p>
                            </div>
                            <p className={`text-[10px] text-zinc-500 italic mt-0.5 ml-3 transition-all ${!showDetails ? "blur-[4px] select-none text-zinc-700" : ""}`}>
                              {showDetails ? (matchPred ? matchPred.championship : "Competição") : "Competição VIP Oculta"}
                            </p>
                            <p className={`text-[11px] text-emerald-400 font-bold ml-3 mt-0.5 transition-all ${!showDetails ? "blur-[5px] select-none text-emerald-950" : ""}`}>
                              Palpite: {showDetails ? (matchPred ? matchPred.market : "Apostar no Mercado") : "Entrada Ultra Secreta"}
                            </p>
                          </div>
                          <span className={`font-mono text-yellow-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-right font-bold self-center transition-all ${!showDetails ? "blur-[4px] select-none text-yellow-950" : ""}`}>
                            x{showDetails ? (matchPred ? matchPred.odd.toFixed(2) : "1.85") : "1.80"}
                          </span>
                        </div>
                      );
                    })}

                    {isLocked && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px] rounded-xl flex flex-col items-center justify-center p-4 text-center">
                        <Lock size={20} className="text-yellow-500 mb-1" />
                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-wider">🔒 Conteúdo Exclusivo VIP</span>
                        <p className="text-[9px] text-zinc-400 max-w-[200px] mt-0.5">Assine o plano VIP para liberar este bilhete pronto agora mesmo!</p>
                      </div>
                    )}
                  </div>

                  {/* Financials in coupon */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="bg-black/60 p-2.5 rounded-xl border border-zinc-900 text-center">
                      <p className="text-[9px] text-zinc-400 uppercase font-bold">Multiplicador Final</p>
                      <p className="text-base font-black text-yellow-400 mt-0.5">x{slip.totalOdd.toFixed(2)}</p>
                    </div>
                    <div className="bg-black/60 p-2.5 rounded-xl border border-zinc-900 text-center">
                      <p className="text-[9px] text-zinc-400 uppercase font-bold">Valor Sugerido</p>
                      <p className="text-base font-bold text-white mt-0.5">R$ {slip.suggestedValue}</p>
                    </div>
                    <div className="bg-black/60 p-2.5 rounded-xl border border-zinc-900 text-center">
                      <p className="text-[9px] text-emerald-400 uppercase font-bold">Ganho Estimado</p>
                      <p className="text-base font-black text-emerald-400 mt-0.5">R$ {slip.estimatedProfit.toFixed(0)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-900 flex items-center justify-between gap-3">
                  {isLocked ? (
                    <button
                      onClick={onOpenSubscription}
                      className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-lg hover:scale-[1.01]"
                    >
                      <Crown size={12} className="fill-black" /> Desbloquear Bilhete VIP
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleCopyTicket(
                          slip.id,
                          `Banca Forte - Bilhete Pronto:\n${slip.title}\nMultiplicador Final: x${slip.totalOdd.toFixed(
                            2
                          )}\nValor Sugerido: R$ ${slip.suggestedValue}\nRetorno Estimado: R$ ${slip.estimatedProfit.toFixed(0)}`
                        )
                      }
                      className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all"
                    >
                      {copiedId === slip.id ? (
                        <>
                          <CheckCircle size={14} /> Bilhete Copiado!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copiar Bilhete Pronto
                        </>
                      )}
                    </button>
                  )}

                  {isPendente && !isLocked && (
                    <span className="text-[10px] text-zinc-500 font-mono italic">
                      Copie e cole na sua corretora
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-zinc-900 rounded-3xl text-zinc-500">
          Nenhum bilhete pronto publicado para hoje.
        </div>
      )}

      {/* Interactive FAQ banner */}
      <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl flex gap-3.5 items-start">
        <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20">
          <HelpCircle size={18} className="animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Como funcionam estes Bilhetes Combinados?</h4>
          <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">
            Os bilhetes prontos somam as chances de vários jogos em uma única aposta, o que faz os multiplicadores (odds) se multiplicarem entre si gerando retornos muito maiores. Sugerimos fazer apostas de valores moderados para manter a diversão e a segurança do seu dinheiro!
          </p>
        </div>
      </div>
    </div>
  );
}
