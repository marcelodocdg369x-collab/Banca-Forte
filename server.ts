import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";


dotenv.config();

const __filenameResolved = typeof __filename !== "undefined"
  ? __filename
  : (import.meta && import.meta.url ? fileURLToPath(import.meta.url) : "");
const __dirnameResolved = typeof __dirname !== "undefined"
  ? __dirname
  : (__filenameResolved ? path.dirname(__filenameResolved) : process.cwd());

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API:", err);
  }
} else {
  console.warn("GEMINI_API_KEY not found in environment variables. AI generation will use fallback logic.");
}

const DATA_FILE_PATH = path.join(process.cwd(), "data-store.json");

// Initialize Firebase Database
let db: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      appId: config.appId
    });
    db = getFirestore(app, config.firestoreDatabaseId);
    console.log("Firebase Client SDK initialized successfully with config!");
  } else {
    console.warn("Firebase configuration file not found. Falling back to local data-store.json.");
  }
} catch (err) {
  console.error("Failed to initialize Firebase Client SDK. Falling back to local data-store.json:", err);
}

// Helper to get dates dynamic relative to today
const getTodayDateStr = (offsetDays = 0) => {
  const d = new Date(Date.now() + offsetDays * 24 * 3600000);
  return d.toISOString().split('T')[0];
};

// Define Initial Seed Data
const INITIAL_PREDICTIONS = [
  {
    id: "pred-1",
    championship: "Premier League (Inglaterra)",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    date: getTodayDateStr(-1),
    time: "16:00",
    market: "Ambas Marcam",
    odd: 1.85,
    confidence: 85,
    analysis: "O Arsenal vem em excelente fase ofensiva jogando no Emirates Stadium, enquanto o Chelsea demonstrou fragilidade defensiva nos últimos jogos fora de casa, mas possui contra-ataques eficientes. A tendência é de jogo aberto com chances claras para ambos os lados.",
    status: "GREEN",
    isPremium: false,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: "pred-2",
    championship: "La Liga (Espanha)",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    date: getTodayDateStr(-1),
    time: "17:00",
    market: "Resultado Final (Vitória Casa)",
    odd: 2.10,
    confidence: 78,
    analysis: "O Real Madrid joga no Santiago Bernabéu com força máxima e busca consolidar a liderança. O Barcelona vem de uma sequência desgastante na Champions League. Acreditamos na vitória merengue baseada na maior solidez coletiva e fator local.",
    status: "PENDENTE",
    isPremium: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "pred-3",
    championship: "Série A (Brasil)",
    homeTeam: "Flamengo",
    awayTeam: "Palmeiras",
    date: getTodayDateStr(0),
    time: "20:00",
    market: "Under 2.5 Gols",
    odd: 1.75,
    confidence: 90,
    analysis: "Um confronto tático muito equilibrado entre as duas melhores equipes do futebol brasileiro. Ambas as defesas são muito fortes e os treinadores costumam adotar posturas mais cautelosas em confrontos diretos.",
    status: "PENDENTE",
    isPremium: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "pred-4",
    championship: "UEFA Champions League",
    homeTeam: "Manchester City",
    awayTeam: "Bayern de Munique",
    date: getTodayDateStr(1),
    time: "16:00",
    market: "Over 2.5 Gols",
    odd: 1.62,
    confidence: 92,
    analysis: "Dois elencos extremamente qualificados com mentalidade ofensiva. O Manchester City impõe um ritmo avassalador em casa, e o Bayern possui transições extremamente rápidas com atacantes velozes. Um jogo com alta expectativa de gols.",
    status: "PENDENTE",
    isPremium: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "pred-5",
    championship: "Copa Libertadores",
    homeTeam: "River Plate",
    awayTeam: "Atlético Mineiro",
    date: getTodayDateStr(2),
    time: "21:30",
    market: "Dupla Chance (Empate ou Visitante)",
    odd: 1.95,
    confidence: 70,
    analysis: "O River Plate enfrenta problemas de consistência tática e o Atlético-MG de Gabriel Milito é extremamente perigoso jogando de forma compactada. Odd muito valorizada para a dupla chance do Galo.",
    status: "PENDENTE",
    isPremium: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "pred-6",
    championship: "Série A (Brasil)",
    homeTeam: "São Paulo",
    awayTeam: "Corinthians",
    date: getTodayDateStr(-2),
    time: "18:00",
    market: "Resultado Final (Vitória Casa)",
    odd: 1.90,
    confidence: 80,
    analysis: "Clássico Majestoso no MorumBis. O São Paulo vem completo e com grande aproveitamento em casa. O Corinthians passa por processo de reestruturação com desfalques importantes na zaga por cartões.",
    status: "GREEN",
    isPremium: false,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: "pred-7",
    championship: "Serie A (Itália)",
    homeTeam: "Inter de Milão",
    awayTeam: "Juventus",
    date: getTodayDateStr(-2),
    time: "15:45",
    market: "Ambas Marcam",
    odd: 2.05,
    confidence: 75,
    analysis: "Derby d'Italia de alta intensidade. A Inter de Milão joga em casa e sempre marca gols, enquanto a Juventus tem mostrado excelente poder de reação com contra-ataques perigosos. Esperamos que ambas balancem as redes.",
    status: "RED",
    isPremium: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: "pred-8",
    championship: "Bundesliga (Alemanha)",
    homeTeam: "Borussia Dortmund",
    awayTeam: "Bayer Leverkusen",
    date: getTodayDateStr(-3),
    time: "15:30",
    market: "Over 3.5 Gols",
    odd: 2.45,
    confidence: 65,
    analysis: "Duelo de equipes de altíssima octanagem ofensiva na Bundesliga. A muralha amarela empurra o Dortmund, enquanto o Leverkusen mantém seu style vistoso com muitos gols marcados e sofridos nos últimos confrontos.",
    status: "GREEN",
    isPremium: true,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
  },
  {
    id: "pred-9",
    championship: "Série B (Brasil)",
    homeTeam: "Santos",
    awayTeam: "Sport Recife",
    date: getTodayDateStr(-3),
    time: "21:30",
    market: "Resultado Final (Vitória Casa)",
    odd: 1.70,
    confidence: 88,
    analysis: "O Santos joga na Vila Belmiro buscando consolidar seu retorno à elite nacional. O Sport Recife tem oscilado fora de casa contra equipes do G4. Vitória provável do Peixe.",
    status: "GREEN",
    isPremium: false,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
  },
  {
    id: "pred-10",
    championship: "Liga Portugal (Portugal)",
    homeTeam: "Porto",
    awayTeam: "Benfica",
    date: getTodayDateStr(-4),
    time: "17:15",
    market: "Escanteios (Over 9.5)",
    odd: 1.80,
    confidence: 82,
    analysis: "Clássico de muita pressão lateral e cruzamentos na área. Estatisticamente ambos os times geram em média de 6 a 7 escanteios por partida individualmente. Tendência forte de over cantos.",
    status: "GREEN",
    isPremium: false,
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString()
  }
];

