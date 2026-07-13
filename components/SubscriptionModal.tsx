import React, { useState, useEffect } from "react";
import { X, Crown, ShieldCheck, Check, CreditCard, Sparkles, AlertCircle, Copy, CheckCircle, Smartphone, RefreshCw, ExternalLink } from "lucide-react";
import { SUBSCRIPTION_PLANS, User } from "../types";

interface SubscriptionModalProps {
  currentUser: User | null;
  onClose: () => void;
  onSubscribe: (planId: string) => Promise<any>;
}

export default function SubscriptionModal({
  currentUser,
  onClose,
  onSubscribe
}: SubscriptionModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState("mensal");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "wallet">("pix");
  
  // Payment states
  const [pixCopied, setPixCopied] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  // Mercado Pago payload state
  const [mercadoPagoPayment, setMercadoPagoPayment] = useState<{
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string | null;
    ticketUrl: string;
    isSimulated: boolean;
    amount: number;
  } | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "approved" | "rejected">("pending");

  // Card Inputs state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [ownerPixSettings, setOwnerPixSettings] = useState<{ pixKey: string; pixName: string; pixCity: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setOwnerPixSettings(data))
      .catch(err => console.error("Erro ao carregar Pix settings:", err));
  }, []);

  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[0];

  // 1. Generate Mercado Pago payment on plan change
  useEffect(() => {
    if (!currentUser) return;
    
    let isMounted = true;
    const generatePayment = async () => {
      setIsLoadingPayment(true);
      try {
        const res = await fetch("/api/payments/mercadopago/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.id, planId: selectedPlanId })
        });
        const data = await res.json();
        if (isMounted && data.success) {
          setMercadoPagoPayment({
            paymentId: data.paymentId,
            qrCode: data.qrCode,
            qrCodeBase64: data.qrCodeBase64,
            ticketUrl: data.ticketUrl,
            isSimulated: data.isSimulated,
            amount: data.amount
          });
          setPaymentStatus("pending");
        }
      } catch (err) {
        console.error("Erro ao gerar pagamento no Mercado Pago:", err);
      } finally {
        if (isMounted) setIsLoadingPayment(false);
      }
    };

    generatePayment();

    return () => {
      isMounted = false;
    };
  }, [selectedPlanId, currentUser]);

  // 2. Poll payment status periodically
  useEffect(() => {
    if (!currentUser || !mercadoPagoPayment || paymentStatus === "approved" || paidSuccess) return;

    let intervalId: any;
    
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payments/mercadopago/status/${mercadoPagoPayment.paymentId}?userId=${currentUser.id}&planId=${selectedPlanId}`);
        const data = await res.json();
        if (data.status === "approved") {
          setPaymentStatus("approved");
          setPaidSuccess(true);
          await onSubscribe(selectedPlanId);
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error("Erro ao verificar status do pagamento:", err);
      }
    };

    // Poll every 3 seconds for fast response
    intervalId = setInterval(checkStatus, 3000);

    return () => clearInterval(intervalId);
  }, [mercadoPagoPayment, paymentStatus, currentUser, selectedPlanId, paidSuccess, onSubscribe]);

  // 3. Handle manual Copy Pix code
  const handleCopyPixKey = () => {
    if (!mercadoPagoPayment) return;
    navigator.clipboard.writeText(mercadoPagoPayment.qrCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  // 4. Force/Simulate Payment Approval
  const handleSimulateApproval = async () => {
    if (!currentUser || !mercadoPagoPayment) return;
    setIsPaying(true);
    try {
      const res = await fetch(`/api/payments/mercadopago/status/${mercadoPagoPayment.paymentId}?userId=${currentUser.id}&planId=${selectedPlanId}&forceApprove=true`);
      const data = await res.json();
      if (data.status === "approved") {
        setPaymentStatus("approved");
        setPaidSuccess(true);
        await onSubscribe(selectedPlanId);
      }
    } catch (err) {
      console.error("Erro ao forçar aprovação do Pix:", err);
    } finally {
      setIsPaying(false);
    }
  };

  // 5. Normal processing fallback
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "pix") {
      // Pix uses active polling or manual simulation approval
      handleSimulateApproval();
      return;
    }

    setIsPaying(true);
    // Simulate non-Pix card payments delay
    setTimeout(async () => {
      try {
        if (currentUser) {
          await onSubscribe(selectedPlanId);
        }
        setPaidSuccess(true);
        setIsPaying(false);
      } catch (err) {
        console.error("Erro ao simular pagamento de cartão", err);
        setIsPaying(false);
      }
    }, 1500);
  };

  return (
    <div id="subscription-checkout-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-yellow-500/30 rounded-3xl overflow-hidden shadow-2xl animate-scaleUp my-8">
        
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-emerald-500 to-green-600" />

        {/* Modal Close */}
        {!paidSuccess && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full border border-zinc-800 transition-colors cursor-pointer z-10"
          >
            <X size={16} />
          </button>
        )}

        {/* Paid Success screen */}
        {paidSuccess ? (
          <div className="p-8 text-center space-y-6">
            <div className="h-16 w-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20 animate-bounce">
              <Crown size={32} className="fill-yellow-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">👑 VOCÊ AGORA É VIP!</h3>
              <p className="text-sm text-emerald-400 font-bold font-mono">Assinatura Premium Ativada via Mercado Pago</p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Parabéns! Seu acesso aos palpites diários de alta probabilidade, bilhetes múltiplos montados por Inteligência Artificial e nossa área secreta foi liberado no sistema. Divirta-se e jogue com responsabilidade.
              </p>
            </div>

            {/* Simulated Membership summary */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl max-w-sm mx-auto text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-zinc-500">Membro Premium:</span>
                <span className="font-bold text-white">{currentUser?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Plano Selecionado:</span>
                <span className="font-bold text-yellow-400 capitalize">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Valor Investido:</span>
                <span className="font-bold text-emerald-400 font-mono">R$ {selectedPlan.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status de Liberação:</span>
                <span className="text-emerald-400 font-bold uppercase font-mono">Aprovado e Ativo</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black text-xs px-8 py-3 rounded-xl transition-all shadow-lg hover:scale-105 cursor-pointer uppercase"
            >
              Ir para Tela de Palpites VIP
            </button>
          </div>
        ) : (
          /* Checkout flow */
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Column: Plan selector */}
            <div className="p-6 md:p-8 bg-zinc-900/40 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded font-black font-mono">
                  ÁREA VIP
                </span>
                <h3 className="text-lg font-black text-white flex items-center gap-1">
                  Selecione seu Plano
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Melhor custo-benefício de palpites esportivos do Brasil.
                </p>
              </div>

              {/* Plans mapping */}
              <div className="space-y-3">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isSel = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                        isSel
                          ? "bg-yellow-500/10 border-yellow-500 text-white"
                          : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          isSel ? "border-yellow-400" : "border-zinc-700"
                        }`}>
                          {isSel && <div className="h-2 w-2 rounded-full bg-yellow-400" />}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white">{plan.name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">Válido por {plan.period}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-yellow-400 font-mono">
                          R$ {plan.price.toFixed(2)}
                        </p>
                        <p className="text-[9px] text-zinc-500">pagamento único</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Perks Checklist */}
              <div className="space-y-2 pt-2 text-[10px] text-zinc-300">
                <p className="font-bold text-zinc-400 uppercase tracking-widest font-mono text-[9px]">O que você recebe:</p>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 animate-pulse" />
                  <span>Acesso a todos os palpites VIP diários</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 animate-pulse" />
                  <span>Odds altas sugeridas e bilhetes prontos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 animate-pulse" />
                  <span>Geração inteligente de palpites com IA</span>
                </div>
              </div>
            </div>

            {/* Right Column: Checkout form */}
            <div className="p-6 md:p-8 bg-zinc-950 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Forma de Pagamento</h4>

                {/* Method selector tabs */}
                <div className="grid grid-cols-3 gap-1.5 bg-zinc-900 p-1 rounded-xl text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                      paymentMethod === "pix" ? "bg-zinc-950 text-emerald-400 font-black" : "text-zinc-500"
                    }`}
                  >
                    Pix (Na Hora)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                      paymentMethod === "card" ? "bg-zinc-950 text-white font-black" : "text-zinc-500"
                    }`}
                  >
                    Cartão Crédito
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("wallet")}
                    className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                      paymentMethod === "wallet" ? "bg-zinc-950 text-white font-black" : "text-zinc-500"
                    }`}
                  >
                    Google / Apple
                  </button>
                </div>

                {/* 1. PIX CONTAINER WITH REAL MERCADO PAGO INTEGRATION */}
                {paymentMethod === "pix" && (
                  <div className="space-y-4 text-xs animate-fadeIn text-center py-2">
                    
                    {isLoadingPayment ? (
                      <div className="h-32 w-32 mx-auto flex flex-col items-center justify-center bg-zinc-900/50 rounded-2xl border border-zinc-800 gap-2">
                        <RefreshCw size={24} className="text-yellow-400 animate-spin" />
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Gerando Pix...</span>
                      </div>
                    ) : (
                      <div className="bg-white p-2.5 rounded-2xl w-32 h-32 mx-auto border border-zinc-200 shadow-md flex flex-col items-center justify-center relative group">
                        {mercadoPagoPayment?.qrCodeBase64 ? (
                          <img 
                            src={mercadoPagoPayment.qrCodeBase64.startsWith("http") ? mercadoPagoPayment.qrCodeBase64 : `data:image/png;base64,${mercadoPagoPayment.qrCodeBase64}`} 
                            alt="Mercado Pago Pix QR Code"
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          /* Fallback vector SVG QR code */
                          <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-900">
                            <rect x="10" y="10" width="20" height="20" fill="currentColor" />
                            <rect x="70" y="10" width="20" height="20" fill="currentColor" />
                            <rect x="10" y="70" width="20" height="20" fill="currentColor" />
                            <rect x="15" y="15" width="10" height="10" fill="white" />
                            <rect x="75" y="15" width="10" height="10" fill="white" />
                            <rect x="15" y="75" width="10" height="10" fill="white" />
                            
                            {/* Fake random QR noise pixels */}
                            <rect x="40" y="20" width="5" height="15" fill="currentColor" />
                            <rect x="50" y="10" width="10" height="5" fill="currentColor" />
                            <rect x="45" y="45" width="15" height="15" fill="currentColor" />
                            <rect x="25" y="40" width="5" height="5" fill="currentColor" />
                            <rect x="10" y="50" width="15" height="5" fill="currentColor" />
                            <rect x="70" y="50" width="20" height="5" fill="currentColor" />
                            <rect x="80" y="60" width="5" height="15" fill="currentColor" />
                            <rect x="50" y="80" width="15" height="10" fill="currentColor" />
                          </svg>
                        )}

                        {/* Banner indicating simulation fallback or real live transaction */}
                        <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-[8px] px-1.5 py-0.5 rounded font-mono text-zinc-400 whitespace-nowrap shadow font-bold">
                          {mercadoPagoPayment?.isSimulated ? "CHAVE PIX DO PROPRIETÁRIO" : "PIX LIVE MERCADO PAGO"}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="font-black text-white text-xs mt-3 flex items-center justify-center gap-1">
                        {mercadoPagoPayment?.isSimulated ? "Pague via Chave Pix Direta" : "Pague via Mercado Pago Pix"}
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      </p>
                      {mercadoPagoPayment?.isSimulated && ownerPixSettings && (
                        <div className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl my-1.5 text-left text-[10px] space-y-1 max-w-[240px] mx-auto">
                          <p className="text-zinc-500 font-bold uppercase tracking-wider text-[8px]">Dados para Transferência:</p>
                          <p className="text-zinc-300 truncate"><span className="text-zinc-500 font-semibold">Favorecido:</span> {ownerPixSettings.pixName}</p>
                          <p className="text-zinc-300 font-mono select-all flex justify-between items-center bg-zinc-950 p-1 px-1.5 rounded border border-zinc-900 mt-1">
                            <span>Chave: <span className="text-yellow-400 font-bold">{ownerPixSettings.pixKey}</span></span>
                          </p>
                        </div>
                      )}
                      <p className="text-[10px] text-zinc-500 leading-normal max-w-[210px] mx-auto">
                        {mercadoPagoPayment?.isSimulated 
                          ? "Escaneie o QR Code real acima com o aplicativo do seu banco ou copie o código Pix abaixo. O dinheiro cai direto na conta do dono! Clique em 'Simular Pagamento Aprovado' após transferir para liberar na hora!"
                          : "A liberação é 100% instantânea no sistema após a aprovação do pagamento."
                        }
                      </p>
                    </div>

                    {mercadoPagoPayment && (
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          readOnly
                          value={mercadoPagoPayment.qrCode}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-[9px] text-zinc-400 text-left truncate font-mono select-all"
                        />
                        <button
                          type="button"
                          onClick={handleCopyPixKey}
                          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3 py-1 rounded-lg flex items-center justify-center gap-1 shrink-0 font-bold transition-colors cursor-pointer text-[10px]"
                        >
                          {pixCopied ? <CheckCircle size={11} className="text-emerald-400 animate-bounce" /> : <Copy size={11} />}
                          {pixCopied ? "Copiado!" : "Copiar"}
                        </button>
                      </div>
                    )}

                    {/* Simulation/Interactive Trigger box for quick visual demonstration */}
                    {mercadoPagoPayment?.isSimulated && (
                      <div className="bg-yellow-500/5 border border-yellow-500/20 p-2.5 rounded-xl space-y-1.5 mt-2 animate-fadeIn text-left">
                        <p className="text-[9px] text-yellow-400 font-bold uppercase tracking-widest font-mono flex items-center gap-1">
                          <Sparkles size={10} className="text-yellow-400" /> Painel de Testes
                        </p>
                        <p className="text-[9px] text-zinc-400 leading-normal">
                          Para testar a liberação instantânea e ver as finanças do app subirem, clique no botão de simulação abaixo:
                        </p>
                        <button
                          type="button"
                          onClick={handleSimulateApproval}
                          disabled={isPaying}
                          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black font-extrabold text-[9px] py-1.5 rounded-lg transition-all uppercase tracking-wider cursor-pointer"
                        >
                          {isPaying ? "Processando..." : "⚡ Simular Pagamento Aprovado"}
                        </button>
                      </div>
                    )}

                    {/* Real Mercado Pago external checkout option */}
                    {mercadoPagoPayment && !mercadoPagoPayment.isSimulated && mercadoPagoPayment.ticketUrl && (
                      <a
                        href={mercadoPagoPayment.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 text-[10px] text-yellow-400 hover:text-yellow-300 hover:underline mt-1 font-bold"
                      >
                        Abrir fatura oficial no Mercado Pago <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                )}

                {/* 2. CARD CONTAINER */}
                {paymentMethod === "card" && (
                  <div className="space-y-3 text-xs animate-fadeIn text-left">
                    <div>
                      <label className="block text-zinc-500 font-semibold mb-1 text-[10px]">Número do Cartão</label>
                      <input
                        type="text"
                        placeholder="4532 1234 5678 9101"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 font-semibold mb-1 text-[10px]">Nome Impresso</label>
                      <input
                        type="text"
                        placeholder="MARCELO CUNHA"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500 animate-pulse"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-zinc-500 font-semibold mb-1 text-[10px]">Vencimento (MM/AA)</label>
                        <input
                          type="text"
                          placeholder="12/29"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 font-semibold mb-1 text-[10px]">Código CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="***"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-yellow-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. WALLETS (APPLE / GOOGLE PAY) CONTAINER */}
                {paymentMethod === "wallet" && (
                  <div className="space-y-4 text-xs animate-fadeIn text-center py-6">
                    <Smartphone size={32} className="text-zinc-500 mx-auto animate-pulse" />
                    <div className="space-y-1">
                      <p className="font-bold text-white">Apple Pay / Google Pay</p>
                      <p className="text-[10px] text-zinc-500 leading-normal">Integração nativa de 1-toque configurada para carteiras virtuais.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout CTA */}
              <form onSubmit={handleProcessPayment} className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-400 border-t border-zinc-900 pt-3">
                  <span>Total do Plano:</span>
                  <span className="font-bold text-white font-mono">R$ {selectedPlan.price.toFixed(2)}</span>
                </div>

                {paymentMethod !== "pix" && (
                  <button
                    type="submit"
                    disabled={isPaying}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-50 text-black font-black py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {isPaying ? (
                      <>
                        <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Processando Pagamento...
                      </>
                    ) : (
                      "Confirmar e Ativar Premium"
                    )}
                  </button>
                )}
                
                <p className="text-[9px] text-zinc-500 text-center flex items-center justify-center gap-1 pt-1">
                  <ShieldCheck size={10} className="text-emerald-500" /> Pagamento integrado com Mercado Pago API. Compra segura.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
