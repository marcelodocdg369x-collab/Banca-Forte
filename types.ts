export interface Prediction {
  id: string;
  championship: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  market: string;
  odd: number;
  confidence: number; // 1 to 100
  analysis: string;
  status: 'PENDENTE' | 'GREEN' | 'RED';
  isPremium: boolean;
  createdAt: string;
}

export interface ReadySlip {
  id: string;
  title: string;
  predictionIds: string[];
  totalOdd: number;
  suggestedValue: number;
  estimatedProfit: number;
  date: string;
  status: 'PENDENTE' | 'GREEN' | 'RED';
  isPremium: boolean;
  createdAt: string;
}

export interface BingoSelection {
  championship: string;
  homeTeam: string;
  awayTeam: string;
  market: string;
  odd: number;
}

export interface Bingo {
  id: string;
  title: string;
  date: string;
  totalOdd: number;
  selections: BingoSelection[];
  status: 'PENDENTE' | 'GREEN' | 'RED';
  isPremium: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  subscriptionType: 'duplo_bingo' | 'mensal' | 'trimestral' | 'semestral' | 'anual' | null;
  subscriptionExpiresAt: string | null;
  createdAt: string;
  favorites?: {
    championships?: string[];
    teams?: string[];
  };
}

export interface NotificationLog {
  id: string;
  title: string;
  message: string;
  type: 'FREE_PREDICTION' | 'PREMIUM_PREDICTION' | 'READY_SLIP' | 'LIVE_ENTRY' | 'RESULT_GREEN' | 'RESULT_RED';
  createdAt: string;
}

export interface FinanceStats {
  activeSubscribers: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  annualRevenue: number;
  cancellationsCount: number;
  renewalsCount: number;
}

export interface SystemStats {
  accuracyRate: number; // e.g. 78%
  greensCount: number;
  redsCount: number;
  roi: number; // e.g. 15.4%
  accumulatedProfit: number; // e.g. +145.5 units
  monthlyProfit: number;
  weeklyProfit: number;
  oddAverage: number;
  oddMax: number;
  oddMin: number;
}

// Fixed lists based on requirements
export const CHAMPIONSHIPS = [
  // Brasil
  "Série A (Brasil)",
  "Série B (Brasil)",
  "Copa do Brasil",
  "Brasileirão Feminino",
  // Inglaterra
  "Premier League (Inglaterra)",
  "Championship (Inglaterra)",
  "FA Cup (Inglaterra)",
  "Carabao Cup (Inglaterra)",
  // Outros Europa
  "La Liga (Espanha)",
  "Copa del Rey (Espanha)",
  "Serie A (Itália)",
  "Coppa Italia (Itália)",
  "Bundesliga (Alemanha)",
  "DFB Pokal (Alemanha)",
  "Ligue 1 (França)",
  "Coupe de France (França)",
  "Liga Portugal (Portugal)",
  "Eredivisie (Holanda)",
  "Jupiler Pro League (Bélgica)",
  "Super Lig (Turquia)",
  // Américas & Ásia
  "Saudi Pro League (Arábia Saudita)",
  "Liga Profesional (Argentina)",
  "MLS (EUA)",
  // Competições Internacionais
  "UEFA Champions League",
  "UEFA Europa League",
  "UEFA Conference League",
  "Copa Libertadores",
  "Copa Sul-Americana",
  "Recopa Sul-Americana",
  "Mundial de Clubes",
  "Copa do Mundo",
  "Eliminatórias",
  "Eurocopa",
  "Copa América",
  "Nations League"
];

export const MARKETS = [
  "Resultado Final",
  "Dupla Chance",
  "Ambas Marcam",
  "Over 0.5",
  "Over 1.5",
  "Over 2.5",
  "Over 3.5",
  "Under 2.5",
  "Handicap Asiático",
  "Handicap Europeu",
  "Escanteios",
  "Cartões",
  "Chutes ao Gol",
  "Jogador Marca",
  "Primeiro Tempo",
  "Segundo Tempo",
  "Próximo Gol"
];

export const SUBSCRIPTION_PLANS = [
  { id: 'duplo_bingo', name: 'Duplo Bingo Diário (2 Bingos)', price: 5.00, period: 'dia', durationDays: 1 },
  { id: 'mensal', name: 'Plano Mensal (VIP Total)', price: 49.90, period: 'mês', durationDays: 30 },
  { id: 'trimestral', name: 'Plano Trimestral (VIP Total)', price: 119.90, period: '3 meses', durationDays: 90 },
  { id: 'semestral', name: 'Plano Semestral (VIP Total)', price: 199.90, period: '6 meses', durationDays: 180 },
  { id: 'anual', name: 'Plano Anual (VIP Total)', price: 299.90, period: 'ano', durationDays: 365 },
];