const INITIAL_READY_SLIPS = [
  {
    id: "slip-1",
    title: "Tripla de Ouro Europeia",
    predictionIds: ["pred-2", "pred-4"], // Real Madrid + Manchester City
    totalOdd: 3.40,
    suggestedValue: 100,
    estimatedProfit: 340,
    date: getTodayDateStr(-1),
    status: "PENDENTE",
    isPremium: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "slip-2",
    title: "Dupla Segura do Brasileirão",
    predictionIds: ["pred-6", "pred-9"], // São Paulo + Santos
    totalOdd: 3.23,
    suggestedValue: 150,
    estimatedProfit: 484.5,
    date: getTodayDateStr(-2),
    status: "GREEN",
    isPremium: false,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: "slip-3",
    title: "Múltipla VIP de Odds Altas 💎",
    predictionIds: ["pred-2", "pred-4", "pred-5"], // Real Madrid + Manchester City + River Plate
    totalOdd: 6.63,
    suggestedValue: 50,
    estimatedProfit: 331.5,
    date: getTodayDateStr(-1),
    status: "PENDENTE",
    isPremium: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "slip-4",
    title: "Dica Ultra-VIP da Champions 💎",
    predictionIds: ["pred-4", "pred-5"], // Manchester City + River Plate
    totalOdd: 3.16,
    suggestedValue: 200,
    estimatedProfit: 632.0,
    date: getTodayDateStr(-1),
    status: "PENDENTE",
    isPremium: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "slip-5",
    title: "Combo Secreto de Domingo 💎",
    predictionIds: ["pred-3", "pred-5"], // Flamengo + River Plate
    totalOdd: 3.41,
    suggestedValue: 120,
    estimatedProfit: 409.2,
    date: getTodayDateStr(-1),
    status: "PENDENTE",
    isPremium: true,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_USERS = [
  {
    id: "user-1",
    name: "Marcelo Cunha",
    email: "marcelodocdg369x@gmail.com",
    isPremium: true,
    isAdmin: true,
    subscriptionType: "anual",
    subscriptionExpiresAt: "2027-07-12T00:00:00.000Z",
    favorites: { championships: ["La Liga (Espanha)", "Série A (Brasil)"], teams: ["Real Madrid", "Flamengo"] },
    createdAt: "2026-01-10T14:30:00.000Z"
  },
  {
    id: "user-2",
    name: "Thiago Silva",
    email: "thiago.silva@gmail.com",
    isPremium: false,
    isAdmin: false,
    subscriptionType: null,
    subscriptionExpiresAt: null,
    favorites: { championships: [], teams: [] },
    createdAt: "2026-06-15T10:00:00.000Z"
  },
  {
    id: "user-3",
    name: "Amanda Costa",
    email: "amanda.c@hotmail.com",
    isPremium: true,
    isAdmin: false,
    subscriptionType: "mensal",
    subscriptionExpiresAt: "2026-08-12T00:00:00.000Z",
    favorites: { championships: ["Premier League (Inglaterra)"], teams: ["Arsenal"] },
    createdAt: "2026-07-01T09:15:00.000Z"
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "🚀 Novo Palpite Gratuito!",
    message: "Arsenal vs Chelsea - Ambas Marcam está liberado na tela inicial!",
    type: "FREE_PREDICTION",
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: "notif-2",
    title: "💎 Palpite VIP Publicado!",
    message: "Real Madrid vs Barcelona - Um palpite exclusivo com Odd 2.10 na Área Premium.",
    type: "PREMIUM_PREDICTION",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: "notif-3",
    title: "✅ GREEN DUPLO!",
    message: "O Bilhete do Dia do Brasileirão deu GREEN! Odd 3.23 batida com sucesso!",
    type: "RESULT_GREEN",
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
  }
];

const INITIAL_FINANCE = {
  activeSubscribers: 1420,
  dailyRevenue: 2850.00,
  monthlyRevenue: 85200.00,
  annualRevenue: 1022400.00,
  cancellationsCount: 12,
  renewalsCount: 245
};

const INITIAL_BINGOS = [
  {
    id: "bingo-1",
    title: "Bingo do Leão - Grátis do Dia",
    date: getTodayDateStr(-1),
    totalOdd: 18.50,
    status: "PENDENTE",
    isPremium: false,
    createdAt: new Date().toISOString(),
    selections: [
      { championship: "Premier League (Inglaterra)", homeTeam: "Arsenal", awayTeam: "Chelsea", market: "Vitória Casa", odd: 1.65 },
      { championship: "La Liga (Espanha)", homeTeam: "Real Madrid", awayTeam: "Barcelona", market: "Over 2.5 Gols", odd: 1.62 },
      { championship: "Série A (Brasil)", homeTeam: "Flamengo", awayTeam: "Palmeiras", market: "Ambas Marcam (Sim)", odd: 1.80 },
      { championship: "Serie A (Itália)", homeTeam: "Inter de Milão", awayTeam: "Juventus", market: "Dupla Chance (Casa ou Empate)", odd: 1.25 },
      { championship: "Bundesliga (Alemanha)", homeTeam: "Borussia Dortmund", awayTeam: "Bayer Leverkusen", market: "Over 1.5 Gols", odd: 1.22 },
      { championship: "Série B (Brasil)", homeTeam: "Santos", awayTeam: "Sport Recife", market: "Vitória Casa", odd: 1.70 }
    ]
  },
  {
    id: "bingo-2",
    title: "Bingo VIP #1 - Gigantes Europeus",
    date: getTodayDateStr(-1),
    totalOdd: 28.30,
    status: "PENDENTE",
    isPremium: true,
    createdAt: new Date().toISOString(),
    selections: [
      { championship: "Premier League (Inglaterra)", homeTeam: "Liverpool", awayTeam: "Aston Villa", market: "Vitória Casa", odd: 1.55 },
      { championship: "La Liga (Espanha)", homeTeam: "Atlético de Madrid", awayTeam: "Sevilla", market: "Vitória Casa", odd: 1.68 },
      { championship: "Serie A (Itália)", homeTeam: "Milan", awayTeam: "Fiorentina", market: "Over 2.5 Gols", odd: 1.75 },
      { championship: "Bundesliga (Alemanha)", homeTeam: "Bayern de Munique", awayTeam: "Stuttgart", market: "Vitória Casa", odd: 1.40 },
      { championship: "Ligue 1 (França)", homeTeam: "PSG", awayTeam: "Marseille", market: "Ambas Marcam (Sim)", odd: 1.58 },
      { championship: "Eredivisie (Holanda)", homeTeam: "Ajax", awayTeam: "Feyenoord", market: "Over 2.5 Gols", odd: 1.60 },
      { championship: "Liga Portugal (Portugal)", homeTeam: "Porto", awayTeam: "Sporting CP", market: "Dupla Chance (Casa ou Empate)", odd: 1.35 }
    ]
  },
  {
    id: "bingo-3",
    title: "Bingo VIP #2 - Expresso do Brasileirão",
    date: getTodayDateStr(-1),
    totalOdd: 15.40,
    status: "PENDENTE",
    isPremium: true,
    createdAt: new Date().toISOString(),
    selections: [
      { championship: "Série A (Brasil)", homeTeam: "São Paulo", awayTeam: "Corinthians", market: "Vitória Casa", odd: 1.90 },
      { championship: "Série A (Brasil)", homeTeam: "Bahia", awayTeam: "Cruzeiro", market: "Dupla Chance (Casa ou Empate)", odd: 1.28 },
      { championship: "Série A (Brasil)", homeTeam: "Botafogo", awayTeam: "Vasco da Gama", market: "Vitória Casa", odd: 1.75 },
      { championship: "Série A (Brasil)", homeTeam: "Athletico-PR", awayTeam: "Vitória", market: "Vitória Casa", odd: 1.60 },
      { championship: "Série A (Brasil)", homeTeam: "Fortaleza", awayTeam: "Cuiabá", market: "Under 2.5 Gols", odd: 1.70 }
    ]
  },
  {
    id: "bingo-4",
    title: "Bingo VIP #3 - Super Milionário",
    date: getTodayDateStr(-1),
    totalOdd: 62.40,
    status: "PENDENTE",
    isPremium: true,
    createdAt: new Date().toISOString(),
    selections: [
      { championship: "Premier League (Inglaterra)", homeTeam: "Manchester United", awayTeam: "Tottenham", market: "Ambas Marcam (Sim)", odd: 1.55 },
      { championship: "La Liga (Espanha)", homeTeam: "Real Sociedad", awayTeam: "Real Betis", market: "Empate ou Visitante", odd: 1.72 },
      { championship: "Serie A (Itália)", homeTeam: "Lazio", awayTeam: "Roma", market: "Over 2.5 Gols", odd: 2.05 },
      { championship: "Bundesliga (Alemanha)", homeTeam: "RB Leipzig", awayTeam: "Frankfurt", market: "Vitória Casa", odd: 1.68 },
      { championship: "Ligue 1 (França)", homeTeam: "Monaco", awayTeam: "Lille", market: "Ambas Marcam (Sim)", odd: 1.60 },
      { championship: "Série A (Brasil)", homeTeam: "Internacional", awayTeam: "Grêmio", market: "Empate", odd: 3.10 },
      { championship: "Liga Profesional (Argentina)", homeTeam: "Boca Juniors", awayTeam: "River Plate", market: "Under 1.5 Gols", odd: 2.40 }
    ]
  },
  {
    id: "bingo-5",
    title: "Bingo VIP #4 - Cartões e Cantos",
    date: getTodayDateStr(-1),
    totalOdd: 32.10,
    status: "PENDENTE",
    isPremium: true,
    createdAt: new Date().toISOString(),
    selections: [
      { championship: "Premier League (Inglaterra)", homeTeam: "Chelsea", awayTeam: "Arsenal", market: "Escanteios (Over 9.5)", odd: 1.72 },
      { championship: "La Liga (Espanha)", homeTeam: "Barcelona", awayTeam: "Real Madrid", market: "Cartões (Over 5.5)", odd: 1.85 },
      { championship: "Série A (Brasil)", homeTeam: "Palmeiras", awayTeam: "Flamengo", market: "Escanteios (Over 10.5)", odd: 2.10 },
      { championship: "Serie A (Itália)", homeTeam: "Juventus", awayTeam: "Inter de Milão", market: "Cartões (Over 4.5)", odd: 1.65 },
      { championship: "Bundesliga (Alemanha)", homeTeam: "Bayer Leverkusen", awayTeam: "Borussia Dortmund", market: "Escanteios (Over 8.5)", odd: 1.45 },
      { championship: "Liga Portugal (Portugal)", homeTeam: "Benfica", awayTeam: "Porto", market: "Cartões (Over 6.5)", odd: 2.20 }
    ]
  },
  {
    id: "bingo-past-1",
    title: "Bingo dos Campeões de Ontem",
    date: getTodayDateStr(-2),
    totalOdd: 12.80,
    status: "GREEN",
    isPremium: false,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    selections: [
      { championship: "Série A (Brasil)", homeTeam: "São Paulo", awayTeam: "Corinthians", market: "Vitória Casa", odd: 1.90 },
      { championship: "Série B (Brasil)", homeTeam: "Santos", awayTeam: "Sport Recife", market: "Vitória Casa", odd: 1.70 },
      { championship: "Serie A (Itália)", homeTeam: "Inter de Milão", awayTeam: "Juventus", market: "Dupla Chance (Casa ou Empate)", odd: 1.25 },
      { championship: "Bundesliga (Alemanha)", homeTeam: "Borussia Dortmund", awayTeam: "Bayer Leverkusen", market: "Over 1.5 Gols", odd: 1.22 },
      { championship: "Premier League (Inglaterra)", homeTeam: "Arsenal", awayTeam: "Chelsea", market: "Vitória Casa", odd: 1.65 }
    ]
  },
  {
    id: "bingo-past-2",
    title: "Bingo VIP - Combo de Sexta-Feira",
    date: getTodayDateStr(-3),
    totalOdd: 24.50,
    status: "RED",
    isPremium: true,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    selections: [
      { championship: "Premier League (Inglaterra)", homeTeam: "Chelsea", awayTeam: "Arsenal", market: "Escanteios (Over 9.5)", odd: 1.72 },
      { championship: "La Liga (Espanha)", homeTeam: "Barcelona", awayTeam: "Real Madrid", market: "Cartões (Over 5.5)", odd: 1.85 },
      { championship: "Série A (Brasil)", homeTeam: "Palmeiras", awayTeam: "Flamengo", market: "Escanteios (Over 10.5)", odd: 2.10 },
      { championship: "Serie A (Itália)", homeTeam: "Juventus", awayTeam: "Inter de Milão", market: "Cartões (Over 4.5)", odd: 1.65 },
      { championship: "Bundesliga (Alemanha)", homeTeam: "Bayer Leverkusen", awayTeam: "Borussia Dortmund", market: "Escanteios (Over 8.5)", odd: 1.45 }
    ]
  }
];

// Store state
let store = {
  predictions: INITIAL_PREDICTIONS,
  readySlips: INITIAL_READY_SLIPS,
  users: INITIAL_USERS,
  notifications: INITIAL_NOTIFICATIONS,
  finance: INITIAL_FINANCE,
  bingos: INITIAL_BINGOS,
  settings: {
    pixKey: "19119119100", // CPF de exemplo padrão do administrador
    pixName: "Marcelo Cunha", // Nome de exemplo padrão do administrador
    pixCity: "SAO PAULO",
    telegramLink: "https://t.me/+ExemploGrupoBancaForte",
    telegramBotToken: "",
    telegramChatId: ""
  }
};

// Load store from data-store.json and Firestore if available
async function loadStore() {
  // 1. First, load baseline from local data-store.json
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const loaded = JSON.parse(raw);
      store = { ...store, ...loaded };
    }
  } catch (err) {
    console.error("Error reading baseline persistent store:", err);
  }

  // 2. Override / sync with Firestore database
  if (db) {
    try {
      console.log("Loading and syncing state with Firestore...");
      
      const docsToLoad = [
        "predictions",
        "readySlips",
        "users",
        "notifications",
        "finance",
        "bingos",
        "settings"
      ];

      for (const key of docsToLoad) {
        const docRef = doc(db, "banca_forte_store", key);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.value !== undefined) {
            (store as any)[key] = data.value;
          } else if (data) {
            (store as any)[key] = data;
          }
        } else {
          // Document does not exist in Firestore yet, write current baseline
          console.log(`Seeding Firestore document: ${key}`);
          const valToSave = (store as any)[key];
          const docData = valToSave && typeof valToSave === "object" && !Array.isArray(valToSave) ? valToSave : { value: valToSave };
          await setDoc(docRef, docData);
        }
      }
      console.log("Successfully synchronized store with Firestore!");
    } catch (err) {
      console.error("Error loading store from Firestore, fell back to local store:", err);
    }
  }

  // 3. Post-load data sanitization and default checks
  if (!store.bingos) {
    store.bingos = INITIAL_BINGOS;
  }
  if (store.predictions) {
    // Remove telegram integration test matches and mock tests
    store.predictions = store.predictions.filter((p: any) => {
      const champLower = (p.championship || "").toLowerCase();
      const homeLower = (p.homeTeam || "").toLowerCase();
      const awayLower = (p.awayTeam || "").toLowerCase();
      const isTelegramTest = champLower.includes("telegram") && champLower.includes("teste");
      const isBancaForteTest = homeLower.includes("banca forte") || awayLower.includes("telegram united");
      const isGenericTest = champLower.includes("teste") || homeLower.includes("teste") || awayLower.includes("teste");
      return !isTelegramTest && !isBancaForteTest && !isGenericTest;
    });
  }
  if (!store.settings) {
    store.settings = {
      pixKey: "19119119100",
      pixName: "Marcelo Cunha",
      pixCity: "SAO PAULO",
      telegramLink: "https://t.me/+ExemploGrupoBancaForte",
      telegramBotToken: "",
      telegramChatId: ""
    };
  } else {
    // Guarantee fields exist
    store.settings.telegramLink = store.settings.telegramLink || "https://t.me/+ExemploGrupoBancaForte";
    store.settings.telegramBotToken = store.settings.telegramBotToken || "";
    store.settings.telegramChatId = store.settings.telegramChatId || "";
  }
  if (store.users) {
    store.users = store.users.map(u => ({
      ...u,
      favorites: u.favorites || { championships: [], teams: [] }
    }));
  }

  // Save the synchronized clean state back to both data-store.json and Firestore
  saveStore();
}

