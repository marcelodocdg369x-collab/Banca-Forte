import React, { useState } from "react";
import { ShieldCheck, User as UserIcon, Crown, Bell, LogIn, Lock, CheckCircle, Flame, Smartphone } from "lucide-react";
import { User, NotificationLog } from "../types";

const logoImg = "/src/assets/images/banca_forte_logo_1783876743440.jpg";

interface HeaderProps {
  currentUser: User | null;
  onSelectUserType: (type: "free" | "premium" | "admin") => void;
  onLoginWithEmail: (email: string) => void;
  onLogout?: () => void;
  notifications: NotificationLog[];
  onOpenSubscription: () => void;
  onOpenNotifications: () => void;
  showNotificationBadge: boolean;
  onOpenDownloadModal: () => void;
}

export default function Header({
  currentUser,
  onSelectUserType,
  onLoginWithEmail,
  onLogout,
  notifications,
  onOpenSubscription,
  onOpenNotifications,
  showNotificationBadge,
  onOpenDownloadModal
}: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-black/95 border-b border-yellow-500/20 backdrop-blur px-4 py-3 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative group flex-shrink-0">
            {/* Outer glowing premium trust aura */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-emerald-500 to-emerald-600 rounded-2xl blur opacity-35 group-hover:opacity-75 transition duration-500" />
            <img
              src={logoImg}
              alt="Banca Forte Logo"
              className="relative h-12 w-12 rounded-2xl object-cover border-2 border-yellow-500/40 shadow-xl shadow-yellow-500/10 group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            {/* Trust badge stamp overlay */}
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black rounded-full p-0.5 border border-black flex items-center justify-center shadow-md shadow-emerald-500/25" title="Banca 100% Verificada & Confiável">
              <ShieldCheck size={10} className="stroke-[3.5] text-black" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-yellow-400 via-yellow-200 to-emerald-400 bg-clip-text text-transparent font-sans">
                BANCA FORTE
              </h1>
              <span className="hidden xs:inline-flex items-center gap-0.5 text-[7px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1 py-0.5 rounded uppercase tracking-widest">
                VERIFICADO 🦁
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[9px] font-extrabold tracking-[0.18em] bg-gradient-to-r from-yellow-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent uppercase font-mono">
                AQUI, A APOSTA É FORTE!
              </p>
              <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
          </div>
        </div>

        {/* Quick Simulator Controller (Frictionless Demo - ONLY visible if Admin/Owner is logged in) */}
        {currentUser?.isAdmin && (
          <div className="hidden md:flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-full text-xs">
            <span className="text-zinc-400 px-2 font-medium">Testar Nível:</span>
            <button
              onClick={() => onSelectUserType("free")}
              className={`px-3 py-1 rounded-full font-semibold transition-all duration-300 ${
                currentUser && !currentUser.isPremium && !currentUser.isAdmin
                  ? "bg-zinc-800 text-white shadow"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Gratuito
            </button>
            <button
              onClick={() => onSelectUserType("premium")}
              className={`px-3 py-1 rounded-full font-semibold transition-all duration-300 flex items-center gap-1 ${
                currentUser && currentUser.isPremium && !currentUser.isAdmin
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow"
                  : "text-zinc-500 hover:text-yellow-400"
              }`}
            >
              <Crown size={12} className="fill-black" /> Premium
            </button>
            <button
              onClick={() => onSelectUserType("admin")}
              className={`px-3 py-1 rounded-full font-semibold transition-all duration-300 flex items-center gap-1 ${
                currentUser && currentUser.isAdmin
                  ? "bg-emerald-600 text-white shadow"
                  : "text-zinc-500 hover:text-emerald-400"
              }`}
            >
              <ShieldCheck size={12} /> Admin
            </button>
          </div>
        )}

        {/* Right Side Buttons */}
        <div className="flex items-center gap-3">
          {/* Download App Trigger */}
          <button
            onClick={onOpenDownloadModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white border border-green-500/20 text-xs font-black transition-all cursor-pointer shadow-md shadow-green-500/10"
            title="Baixar App para Android & iOS"
          >
            <Smartphone size={14} /> 
            <span className="hidden sm:inline">Instalar App</span>
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
            title="Histórico de Notificações"
            id="notif-btn"
          >
            <Bell size={18} />
            {showNotificationBadge && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse border border-black" />
            )}
          </button>

          {/* User Widget */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl text-sm hover:border-yellow-500/40 transition-all cursor-pointer"
                id="user-dropdown-btn"
              >
                <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 border border-zinc-700">
                  <UserIcon size={14} />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold truncate max-w-[100px]">{currentUser.name}</p>
                  <p className="text-[10px] text-zinc-400 truncate max-w-[100px]">{currentUser.email}</p>
                </div>
                {currentUser.isPremium ? (
                  <Crown size={14} className="text-yellow-400 fill-yellow-400 animate-pulse ml-1" />
                ) : (
                  <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 ml-1 font-semibold">FREE</span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 text-left">
                  <div className="px-3 py-2 border-b border-zinc-900">
                    <p className="text-xs font-bold text-zinc-200">{currentUser.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{currentUser.email}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      {currentUser.isPremium ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full font-bold">
                          <Crown size={10} className="fill-yellow-400" /> Assinante VIP
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-full font-bold">
                          Plano Gratuito
                        </span>
                      )}
                      {currentUser.isAdmin && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                          Administrador
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Demo Swappers for Mobile (Only if logged-in user is Admin) */}
                  {currentUser.isAdmin && (
                    <div className="md:hidden block border-b border-zinc-900 p-2 space-y-1">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase px-2 mb-1">Mudar Modo Demo</p>
                      <button
                        onClick={() => { onSelectUserType("free"); setShowDropdown(false); }}
                        className="w-full text-left px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-900 rounded"
                      >
                        Usuário Gratuito
                      </button>
                      <button
                        onClick={() => { onSelectUserType("premium"); setShowDropdown(false); }}
                        className="w-full text-left px-2 py-1 text-xs text-yellow-400 hover:bg-yellow-500/10 rounded flex items-center gap-1"
                      >
                        <Crown size={10} className="fill-yellow-400" /> Usuário Premium VIP
                      </button>
                      <button
                        onClick={() => { onSelectUserType("admin"); setShowDropdown(false); }}
                        className="w-full text-left px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded flex items-center gap-1"
                      >
                        <ShieldCheck size={10} /> Administrador
                      </button>
                    </div>
                  )}

                  {/* Clean Email Login Switcher */}
                  <div className="border-b border-zinc-900 p-3">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2">Acessar outra conta</p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const emailInput = form.elements.namedItem("loginEmail") as HTMLInputElement;
                        if (emailInput && emailInput.value.trim()) {
                          onLoginWithEmail(emailInput.value.trim());
                          setShowDropdown(false);
                          form.reset();
                        }
                      }}
                      className="space-y-1.5"
                    >
                      <input
                        type="email"
                        name="loginEmail"
                        placeholder="Seu e-mail cadastrado..."
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 text-[11px] text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-yellow-500"
                      />
                      <button
                        type="submit"
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] font-black py-1.5 rounded-lg transition-all"
                      >
                        Entrar com E-mail
                      </button>
                    </form>
                    <p className="text-[9px] text-zinc-500 mt-1.5 leading-tight">
                      Administrador? Faça login com seu e-mail para abrir o painel.
                    </p>
                  </div>

                  <div className="p-1 mt-1">
                    {!currentUser.isPremium && (
                      <button
                        onClick={() => {
                          onOpenSubscription();
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold text-xs py-2 px-3 rounded-lg transition-all"
                      >
                        <Crown size={12} className="fill-black" /> Assinar VIP
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (onLogout) onLogout();
                        setShowDropdown(false);
                      }}
                      className="w-full text-center mt-1 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg font-bold transition-all cursor-pointer"
                    >
                      Sair da Conta
                    </button>
                    <button
                      onClick={() => setShowDropdown(false)}
                      className="w-full text-center mt-1 py-1 text-xs text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors cursor-pointer"
                    >
                      Fechar Menu
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs px-3 py-1.5 rounded-lg transition-all">
              <LogIn size={14} /> Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
