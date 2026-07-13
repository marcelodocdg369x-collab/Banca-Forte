import React, { useState } from "react";
import { X, Smartphone, ArrowRight, Download, Apple, Check, AlertCircle, RefreshCw, QrCode, ShieldCheck } from "lucide-react";

const logoImg = "/src/assets/images/banca_forte_logo_1783876743440.jpg";

interface DownloadAppModalProps {
  onClose: () => void;
}

export default function DownloadAppModal({ onClose }: DownloadAppModalProps) {
  const [activeTab, setActiveTab] = useState<"android" | "ios">("android");
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const startAndroidDownload = () => {
    if (downloading || downloadComplete) return;
    setDownloading(true);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloading(false);
          setDownloadComplete(true);
          // Simulate browser starting a download of the APK file
          const link = document.createElement("a");
          link.href = "#";
          link.setAttribute("download", "banca-forte-vip.apk");
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        id="download-modal"
      >
        {/* Subtle top decoration light */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-green-500 to-emerald-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer border border-zinc-800"
          title="Fechar"
        >
          <X size={16} />
        </button>

        {/* Content Box */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Top Branding Section */}
          <div className="text-center space-y-2 mt-2 group">
            <div className="relative h-18 w-18 mx-auto">
              {/* Outer gold-emerald glow halo */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
              <div className="relative h-18 w-18 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                <img
                  src={logoImg}
                  alt="Banca Forte Logo"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Verified badge seal */}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black rounded-full p-0.5 border border-black flex items-center justify-center shadow-md">
                <ShieldCheck size={11} className="stroke-[3.5]" />
              </div>
            </div>
            <h3 className="text-xl font-black text-white">Baixar o Aplicativo Banca Forte</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Tenha o Leão dos Palpites direto no seu celular para receber notificações instantâneas e palpites com alta consistência!
            </p>
          </div>

          {/* OS Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-900/60 p-1 rounded-xl border border-zinc-900">
            <button
              onClick={() => setActiveTab("android")}
              className={`py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "android"
                  ? "bg-green-600 text-white shadow-lg"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Smartphone size={14} /> Android (APK / Google Play)
            </button>
            <button
              onClick={() => setActiveTab("ios")}
              className={`py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "ios"
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-lg"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Apple size={14} /> iOS (iPhone & iPad)
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            
            {/* ANDROID TAB */}
            {activeTab === "android" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="p-1.5 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20 mt-0.5">
                      <Download size={16} />
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-200">Método Oficial: Download Direto (Instalação Segura APK)</p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Baixe nosso aplicativo completo e otimizado com menor consumo de internet e atualizações em tempo real.
                      </p>
                    </div>
                  </div>

                  {/* Simulated download state indicator */}
                  {downloading ? (
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400 font-medium animate-pulse flex items-center gap-1">
                          <RefreshCw size={10} className="animate-spin text-yellow-400" />
                          Baixando banca-forte-vip.apk...
                        </span>
                        <span className="font-mono text-yellow-400 font-bold">{downloadProgress}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-green-500 h-full transition-all duration-150"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : downloadComplete ? (
                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center gap-2.5 text-[11px] text-green-400">
                      <Check size={16} className="bg-green-500 text-black rounded-full p-0.5 shrink-0" />
                      <div>
                        <p className="font-bold">Download Concluído com Sucesso!</p>
                        <p className="text-zinc-400 text-[10px]">Abra o arquivo baixado nas suas notificações para instalar.</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={startAndroidDownload}
                      className="w-full bg-green-600 hover:bg-green-500 text-white font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-green-600/15 mt-2"
                    >
                      <Download size={14} /> Baixar Aplicativo Oficial para Android (.APK)
                    </button>
                  )}
                </div>

                <div className="bg-zinc-900/20 border border-zinc-900/60 p-3.5 rounded-xl flex items-start gap-2 text-[10px] text-zinc-400 leading-tight">
                  <AlertCircle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                  <span>
                    Caso o celular pergunte sobre "fontes desconhecidas", pode aceitar com tranquilidade! Nosso aplicativo é 100% verificado, seguro e livre de anúncios irritantes.
                  </span>
                </div>
              </div>
            )}

            {/* IOS TAB */}
            {activeTab === "ios" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl space-y-4">
                  <p className="text-xs font-black text-zinc-300 uppercase tracking-wider">Como instalar no seu iPhone / iPad:</p>
                  
                  {/* Visual Step by Step */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-zinc-800 text-yellow-400 text-xs font-black shrink-0">
                        1
                      </span>
                      <p className="text-[11px] text-zinc-300">
                        Abra este aplicativo no seu navegador padrão do iPhone (<span className="text-yellow-400 font-semibold">Safari</span>).
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-zinc-800 text-yellow-400 text-xs font-black shrink-0">
                        2
                      </span>
                      <p className="text-[11px] text-zinc-300 flex items-center gap-1 flex-wrap">
                        Toque no botão de <span>Compartilhar</span> 
                        <span className="inline-block p-1 bg-zinc-800 rounded font-mono text-[10px] text-zinc-400 border border-zinc-700">⎋</span>
                        (aquele com o ícone de uma seta para cima na barra inferior).
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-zinc-800 text-yellow-400 text-xs font-black shrink-0">
                        3
                      </span>
                      <p className="text-[11px] text-zinc-300">
                        Role a lista de opções para baixo e selecione <span className="text-white font-bold">"Adicionar à Tela de Início"</span>.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-zinc-800 text-yellow-400 text-xs font-black shrink-0">
                        4
                      </span>
                      <p className="text-[11px] text-zinc-300">
                        Toque em <span className="text-yellow-400 font-black">Adicionar</span> no canto superior direito. Pronto! O ícone do Banca Forte surgirá na sua tela principal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/10 p-3.5 rounded-xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-yellow-400">Instalação sem download!</p>
                    <p className="text-[10px] text-zinc-400">Não ocupa espaço no seu iPhone e funciona incrivelmente veloz.</p>
                  </div>
                  <Apple size={24} className="text-zinc-500 shrink-0" />
                </div>
              </div>
            )}

            {/* Desktop scan QR Code option if on desktop */}
            <div className="hidden sm:flex bg-zinc-950 border border-zinc-900 p-4 rounded-2xl items-center gap-4">
              <div className="bg-white p-2 rounded-xl shrink-0 border border-zinc-800 shadow-md">
                {/* Visual beautiful QR code mock */}
                <div className="relative p-0.5 bg-white text-black flex items-center justify-center">
                  <QrCode size={56} className="text-black" />
                  <div className="absolute inset-0 m-auto h-4 w-4 rounded bg-black border border-white flex items-center justify-center text-[7px] font-black text-white">
                    BF
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-300">Acessar no Celular via QR Code</p>
                <p className="text-[10px] text-zinc-500 leading-tight">
                  Aponte a câmera do seu celular para o QR Code acima para abrir o Banca Forte e instalar instantaneamente no seu smartphone.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-900/40 border-t border-zinc-900/80 px-6 py-4 text-center">
          <p className="text-[10px] text-zinc-500">
            Versão do App 2.4.0 • Licenciado sob criptografia SSL de ponta a ponta.
          </p>
        </div>
      </div>
    </div>
  );
}