// Save store to data-store.json and Firestore
function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing local persistent store:", err);
  }

  // Save to Firestore asynchronously
  if (db) {
    const docsToSave = [
      "predictions",
      "readySlips",
      "users",
      "notifications",
      "finance",
      "bingos",
      "settings"
    ];

    for (const key of docsToSave) {
      try {
        const valToSave = (store as any)[key];
        const docData = valToSave && typeof valToSave === "object" && !Array.isArray(valToSave) ? valToSave : { value: valToSave };
        const docRef = doc(db, "banca_forte_store", key);
        setDoc(docRef, docData).catch((err: any) => {
          console.error(`Failed to async save ${key} to Firestore:`, err);
        });
      } catch (err) {
        console.error(`Error initiating save for ${key} to Firestore:`, err);
      }
    }
  }
}

// Start async load
loadStore().catch(err => {
  console.error("Failed to run async loadStore on boot:", err);
});

// Dynamic Stats Calculator based on current predictions
function getSystemStats() {
  const resolved = store.predictions.filter(p => p.status !== "PENDENTE");
  const greens = resolved.filter(p => p.status === "GREEN");
  const total = resolved.length;
  
  const accuracyRate = total > 0 ? Math.round((greens.length / total) * 100) : 80;
  
  const oddSum = resolved.reduce((acc, p) => acc + p.odd, 0);
  const oddAverage = total > 0 ? parseFloat((oddSum / total).toFixed(2)) : 1.95;
  
  const oddsAll = store.predictions.map(p => p.odd);
  const oddMax = oddsAll.length > 0 ? Math.max(...oddsAll) : 2.45;
  const oddMin = oddsAll.length > 0 ? Math.min(...oddsAll) : 1.62;
  
  // Calculate a simulated ROI and accumulated profits
  const accumulatedProfit = parseFloat((greens.length * 0.9 - (total - greens.length) * 1.0).toFixed(1));
  const roi = total > 0 ? parseFloat(((accumulatedProfit / total) * 100).toFixed(1)) : 15.4;

  return {
    accuracyRate,
    greensCount: greens.length,
    redsCount: total - greens.length,
    roi,
    accumulatedProfit,
    monthlyProfit: parseFloat((accumulatedProfit * 0.75).toFixed(1)),
    weeklyProfit: parseFloat((accumulatedProfit * 0.25).toFixed(1)),
    oddAverage,
    oddMax,
    oddMin
  };
}

