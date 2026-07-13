import React, { useState } from "react";
import { Users, Plus, ShieldCheck, Edit, Trash2, Crown, Sparkles, TrendingUp, CheckCircle, XCircle, AlertTriangle, Coins, RefreshCw, BarChart2, DollarSign, Send } from "lucide-react";
import { Prediction, User, ReadySlip, FinanceStats, CHAMPIONSHIPS, MARKETS, Bingo, BingoSelection } from "../types";
import { Dices, HelpCircle, Ticket } from "lucide-react";

interface AdminPanelProps {
  predictions: Prediction[];
  users: User[];
  readySlips: ReadySlip[];
  bingos: Bingo[];
  financeStats: FinanceStats;
  onAddPrediction: (pred: Omit<Prediction, "id" | "createdAt">) => Promise<any>;
  onUpdatePrediction: (id: string, updates: Partial<Prediction>) => Promise<any>;
  onDeletePrediction: (id: string) => Promise<any>;
  onAddReadySlip: (slip: Omit<ReadySlip, "id" | "createdAt">) => Promise<any>;
  onUpdateReadySlip: (id: string, updates: Partial<ReadySlip>) => Promise<any>;
  onDeleteReadySlip: (id: string) => Promise<any>;
  onAddBingo: (bingo: Omit<Bingo, "id" | "createdAt">) => Promise<any>;
  onUpdateBingo: (id: string, updates: Partial<Bingo>) => Promise<any>;
  onDeleteBingo: (id: string) => Promise<any>;
  onAddUser: (user: Omit<User, "id" | "createdAt">) => Promise<any>;
  onUpdateUser: (id: string, updates: Partial<User>) => Promise<any>;
  onDeleteUser: (id: string) => Promise<any>;
  onRefreshData?: () => Promise<any>;
}

