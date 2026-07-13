import React, { useState, useEffect } from "react";
import {
  Trophy,
  Crown,
  TrendingUp,
  ShieldCheck,
  Bell,
  Home,
  FileText,
  Ticket,
  BarChart2,
  Lock,
  ChevronRight,
  PlusCircle,
  HelpCircle,
  Sparkles,
  Dices
} from "lucide-react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import PredictionList from "./components/PredictionList";
import ReadySlipsView from "./components/ReadySlipsView";
import StatsDashboard from "./components/StatsDashboard";
import AdminPanel from "./components/AdminPanel";
import SubscriptionModal from "./components/SubscriptionModal";
import NotificationLogView from "./components/NotificationLogView";
import DownloadAppModal from "./components/DownloadAppModal";
import BingoView from "./components/BingoView";
import FavoritesManager from "./components/FavoritesManager";
import AuthScreen from "./components/AuthScreen";
import { Prediction, ReadySlip, User, NotificationLog, SystemStats, FinanceStats, Bingo } from "./types";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Loaded Server State
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [readySlips, setReadySlips] = useState<ReadySlip[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [financeStats, setFinanceStats] = useState<FinanceStats | null>(null);
  const [bingos, setBingos] = useState<Bingo[]>([]);

  // App & Dialog State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newNotifBadge, setNewNotifBadge] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

  // Fetch all data from full-stack backend
  const refreshAllData = async () => {
    try {
      const [predRes, slipRes, userRes, statsRes, financeRes, notifRes, bingoRes] = await Promise.all([
        fetch("/api/predictions"),
        fetch("/api/ready-slips"),
        fetch("/api/users"),
        fetch("/api/stats"),
        fetch("/api/finance-stats"),
        fetch("/api/notifications"),
        fetch("/api/bingos")
      ]);

      const [predData, slipData, userData, statsData, financeData, notifData, bingoData] = await Promise.all([
        predRes.json(),
        slipRes.json(),
        userRes.json(),
        statsRes.json(),
        financeRes.json(),
        notifRes.json(),
        bingoRes.json()
      ]);

      setPredictions(predData);
      setReadySlips(slipData);
      setUsers(userData);
      setStats(statsData);
      setFinanceStats(financeData);
      setBingos(bingoData);
      
      // Keep track if notifications increased to flash the badge
      if (notifications.length > 0 && notifData.length > notifications.length) {
        setNewNotifBadge(true);
      }
      setNotifications(notifData);

      // Handle keeping active user object updated
      let activeUser = currentUser;
      if (!activeUser) {
        const stored = localStorage.getItem("banca_forte_user");
        if (stored) {
          try {
            activeUser = JSON.parse(stored);
          } catch (e) {
            console.error("Failed to parse stored user", e);
          }
        }
      }

      if (activeUser) {
        const updatedUser = userData.find((u: User) => u.id === activeUser.id || u.email.toLowerCase() === activeUser.email.toLowerCase());
        if (updatedUser) {
          setCurrentUser(updatedUser);
          localStorage.setItem("banca_forte_user", JSON.stringify(updatedUser));
        } else {
          setCurrentUser(activeUser);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Error loading server-side full-stack state:", err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Simple selector representing the frictionless demo modes (Free, VIP, Admin)
  const handleSelectUserType = async (type: "free" | "premium" | "admin") => {
    // Look up or create simulated user
    try {
      const emailMap = {
        free: "thiago.silva@gmail.com", // Thiago (Free)
        premium: "amanda.c@hotmail.com", // Amanda (Premium)
        admin: "marcelodocdg369x@gmail.com" // Marcelo (Admin)
      };
      
      const email = emailMap[type];
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (data.user) {
        setCurrentUser(data.user);
        // Ensure UI view resets to valid tab if admin panel gets restricted
        if (type !== "admin" && activeTab === "admin") {
          setActiveTab("dashboard");
        }
      }
    } catch (err) {
      console.error("Failed to swap user type", err);
    }
  };

  // --- Backend Sync Callbacks for Admin Panels ---

  // Predictions CRUD handlers
  const handleAddPrediction = async (pred: Omit<Prediction, "id" | "createdAt">) => {
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pred)
    });
    const data = await res.json();
    await refreshAllData();
    setNewNotifBadge(true);
    return data;
  };

  const handleUpdatePrediction = async (id: string, updates: Partial<Prediction>) => {
    const res = await fetch(`/api/predictions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    await refreshAllData();
    setNewNotifBadge(true);
    return data;
  };

  const handleDeletePrediction = async (id: string) => {
    const res = await fetch(`/api/predictions/${id}`, { method: "DELETE" });
    const data = await res.json();
    await refreshAllData();
    return data;
  };

  // Ready Slips (Bilhetes) CRUD handlers
  const handleAddReadySlip = async (slip: Omit<ReadySlip, "id" | "createdAt">) => {
    const res = await fetch("/api/ready-slips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slip)
    });
    const data = await res.json();
    await refreshAllData();
    setNewNotifBadge(true);
    return data;
  };

  const handleUpdateReadySlip = async (id: string, updates: Partial<ReadySlip>) => {
    const res = await fetch(`/api/ready-slips/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    await refreshAllData();
    return data;
  };

  const handleDeleteReadySlip = async (id: string) => {
    const res = await fetch(`/api/ready-slips/${id}`, { method: "DELETE" });
    const data = await res.json();
    await refreshAllData();
    return data;
  };

  // Bingos CRUD handlers
  const handleAddBingo = async (bingo: Omit<Bingo, "id" | "createdAt">) => {
    const res = await fetch("/api/bingos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bingo)
    });
    const data = await res.json();
    await refreshAllData();
    return data;
  };

  const handleUpdateBingo = async (id: string, updates: Partial<Bingo>) => {
    const res = await fetch(`/api/bingos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    await refreshAllData();
    return data;
  };

  const handleDeleteBingo = async (id: string) => {
    const res = await fetch(`/api/bingos/${id}`, { method: "DELETE" });
    const data = await res.json();
    await refreshAllData();
    return data;
  };

  // Users CRUD handlers
  const handleAddUser = async (user: Omit<User, "id" | "createdAt">) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });
    const data = await res.json();
    await refreshAllData();
    return data;
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    await refreshAllData();
    return data;
  };

  const handleDeleteUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    await refreshAllData();
    return data;
  };

  // User VIP self-subscription trigger
  const handleUserSubscribe = async (planId: string) => {
    if (!currentUser) return;
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, planId })
    });
    const data = await res.json();
    await refreshAllData();
    return data;
  };

  // Simple login handler using registered e-mail
  const handleLoginWithEmail = async (email: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        alert(`Sucesso! Você entrou como ${data.user.name}.`);
        if (!data.user.isAdmin && activeTab === "admin") {
          setActiveTab("dashboard");
        }
      } else {
        alert("E-mail não encontrado na base de dados do sistema.");
      }
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      alert("Não foi possível processar o login com e-mail.");
    }
  };

  // Notification clearing
  const handleClearNotifications = () => {
    setNotifications([]);
    setNewNotifBadge(false);
  };

  const isUserPremium = currentUser?.isPremium || currentUser?.isAdmin || false;
  const isUserAdmin = currentUser?.isAdmin || false;

  if (!currentUser) {
    return (
      <AuthScreen
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
        onAdminQuickLogin={async () => {
          await handleSelectUserType("admin");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
      
      {/* Dynamic sports ticker alert */}
      <div className="bg-gradient-to-r from-yellow-500 via-green-600 to-emerald-700 text-black py-1 px-4 overflow-hidden relative whitespace-nowrap">
        <div className="inline-block animate-marquee text-[10px] font-black tracking-wide uppercase font-mono">
          🚨 forte alerta de ia: {predictions[0] ? `${predictions[0].homeTeam} vs ${predictions[0].awayTeam} possui 88% de consistência` : "Cotações de odds calculadas com sucesso!"} | 🦁 lucros acumulados de +{stats?.accumulatedProfit} unidades este mês | 🏆 junte-se aos mais de 1,400 assinantes na área VIP!
        </div>
      </div>

      {/* Header bar */}
      <Header
        currentUser={currentUser}
        onSelectUserType={handleSelectUserType}
        onLoginWithEmail={handleLoginWithEmail}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem("banca_forte_user");
          setActiveTab("dashboard");
        }}
        notifications={notifications}
        onOpenSubscription={() => setShowSubscription(true)}
        onOpenNotifications={() => {
          setShowNotifications(true);
          setNewNotifBadge(false);
        }}
        showNotificationBadge={newNotifBadge}
        onOpenDownloadModal={() => setShowDownload(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-24">
        
        {/* Navigation for Desktop */}
        <div className="hidden md:flex items-center gap-2 bg-zinc-950/60 border border-zinc-900 p-2 rounded-2xl mb-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "dashboard" ? "bg-yellow-500 text-black shadow-lg" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Home size={14} /> Tela Inicial
          </button>
          <button
            onClick={() => setActiveTab("predictions")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "predictions" ? "bg-yellow-500 text-black shadow-lg" : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileText size={14} /> Palpites Diários
          </button>
          <button
            onClick={() => setActiveTab("readySlips")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "readySlips" ? "bg-yellow-500 text-black shadow-lg" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Ticket size={14} /> Bilhetes do Dia
          </button>
          <button
            onClick={() => setActiveTab("bingo")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "bingo" ? "bg-yellow-500 text-black shadow-lg" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Dices size={14} /> Bingo do Dia
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "stats" ? "bg-yellow-500 text-black shadow-lg" : "text-zinc-400 hover:text-white"
            }`}
          >
            <BarChart2 size={14} /> Estatísticas
          </button>
          {isUserAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "admin" ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-400 hover:text-emerald-400"
              }`}
            >
              <ShieldCheck size={14} /> Painel Operador
            </button>
          )}
        </div>

        {/* Dynamic Tab Switchers Rendering */}
        <div className="animate-fadeIn">
          {activeTab === "dashboard" && stats && (
            <Dashboard
              stats={stats}
              predictions={predictions}
              readySlips={readySlips}
              isPremium={isUserPremium}
              onOpenSubscription={() => setShowSubscription(true)}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onViewPrediction={(pred) => {
                setSelectedPrediction(pred);
                setActiveTab("predictions");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onOpenDownloadModal={() => setShowDownload(true)}
            />
          )}

          {activeTab === "predictions" && (
            <div className="space-y-6">
              <FavoritesManager
                currentUser={currentUser}
                predictions={predictions}
                isPremium={isUserPremium}
                onOpenSubscription={() => setShowSubscription(true)}
                onUpdateUser={handleUpdateUser}
                onRefreshData={refreshAllData}
              />
              <PredictionList
                predictions={predictions}
                isPremium={isUserPremium}
                onOpenSubscription={() => setShowSubscription(true)}
                selectedPredictionId={selectedPrediction?.id}
                onViewPrediction={(pred) => setSelectedPrediction(pred)}
                currentUser={currentUser}
              />
            </div>
          )}

          {activeTab === "readySlips" && (
            <ReadySlipsView
              readySlips={readySlips}
              predictions={predictions}
              isPremium={isUserPremium}
              onOpenSubscription={() => setShowSubscription(true)}
            />
          )}

          {activeTab === "bingo" && (
            <BingoView
              bingos={bingos}
              currentUser={currentUser}
              isPremium={isUserPremium}
              onOpenSubscription={() => setShowSubscription(true)}
            />
          )}

          {activeTab === "stats" && stats && (
            <StatsDashboard stats={stats} />
          )}

          {activeTab === "admin" && isUserAdmin && financeStats && (
            <AdminPanel
              predictions={predictions}
              users={users}
              readySlips={readySlips}
              bingos={bingos}
              financeStats={financeStats}
              onAddPrediction={handleAddPrediction}
              onUpdatePrediction={handleUpdatePrediction}
              onDeletePrediction={handleDeletePrediction}
              onAddReadySlip={handleAddReadySlip}
              onUpdateReadySlip={handleUpdateReadySlip}
              onDeleteReadySlip={handleDeleteReadySlip}
              onAddBingo={handleAddBingo}
              onUpdateBingo={handleUpdateBingo}
              onDeleteBingo={handleDeleteBingo}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onRefreshData={refreshAllData}
            />
          )}
        </div>
      </main>

      {/* Mobile Optimized App Navigation Bar (Always sticky to bottom on mobile/small viewports) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-900 text-zinc-400 flex items-center justify-around py-2.5 backdrop-blur shadow-2xl">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 font-bold text-[9px] transition-all cursor-pointer ${
            activeTab === "dashboard" ? "text-yellow-400 font-extrabold" : "hover:text-zinc-300"
          }`}
        >
          <Home size={18} />
          <span>Início</span>
        </button>
        <button
          onClick={() => setActiveTab("predictions")}
          className={`flex flex-col items-center gap-1 font-bold text-[9px] transition-all cursor-pointer ${
            activeTab === "predictions" ? "text-yellow-400 font-extrabold" : "hover:text-zinc-300"
          }`}
        >
          <FileText size={18} />
          <span>Palpites</span>
        </button>
        <button
          onClick={() => setActiveTab("readySlips")}
          className={`flex flex-col items-center gap-1 font-bold text-[9px] transition-all cursor-pointer ${
            activeTab === "readySlips" ? "text-yellow-400 font-extrabold" : "hover:text-zinc-300"
          }`}
        >
          <Ticket size={18} />
          <span>Bilhetes</span>
        </button>
        <button
          onClick={() => setActiveTab("bingo")}
          className={`flex flex-col items-center gap-1 font-bold text-[9px] transition-all cursor-pointer ${
            activeTab === "bingo" ? "text-yellow-400 font-extrabold" : "hover:text-zinc-300"
          }`}
        >
          <Dices size={18} />
          <span>Bingo</span>
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex flex-col items-center gap-1 font-bold text-[9px] transition-all cursor-pointer ${
            activeTab === "stats" ? "text-yellow-400 font-extrabold" : "hover:text-zinc-300"
          }`}
        >
          <BarChart2 size={18} />
          <span>Estatísticas</span>
        </button>
        {isUserAdmin && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex flex-col items-center gap-1 font-bold text-[9px] transition-all cursor-pointer ${
              activeTab === "admin" ? "text-emerald-400 font-extrabold" : "hover:text-zinc-300"
            }`}
          >
            <ShieldCheck size={18} />
            <span>Painel</span>
          </button>
        )}
      </nav>

      {/* Global Subscription Modal Dialog */}
      {showSubscription && (
        <SubscriptionModal
          currentUser={currentUser}
          onClose={() => setShowSubscription(false)}
          onSubscribe={handleUserSubscribe}
        />
      )}

      {/* Global Notifications Sidebar */}
      {showNotifications && (
        <NotificationLogView
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onClear={handleClearNotifications}
        />
      )}

      {/* Download App Modal */}
      {showDownload && (
        <DownloadAppModal
          onClose={() => setShowDownload(false)}
        />
      )}
    </div>
  );
}