// REST API Routes

// 1. Predictions CRUD
app.get("/api/predictions", (req, res) => {
  res.json(store.predictions);
});

app.post("/api/predictions", (req, res) => {
  const newPrediction = {
    id: "pred-" + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  store.predictions.unshift(newPrediction);
  
  // Auto-generate notification
  const notifyType = newPrediction.isPremium ? "PREMIUM_PREDICTION" : "FREE_PREDICTION";
  const notifyTitle = newPrediction.isPremium ? "💎 Novo Palpite VIP!" : "🚀 Novo Palpite Gratuito!";
  const notifyMessage = `${newPrediction.homeTeam} vs ${newPrediction.awayTeam} (${newPrediction.market}) com Odd ${newPrediction.odd.toFixed(2)} já está disponível!`;
  
  const newNotif = {
    id: "notif-" + Date.now(),
    title: notifyTitle,
    message: notifyMessage,
    type: notifyType,
    createdAt: new Date().toISOString()
  };
  store.notifications.unshift(newNotif);
  
  saveStore();
  res.status(201).json(newPrediction);
});

app.post("/api/predictions/create-daily", async (req, res) => {
  let selectedMatch: any = null;

  if (ai) {
    try {
      const todayDateStr = new Date().toISOString().split("T")[0];
      const prompt = `Search for real football (soccer) matches happening today (${todayDateStr}) or this week in major world leagues (such as Brasileirão Série A, Premier League, La Liga, UEFA Champions League, Serie A Itália, etc.). 
Select ONE highly probable actual real-world football game that is scheduled for today or very soon, and provide realistic market odds.
Return a clean, valid JSON object matching exactly this schema, with no markdown formatting or backticks:
{
  "champ": "Name of Championship (e.g. Série A (Brasil))",
  "home": "Home Team Name",
  "away": "Away Team Name",
  "market": "Suggested betting market (e.g. Ambas Marcam, Resultado Final (Vitória Casa), Over 2.5 Gols, Under 2.5 Gols, etc.)",
  "odd": 1.75,
  "conf": 85,
  "analysis": "A detailed tactic analysis in Portuguese explaining current form, key news, and the tactical reason for this selected bet."
}`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        },
      });

      if (aiResponse.text) {
        selectedMatch = JSON.parse(aiResponse.text.trim());
      }
    } catch (err) {
      console.error("Error generating live prediction via Gemini search grounding:", err);
    }
  }

  // Fallback if Gemini fails or is not configured
  if (!selectedMatch) {
    const matchups = [
      { champ: "Série A (Brasil)", home: "Flamengo", away: "Palmeiras", market: "Ambas Marcam", odd: 1.88, conf: 88, analysis: "Flamengo joga no Maracanã onde costuma ser letal, mas a defesa do Palmeiras é sólida e o time tem transição rápida. Esperamos um clássico de alta voltagem com chances para ambas as equipes balançarem as redes do adversário hoje." },
      { champ: "Série A (Brasil)", home: "São Paulo", away: "Corinthians", market: "Dupla Chance (São Paulo ou Empate)", odd: 1.35, conf: 92, analysis: "O São Paulo defende sua invencibilidade em clássicos no MorumBis. O Corinthians vem em momento instável de reestruturação. Cenário muito favorável para o Tricolor não sair derrotado hoje." }
    ];
    selectedMatch = matchups[Math.floor(Math.random() * matchups.length)];
  }

  const dailyPrediction = {
    id: "pred-daily-" + Date.now(),
    championship: selectedMatch.champ,
    homeTeam: selectedMatch.home,
    awayTeam: selectedMatch.away,
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    market: selectedMatch.market,
    odd: Number(selectedMatch.odd) || 1.80,
    confidence: Number(selectedMatch.conf) || 80,
    analysis: selectedMatch.analysis,
    status: "PENDENTE" as const,
    isPremium: false,
    createdAt: new Date().toISOString()
  };
  
  store.predictions.unshift(dailyPrediction);
  
  // Also create a notification
  const newNotif = {
    id: "notif-daily-" + Date.now(),
    title: `🤖 Novo Palpite do Dia: ${selectedMatch.home} x ${selectedMatch.away}`,
    message: `Aviso de jogo quente! Mercado: ${selectedMatch.market} com Odd ${selectedMatch.odd}. Palpite gerado automaticamente no sistema.`,
    type: "FREE_PREDICTION" as const,
    createdAt: new Date().toISOString()
  };
  store.notifications.unshift(newNotif);
  
  saveStore();
  res.json({ success: true, prediction: dailyPrediction });
});

app.post("/api/predictions/simulate-favorite", async (req, res) => {
  const { userId } = req.body;
  const user = store.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }
  if (!user.isPremium && !user.isAdmin) {
    return res.status(403).json({ error: "Funcionalidade exclusiva para usuários Premium." });
  }

  // Pick a favorite championship and team
  const favs = user.favorites || { championships: [], teams: [] };
  const championships = favs.championships && favs.championships.length > 0 
    ? favs.championships 
    : ["Premier League (Inglaterra)"];
  const teams = favs.teams && favs.teams.length > 0 
    ? favs.teams 
    : ["Arsenal"];

  const champ = championships[Math.floor(Math.random() * championships.length)];
  const team = teams[Math.floor(Math.random() * teams.length)];

  // Set opponent
  const opponentsList: Record<string, string[]> = {
    "Arsenal": ["Liverpool", "Tottenham", "Aston Villa", "Manchester United"],
    "Real Madrid": ["Atlético de Madrid", "Real Sociedad", "Sevilla", "Athletic Bilbao"],
    "Flamengo": ["Vasco da Gama", "Fluminense", "Botafogo", "Palmeiras"],
    "Chelsea": ["Manchester City", "West Ham", "Newcastle", "Everton"],
    "São Paulo": ["Corinthians", "Santos", "Palmeiras", "Red Bull Bragantino"],
    "Manchester City": ["Manchester United", "Liverpool", "Arsenal", "Aston Villa"],
    "Barcelona": ["Real Madrid", "Girona", "Atlético de Madrid", "Valencia"],
    "Inter de Milão": ["Milan", "Juventus", "Roma", "Napoli"]
  };

  const possibleOpponents = opponentsList[team] || ["Clube Atlético Forte", "Sporting de Elite", "União de Craques", "Real Fortaleza"];
  const opponent = possibleOpponents[Math.floor(Math.random() * possibleOpponents.length)];

  const isHome = Math.random() > 0.5;
  const homeTeam = isHome ? team : opponent;
  const awayTeam = isHome ? opponent : team;

  const markets = ["Resultado Final (Vitória Casa)", "Ambas Marcam", "Over 2.5 Gols", "Dupla Chance (Empate/Visitante)", "Under 3.5 Gols"];
  const market = markets[Math.floor(Math.random() * markets.length)];
  const odd = parseFloat((1.65 + Math.random() * 0.95).toFixed(2));
  const confidence = Math.floor(75 + Math.random() * 20);

  let analysis = `Análise Premium Exclusiva para ${homeTeam} vs ${awayTeam} no campeonato ${champ}.\n\n` +
    `Este palpite foi gerado com exclusividade pois coincide com o seu time favorito (${team}) ou liga de interesse (${champ})!\n` +
    `As estatísticas táticas e métricas de desempenho indicam que o mercado "${market}" possui alta consistência técnica. Aproveite as odds valorizadas de x${odd.toFixed(2)} com gestão adequada.`;

  if (ai) {
    try {
      const prompt = `Gere uma análise tática de aposta esportiva em Português do Brasil (PT-BR) para o confronto:
- Campeonato: ${champ}
- Time de Casa: ${homeTeam}
- Time de Fora: ${awayTeam}
- Mercado sugerido: ${market}
- Odd de referência: x${odd.toFixed(2)}

Sua análise deve ser muito motivadora e focada em dados táticos (estilo especialista em apostas). Escreva 2 parágrafos curtos explicando os motivos táticos pelos quais essa aposta tem alta consistência (ex: desfalques, fator casa, retrospecto de gols).`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      if (response.text) {
        analysis = response.text.trim();
      }
    } catch (err) {
      console.error("Erro ao gerar análise com Gemini para favorito:", err);
    }
  }

  const newPrediction = {
    id: "pred-" + Date.now(),
    championship: champ,
    homeTeam,
    awayTeam,
    date: new Date().toISOString().split('T')[0],
    time: "20:00",
    market,
    odd,
    confidence,
    analysis,
    status: "PENDENTE" as const,
    isPremium: true,
    createdAt: new Date().toISOString()
  };

  store.predictions.unshift(newPrediction);

  // Exclusiva notification
  const newNotif = {
    id: "notif-" + Date.now(),
    title: `🔔 Alerta de Favorito VIP!`,
    message: `Seu favorito ${team} tem palpite exclusivo no campeonato ${champ}! Mercado: ${market} com Odd ${odd.toFixed(2)}.`,
    type: "PREMIUM_PREDICTION" as const,
    createdAt: new Date().toISOString()
  };
  store.notifications.unshift(newNotif);

  saveStore();
  res.status(201).json(newPrediction);
});

