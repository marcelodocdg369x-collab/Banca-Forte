import React from "react";
import { X, Bell, Trophy, CheckCircle, AlertTriangle, PlayCircle, Star, Crown } from "lucide-react";
import { NotificationLog } from "../types";

interface NotificationLogViewProps {
  notifications: NotificationLog[];
  onClose: () => void;
  onClear: () => void;
}

export default function NotificationLogView({
  notifications,
  onClose,
  onClear
}: NotificationLogViewProps) {
  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-zinc-950 border-l border-zinc-900 shadow-2xl z-50 flex flex-col justify-between animate-slideLeft">
      
      {/* Header */}
      <div className="p-4 border-b border-zinc-900 bg-black flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Bell className="text-yellow-400 animate-pulse" size={18} />
          <h3 className="font-black text-xs uppercase tracking-wider font-mono">Central de Notificações Push</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            // Pick icon and bg color based on notification type
            let icon = <Bell size={14} />;
            let borderStyle = "border-zinc-900";
            let textStyle = "text-zinc-300";
            
            switch (notif.type) {
              case "FREE_PREDICTION":
                icon = <PlayCircle size={14} className="text-emerald-400" />;
                borderStyle = "border-emerald-500/10 bg-emerald-500/[0.02]";
                break;
              case "PREMIUM_PREDICTION":
                icon = <Crown size={14} className="text-yellow-400 fill-yellow-400" />;
                borderStyle = "border-yellow-500/20 bg-yellow-500/[0.02]";
                break;
              case "READY_SLIP":
                icon = <Star size={14} className="text-yellow-400" />;
                borderStyle = "border-zinc-800 bg-zinc-900/10";
                break;
              case "RESULT_GREEN":
                icon = <CheckCircle size={14} className="text-emerald-500" />;
                borderStyle = "border-emerald-500/20 bg-emerald-500/10";
                textStyle = "text-emerald-300";
                break;
              case "RESULT_RED":
                icon = <AlertTriangle size={14} className="text-red-400" />;
                borderStyle = "border-red-500/20 bg-red-500/5";
                textStyle = "text-zinc-300";
                break;
              case "LIVE_ENTRY":
                icon = <Trophy size={14} className="text-yellow-400" />;
                borderStyle = "border-zinc-800 bg-zinc-900/50";
                break;
            }

            return (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border flex gap-2.5 text-xs transition-all ${borderStyle}`}
              >
                <div className="p-1.5 h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div className="space-y-0.5">
                  <p className="font-black text-white">{notif.title}</p>
                  <p className={textStyle}>{notif.message}</p>
                  <p className="text-[9px] text-zinc-500 font-mono pt-1">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center text-zinc-500 text-xs space-y-2">
            <Bell size={24} className="text-zinc-700" />
            <p>Nenhuma notificação recente por aqui.</p>
          </div>
        )}
      </div>

      {/* Clear footer */}
      {notifications.length > 0 && (
        <div className="p-3 bg-black border-t border-zinc-900">
          <button
            onClick={onClear}
            className="w-full py-1.5 text-xs text-center text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-all cursor-pointer font-bold"
          >
            Limpar Notificações
          </button>
        </div>
      )}
    </div>
  );
}