export default function AdminPanel({
  predictions,
  users,
  readySlips,
  bingos,
  financeStats,
  onAddPrediction,
  onUpdatePrediction,
  onDeletePrediction,
  onAddReadySlip,
  onUpdateReadySlip,
  onDeleteReadySlip,
  onAddBingo,
  onUpdateBingo,
  onDeleteBingo,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onRefreshData
}: AdminPanelProps) {
  // Navigation tabs within Admin Panel
  const [activeAdminTab, setActiveAdminTab] = useState<"palpites" | "usuarios" | "bilhetes" | "bingos" | "financeiro">("palpites");

  // --- Admin Owner Pix Settings State ---
  const [adminPixKey, setAdminPixKey] = useState("");
  const [adminPixName, setAdminPixName] = useState("");
  const [adminPixCity, setAdminPixCity] = useState("SAO PAULO");
  const [isSavingPix, setIsSavingPix] = useState(false);

  // --- Telegram Settings State ---
  const [telegramLink, setTelegramLink] = useState("");
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isSendingTelegramTips, setIsSendingTelegramTips] = useState(false);
  const [telegramSendResult, setTelegramSendResult] = useState<string | null>(null);
  const [isGeneratingDailyPrediction, setIsGeneratingDailyPrediction] = useState(false);

  React.useEffect(() => {
    if (activeAdminTab === "financeiro") {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          setAdminPixKey(data.pixKey || "");
          setAdminPixName(data.pixName || "");
          setAdminPixCity(data.pixCity || "SAO PAULO");
          setTelegramLink(data.telegramLink || "");
          setTelegramBotToken(data.telegramBotToken || "");
          setTelegramChatId(data.telegramChatId || "");
        })
        .catch((err) => console.error("Erro ao carregar Pix:", err));
    }
  }, [activeAdminTab]);

  const handleSavePixSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPix(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixKey: adminPixKey,
          pixName: adminPixName,
          pixCity: adminPixCity,
          telegramLink,
          telegramBotToken,
          telegramChatId
        })
      });
      if (res.ok) {
        alert("Configurações de recebimento Pix salvas com sucesso!");
      } else {
        alert("Erro ao salvar configurações do Pix.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de rede ao salvar configurações.");
    } finally {
      setIsSavingPix(false);
    }
  };

  const handleSaveTelegramSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTelegram(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixKey: adminPixKey,
          pixName: adminPixName,
          pixCity: adminPixCity,
          telegramLink,
          telegramBotToken,
          telegramChatId
        })
      });
      if (res.ok) {
        alert("Configurações do Telegram salvas com sucesso!");
      } else {
        alert("Erro ao salvar configurações do Telegram.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de rede ao salvar configurações.");
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const handleSendTipsToTelegram = async () => {
    setIsSendingTelegramTips(true);
    setTelegramSendResult(null);
    try {
      const res = await fetch("/api/telegram/send-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        setTelegramSendResult(data.message);
        alert(data.message);
      } else {
        setTelegramSendResult(`Erro: ${data.message}`);
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      setTelegramSendResult("Erro de conexão ao enviar palpites.");
    } finally {
      setIsSendingTelegramTips(false);
    }
  };

  const handleGenerateDailyPrediction = async () => {
    setIsGeneratingDailyPrediction(true);
    try {
      const res = await fetch("/api/predictions/create-daily", {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        alert("Novo palpite de jogo real do dia gerado com sucesso no painel! Ele já está disponível na aba 'Palpites' e na tela inicial, pronto para envio para o Telegram.");
        if (onRefreshData) {
          await onRefreshData();
        }
      } else {
        alert("Erro ao criar palpite do dia.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor para criar o palpite do dia.");
    } finally {
      setIsGeneratingDailyPrediction(false);
    }
  };

  // --- Palpites Create Form State ---
  const [pChamp, setPChamp] = useState(CHAMPIONSHIPS[0]);
  const [pHome, setPHome] = useState("");
  const [pAway, setPAway] = useState("");
  const [pDate, setPDate] = useState("2026-07-12");
  const [pTime, setPTime] = useState("16:00");
  const [pMarket, setPMarket] = useState(MARKETS[0]);
  const [pOdd, setPOdd] = useState(1.95);
  const [pConfidence, setPConfidence] = useState(85);
  const [pAnalysis, setPAnalysis] = useState("");
  const [pIsPremium, setPIsPremium] = useState(false);
  const [pStatus, setPStatus] = useState<'PENDENTE' | 'GREEN' | 'RED'>('PENDENTE');

  // --- Odds AI suggester fields ---
  const [targetOdd, setTargetOdd] = useState(2.50);
  const [loadingAI, setLoadingAI] = useState(false);

  // --- Users Form State ---
  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uIsPremium, setUIsPremium] = useState(false);
  const [uIsAdmin, setUIsAdmin] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // --- Bilhete Pronto Builder Form State ---
  const [bTitle, setBTitle] = useState("Dica de Tripla Premiada");
  const [bSelectedPredIds, setBSelectedPredIds] = useState<string[]>([]);
  const [bSuggestedValue, setBSuggestedValue] = useState(100);
  const [bIsPremium, setBIsPremium] = useState(false);

  // --- Bingo Builder Form State ---
  const [bingoFormTitle, setBingoFormTitle] = useState("Bingo de Fim de Semana");
  const [bingoFormDate, setBingoFormDate] = useState("2026-07-12");
  const [bingoFormIsPremium, setBingoFormIsPremium] = useState(false);
  const [bingoFormSelections, setBingoFormSelections] = useState<BingoSelection[]>([]);

  // Individual selection state inside Bingo Builder
  const [bingoSelChamp, setBingoSelChamp] = useState(CHAMPIONSHIPS[0]);
  const [bingoSelHome, setBingoSelHome] = useState("");
  const [bingoSelAway, setBingoSelAway] = useState("");
  const [bingoSelMarket, setBingoSelMarket] = useState("Vitória Casa");
  const [bingoSelOdd, setBingoSelOdd] = useState(1.70);

  // Trigger AI Suggestion
  const handleAISuggestion = async () => {
    setLoadingAI(true);
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetOdd,
          teamHome: pHome || undefined,
          teamAway: pAway || undefined,
          championship: pChamp
        })
      });
      const data = await response.json();
      
      // Auto populate fields
      if (data.homeTeam) setPHome(data.homeTeam);
      if (data.awayTeam) setPAway(data.awayTeam);
      if (data.market) setPMarket(data.market);
      if (data.odd) setPOdd(data.odd);
      if (data.confidence) setPConfidence(data.confidence);
      if (data.analysis) setPAnalysis(data.analysis);
      
    } catch (err) {
      console.error("Erro ao gerar sugestão de IA", err);
    } finally {
      setLoadingAI(false);
    }
  };

  // Submit Palpite
  const handleSubmitPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pHome || !pAway || !pAnalysis) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    await onAddPrediction({
      championship: pChamp,
      homeTeam: pHome,
      awayTeam: pAway,
      date: pDate,
      time: pTime,
      market: pMarket,
      odd: pOdd,
      confidence: pConfidence,
      analysis: pAnalysis,
      isPremium: pIsPremium,
      status: pStatus
    });

    // Reset Form
    setPHome("");
    setPAway("");
    setPAnalysis("");
    setPOdd(1.95);
    alert("Palpite criado com sucesso e publicado!");
  };

  // Resolve prediction status
  const handleResolvePrediction = async (id: string, status: "GREEN" | "RED") => {
    await onUpdatePrediction(id, { status });
  };

  // Toggle user Premium
  const handleToggleUserPremium = async (user: User) => {
    const isNowPremium = !user.isPremium;
    await onUpdateUser(user.id, {
      isPremium: isNowPremium,
      subscriptionType: isNowPremium ? "mensal" : null,
      subscriptionExpiresAt: isNowPremium ? new Date(Date.now() + 30 * 24 * 3600000).toISOString() : null
    });
  };

  // Toggle user Admin
  const handleToggleUserAdmin = async (user: User) => {
    await onUpdateUser(user.id, {
      isAdmin: !user.isAdmin
    });
  };

  // Create User manually
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName || !uEmail) return;

    if (editingUserId) {
      await onUpdateUser(editingUserId, {
        name: uName,
        email: uEmail,
        isPremium: uIsPremium,
        isAdmin: uIsAdmin
      });
      setEditingUserId(null);
    } else {
      await onAddUser({
        name: uName,
        email: uEmail,
        isPremium: uIsPremium,
        isAdmin: uIsAdmin,
        subscriptionType: uIsPremium ? "mensal" : null,
        subscriptionExpiresAt: uIsPremium ? new Date(Date.now() + 30 * 24 * 3600000).toISOString() : null
      });
    }

    setUName("");
    setUEmail("");
    setUIsPremium(false);
    setUIsAdmin(false);
  };

  // Select User for editing
  const handleSelectUserForEdit = (user: User) => {
    setEditingUserId(user.id);
    setUName(user.name);
    setUEmail(user.email);
    setUIsPremium(user.isPremium);
    setUIsAdmin(user.isAdmin);
  };

  // Toggle prediction in ticket builder selection
  const handleTogglePredSelection = (id: string) => {
    if (bSelectedPredIds.includes(id)) {
      setBSelectedPredIds(bSelectedPredIds.filter(item => item !== id));
    } else {
      setBSelectedPredIds([...bSelectedPredIds, id]);
    }
  };

  // Save Ready Slip
  const handleBuildReadySlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bSelectedPredIds.length === 0) {
      alert("Selecione ao menos 1 palpite para compor o bilhete!");
      return;
    }

    // Calculate total odd
    const selectedPreds = predictions.filter(p => bSelectedPredIds.includes(p.id));
    const totalOdd = selectedPreds.reduce((acc, p) => acc * p.odd, 1);
    const estimatedProfit = bSuggestedValue * totalOdd;

    await onAddReadySlip({
      title: bTitle,
      predictionIds: bSelectedPredIds,
      totalOdd: parseFloat(totalOdd.toFixed(2)),
      suggestedValue: bSuggestedValue,
      estimatedProfit: parseFloat(estimatedProfit.toFixed(2)),
      date: new Date().toISOString().split("T")[0],
      isPremium: bIsPremium,
      status: "PENDENTE"
    });

    setBTitle("Dica de Tripla Premiada");
    setBSelectedPredIds([]);
    setBIsPremium(false);
    alert("Bilhete do Dia criado com sucesso!");
  };

  // --- Bingo Builder Actions ---
  const handleAddSelectionToBingo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bingoSelHome || !bingoSelAway) {
      alert("Por favor, preencha as equipes de Casa e Visitante.");
      return;
    }
    const newSelection: BingoSelection = {
      championship: bingoSelChamp,
      homeTeam: bingoSelHome,
      awayTeam: bingoSelAway,
      market: bingoSelMarket,
      odd: bingoSelOdd
    };
    setBingoFormSelections([...bingoFormSelections, newSelection]);
    setBingoSelHome("");
    setBingoSelAway("");
  };

  const handleRemoveSelectionFromBingo = (index: number) => {
    setBingoFormSelections(bingoFormSelections.filter((_, idx) => idx !== index));
  };

  const handleCreateBingo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bingoFormSelections.length < 5 || bingoFormSelections.length > 10) {
      alert(`O Bingo deve conter de 5 a 10 equipes/jogos! Atualmente contém: ${bingoFormSelections.length}.`);
      return;
    }

    const calculatedTotalOdd = bingoFormSelections.reduce((acc, sel) => acc * sel.odd, 1);

    await onAddBingo({
      title: bingoFormTitle,
      date: bingoFormDate,
      totalOdd: parseFloat(calculatedTotalOdd.toFixed(2)),
      selections: bingoFormSelections,
      status: "PENDENTE",
      isPremium: bingoFormIsPremium
    });

    setBingoFormTitle("Bingo de Fim de Semana");
    setBingoFormSelections([]);
    alert("Bingo do Dia criado com sucesso!");
  };

  const handleResolveBingo = async (id: string, status: "GREEN" | "RED") => {
    await onUpdateBingo(id, { status });
  };

  return (
    <div className="space-y-6">
      {/* Admin Title Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-zinc-950 to-zinc-900 border border-emerald-500/30 p-5 rounded-3xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" />
            Painel do Operador
          </h2>
          <p className="text-xs text-zinc-400">
            Crie palpites apoiado por IA, configure bilhetes combinados e gerencie assinaturas de usuários em tempo real.
          </p>
        </div>

        <span className="text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-400">
          SISTEMA ATIVO 🟢
        </span>
      </div>

      {/* Admin Navigation tabs */}
      <div className="flex border-b border-zinc-800 gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveAdminTab("palpites")}
          className={`px-4 py-2 text-xs font-black rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeAdminTab === "palpites" ? "bg-zinc-900 text-yellow-400 border-b-2 border-yellow-500" : "text-zinc-400 hover:text-white"
          }`}
        >
          ⚽ Palpites & IA
        </button>
        <button
          onClick={() => setActiveAdminTab("usuarios")}
          className={`px-4 py-2 text-xs font-black rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeAdminTab === "usuarios" ? "bg-zinc-900 text-yellow-400 border-b-2 border-yellow-500" : "text-zinc-400 hover:text-white"
          }`}
        >
          👥 Gerenciar Usuários
        </button>
        <button
          onClick={() => setActiveAdminTab("bilhetes")}
          className={`px-4 py-2 text-xs font-black rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeAdminTab === "bilhetes" ? "bg-zinc-900 text-yellow-400 border-b-2 border-yellow-500" : "text-zinc-400 hover:text-white"
          }`}
        >
          🎫 Construtor de Bilhetes
        </button>
        <button
          onClick={() => setActiveAdminTab("bingos")}
          className={`px-4 py-2 text-xs font-black rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeAdminTab === "bingos" ? "bg-zinc-900 text-yellow-400 border-b-2 border-yellow-500" : "text-zinc-400 hover:text-white"
          }`}
        >
          🎰 Construtor de Bingos
        </button>
        <button
          onClick={() => setActiveAdminTab("financeiro")}
          className={`px-4 py-2 text-xs font-black rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeAdminTab === "financeiro" ? "bg-zinc-900 text-yellow-400 border-b-2 border-yellow-500" : "text-zinc-400 hover:text-white"
          }`}
        >
          📊 Painel Financeiro
        </button>
      </div>

      {/* --- TAB 1: PALPITES & IA --- */}
      {activeAdminTab === "palpites" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creator Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-md text-white flex items-center gap-1.5">
                  <Plus size={16} className="text-yellow-400" />
                  Cadastrar Novo Palpite
                </h3>
                
                {/* AI Trigger Box */}
                <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl border border-yellow-500/20">
                  <span className="text-[10px] text-zinc-400 font-bold font-mono">ODD DO DIA:</span>
                  <input
                    type="number"
                    step="0.05"
                    value={targetOdd}
                    onChange={(e) => setTargetOdd(parseFloat(e.target.value) || 2.50)}
                    className="w-12 bg-zinc-900 border border-zinc-800 rounded px-1 text-xs text-yellow-400 text-center font-bold font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAISuggestion}
                    disabled={loadingAI}
                    className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-extrabold text-[10px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={10} className="fill-black" />
                    {loadingAI ? "Gerando..." : "Sugerir com IA"}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitPrediction} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Campeonato</label>
                  <select
                    value={pChamp}
                    onChange={(e) => setPChamp(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500"
                  >
                    {CHAMPIONSHIPS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Time da Casa *</label>
                    <input
                      type="text"
                      placeholder="Ex: Real Madrid"
                      required
                      value={pHome}
                      onChange={(e) => setPHome(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Time Visitante *</label>
                    <input
                      type="text"
                      placeholder="Ex: Barcelona"
                      required
                      value={pAway}
                      onChange={(e) => setPAway(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Data</label>
                    <input
                      type="date"
                      value={pDate}
                      onChange={(e) => setPDate(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Horário</label>
                    <input
                      type="text"
                      placeholder="Ex: 16:00"
                      value={pTime}
                      onChange={(e) => setPTime(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-zinc-400 font-semibold mb-1">Mercado Recomendado</label>
                    <select
                      value={pMarket}
                      onChange={(e) => setPMarket(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500"
                    >
                      {MARKETS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Odd Recomendada</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={pOdd}
                      onChange={(e) => setPOdd(parseFloat(e.target.value) || 1.95)}
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Nível de Confiança (%)</label>
                    <input
                      type="range"
                      min="50"
                      max="99"
                      value={pConfidence}
                      onChange={(e) => setPConfidence(parseInt(e.target.value))}
                      className="w-full accent-yellow-500"
                    />
                    <div className="text-right text-yellow-500 font-mono font-bold">{pConfidence}%</div>
                  </div>
                  <div className="flex items-center gap-4 pl-4 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-white">
                      <input
                        type="checkbox"
                        checked={pIsPremium}
                        onChange={(e) => setPIsPremium(e.target.checked)}
                        className="rounded border-zinc-800 text-yellow-500 accent-yellow-500 cursor-pointer h-4 w-4"
                      />
                      <span>Palpite Exclusivo VIP</span>
                    </label>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-zinc-400 font-semibold mb-1">Análise Tática do Especialista *</label>
                  <textarea
                    rows={4}
                    placeholder="Escreva a análise técnica completa..."
                    required
                    value={pAnalysis}
                    onChange={(e) => setPAnalysis(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500 leading-relaxed"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black py-2.5 rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 text-xs"
                  >
                    Publicar Palpite no Sistema
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* List of current Active matches to resolve */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Gerenciar Resultados dos Jogos</h4>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-3 max-h-[460px] overflow-y-auto">
              {predictions.map(pred => (
                <div key={pred.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-xs flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-500 font-mono truncate">{pred.championship}</p>
                    <p className="font-bold text-white mt-0.5 truncate">{pred.homeTeam} vs {pred.awayTeam}</p>
                    <p className="text-[10px] text-emerald-400 mt-0.5 font-bold">Mercado: {pred.market} (Odd @{pred.odd.toFixed(2)})</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {pred.status === "PENDENTE" ? (
                      <>
                        <button
                          onClick={() => handleResolvePrediction(pred.id, "GREEN")}
                          className="bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black font-bold p-1 px-2 rounded-lg border border-emerald-500/20 text-[10px] transition-colors cursor-pointer"
                        >
                          GREEN
                        </button>
                        <button
                          onClick={() => handleResolvePrediction(pred.id, "RED")}
                          className="bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white font-bold p-1 px-2 rounded-lg border border-red-500/20 text-[10px] transition-colors cursor-pointer"
                        >
                          RED
                        </button>
                      </>
                    ) : (
                      <span className={`px-2 py-0.5 rounded font-black font-mono text-[9px] ${
                        pred.status === "GREEN" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"
                      }`}>
                        {pred.status}
                      </span>
                    )}

                    <button
                      onClick={() => onDeletePrediction(pred.id)}
                      className="p-1 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                      title="Excluir palpite"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: GERENCIAR USUÁRIOS --- */}
      {activeAdminTab === "usuarios" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Creator Form */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-extrabold text-md text-white flex items-center gap-1.5">
              <Users size={16} className="text-yellow-400" />
              {editingUserId ? "Editar Usuário" : "Criar Usuário"}
            </h3>

            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Roberto"
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Endereço de E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: joao@gmail.com"
                  value={uEmail}
                  onChange={(e) => setUEmail(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="space-y-2 py-1">
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={uIsPremium}
                    onChange={(e) => setUIsPremium(e.target.checked)}
                    className="rounded border-zinc-800 text-yellow-500 accent-yellow-500 cursor-pointer h-4 w-4"
                  />
                  <span>Dar Acesso VIP (Premium)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={uIsAdmin}
                    onChange={(e) => setUIsAdmin(e.target.checked)}
                    className="rounded border-zinc-800 text-yellow-500 accent-yellow-500 cursor-pointer h-4 w-4"
                  />
                  <span>Permissões de Administrador</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-2 px-3 rounded-xl transition-all cursor-pointer text-center"
              >
                {editingUserId ? "Salvar Alterações" : "Adicionar Usuário"}
              </button>
              
              {editingUserId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingUserId(null);
                    setUName("");
                    setUEmail("");
                    setUIsPremium(false);
                    setUIsAdmin(false);
                  }}
                  className="w-full text-zinc-400 hover:text-white text-xs mt-1 transition-colors cursor-pointer text-center"
                >
                  Cancelar Edição
                </button>
              )}
            </form>
          </div>

          {/* User List table */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Quadro Geral de Membros</h4>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 uppercase font-mono text-[9px]">
                  <tr>
                    <th className="p-3">Membro</th>
                    <th className="p-3">Status VIP</th>
                    <th className="p-3">Cargo</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-zinc-900/20">
                      <td className="p-3">
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-[10px] text-zinc-500">{user.email}</p>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleUserPremium(user)}
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold cursor-pointer transition-all border ${
                            user.isPremium
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : "bg-zinc-900 text-zinc-500 border-zinc-800"
                          }`}
                        >
                          <Crown size={10} className={user.isPremium ? "fill-yellow-400 animate-pulse" : ""} />
                          {user.isPremium ? "VIP Ativo" : "Gratuito"}
                        </button>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleUserAdmin(user)}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold cursor-pointer transition-all ${
                            user.isAdmin ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-900 text-zinc-500"
                          }`}
                        >
                          {user.isAdmin ? "Admin" : "Apostador"}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleSelectUserForEdit(user)}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-all cursor-pointer"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => onDeleteUser(user.id)}
                          className="p-1 hover:bg-red-500/20 rounded text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: CONSTRUTOR DE BILHETES --- */}
      {activeAdminTab === "bilhetes" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creator form */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-extrabold text-md text-white flex items-center gap-1.5">
              <Plus size={16} className="text-yellow-400" />
              Montar Bilhete do Dia
            </h3>

            <form onSubmit={handleBuildReadySlip} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Título do Bilhete</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tripla dos Campeões"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Sugestão de Investimento (R$)</label>
                <input
                  type="number"
                  required
                  value={bSuggestedValue}
                  onChange={(e) => setBSuggestedValue(parseInt(e.target.value) || 100)}
                  className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 p-3 rounded-xl">
                <input
                  type="checkbox"
                  id="bIsPremium"
                  checked={bIsPremium}
                  onChange={(e) => setBIsPremium(e.target.checked)}
                  className="rounded border-zinc-800 text-yellow-500 accent-yellow-500 cursor-pointer h-4 w-4"
                />
                <label htmlFor="bIsPremium" className="text-zinc-300 font-semibold cursor-pointer flex items-center gap-1.5 select-none">
                  <Crown size={12} className={bIsPremium ? "text-yellow-400 font-bold" : "text-zinc-500"} />
                  Este é um Bilhete VIP/Premium
                </label>
              </div>

              {/* Combined odd math */}
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 space-y-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Resumo do Cupom</p>
                <div className="flex justify-between text-zinc-300">
                  <span>Jogos selecionados:</span>
                  <span className="font-bold text-white">{bSelectedPredIds.length}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Odd Combinada Total:</span>
                  <span className="font-bold text-yellow-400 font-mono">
                    @{predictions
                      .filter(p => bSelectedPredIds.includes(p.id))
                      .reduce((acc, p) => acc * p.odd, 1)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Retorno Estimado:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    R$ {(predictions
                      .filter(p => bSelectedPredIds.includes(p.id))
                      .reduce((acc, p) => acc * p.odd, 1) * bSuggestedValue)
                      .toFixed(1)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black py-2.5 rounded-xl transition-all shadow-lg cursor-pointer text-center text-xs"
              >
                Gerar e Publicar Bilhete Pronto
              </button>
            </form>
          </div>

          {/* Selectable pending matches */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Selecione os Palpites que Comporão o Bilhete</h4>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
              {predictions.filter(p => p.status === "PENDENTE").length > 0 ? (
                predictions
                  .filter(p => p.status === "PENDENTE")
                  .map(pred => {
                    const isSelected = bSelectedPredIds.includes(pred.id);
                    return (
                      <div
                        key={pred.id}
                        onClick={() => handleTogglePredSelection(pred.id)}
                        className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? "bg-yellow-500/10 border-yellow-500 text-white"
                            : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                        }`}
                      >
                        <div>
                          <p className="text-[10px] font-mono text-zinc-500">{pred.championship}</p>
                          <p className="font-bold text-white mt-0.5">{pred.homeTeam} vs {pred.awayTeam}</p>
                          <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Mercado: {pred.market}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-yellow-400 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            @{pred.odd.toFixed(2)}
                          </span>
                          <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                            isSelected ? "bg-yellow-500 border-yellow-500 text-black" : "border-zinc-700"
                          }`}>
                            {isSelected && <span className="text-[10px] font-black">✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-xs text-zinc-500 text-center py-6">Nenhum palpite pendente disponível para combinar no momento. Crie palpites adicionais primeiro.</p>
              )}
            </div>
          </div>
        </div>

        {/* List of Published Tickets */}
        <div className="mt-8 bg-zinc-950/60 border border-zinc-900 rounded-3xl p-6 space-y-4">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Ticket size={14} className="text-yellow-400" />
            Bilhetes Prontos Publicados ({readySlips.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {readySlips.length > 0 ? (
              readySlips.map((slip) => (
                <div key={slip.id} className="bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between gap-4 text-xs">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h5 className="font-extrabold text-white text-sm flex items-center gap-1 truncate max-w-[180px]">
                        {slip.isPremium && <Crown size={12} className="text-yellow-400 fill-yellow-400 shrink-0" />}
                        <span className="truncate">{slip.title}</span>
                      </h5>
                      <span className={`px-2 py-0.5 rounded font-black font-mono text-[9px] shrink-0 ${
                        slip.status === "GREEN" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" :
                        slip.status === "RED" ? "bg-red-500/20 text-red-400 border border-red-500/20" :
                        "bg-yellow-500/20 text-yellow-500 border border-yellow-500/20"
                      }`}>
                        {slip.status}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-[10px] text-zinc-400">
                      <p>Jogos combinados: <span className="font-bold text-zinc-200">{slip.predictionIds.length}</span></p>
                      <p>Odd Combinada: <span className="font-mono text-yellow-400 font-bold">@{slip.totalOdd.toFixed(2)}</span></p>
                      <p>Sugerido: <span className="font-bold text-zinc-300">R$ {slip.suggestedValue}</span> | Retorno: <span className="font-bold text-emerald-400">R$ {slip.estimatedProfit.toFixed(0)}</span></p>
                      <p className="text-[9px] text-zinc-500 mt-1 font-mono">Tipo: {slip.isPremium ? "🏆 VIP / Premium" : "🆓 Gratuito"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
                    <div className="flex gap-1.5">
                      {slip.status === "PENDENTE" && (
                        <>
                          <button
                            onClick={() => onUpdateReadySlip(slip.id, { status: "GREEN" })}
                            className="bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black font-bold p-1 px-2 rounded-lg border border-emerald-500/20 text-[10px] transition-all cursor-pointer"
                          >
                            GREEN
                          </button>
                          <button
                            onClick={() => onUpdateReadySlip(slip.id, { status: "RED" })}
                            className="bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white font-bold p-1 px-2 rounded-lg border border-red-500/20 text-[10px] transition-all cursor-pointer"
                          >
                            RED
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteReadySlip(slip.id)}
                      className="p-1 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded transition-colors cursor-pointer ml-auto"
                      title="Excluir Bilhete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 py-4 text-center col-span-full">Nenhum bilhete pronto cadastrado.</p>
            )}
          </div>
        </div>
        </div>
      )}

      {/* --- TAB 3.5: CONSTRUTOR DE BINGOS --- */}
      {activeAdminTab === "bingos" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Left Column: Form Builder (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-6">
              <div>
                <h3 className="text-md font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <Dices className="text-yellow-400" size={18} /> Novo Bingo do Dia
                </h3>
                <p className="text-xs text-zinc-500">Crie apostas combinadas contendo de 5 a 10 equipes com odds gigantescas.</p>
              </div>

              <form onSubmit={handleCreateBingo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Título do Bingo</label>
                    <input
                      type="text"
                      value={bingoFormTitle}
                      onChange={(e) => setBingoFormTitle(e.target.value)}
                      placeholder="Ex: Bingo de Sábado do Leão"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-500/40 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition-colors font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Data do Palpite</label>
                    <input
                      type="date"
                      value={bingoFormDate}
                      onChange={(e) => setBingoFormDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-500/40 rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl">
                  <input
                    type="checkbox"
                    id="bingoFormIsPremium"
                    checked={bingoFormIsPremium}
                    onChange={(e) => setBingoFormIsPremium(e.target.checked)}
                    className="h-4 w-4 rounded bg-zinc-900 border-zinc-800 text-yellow-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="bingoFormIsPremium" className="text-xs font-black text-zinc-300 flex items-center gap-1.5 cursor-pointer">
                    <Crown size={12} className={bingoFormIsPremium ? "text-yellow-400" : "text-zinc-500"} />
                    Este é um Bingo VIP/Premium Exclusivo
                  </label>
                </div>

                {/* Show Selections currently added */}
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Jogos no Bingo ({bingoFormSelections.length} de 10)</span>
                    <span className="text-zinc-600">Mínimo de 5 jogos</span>
                  </p>

                  {bingoFormSelections.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {bingoFormSelections.map((sel, idx) => (
                        <div key={idx} className="bg-zinc-900/50 border border-zinc-900/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div className="space-y-0.5 truncate">
                            <p className="text-[9px] text-zinc-500 uppercase truncate">{sel.championship}</p>
                            <p className="font-bold text-white truncate">
                              {sel.homeTeam} vs {sel.awayTeam}
                            </p>
                            <p className="text-[10px] text-yellow-400 font-semibold">{sel.market} (Odd @{sel.odd.toFixed(2)})</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectionFromBingo(idx)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Remover palpite"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-zinc-900/20 border border-zinc-900 border-dashed rounded-2xl text-xs text-zinc-500">
                      Adicione de 5 a 10 palpites/jogos abaixo primeiro!
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={bingoFormSelections.length < 5 || bingoFormSelections.length > 10}
                  className={`w-full font-black text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    bingoFormSelections.length >= 5 && bingoFormSelections.length <= 10
                      ? "bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/5"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  <Dices size={14} /> PUBLICAR BINGO DO DIA (ODD @{bingoFormSelections.reduce((acc, s) => acc * s.odd, 1).toFixed(2)})
                </button>
              </form>

              {/* Sub-form to add game selection */}
              <div className="pt-4 border-t border-zinc-900 space-y-4">
                <h4 className="text-xs font-black text-yellow-400 uppercase tracking-wider">Adicionar Jogo ao Construtor</h4>
                
                <form onSubmit={handleAddSelectionToBingo} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Campeonato</label>
                    <select
                      value={bingoSelChamp}
                      onChange={(e) => setBingoSelChamp(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-500/40 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                    >
                      {CHAMPIONSHIPS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Palpite / Mercado</label>
                    <input
                      type="text"
                      value={bingoSelMarket}
                      onChange={(e) => setBingoSelMarket(e.target.value)}
                      placeholder="Ex: Ambas Marcam ou Vitória Casa"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-500/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Equipe Casa</label>
                    <input
                      type="text"
                      value={bingoSelHome}
                      onChange={(e) => setBingoSelHome(e.target.value)}
                      placeholder="Ex: Real Madrid"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-500/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Equipe Visitante</label>
                    <input
                      type="text"
                      value={bingoSelAway}
                      onChange={(e) => setBingoSelAway(e.target.value)}
                      placeholder="Ex: Barcelona"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-500/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Odd Individual</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="1.01"
                        value={bingoSelOdd}
                        onChange={(e) => setBingoSelOdd(parseFloat(e.target.value) || 1.1)}
                        className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-yellow-500/40 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-mono"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-300 font-black text-xs px-5 rounded-xl transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 font-bold"
                      >
                        <Plus size={14} /> ADICIONAR JOGO
                      </button>
                    </div>
                  </div>
                </form>
              </div>

            </div>
          </div>

          {/* Right Column: Manage Bingos List (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono px-1">Bingos Publicados</h3>
            
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {bingos.length > 0 ? (
                bingos.map((bingo) => (
                  <div key={bingo.id} className="bg-zinc-950 border border-zinc-900 p-4.5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 truncate pr-2">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-white truncate max-w-[160px]">{bingo.title}</p>
                          {bingo.isPremium ? (
                            <span className="bg-yellow-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Crown size={7} /> VIP
                            </span>
                          ) : (
                            <span className="bg-zinc-800 text-zinc-400 text-[7px] font-black px-1.5 py-0.5 rounded">
                              GRÁTIS
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-zinc-500 font-mono">{bingo.date} • {bingo.selections.length} jogos</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[8px] text-zinc-500 font-bold uppercase">Odd total</p>
                        <p className="text-xs font-mono font-black text-green-400">@{bingo.totalOdd.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Display mini selections inside */}
                    <div className="p-2.5 bg-zinc-900/30 border border-zinc-900/60 rounded-xl space-y-1 text-[10px] max-h-40 overflow-y-auto">
                      {bingo.selections.map((sel, sIdx) => (
                        <div key={sIdx} className="flex justify-between gap-1 text-zinc-400">
                          <span className="truncate max-w-[130px] font-medium">{sel.homeTeam} vs {sel.awayTeam}</span>
                          <span className="text-yellow-500 shrink-0 font-semibold">{sel.market} (@{sel.odd.toFixed(2)})</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono ${
                        bingo.status === "PENDENTE"
                          ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                          : bingo.status === "GREEN"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {bingo.status}
                      </span>

                      {bingo.status === "PENDENTE" ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleResolveBingo(bingo.id, "GREEN")}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-0.5"
                          >
                            <CheckCircle size={10} /> GREEN
                          </button>
                          <button
                            onClick={() => handleResolveBingo(bingo.id, "RED")}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-0.5"
                          >
                            <XCircle size={10} /> RED
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm("Excluir este bingo permanentemente?")) {
                                await onDeleteBingo(bingo.id);
                              }
                            }}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg transition-colors border border-zinc-800 cursor-pointer"
                            title="Excluir Bingo"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={async () => {
                            if (confirm("Excluir este bingo permanentemente?")) {
                              await onDeleteBingo(bingo.id);
                            }
                          }}
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg transition-colors border border-zinc-800 cursor-pointer flex items-center gap-1.5 text-[10px]"
                        >
                          <Trash2 size={11} /> Excluir
                        </button>
                      )}
                    </div>

                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 text-center py-10 bg-zinc-950 border border-zinc-900 rounded-2xl">
                  Nenhum bingo cadastrado no momento.
                </p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* --- TAB 4: PAINEL FINANCEIRO --- */}
      {activeAdminTab === "financeiro" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Revenue metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
              <p className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase font-bold">Assinantes Ativos</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-black text-white">{financeStats.activeSubscribers}</p>
                <span className="p-1.5 bg-yellow-500/10 text-yellow-400 rounded-xl">
                  <Crown size={16} className="fill-yellow-400" />
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2 font-mono">Crescimento de +12% este mês</p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
              <p className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase font-bold">Faturamento Diário</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-black text-emerald-400">R$ {financeStats.dailyRevenue.toFixed(2)}</p>
                <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Coins size={16} />
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2 font-mono">Pico às quartas e domingos</p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
              <p className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase font-bold">Faturamento Mensal</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-black text-emerald-400">R$ {financeStats.monthlyRevenue.toFixed(2)}</p>
                <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <DollarSign size={16} />
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2 font-mono">Meta de R$ 90K próxima</p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
              <p className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase font-bold">Faturamento Anual</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-black text-emerald-400">R$ {financeStats.annualRevenue.toFixed(2)}</p>
                <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <BarChart2 size={16} />
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2 font-mono">Projeção conservadora</p>
            </div>
          </div>

          {/* Cancellation vs renewal ratios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Eventos Financeiros Recentes</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs pb-2.5 border-b border-zinc-900">
                  <span className="text-zinc-400">Renovações Recentes:</span>
                  <span className="font-bold text-emerald-400">+{financeStats.renewalsCount} usuários</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2.5 border-b border-zinc-900">
                  <span className="text-zinc-400">Cancelamentos Totais:</span>
                  <span className="font-bold text-red-400">{financeStats.cancellationsCount} usuários</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Taxa de Churn (Cancelamento):</span>
                  <span className="font-bold text-yellow-500 font-mono">0.84% (Excelente)</span>
                </div>
              </div>
            </div>

            {/* Quick alert banner */}
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-5 flex items-start gap-4">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
                <CheckCircle size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Integração de Gateway Ativa</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Os pagamentos via Pix e Cartão de Crédito estão sincronizados com Stripe e Mercado Pago. Todas as novas assinaturas de teste liberam o Premium de forma automatizada no banco de dados da aplicação instantaneamente.
                </p>
              </div>
            </div>
          </div>

          {/* Configuração de Recebimentos Pix do Dono */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-yellow-500/10 text-yellow-400 rounded-xl">
                <Coins size={16} />
              </span>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Configuração de Recebimentos Pix (Sua Chave Pix)</h4>
                <p className="text-[10px] text-zinc-500 font-medium">Cadastre sua chave Pix pessoal para que o sistema de pagamentos Pix direto direcione o faturamento do app para sua conta bancária!</p>
              </div>
            </div>

            <form onSubmit={handleSavePixSettings} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Sua Chave Pix (CPF, Celular, E-mail ou Aleatória)</label>
                <input
                  type="text"
                  placeholder="Ex: 19119119100 ou contato@bancaforte.com"
                  value={adminPixKey}
                  onChange={(e) => setAdminPixKey(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-xs text-white placeholder-zinc-700 font-mono focus:border-yellow-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nome Completo do Beneficiário (Favorecido)</label>
                <input
                  type="text"
                  placeholder="Ex: Marcelo Cunha"
                  value={adminPixName}
                  onChange={(e) => setAdminPixName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-xs text-white placeholder-zinc-700 focus:border-yellow-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <button
                  type="submit"
                  disabled={isSavingPix}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 text-black font-black text-xs p-3.5 rounded-xl transition-all uppercase tracking-wider shrink-0 cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  {isSavingPix ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> SALVANDO...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} /> SALVAR CHAVE PIX
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Configuração do Telegram e Envio Automatizado */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-sky-500/10 text-sky-400 rounded-xl">
                <Send size={16} />
              </span>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Configuração do Canal/Grupo do Telegram</h4>
                <p className="text-[10px] text-zinc-500 font-medium">Configure o link de convite do Telegram e automatize o envio diário de palpites para o seu público!</p>
              </div>
            </div>

            {/* Guia de Configuração Rápido */}
            <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl space-y-2 text-[11px] text-zinc-300 leading-normal">
              <p className="font-black text-sky-400 uppercase tracking-wider text-[9px] flex items-center gap-1.5 font-mono">
                🚀 GUIA RÁPIDO PARA ATIVAR O ENVIO REAL NO SEU TELEGRAM:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-zinc-400">
                <li>
                  <span className="text-zinc-200 font-semibold">Crie o seu Bot:</span> Abra o Telegram, pesquise por <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-bold">@BotFather</a> e envie o comando <code className="bg-zinc-950 px-1 py-0.5 rounded font-mono text-yellow-400 text-[10px] border border-zinc-900">/newbot</code>. Siga as instruções para dar um nome e um username ao seu bot.
                </li>
                <li>
                  <span className="text-zinc-200 font-semibold">Pegue o Token:</span> O @BotFather vai te enviar uma mensagem contendo o seu <span className="text-yellow-400 font-bold font-mono">Token HTTP API</span> (ex: <code className="text-zinc-400 font-mono">123456789:ABC...</code>). Copie e cole no campo <span className="text-zinc-200 font-bold">"Bot Token"</span> abaixo.
                </li>
                <li>
                  <span className="text-zinc-200 font-semibold">Adicione o Bot no Grupo:</span> Crie um Grupo ou Canal no Telegram, adicione o seu Bot recém-criado como membro e <span className="text-yellow-400 font-bold">promova o Bot a Administrador</span> do grupo com permissão para enviar mensagens.
                </li>
                <li>
                  <span className="text-zinc-200 font-semibold">Pegue o Chat ID do Grupo:</span> 
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Se for um Canal Público, seu Chat ID é simplesmente o username dele (ex: <code className="text-sky-400 font-mono font-bold">@meu_canal</code>).</li>
                    <li>Se for um Grupo Privado, adicione o bot <a href="https://t.me/RawDataBot" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">@RawDataBot</a> temporariamente no grupo. Ele enviará um JSON com o ID do grupo (normalmente começa com <code className="text-yellow-400 font-mono font-bold">-100</code>, ex: <code className="text-zinc-300 font-mono">-100123456789</code>). Copie esse ID e cole no campo <span className="text-zinc-200 font-bold">"ID do Chat/Canal"</span> abaixo.</li>
                  </ul>
                </li>
              </ol>
              <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                <span>⚠️</span>
                <span>ATENÇÃO: Sempre clique em "SALVAR CONFIGURAÇÃO TELEGRAM" antes de testar ou disparar! Sem esses campos salvos, o envio real não funcionará.</span>
              </div>
            </div>

            <form onSubmit={handleSaveTelegramSettings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Link de Convite do Telegram (Entrar no Grupo)</label>
                  <input
                    type="text"
                    placeholder="Ex: https://t.me/+SuaHashDoGrupo"
                    value={telegramLink}
                    onChange={(e) => setTelegramLink(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-xs text-white placeholder-zinc-700 font-mono focus:border-yellow-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Bot Token do Telegram (Opcional - Para Envio)</label>
                  <input
                    type="password"
                    placeholder="Ex: 123456789:ABCdefGhIJKlmNoPQRsT"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-xs text-white placeholder-zinc-700 font-mono focus:border-yellow-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ID do Chat/Canal (Opcional - Ex: @meu_canal ou ID)</label>
                  <input
                    type="text"
                    placeholder="Ex: -100123456789 ou @meucanal"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-xs text-white placeholder-zinc-700 font-mono focus:border-yellow-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingTelegram}
                  className="bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-800 text-white font-black text-xs px-5 py-3 rounded-xl transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  {isSavingTelegram ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> SALVANDO...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} /> SALVAR CONFIGURAÇÃO TELEGRAM
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSendTipsToTelegram}
                  disabled={isSendingTelegramTips}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 text-black font-black text-xs px-5 py-3 rounded-xl transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  {isSendingTelegramTips ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> ENVIANDO PALPITES...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> DISPARAR PALPITES DO DIA PARA TELEGRAM
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGenerateDailyPrediction}
                  disabled={isGeneratingDailyPrediction}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-black text-xs px-5 py-3 rounded-xl transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  {isGeneratingDailyPrediction ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> GERANDO PALPITE DO DIA...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> GERAR PALPITE REAL DO DIA
                    </>
                  )}
                </button>
              </div>

              {telegramSendResult && (
                <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-[10px] text-zinc-400 font-mono">
                  <p className="text-zinc-500 uppercase font-black tracking-wider text-[8px] mb-1">Resultado do Último Envio:</p>
                  <p>{telegramSendResult}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