app.put("/api/predictions/:id", (req, res) => {
  const { id } = req.params;
  const index = store.predictions.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Prediction not found" });
  }

  const oldStatus = store.predictions[index].status;
  const updated = { ...store.predictions[index], ...req.body };
  store.predictions[index] = updated;

  // If status changed to GREEN or RED, create notification
  if (oldStatus === "PENDENTE" && (updated.status === "GREEN" || updated.status === "RED")) {
    const notifyType = updated.status === "GREEN" ? "RESULT_GREEN" : "RESULT_RED";
    const emoji = updated.status === "GREEN" ? "✅ GREEN!" : "❌ RED (Ajustando...)";
    const notifyMessage = `${emoji} Resultado resolvido para: ${updated.homeTeam} vs ${updated.awayTeam} - Mercado: ${updated.market} (Odd ${updated.odd.toFixed(2)})`;
    
    const newNotif = {
      id: "notif-" + Date.now(),
      title: updated.status === "GREEN" ? "🎉 PALPITE CERTEIRO!" : "⚠️ PALPITE NÃO CONCRETIZADO",
      message: notifyMessage,
      type: notifyType,
      createdAt: new Date().toISOString()
    };
    store.notifications.unshift(newNotif);
  }

  saveStore();
  res.json(updated);
});

app.delete("/api/predictions/:id", (req, res) => {
  const { id } = req.params;
  store.predictions = store.predictions.filter(p => p.id !== id);
  saveStore();
  res.json({ success: true });
});

// 2. Ready Slips (Bilhete do Dia) CRUD
app.get("/api/ready-slips", (req, res) => {
  res.json(store.readySlips);
});

app.post("/api/ready-slips", (req, res) => {
  const newSlip = {
    id: "slip-" + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  store.readySlips.unshift(newSlip);

  // Auto-generate notification
  const newNotif = {
    id: "notif-" + Date.now(),
    title: "🎫 Novo Bilhete Pronto Disponível!",
    message: `Bilhete do Dia '${newSlip.title}' criado com Odd Total de ${newSlip.totalOdd.toFixed(2)}! Veja a sugestão de aposta.`,
    type: "READY_SLIP",
    createdAt: new Date().toISOString()
  };
  store.notifications.unshift(newNotif);

  saveStore();
  res.status(201).json(newSlip);
});

app.put("/api/ready-slips/:id", (req, res) => {
  const { id } = req.params;
  const index = store.readySlips.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Slip not found" });
  }
  store.readySlips[index] = { ...store.readySlips[index], ...req.body };
  saveStore();
  res.json(store.readySlips[index]);
});

app.delete("/api/ready-slips/:id", (req, res) => {
  const { id } = req.params;
  store.readySlips = store.readySlips.filter(s => s.id !== id);
  saveStore();
  res.json({ success: true });
});

// 2.5. Bingos CRUD
app.get("/api/bingos", (req, res) => {
  res.json(store.bingos);
});

app.post("/api/bingos", (req, res) => {
  const newBingo = {
    id: "bingo-" + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  store.bingos.unshift(newBingo);

  // Auto-generate notification
  const typeText = newBingo.isPremium ? "VIP 💎" : "Grátis 🚀";
  const newNotif = {
    id: "notif-" + Date.now(),
    title: `🎰 Novo Bingo do Dia ${typeText}!`,
    message: `Bingo '${newBingo.title}' com Odd de ${newBingo.totalOdd.toFixed(2)} foi lançado!`,
    type: newBingo.isPremium ? "PREMIUM_PREDICTION" : "FREE_PREDICTION",
    createdAt: new Date().toISOString()
  };
  store.notifications.unshift(newNotif);

  saveStore();
  res.status(201).json(newBingo);
});

app.put("/api/bingos/:id", (req, res) => {
  const { id } = req.params;
  const index = store.bingos.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Bingo not found" });
  }
  const oldStatus = store.bingos[index].status;
  const updated = { ...store.bingos[index], ...req.body };
  store.bingos[index] = updated;

  // Auto-generate notification if status changed to GREEN or RED
  if (oldStatus === "PENDENTE" && (updated.status === "GREEN" || updated.status === "RED")) {
    const emoji = updated.status === "GREEN" ? "✅ BINGO GREEN!" : "❌ BINGO RED";
    const titleText = updated.status === "GREEN" ? "🎉 ACERTAMOS O BINGO!" : "⚠️ BINGO ACUMULOU";
    const typeText = updated.isPremium ? "VIP 💎" : "Grátis 🚀";
    const message = `${emoji} O Bingo ${typeText} '${updated.title}' de Odd ${updated.totalOdd.toFixed(2)} foi resolvido!`;

    const newNotif = {
      id: "notif-" + Date.now(),
      title: titleText,
      message: message,
      type: updated.status === "GREEN" ? "RESULT_GREEN" : "RESULT_RED",
      createdAt: new Date().toISOString()
    };
    store.notifications.unshift(newNotif);
  }

  saveStore();
  res.json(updated);
});

app.delete("/api/bingos/:id", (req, res) => {
  const { id } = req.params;
  store.bingos = store.bingos.filter(b => b.id !== id);
  saveStore();
  res.json({ success: true });
});

// 3. User Management API
app.get("/api/users", (req, res) => {
  res.json(store.users);
});

app.post("/api/users", (req, res) => {
  const newUser = {
    id: "user-" + Date.now(),
    name: req.body.name || "Novo Usuário",
    email: req.body.email || "user@bancaforte.com",
    isPremium: req.body.isPremium || false,
    isAdmin: req.body.isAdmin || false,
    subscriptionType: req.body.subscriptionType || null,
    subscriptionExpiresAt: req.body.subscriptionExpiresAt || null,
    favorites: req.body.favorites || { championships: [], teams: [] },
    createdAt: new Date().toISOString()
  };
  store.users.push(newUser);
  saveStore();
  res.status(201).json(newUser);
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const index = store.users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  store.users[index] = { ...store.users[index], ...req.body };
  saveStore();
  res.json(store.users[index]);
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  store.users = store.users.filter(u => u.id !== id);
  saveStore();
  res.json({ success: true });
});

// 4. Statistics and Notifications APIs
app.get("/api/stats", (req, res) => {
  res.json(getSystemStats());
});

app.get("/api/finance-stats", (req, res) => {
  res.json(store.finance);
});

app.get("/api/notifications", (req, res) => {
  res.json(store.notifications);
});

app.post("/api/notifications", (req, res) => {
  const newNotif = {
    id: "notif-" + Date.now(),
    title: req.body.title || "Notificação do Sistema",
    message: req.body.message || "Novidades na Banca Forte esportiva!",
    type: req.body.type || "LIVE_ENTRY",
    createdAt: new Date().toISOString()
  };
  store.notifications.unshift(newNotif);
  saveStore();
  res.status(201).json(newNotif);
});

