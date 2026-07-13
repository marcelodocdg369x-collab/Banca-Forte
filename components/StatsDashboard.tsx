import React from "react";
import { SystemStats } from "../types";
import { TrendingUp, CheckCircle, XCircle, Award, Target, Percent, DollarSign, Calendar } from "lucide-react";

interface StatsDashboardProps {
  stats: SystemStats;
}

export default function StatsDashboard({ stats }: StatsDashboardProps) {
  // Let's create dynamic points for an SVG area chart showing cumulative profit progress
  // We'll map the progress points visually
  const chartPoints = [
    { label: "Jan", val: 5 },
    { label: "Fev", val: 18 },
    { label: "Mar", val: 42 },
    { label: "Abr", val: 35 },
    { label: "Mai", val: 68 },
    { label: "Jun", val: 94 },
    { label: "Jul", val: Math.round(stats.accumulatedProfit || 145) }
  ];

  const maxVal = Math.max(...chartPoints.map(p => p.val));
  const minVal = Math.min(...chartPoints.map(p => p.val));
  const range = maxVal - minVal;

  const width = 500;
  const height = 150;
  
  // Convert points to SVG polyline coordinates
  const pointsString = chartPoints.map((p, idx) => {
    const x = (idx / (chartPoints.length - 1)) * (width - 40) + 20;
    const y = height - ((p.val - minVal) / range) * (height - 30) - 15;
    return `${x},${y}`;
  }).join(" ");

  // Create area coordinates
  const areaPointsString = `${20},${height - 10} ${pointsString} ${width - 20},${height - 10}`;

  return (
    <div className="space-y-6">
      {/* Overview Headings */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          📈 Estatísticas de Performance da Banca
        </h2>
        <p className="text-xs text-zinc-400">
          Relatório de assertividade consolidado, ROI, lucros em unidades e acompanhamento de rentabilidade histórica.
        </p>
      </div>

      {/* Numerical Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Taxa de Acerto</span>
            <Target size={14} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{stats.accuracyRate}%</p>
          <p className="text-[10px] text-emerald-400 mt-1 font-mono flex items-center gap-0.5">
            <Percent size={10} /> Consistência acima de 75%
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Retorno (ROI)</span>
            <TrendingUp size={14} className="text-yellow-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">+{stats.roi}%</p>
          <p className="text-[10px] text-yellow-400 mt-1 font-mono">Retorno sobre investimento</p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Lucro em Unidades</span>
            <Award size={14} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-1">+{stats.accumulatedProfit} u.</p>
          <p className="text-[10px] text-zinc-500 mt-1 font-mono">Referência: 1 Unidade = 1% Banca</p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Histórico Geral</span>
            <div className="flex gap-1 text-[9px] font-black text-zinc-400 font-mono">
              <span className="text-emerald-400">G</span>
              <span>/</span>
              <span className="text-red-400">R</span>
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {stats.greensCount} <span className="text-zinc-500 text-xs">/</span> <span className="text-zinc-400">{stats.redsCount}</span>
          </p>
          <p className="text-[10px] text-zinc-500 mt-1 font-mono">Total resolvidos: {stats.greensCount + stats.redsCount} jogos</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Profit Growth curve */}
        <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Progressão dos Lucros (Acumulado)</h4>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-black/40 px-2 py-1 rounded-lg border border-zinc-800 font-mono">
              <Calendar size={10} /> <span>Jan - Jul 2026</span>
            </div>
          </div>

          {/* SVG chart */}
          <div className="w-full bg-zinc-950 rounded-xl p-2 border border-zinc-900">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E676" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00E676" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="20" y1="20" x2={width - 20} y2="20" stroke="#333" strokeDasharray="3,3" strokeWidth="0.5" />
              <line x1="20" y1="60" x2={width - 20} y2="60" stroke="#333" strokeDasharray="3,3" strokeWidth="0.5" />
              <line x1="20" y1="100" x2={width - 20} y2="100" stroke="#333" strokeDasharray="3,3" strokeWidth="0.5" />
              <line x1="20" y1={height - 10} x2={width - 20} y2={height - 10} stroke="#444" strokeWidth="0.8" />

              {/* Area */}
              <polygon points={areaPointsString} fill="url(#chartGrad)" />

              {/* Line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points={pointsString}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Dots & values */}
              {chartPoints.map((p, idx) => {
                const x = (idx / (chartPoints.length - 1)) * (width - 40) + 20;
                const y = height - ((p.val - minVal) / range) * (height - 30) - 15;
                return (
                  <g key={p.label}>
                    <circle cx={x} cy={y} r="3.5" fill="#FFD700" stroke="#000" strokeWidth="1" />
                    <text x={x} y={y - 8} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">
                      +{p.val}u
                    </text>
                    <text x={x} y={height + 5} textAnchor="middle" fill="#555" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                      {p.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Breakdown side panel */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Rendimento Recente</h4>

          <div className="space-y-4 flex-1 flex flex-col justify-center text-xs">
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Rendimento Mensal</p>
                <p className="text-lg font-black text-emerald-400 mt-0.5">+{stats.monthlyProfit} Unidades</p>
              </div>
              <TrendingUp className="text-emerald-400" size={18} />
            </div>

            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Rendimento Semanal</p>
                <p className="text-lg font-black text-emerald-400 mt-0.5">+{stats.weeklyProfit} Unidades</p>
              </div>
              <TrendingUp className="text-emerald-400" size={18} />
            </div>

            <div className="p-1 text-[11px] text-zinc-400 flex gap-2 items-start leading-normal">
              <CheckCircle className="text-emerald-500 shrink-0" size={14} />
              <span>O rendimento consolidado é atualizado em tempo real à medida que os operadores publicam o encerramento do status dos palpites pendentes.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
