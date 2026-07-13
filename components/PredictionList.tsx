import React, { useState } from "react";
import { Search, Filter, Crown, Sparkles, Star, ChevronDown, ChevronUp, Lock, Lightbulb } from "lucide-react";
import { Prediction, User, CHAMPIONSHIPS, MARKETS } from "../types";

interface PredictionListProps {
  predictions: Prediction[];
  isPremium: boolean;
  onOpenSubscription: () => void;
  selectedPredictionId?: string;
  onViewPrediction: (prediction: Prediction) => void;
  currentUser?: User | null;
}

export default function PredictionList({
  predictions,
  isPremium,
  onOpenSubscription,
  selectedPredictionId,
  onViewPrediction,
  currentUser
}: PredictionListProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChampionship, setSelectedChampionship] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Local active accordion prediction
  const [expandedId, setExpandedId] = useState<string | null>(selectedPredictionId || null);

  const toggleExpand = (id: string, pred: Prediction) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      onViewPrediction(pred);
    }
  };

  // Filtered Predictions
  const filteredPredictions = predictions.filter(pred => {
    const matchSearch =
      pred.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pred.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pred.analysis.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchChamp = selectedChampionship ? pred.championship === selectedChampionship : true;
    const matchMarket = selectedMarket ? pred.market === selectedMarket : true;
    const matchStatus = selectedStatus ? pred.status === selectedStatus : true;

    return matchSearch && matchChamp && matchMarket && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            ⚽ Todos os Palpites de Hoje
          </h2>
          <p className="text-xs text-zinc-400">
            Veja as análises dos especialistas, escolha seus confrontos favoritos e multiplique sua banca de forma consciente.
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            showFilters
              ? "bg-yellow-500 text-black border-yellow-500"
              : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800"
          }`}
        >
          <Filter size={14} /> {showFilters ? "Fechar Filtros" : "Mostrar Filtros de Busca"}
        </button>
      </div>

      {/* 2. Filters Box */}
      {showFilters && (
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 animate-fadeIn">
          {/* Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Buscar por time..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          {/* Championship Filter */}
          <select
            value={selectedChampionship}
            onChange={(e) => setSelectedChampionship(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-yellow-500/50"
          >
            <option value="">Todos os Campeonatos</option>
            {CHAMPIONSHIPS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Market Filter */}
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-yellow-500/50"
          >
            <option value="">Todos os Palpites (Mercados)</option>
            {MARKETS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-yellow-500/50"
          >
            <option value="">Todos os Resultados</option>
            <option value="PENDENTE">Ainda não Jogaram ⏳</option>
            <option value="GREEN">Ganhos ✅</option>
            <option value="RED">Perdidos ❌</option>
          </select>
        </div>
      )}

      {/* 3. Predictions List Accordion */}
      <div className="space-y-3">
        {filteredPredictions.length > 0 ? (
          filteredPredictions.map((pred) => {
            const isExpanded = expandedId === pred.id;
            const needsVip = pred.isPremium && !isPremium;

            // Status match
            const statusLabel =
              pred.status === "GREEN"
                ? "Ganho ✅"
                : pred.status === "RED"
                ? "Perdido ❌"
                : "Ativo ⏳";

            const statusColor =
              pred.status === "GREEN"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : pred.status === "RED"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";

            // Check if this prediction matches user favorites (leagues or teams)
            const favs = currentUser?.favorites;
            const isFavoriteChamp = favs?.championships?.includes(pred.championship);
            const isFavoriteTeam = favs?.teams?.some(
              t => t.toLowerCase() === pred.homeTeam.toLowerCase() || t.toLowerCase() === pred.awayTeam.toLowerCase()
            );
            const isFavorite = isFavoriteChamp || isFavoriteTeam;

            const isHomeTeamFav = favs?.teams?.some(t => t.toLowerCase() === pred.homeTeam.toLowerCase());
            const isAwayTeamFav = favs?.teams?.some(t => t.toLowerCase() === pred.awayTeam.toLowerCase());

            return (
              <div
                key={pred.id}
                className={`overflow-hidden rounded-2xl border transition-all ${
                  isFavorite
                    ? "bg-gradient-to-r from-emerald-950/20 via-zinc-900/30 to-zinc-950 border-emerald-500/30 hover:border-emerald-500/50 shadow-md shadow-emerald-500/5"
                    : pred.isPremium
                    ? "bg-gradient-to-r from-zinc-950 to-zinc-900/50 border-yellow-500/20 hover:border-yellow-500/40"
                    : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {/* Accordion Trigger Header */}
                <div
                  onClick={() => toggleExpand(pred.id, pred)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] text-zinc-400 font-mono tracking-tight bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800 truncate">
                        {pred.championship}
                      </span>
                      {pred.isPremium && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.2 rounded font-bold uppercase">
                          <Crown size={8} className="fill-yellow-400" /> VIP
                        </span>
                      )}
                      {isFavorite && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-black uppercase tracking-wider animate-pulse">
                          <Star size={8} className="fill-emerald-400 text-emerald-400" /> FAVORITO 🦁
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm md:text-md font-bold text-white">
                      <span className={isHomeTeamFav ? "text-emerald-400 font-extrabold" : ""}>{pred.homeTeam}</span>
                      <span className="text-yellow-500 font-normal text-xs">X</span>
                      <span className={isAwayTeamFav ? "text-emerald-400 font-extrabold" : ""}>{pred.awayTeam}</span>
                    </div>
                  </div>

                  {/* Summary Indicators */}
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                      <p className="text-[9px] text-zinc-500">PALPITE</p>
                      <p className="text-xs font-bold text-emerald-400">
                        {needsVip ? "🔓 Exclusivo VIP" : pred.market}
                      </p>
                    </div>

                    <div className="text-center bg-black/40 px-3 py-1 rounded-xl border border-zinc-800">
                      <p className="text-[8px] text-zinc-500 font-bold">ODD</p>
                      <p className="text-sm font-black text-yellow-400">
                        {needsVip ? "---" : `x${pred.odd.toFixed(2)}`}
                      </p>
                    </div>

                    <span className={`text-[10px] font-black border px-2 py-1 rounded-lg uppercase whitespace-nowrap ${statusColor}`}>
                      {statusLabel}
                    </span>

                    {isExpanded ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                  </div>
                </div>

                {/* Expanded Section with Details */}
                {isExpanded && (
                  <div className="border-t border-zinc-900 p-5 bg-black/40 space-y-4 animate-slideDown">
                    {needsVip ? (
                      /* VIP Locked Screen */
                      <div className="p-6 text-center space-y-3 max-w-md mx-auto">
                        <div className="h-12 w-12 bg-yellow-500/10 text-yellow-400 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20 animate-pulse">
                          <Lock size={20} />
                        </div>
                        <h4 className="text-md font-extrabold text-yellow-500">Conteúdo Exclusivo Premium VIP</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Este palpite possui cotações de alto valor e uma análise completa baseada em desfalques recentes e estatísticas calculadas por Inteligência Artificial.
                        </p>
                        <button
                          onClick={onOpenSubscription}
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-yellow-500/10 cursor-pointer"
                        >
                          Seja VIP agora para liberar essa dica
                        </button>
                      </div>
                    ) : (
                      /* VIP Unlocked / Free content */
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Meta Left column */}
                        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl space-y-3">
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-400">Detalhes do Jogo</h5>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Data e Hora:</span>
                              <span className="font-semibold text-zinc-300">{pred.date} às {pred.time}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Opção de Aposta:</span>
                              <span className="font-bold text-emerald-400">{pred.market}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Multiplicador (Odd):</span>
                              <span className="font-bold text-yellow-400">x{pred.odd.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-500">Chance de Acerto:</span>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={11}
                                    className={
                                      i < Math.round(pred.confidence / 20)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-zinc-700"
                                    }
                                  />
                                ))}
                                <span className="ml-1 text-[11px] font-mono text-zinc-300">({pred.confidence}%)</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Resultado:</span>
                              <span className={`font-bold uppercase ${
                                pred.status === "GREEN" ? "text-emerald-400" : pred.status === "RED" ? "text-red-400" : "text-yellow-400"
                              }`}>
                                {statusLabel}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Analysis Middle/Right Column */}
                        <div className="md:col-span-2 space-y-3">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block p-1 bg-yellow-500/10 text-yellow-500 rounded">
                              <Lightbulb size={12} className="animate-pulse" />
                            </span>
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-400">Por que apostar nesse jogo?</h5>
                          </div>
                          
                          <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-4 rounded-xl border border-zinc-900 whitespace-pre-line">
                            {pred.analysis}
                          </p>

                          {/* Quick tip box */}
                          <div className="text-[11px] text-zinc-400 bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/40 flex items-start gap-1.5">
                            <span className="text-yellow-400 font-bold">💡 Dica banca forte:</span>
                            <span>Aconselhamos apostar uma porcentagem pequena da sua banca total (ex: 2%) para gerenciar seu saldo com total segurança.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-500 text-xs">
            Nenhum palpite foi encontrado com os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
}