// 5. Authentication & Subscription Simulator Endpoints
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  // Simulating lookup
  const foundUser = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (foundUser) {
    return res.json({ user: foundUser });
  } else {
    // Create guest on the fly for seamless testing!
    const newUser = {
      id: "user-" + Date.now(),
      name: email.split("@")[0].toUpperCase(),
      email: email,
      isPremium: false,
      isAdmin: false,
      subscriptionType: null,
      subscriptionExpiresAt: null,
      favorites: { championships: [], teams: [] },
      createdAt: new Date().toISOString()
    };
    store.users.push(newUser);
    saveStore();
    return res.json({ user: newUser });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, phone, favoriteTeam, preferredMarket, planOfInterest, isAdmin } = req.body;
  const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Este e-mail já está cadastrado no Banca Forte." });
  }

  const isPremium = planOfInterest && planOfInterest !== "free";
  let subscriptionType = null;
  let subscriptionExpiresAt = null;
  if (isPremium) {
    subscriptionType = planOfInterest;
    const durationMap: Record<string, number> = {
      mensal: 30,
      trimestral: 90,
      semestral: 180,
      anual: 365
    };
    const days = durationMap[planOfInterest] || 30;
    subscriptionExpiresAt = new Date(Date.now() + days * 24 * 3600000).toISOString();
  }

  const newUser = {
    id: "user-" + Date.now(),
    name: name || "Jogador Forte",
    email: email.trim().toLowerCase(),
    phone: phone || "",
    favoriteTeam: favoriteTeam || "",
    preferredMarket: preferredMarket || "",
    isPremium,
    isAdmin: isAdmin || false,
    subscriptionType,
    subscriptionExpiresAt,
    favorites: { 
      championships: [], 
      teams: favoriteTeam ? [favoriteTeam] : [] 
    },
    createdAt: new Date().toISOString()
  };
  
  store.users.push(newUser);
  saveStore();
  res.json({ success: true, user: newUser });
});

app.post("/api/subscribe", (req, res) => {
  const { userId, planId } = req.body;
  const index = store.users.findIndex(u => u.id === userId);
  if (index === -1) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }

  const durationMap: Record<string, number> = {
    mensal: 30,
    trimestral: 90,
    semestral: 180,
    anual: 365
  };
  const days = durationMap[planId] || 30;
  const expiresAt = new Date(Date.now() + days * 24 * 3600000).toISOString();

  store.users[index].isPremium = true;
  store.users[index].subscriptionType = planId;
  store.users[index].subscriptionExpiresAt = expiresAt;

  // Add revenue to finances
  const prices: Record<string, number> = {
    mensal: 49.90,
    trimestral: 119.90,
    semestral: 199.90,
    anual: 299.90
  };
  const amount = prices[planId] || 49.90;
  store.finance.activeSubscribers += 1;
  store.finance.dailyRevenue += amount;
  store.finance.monthlyRevenue += amount;
  store.finance.renewalsCount += 1;

  // Notification log
  const newNotif = {
    id: "notif-" + Date.now(),
    title: "👑 Novo Assinante Premium!",
    message: `Parabéns ${store.users[index].name}! Sua assinatura ${planId} foi ativada com sucesso via Pix/Cartão de Crédito.`,
    type: "LIVE_ENTRY",
    createdAt: new Date().toISOString()
  };
  store.notifications.unshift(newNotif);

  saveStore();
  res.json({ success: true, user: store.users[index] });
});

// Helper functions for static Pix generation (BR Code)
function getCRC16(payload: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    const b = payload.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      const bit = ((b >> (7 - j)) & 1) === 1;
      const c15 = ((crc >> 15) & 1) === 1;
      crc <<= 1;
      if (c15 !== bit) {
        crc ^= polynomial;
      }
    }
  }

  crc &= 0xFFFF;
  let result = crc.toString(16).toUpperCase();
  return result.padStart(4, "0");
}

function generateStaticPix(key: string, name: string, amount: number, txid = "***"): string {
  const cleanKey = key.trim();
  const cleanName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-zA-Z0-9 ]/g, "") // Remove special characters
    .substring(0, 25)
    .toUpperCase();

  const formattedAmount = amount.toFixed(2);

  const part26 = `0014br.gov.bcb.pix01${cleanKey.length.toString().padStart(2, "0")}${cleanKey}`;
  const part26Block = `26${part26.length.toString().padStart(2, "0")}${part26}`;

  const part54Block = `54${formattedAmount.length.toString().padStart(2, "0")}${formattedAmount}`;

  const cleanNameFormatted = cleanName.trim() || "MARCELO CUNHA";
  const part59Block = `59${cleanNameFormatted.length.toString().padStart(2, "0")}${cleanNameFormatted}`;

  const part60Block = "6009SAO PAULO";

  const part62 = `05${txid.length.toString().padStart(2, "0")}${txid}`;
  const part62Block = `62${part62.length.toString().padStart(2, "0")}${part62}`;

  const payload = `000201${part26Block}520400005303986${part54Block}5802BR${part59Block}${part60Block}${part62Block}6304`;
  const crc = getCRC16(payload);

  return `${payload}${crc}`;
}

// System settings routes
app.get("/api/settings", (req, res) => {
  res.json(store.settings || {
    pixKey: "19119119100",
    pixName: "Marcelo Cunha",
    pixCity: "SAO PAULO",
    telegramLink: "https://t.me/+ExemploGrupoBancaForte",
    telegramBotToken: "",
    telegramChatId: ""
  });
});

app.post("/api/settings", (req, res) => {
  const { pixKey, pixName, pixCity, telegramLink, telegramBotToken, telegramChatId } = req.body;
  
  store.settings = {
    pixKey: pixKey || "19119119100",
    pixName: pixName || "Marcelo Cunha",
    pixCity: pixCity || "SAO PAULO",
    telegramLink: telegramLink || "https://t.me/+ExemploGrupoBancaForte",
    telegramBotToken: telegramBotToken || "",
    telegramChatId: telegramChatId || ""
  };
  
  saveStore();
  res.json({ success: true, settings: store.settings });
});

// Send daily tips to Telegram API
app.post("/api/telegram/send-tips", async (req, res) => {
  const settings = store.settings || { telegramLink: "", telegramBotToken: "", telegramChatId: "" };
  const botToken = settings.telegramBotToken;
  const chatId = settings.telegramChatId;
  const inviteLink = settings.telegramLink;

  // Format today's predictions & bingos
  const predictions = store.predictions || [];
  const bingos = store.bingos || [];

  // Filter for today's date (or pending/live ones)
  const todayStr = new Date().toISOString().split("T")[0];
  const activePreds = predictions.filter(p => p.status === "PENDENTE");
  const activeBingos = bingos.filter(b => b.status === "PENDENTE");

  if (activePreds.length === 0 && activeBingos.length === 0) {
    return res.json({ success: false, message: "Não há palpites pendentes/ativos cadastrados para hoje." });
  }

  // Construct message with HTML formatting
  let msg = `<b>🎰 BANCA FORTE TIPS - PALPITES DO DIA 🎰</b>\n\n`;

  if (activePreds.length > 0) {
    msg += `⚽ <b>PALPITES SELECIONADOS:</b>\n`;
    activePreds.forEach((pred) => {
      msg += `• <b>${pred.homeTeam} vs ${pred.awayTeam}</b> (${pred.championship})\n`;
      msg += `  👉 <b>Palpite:</b> ${pred.market}\n`;
      msg += `  📈 <b>Odd:</b> @${Number(pred.odd).toFixed(2)} | Confiança: ${pred.confidence}%\n`;
      if (pred.analysis) {
        msg += `  📝 <i>Análise:</i> ${pred.analysis.substring(0, 120)}...\n`;
      }
      msg += `\n`;
    });
  }

  if (activeBingos.length > 0) {
    msg += `🏆 <b>BINGOS DO DIA (MÚLTIPLAS ACUMULADAS):</b>\n`;
    activeBingos.forEach((bingo) => {
      msg += `• <b>${bingo.title || "Bingo Acumulado"}</b>\n`;
      msg += `  🔥 <b>Odd Total:</b> @${Number(bingo.totalOdd).toFixed(2)}\n`;
      if (bingo.selections && bingo.selections.length > 0) {
        bingo.selections.forEach((sel: any) => {
          msg += `  ✅ ${sel.homeTeam} x ${sel.awayTeam} (${sel.market}) @${Number(sel.odd).toFixed(2)}\n`;
        });
      }
      msg += `\n`;
    });
  }

  if (inviteLink) {
    msg += `🚀 <b>Acesse o Aplicativo para Todas as Análises:</b> <a href="${inviteLink}">Clique aqui para entrar</a>\n`;
  }

  let realSent = false;
  let apiResponse = "";

  if (botToken && chatId) {
    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: msg,
          parse_mode: "HTML",
          disable_web_page_preview: true
        })
      });
      const data: any = await response.json();
      realSent = data.ok === true;
      apiResponse = JSON.stringify(data);
    } catch (err: any) {
      console.error("Erro ao enviar para Telegram:", err);
      apiResponse = err.message || "Erro de conexão";
    }
  }

  res.json({
    success: true,
    message: realSent 
      ? "Palpites enviados com sucesso para o Telegram real!"
      : "Palpites formatados com sucesso (Simulado ou Falhou bot/chat ID). Verifique suas credenciais de Bot.",
    formattedMessage: msg,
    realSent,
    apiResponse
  });
});

