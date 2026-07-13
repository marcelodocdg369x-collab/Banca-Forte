import React, { useState } from "react";
import { Star, Crown, Plus, Trash2, Bell, Sparkles, Lock, Check, Loader2, Volume2, ShieldAlert } from "lucide-react";
import { User, Prediction, CHAMPIONSHIPS } from "../types";

interface FavoritesManagerProps {
  currentUser: User | null;
  predictions: Prediction[];
  isPremium: boolean;
  onOpenSubscription: () => void;
  onUpdateUser: (id: string, updates: Partial<User>) => Promise<any>;
  onRefreshData: () => Promise<void>;
}

export default function FavoritesManager({
  currentUser,
  predictions,
  isPremium,
  onOpenSubscription,
  onUpdateUser,
  onRefreshData
}: FavoritesManagerProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<Prediction | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Input states
  const [selectedChamp, setSelectedChamp] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [customTeam, setCustomTeam] = useState("");

  // Real-time alerts toggles
  const [realtimeNotify, setRealtimeNotify] = useState(true);
  const [whatsappNotify, setWhatsappNotify] = useState(false);

  // Extract unique teams from predictions to offer as suggestions
  const uniqueTeams = Array.from(
    new Set(predictions.flatMap((p) => [p.homeTeam, p.awayTeam]))
  ).sort();

  // Get current user's favorites
  const favorites = currentUser?.favorites || { championships: [], teams: [] };
  const favChamps = favorites.championships || [];
  const favTeams = favorites.teams || [];

  // Add championship
  const handleAddChampionship = async () => {
    if (!currentUser || !selectedChamp) return;
    if (favChamps.includes(selectedChamp)) {
      setFeedbackMsg("Esta liga já está nos seus favoritos.");
      setTimeout(() => setFeedbackMsg(""), 3000);
      return;
    }

    const updatedChamps = [...favChamps, selectedChamp];
    const newFavorites = { ...favorites, championships: updatedChamps };

    try {
      await onUpdateUser(currentUser.id, { favorites: newFavorites });
      await onRefreshData();
      setSelectedChamp("");
      setFeedbackMsg("🏆 Liga adicionada aos favoritos!");
      setTimeout(() => setFeedbackMsg(""), 3000);
    } catch (err) {
      console.error("Erro ao adicionar favorito:", err);
    }
  };

  // Add team
  const handleAddTeam = async (teamToAdd: string) => {
    if (!currentUser || !teamToAdd.trim()) return;
    const name = teamToAdd.trim();
    if (favTeams.some((t) => t.toLowerCase() === name.toLowerCase())) {
      setFeedbackMsg("Este time já está nos seus favoritos.");
      setTimeout(() => setFeedbackMsg(""), 3000);
      return;
    }

    const updatedTeams = [...favTeams, name];
    const newFavorites = { ...favorites, teams: updatedTeams };

    try {
      await onUpdateUser(currentUser.id, { favorites: newFavorites });
      await onRefreshData();
      setSelectedTeam("");
      setCustomTeam("");
      setFeedbackMsg(`⚽ ${name} adicionado aos favoritos!`);
      setTimeout(() => setFeedbackMsg(""), 3000);
    } catch (err) {
      console.error("Erro ao adicionar favorito:", err);
    }
  };

  // Remove championship
  const handleRemoveChampionship = async (champ: string) => {
    if (!currentUser) return;
    const updatedChamps = favChamps.filter((c) => c !== champ);
    const newFavorites = { ...favorites, championships: updatedChamps };

    try {
      await onUpdateUser(currentUser.id, { favorites: newFavorites });
      await onRefreshData();
      setFeedbackMsg("Liga removida dos favoritos.");
      setTimeout(() => setFeedbackMsg(""), 3000);
    } catch (err) {
      console.error("Erro ao remover favorito:", err);
    }
  };

  // Remove team
  const handleRemoveTeam = async (team: string) => {
    if (!currentUser) return;
    const updatedTeams = favTeams.filter((t) => t !== team);
    const newFavorites = { ...favorites, teams: updatedTeams };

    try {
      await onUpdateUser(currentUser.id, { favorites: newFavorites });
      await onRefreshData();
      setFeedbackMsg("Time removido dos favoritos.");
      setTimeout(() => setFeedbackMsg(""), 3000);
    } catch (err) {
      console.error("Erro ao remover favorito:", err);
    }
  };

  // Call simulated prediction generation
  const handleSimulateAlert = async () => {
    if (!currentUser) return;
    if (favChamps.length === 0 && favTeams.length === 0) {
      setFeedbackMsg("⚠️ Adicione pelo menos uma liga ou time favorito para simular o alerta exclusivo!");
      setTimeout(() => setFeedbackMsg(""), 4000);
      return;
    }

    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const res = await fetch("/api/predictions/simulate-favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      
      if (!res.ok) {
        throw new Error("Erro na simulação");
      }

      const newPred = await res.json();
      await onRefreshData();
      setSimulationResult(newPred);
      setFeedbackMsg("🔔 ALERTA ENVIADO! Um novo palpite VIP exclusivo acaba de ser publicado!");
    } catch (err) {
      console.error("Erro ao simular alerta de favoritos:", err);
      setFeedbackMsg("Falha ao processar simulação com IA.");
    } finally {
      setIsSimulating(false);
    }
  };

  if (!isPremium) {
    /* Locked state for Non-Premium users */
    return (
      <div className="bg-zinc-950/60 border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center space-y-4 max-w-lg mx-auto py-6">
          <div className="h-14 w-14 bg-gradient-to-tr from-yellow-500 to-amber-400 text-black rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-yellow-500/10">
            <Lock size={26} className="stroke-[2.5]" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-black text-white flex items-center justify-center gap-2">
              ⭐ Monitoramento de Favoritos <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-0.5 rounded-full">VIP EXCLUSIVO</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Marque ligas famosas (Premier League, Brasileirão) ou seus times do coração (Flamengo, Arsenal, Real Madrid) para monitorar novas oportunidades de lucro em tempo real!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/60 flex gap-2 items-start">
              <span className="text-yellow-400 font-bold text-xs mt-0.5">✔</span>
              <div>
                <h5 className="text-xs font-bold text-zinc-200">Alertas Instantâneos</h5>
                <p className="text-[10px] text-zinc-500 leading-tight">Receba push notifications no painel assim que um palpite correspondente for lançado.</p>
              </div>
            </div>
            <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/60 flex gap-2 items-start">
              <span className="text-yellow-400 font-bold text-xs mt-0.5">✔</span>
              <div>
                <h5 className="text-xs font-bold text-zinc-200">Análise de IA Customizada</h5>
                <p className="text-[10px] text-zinc-500 leading-tight">Nossa IA cruza os dados dos seus favoritos para priorizar análises com o Leão.</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={onOpenSubscription}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-black text-xs px-6 py-3 rounded-xl transition-all hover:scale-[1.03] shadow-lg shadow-yellow-500/10 flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Crown size={14} className="fill-black" /> Desbloquear Favoritos & Área VIP
            </button>
            <p className="text-[10px] text-zinc-500 mt-2">Assinaturas a partir de R$ 49,90/mês. Cancele quando quiser.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950/60 border border-zinc-900 rounded-3xl p-6 space-y-6 relative overflow-hidden">
      {/* Absolute Glow */}
      <div className="absolute right-0 top-0 w-32 h-full bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-900">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Star size={20} className="text-yellow-400 fill-yellow-400 animate-pulse" />
            Gerenciador de Favoritos Premium
          </h3>
          <p className="text-xs text-zinc-400">
            Customize o robô de IA do Leão com seus times e campeonatos favoritos para notificações exclusivas.
          </p>
        </div>

        {/* Live Feedback Message Toast */}
        {feedbackMsg && (
          <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1.5 rounded-xl font-bold animate-fadeIn">
            {feedbackMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Configure Favorites */}
        <div className="space-y-5 bg-zinc-900/20 p-5 rounded-2xl border border-zinc-900">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5 text-zinc-300">
            ⚙️ CONFIGURAR PREFERÊNCIAS
          </h4>

          {/* Championship Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">Favoritar Campeonato</label>
            <div className="flex gap-2">
              <select
                value={selectedChamp}
                onChange={(e) => setSelectedChamp(e.target.value)}
                className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-yellow-500/50"
              >
                <option value="">-- Selecione um Campeonato --</option>
                {CHAMPIONSHIPS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={handleAddChampionship}
                disabled={!selectedChamp}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xs px-4 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Team Selector / Creator */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">Favoritar Time</label>
            
            {/* Quick-select suggestion */}
            <div className="flex gap-2 mb-1">
              <select
                value={selectedTeam}
                onChange={(e) => {
                  setSelectedTeam(e.target.value);
                  setCustomTeam(""); // Clear custom input if selected suggestion
                }}
                className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-yellow-500/50"
              >
                <option value="">-- Sugestões de Times Ativos --</option>
                {uniqueTeams.map((team) => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
              <button
                onClick={() => handleAddTeam(selectedTeam)}
                disabled={!selectedTeam}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xs px-4 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Custom Team input fallback */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ou digite o nome de outro time..."
                value={customTeam}
                onChange={(e) => {
                  setCustomTeam(e.target.value);
                  setSelectedTeam(""); // Clear suggestion if typing
                }}
                className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50"
              />
              <button
                onClick={() => handleAddTeam(customTeam)}
                disabled={!customTeam.trim()}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs px-4 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 border border-zinc-700"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Notification settings */}
          <div className="pt-3 border-t border-zinc-900 space-y-3">
            <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
              CANAIS DE ALERTA EXCLUSIVOS
            </h5>
            
            <div className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-zinc-900">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-zinc-200">Notificação no Painel</p>
                  <p className="text-[9px] text-zinc-500">Alertas instantâneos na barra de avisos</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={realtimeNotify}
                onChange={(e) => setRealtimeNotify(e.target.checked)}
                className="h-4 w-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-zinc-900">
              <div className="flex items-center gap-2">
                <Crown size={14} className="text-yellow-400 fill-yellow-400" />
                <div>
                  <p className="text-xs font-bold text-zinc-200">Sincronizar E-mail & WhatsApp</p>
                  <p className="text-[9px] text-zinc-500">Alertas táticos em tempo de jogo</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={whatsappNotify}
                onChange={(e) => setWhatsappNotify(e.target.checked)}
                className="h-4 w-4 accent-yellow-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Favorites List & Live simulator */}
        <div className="space-y-5 flex flex-col justify-between bg-zinc-900/20 p-5 rounded-2xl border border-zinc-900">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5 text-zinc-300">
              📋 SEUS FAVORITOS ATIVOS
            </h4>

            {/* Favorite Championships list */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-zinc-500">🏆 Campeonatos Monitorados ({favChamps.length})</h5>
              {favChamps.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {favChamps.map((champ) => (
                    <span
                      key={champ}
                      className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg text-[10px] font-bold"
                    >
                      {champ}
                      <button
                        onClick={() => handleRemoveChampionship(champ)}
                        className="text-emerald-400 hover:text-red-400 ml-1 focus:outline-none cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-zinc-600 italic">Nenhuma liga monitorada no momento.</p>
              )}
            </div>

            {/* Favorite Teams list */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-zinc-500">⚽ Times Monitorados ({favTeams.length})</h5>
              {favTeams.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {favTeams.map((team) => (
                    <span
                      key={team}
                      className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded-lg text-[10px] font-bold"
                    >
                      {team}
                      <button
                        onClick={() => handleRemoveTeam(team)}
                        className="text-yellow-400 hover:text-red-400 ml-1 focus:outline-none cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-zinc-600 italic">Nenhum time monitorado no momento.</p>
              )}
            </div>
          </div>

          {/* Simulation Playground & Real-time IA tool */}
          <div className="pt-4 border-t border-zinc-900 space-y-3">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-black text-yellow-400">
                  <Sparkles size={14} className="animate-spin text-yellow-400" />
                  SIMULADOR DE ALERTA DE IA
                </span>
                <span className="text-[8px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">
                  teste vip
                </span>
              </div>
              
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Quer testar a recepção de alertas instantâneos? Clique abaixo para simular que nossa IA acaba de identificar e publicar uma nova entrada para um de seus times/ligas monitoradas acima.
              </p>

              <button
                onClick={handleSimulateAlert}
                disabled={isSimulating || (favChamps.length === 0 && favTeams.length === 0)}
                className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-700 hover:from-emerald-600 hover:to-green-800 text-black font-black text-xs py-2.5 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSimulating ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Banca Forte IA analisando dados...
                  </>
                ) : (
                  <>
                    <Volume2 size={13} />
                    Simular Alerta de Novo Palpite Favorito
                  </>
                )}
              </button>

              {/* Simulation Result Success Banner */}
              {simulationResult && (
                <div className="mt-3 bg-zinc-900/80 border border-emerald-500/30 p-3 rounded-lg space-y-1.5 animate-fadeIn">
                  <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    🎯 Palpite Gerado com Sucesso!
                  </p>
                  <p className="text-xs font-extrabold text-white">
                    {simulationResult.homeTeam} vs {simulationResult.awayTeam}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Liga: {simulationResult.championship}</span>
                    <span className="text-yellow-400 font-bold">Odd: x{simulationResult.odd.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-tight italic line-clamp-2">
                    {simulationResult.analysis}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