// Mercado Pago Payment Integration
app.post("/api/payments/mercadopago/create", async (req, res) => {
  const { userId, planId } = req.body;
  const index = store.users.findIndex(u => u.id === userId);
  if (index === -1) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }

  const user = store.users[index];

  const prices: Record<string, number> = {
    duplo_bingo: 5.00,
    mensal: 49.90,
    trimestral: 119.90,
    semestral: 199.90,
    anual: 299.90
  };
  const amount = prices[planId] || 49.90;

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (accessToken && accessToken.trim() !== "") {
    try {
      console.log(`[Mercado Pago] Creating real Pix payment of R$${amount} for user ${user.email}`);
      const payload = {
        transaction_amount: amount,
        description: `Assinatura VIP Banca Forte - Plano ${planId.toUpperCase()}`,
        payment_method_id: "pix",
        payer: {
          email: user.email || "usuario@bancaforte.com",
          first_name: user.name ? user.name.split(" ")[0] : "Jogador",
          last_name: user.name ? user.name.split(" ").slice(1).join(" ") || "Forte" : "Forte",
          identification: {
            type: "CPF",
            number: "19119119100" // Generic sandbox/production CPF
          }
        }
      };

      const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": `idemp-${userId}-${Date.now()}`
        },
        body: JSON.stringify(payload)
      });

      if (mpRes.ok) {
        const data = (await mpRes.json()) as any;
        console.log(`[Mercado Pago] Real payment successfully created! ID: ${data.id}`);
        return res.json({
          success: true,
          isSimulated: false,
          paymentId: data.id.toString(),
          status: data.status,
          qrCode: data.point_of_interaction?.transaction_data?.qr_code,
          qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64,
          ticketUrl: data.point_of_interaction?.transaction_data?.ticket_url,
          amount
        });
      } else {
        const errText = await mpRes.text();
        console.error("[Mercado Pago] API response error:", errText);
        // Fallback to simulation if token is bad or sandbox failed, to keep app functional
      }
    } catch (err) {
      console.error("[Mercado Pago] Exception during payment creation:", err);
    }
  }

  // High-fidelity fallback Simulator Mode / Direct Owner Pix Key
  console.log(`[Mercado Pago] Generating direct Pix payment of R$${amount} using Owner settings for user ${user.email}`);
  const simulatedPaymentId = `mp-sim-${Date.now()}`;
  
  // Create a valid EMV BR Code Pix payload based on owner settings
  const pixKey = store.settings?.pixKey || "19119119100";
  const pixName = store.settings?.pixName || "Marcelo Cunha";
  const realPixCode = generateStaticPix(pixKey, pixName, amount);
  
  // Use a public free dynamic QR Code API to render the BR Code on the fly as an image URL
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(realPixCode)}`;

  res.json({
    success: true,
    isSimulated: true,
    paymentId: simulatedPaymentId,
    status: "pending",
    qrCode: realPixCode,
    qrCodeBase64: qrCodeImageUrl, // Returned as direct image URL
    ticketUrl: "https://www.mercadopago.com.br",
    amount
  });
});

app.get("/api/payments/mercadopago/status/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  const { userId, planId, forceApprove } = req.query;

  if (!userId || !planId) {
    return res.status(400).json({ error: "Missing userId or planId parameters" });
  }

  // 1. Handle Simulator mode
  if (paymentId.startsWith("mp-sim-") || forceApprove === "true") {
    const shouldApprove = forceApprove === "true";
    
    if (shouldApprove) {
      const index = store.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        const user = store.users[index];
        const isDuplo = planId === "duplo_bingo";
        if (!user.isPremium || isDuplo) {
          const durationMap: Record<string, number> = {
            duplo_bingo: 1,
            mensal: 30,
            trimestral: 90,
            semestral: 180,
            anual: 365
          };
          const days = durationMap[planId as string] || 30;
          const expiresAt = new Date(Date.now() + days * 24 * 3600000).toISOString();

          store.users[index].isPremium = isDuplo ? false : true;
          store.users[index].subscriptionType = planId as string;
          store.users[index].subscriptionExpiresAt = expiresAt;

          const prices: Record<string, number> = {
            duplo_bingo: 5.00,
            mensal: 49.90,
            trimestral: 119.90,
            semestral: 199.90,
            anual: 299.90
          };
          const amount = prices[planId as string] || 49.90;
          if (!isDuplo) {
            store.finance.activeSubscribers += 1;
          }
          store.finance.dailyRevenue += amount;
          store.finance.monthlyRevenue += amount;
          store.finance.renewalsCount += 1;

          // Notification log
          const newNotif = {
            id: "notif-" + Date.now(),
            title: isDuplo ? "🎰 Novo Pacote Duplo Bingo!" : "👑 Novo Assinante Premium!",
            message: isDuplo
              ? `Parabéns ${store.users[index].name}! Seu pacote de 2 Bingos Diários foi ativado com sucesso via Mercado Pago (Pix Simulado).`
              : `Parabéns ${store.users[index].name}! Sua assinatura ${planId} foi ativada com sucesso via Mercado Pago (Pix Simulado).`,
            type: "LIVE_ENTRY",
            createdAt: new Date().toISOString()
          };
          store.notifications.unshift(newNotif);
          saveStore();
        }
        return res.json({ status: "approved", isSimulated: true, user: store.users[index] });
      }
    }
    return res.json({ status: "pending", isSimulated: true });
  }

  // 2. Real Mercado Pago api check
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return res.json({ status: "pending", isSimulated: true });
  }

  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (mpRes.ok) {
      const data = (await mpRes.json()) as any;
      const status = data.status; // "approved", "pending", "in_process", "rejected", etc
      
      if (status === "approved") {
        const index = store.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          const user = store.users[index];
          const isDuplo = planId === "duplo_bingo";
          if (!user.isPremium || isDuplo) {
            const durationMap: Record<string, number> = {
              duplo_bingo: 1,
              mensal: 30,
              trimestral: 90,
              semestral: 180,
              anual: 365
            };
            const days = durationMap[planId as string] || 30;
            const expiresAt = new Date(Date.now() + days * 24 * 3600000).toISOString();

            store.users[index].isPremium = isDuplo ? false : true;
            store.users[index].subscriptionType = planId as string;
            store.users[index].subscriptionExpiresAt = expiresAt;

            const prices: Record<string, number> = {
              duplo_bingo: 5.00,
              mensal: 49.90,
              trimestral: 119.90,
              semestral: 199.90,
              anual: 299.90
            };
            const amount = prices[planId as string] || 49.90;
            if (!isDuplo) {
              store.finance.activeSubscribers += 1;
            }
            store.finance.dailyRevenue += amount;
            store.finance.monthlyRevenue += amount;
            store.finance.renewalsCount += 1;

            const newNotif = {
              id: "notif-" + Date.now(),
              title: isDuplo ? "🎰 Novo Pacote Duplo Bingo!" : "👑 Novo Assinante Premium!",
              message: isDuplo
                ? `Parabéns ${store.users[index].name}! Seu pacote de 2 Bingos Diários foi ativado com sucesso via Mercado Pago.`
                : `Parabéns ${store.users[index].name}! Sua assinatura ${planId} foi ativada com sucesso via Mercado Pago (Aprovado).`,
              type: "LIVE_ENTRY",
              createdAt: new Date().toISOString()
            };
            store.notifications.unshift(newNotif);
            saveStore();
          }
        }
      }

      return res.json({ status, isSimulated: false, user: store.users.find(u => u.id === userId) });
    } else {
      const errText = await mpRes.text();
      console.error("[Mercado Pago] Status lookup API error:", errText);
      return res.status(mpRes.status).json({ error: "Failed to fetch status from Mercado Pago" });
    }
  } catch (err: any) {
    console.error("[Mercado Pago] Status exception:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 6. INTELLIGENT ODD COMBINATOR & AI SUGGESTION
// Using Gemini model if initialized, otherwise providing an advanced statistical matching system
app.post("/api/ai/suggest", async (req, res) => {
  const { targetOdd, teamHome, teamAway, championship } = req.body;
  const oddVal = parseFloat(targetOdd) || 2.50;

  // Define some markets and realistic sub-odds that can combine to reach roughly the target odd
  const subMarkets = [
    { name: "Resultado Final (Vitória Casa)", weight: 1.85, type: "Resultado Final" },
    { name: "Resultado Final (Empate)", weight: 3.20, type: "Resultado Final" },
    { name: "Resultado Final (Vitória Visitante)", weight: 2.40, type: "Resultado Final" },
    { name: "Dupla Chance (Casa ou Empate)", weight: 1.30, type: "Dupla Chance" },
    { name: "Dupla Chance (Visitante ou Empate)", weight: 1.45, type: "Dupla Chance" },
    { name: "Ambas Marcam (Sim)", weight: 1.80, type: "Ambas Marcam" },
    { name: "Ambas Marcam (Não)", weight: 1.95, type: "Ambas Marcam" },
    { name: "Over 1.5 Gols", weight: 1.28, type: "Over/Under" },
    { name: "Over 2.5 Gols", weight: 1.82, type: "Over/Under" },
    { name: "Under 2.5 Gols", weight: 1.75, type: "Over/Under" },
    { name: "Escanteios Over 8.5", weight: 1.45, type: "Escanteios" },
    { name: "Escanteios Over 9.5", weight: 1.78, type: "Escanteios" },
    { name: "Cartões Over 3.5", weight: 1.55, type: "Cartões" },
    { name: "Chutes ao Gol Over 7.5", weight: 1.60, type: "Chutes ao Gol" },
    { name: "Primeiro Tempo (Empate)", weight: 2.10, type: "Primeiro Tempo" },
    { name: "Próximo Gol (Casa)", weight: 1.50, type: "Próximo Gol" }
  ];

  // Combine items to match approximately the requested odd
  // E.g. combination of two elements whose multiplication is near oddVal
  let bestCombination: typeof subMarkets = [];
  let bestProduct = 1.0;
  let minDiff = 999.0;

  // Let's search pairs
  for (let i = 0; i < subMarkets.length; i++) {
    for (let j = i + 1; j < subMarkets.length; j++) {
      // Avoid duplicate types (e.g. don't combine Over 2.5 and Under 2.5 or double Resultado Final)
      if (subMarkets[i].type === subMarkets[j].type) continue;
      
      const prod = subMarkets[i].weight * subMarkets[j].weight;
      const diff = Math.abs(prod - oddVal);
      if (diff < minDiff) {
        minDiff = diff;
        bestProduct = prod;
        bestCombination = [subMarkets[i], subMarkets[j]];
      }
    }
  }

  // Also try single if single matches
  for (let i = 0; i < subMarkets.length; i++) {
    const diff = Math.abs(subMarkets[i].weight - oddVal);
    if (diff < minDiff) {
      minDiff = diff;
      bestProduct = subMarkets[i].weight;
      bestCombination = [subMarkets[i]];
    }
  }

  // Also try triples if target is very high
  if (oddVal > 3.0) {
    for (let i = 0; i < subMarkets.length; i++) {
      for (let j = i + 1; j < subMarkets.length; j++) {
        for (let k = j + 1; k < subMarkets.length; k++) {
          if (subMarkets[i].type === subMarkets[j].type || subMarkets[j].type === subMarkets[k].type || subMarkets[i].type === subMarkets[k].type) continue;
          const prod = subMarkets[i].weight * subMarkets[j].weight * subMarkets[k].weight;
          const diff = Math.abs(prod - oddVal);
          if (diff < minDiff) {
            minDiff = diff;
            bestProduct = prod;
            bestCombination = [subMarkets[i], subMarkets[j], subMarkets[k]];
          }
        }
      }
    }
  }

  // Default mock names if not supplied
  const home = teamHome || "Flamengo";
  const away = teamAway || "Fluminense";
  const champ = championship || "Série A (Brasil)";
  const finalCombinationText = bestCombination.map(c => `${c.name} (${c.weight.toFixed(2)})`).join(" + ");

  // Fallback default generated analysis
  let aiAnalysis = `Análise Estatística para ${home} vs ${away} no campeonato ${champ}:\n\n` +
    `1. Forma Recente: O ${home} possui 65% de aproveitamento nos últimos 5 jogos em casa, com média de 1.8 gols marcados.\n` +
    `2. Histórico de Confrontos: Nos últimos 3 confrontos diretos, tivemos média de 2.3 gols por partida, com forte tendência de mercados de cantos e ambas marcam.\n` +
    `3. Sugestão de Entrada: A combinação de mercados sugerida é: **${finalCombinationText}** perfazendo uma Odd final de **${bestProduct.toFixed(2)}** (Alvo: ${oddVal.toFixed(2)}).\n` +
    `4. Grau de Confiança: Recomendamos Gestão de Banca Neutra/Moderada com 82% de confiança tática de acordo com desfalques recentes.`;

  let usedAI = false;

  if (ai) {
    try {
      const prompt = `Você é a IA de Apostas Esportivas oficial da plataforma "Banca Forte".
O operador solicitou uma sugestão inteligente de palpites com base em:
- Campeonato: ${champ}
- Time da Casa: ${home}
- Time Visitante: ${away}
- Odd Alvo Desejada do Dia: ${oddVal.toFixed(2)}

Você deve retornar uma resposta em formato JSON estrito correspondente aos campos de palpite necessários.
A odd final sugerida deve ser o mais próximo possível de ${oddVal.toFixed(2)}. Você pode inventar uma ou mais combinações de mercados específicos (como Ambas Marcam, Over de gols, vitória, escanteios, dupla chance, etc.) que façam sentido tático para este confronto.
Gere também uma análise tática e profissional em Português do Brasil (PT-BR) com dados inventados porém realistas sobre estatísticas recentes das duas equipes, histórico recente de forma, desfalques imaginados de destaque, e média de gols recente.

Sua resposta deve ser EXCLUSIVAMENTE um objeto JSON válido, sem markdown extra ou tags adicionais. Use o seguinte esquema:
{
  "championship": "${champ}",
  "homeTeam": "${home}",
  "awayTeam": "${away}",
  "market": "Nome do mercado ou combinação proposta",
  "odd": ${bestProduct.toFixed(2)},
  "confidence": 85,
  "analysis": "Sua análise tática detalhada e profissional estruturada em 2 ou 3 parágrafos explicativos em PT-BR"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      const cleaned = responseText.trim().replace(/^```json\s*/, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.market && parsed.odd) {
        aiAnalysis = parsed.analysis;
        const resObj = {
          championship: parsed.championship || champ,
          homeTeam: parsed.homeTeam || home,
          awayTeam: parsed.awayTeam || away,
          market: parsed.market,
          odd: parseFloat(parsed.odd) || bestProduct,
          confidence: parseInt(parsed.confidence) || 82,
          analysis: aiAnalysis,
          usedAI: true
        };
        return res.json(resObj);
      }
    } catch (err) {
      console.error("Failed to generate with Gemini, falling back to smart heuristic engine:", err);
    }
  }

  // Heuristic response
  res.json({
    championship: champ,
    homeTeam: home,
    awayTeam: away,
    market: bestCombination.length > 1 ? `Criador de Apostas: ${bestCombination.map(c => c.name).join(" & ")}` : bestCombination[0]?.name || "Resultado Final",
    odd: parseFloat(bestProduct.toFixed(2)),
    confidence: 82,
    analysis: aiAnalysis,
    usedAI: false
  });
});

// Configure Vite or Serve Static Production Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Banca Forte server is running on http://localhost:${PORT}`);
  });
}

startServer();
