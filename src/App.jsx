// FitPro v7 - Retention-focused upgrade
// Built on v6 architecture — nothing removed, everything enhanced
// New: XP/Levels, Daily Missions, North Star Goal, Post-Workout Celebration,
//      Smart Daily Loop, Contextual Upsell, Enhanced AI Coach

import {
  useState, useEffect, useRef, useMemo, useCallback,
  useReducer, createContext, useContext, memo,
} from "react";

// ─── THEME ───────────────────────────────────────────────────────────────────
var T = Object.freeze({
  bg: "#080808", surface: "#111111", surface2: "#181818",
  border: "#1f1f1f", border2: "#2a2a2a",
  orange: "#F97316", orangeHi: "#FB923C", orangeLo: "#7C3B0D", orangeGl: "#F9731615",
  text: "#F5F5F5", text2: "#A0A0A0", text3: "#555555",
  green: "#22C55E", red: "#EF4444", blue: "#3B82F6", yellow: "#EAB308",
  purple: "#A855F7", purpleGl: "#A855F715",
});

var FONTS = "@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');";

var GLOBAL_CSS = "\n" +
  "* { box-sizing: border-box; margin: 0; padding: 0; }\n" +
  "html, body { width: 100%; min-height: 100%; background: " + T.bg + "; }\n" +
  "input,textarea,button,select { font-family: 'DM Sans', sans-serif; }\n" +
  "input[type=range] { width: 100%; accent-color: " + T.orange + "; }\n" +
  "::-webkit-scrollbar { width: 0; height: 0; }\n" +
  "::placeholder { color: " + T.text3 + "; }\n" +
  "@keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }\n" +
  "@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }\n" +
  "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }\n" +
  "@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }\n" +
  "@keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }\n" +
  "@keyframes xpPop { 0% { opacity: 0; transform: translateY(0) scale(0.8); } 40% { opacity: 1; transform: translateY(-16px) scale(1.1); } 100% { opacity: 0; transform: translateY(-40px) scale(1); } }\n" +
  "@keyframes streakPulse { 0%,100% { box-shadow: 0 0 0 0 " + T.orange + "44; } 50% { box-shadow: 0 0 0 8px " + T.orange + "00; } }\n" +
  "@keyframes barFill { from { width: 0%; } to { width: var(--bar-w); } }\n" +
  "@keyframes celebIn { 0% { opacity: 0; transform: scale(0.85) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }\n";

// ─── EXERCISE DATA ────────────────────────────────────────────────────────────
var MUSCLE_ICONS = Object.freeze({
  peito: "🫁", costas: "🦾", ombro: "🔝", biceps: "💪",
  triceps: "🔙", pernas: "🦵", core: "🔩", cardio: "🏃",
});

var EXERCISE_DB = Object.freeze({
  peito: [
    ["Supino Reto","3x10","60s",2,"Peitoral maior","Deite no banco, pes no chao. Agarre a barra na largura dos ombros. Desca controlado ate o peito e empurre. Mantenha omoplatas retraidas.","https://www.youtube.com/watch?v=rT7DgCr-3pg"],
    ["Supino Inclinado","3x12","60s",2,"Peitoral superior","Banco a 30-45 graus. Cotovelo a 75 graus do corpo. Foco no peitoral superior.","https://www.youtube.com/watch?v=DbFgADa2PL8"],
    ["Crucifixo","3x12","45s",1,"Peitoral","Ligeiro cotovelo flexionado. Amplitude controlada. Sinta o alongamento.","https://www.youtube.com/watch?v=eozdVDA78K0"],
    ["Flexao","3x15","45s",1,"Peitoral e triceps","Maos alinhadas com o peito. Corpo reto. Desca ate quase tocar o chao.",""],
    ["Peck Deck","3x12","45s",1,"Peitoral","Cotovelos na almofada. Junte lentamente. Segure 1s no pico.",""],
  ],
  costas: [
    ["Puxada Frontal","4x10","60s",2,"Dorsais","Pegada pronada larga. Puxe ate o queixo. Ative o dorsal, nao o biceps.","https://www.youtube.com/watch?v=CAwf7n6Luuc"],
    ["Remada Curvada","4x10","60s",2,"Dorsais e trapezio","Quadril para tras, lombar neutra. Puxe ate o umbigo.","https://www.youtube.com/watch?v=G8l_8chR5BE"],
    ["Remada Unilateral","3x12","45s",1,"Dorsal","Apoio no banco. Puxe o cotovelo para tras e para cima.",""],
    ["Pull-up","3x8","90s",3,"Dorsais e biceps","Pegada pronada. Puxe ate o queixo acima da barra. Desca completamente.",""],
  ],
  ombro: [
    ["Desenvolvimento","4x10","60s",2,"Deltoide","Barra na clavicula. Pressione acima da cabeca. Nao incline para tras.",""],
    ["Elevacao Lateral","3x15","45s",1,"Deltoide lateral","Leve flexao no cotovelo. Eleve ate a altura do ombro.",""],
    ["Elevacao Frontal","3x12","45s",1,"Deltoide anterior","Eleve ate a altura dos ombros. Alternar ou simultaneo.",""],
    ["Face Pull","3x15","45s",1,"Deltoide posterior","Polia alta. Puxe ate a altura do rosto com rotacao externa.",""],
  ],
  biceps: [
    ["Rosca Direta","3x12","45s",1,"Biceps","Cotovelos fixos. Supinacao no topo. Nao balance o tronco.",""],
    ["Rosca Alternada","3x12","45s",1,"Biceps","Alterne os bracos. Supine o punho durante a subida.",""],
    ["Rosca Martelo","3x10","45s",1,"Biceps braquial","Pegada neutra. Trabalha cabeca longa do biceps.",""],
    ["Rosca Concentrada","3x12","30s",1,"Biceps","Cotovelo apoiado na coxa. Maxima amplitude e isolamento.",""],
  ],
  triceps: [
    ["Triceps Pulley","4x12","45s",1,"Triceps","Cotovelos fixos. Puxe ate bracos paralelos ao corpo.",""],
    ["Triceps Testa","3x12","45s",2,"Triceps cabeca longa","Deite no banco. Desca a barra ate a testa. Cotovelos fixos.",""],
    ["Mergulho","3x10","60s",2,"Triceps e peitoral","Desca ate 90 graus. Corpo levemente inclinado para triceps.",""],
    ["Triceps Corda","3x15","45s",1,"Triceps","Abra a corda na parte inferior. Extensao completa.",""],
  ],
  pernas: [
    ["Agachamento Livre","4x10","90s",3,"Quadriceps e gluteos","Pes na largura dos ombros. Desca ate coxa paralela. Lombar neutra.",""],
    ["Leg Press","4x12","60s",2,"Quadriceps","Pes no centro da plataforma. Nao arredonde a lombar.",""],
    ["Cadeira Extensora","3x15","45s",1,"Quadriceps","Isolamento. Estenda ate quase travar. Segure 1s.",""],
    ["Mesa Flexora","3x12","45s",1,"Isquiotibiais","Quadril fixo. Flexione ate 90 graus. Desca controlado.",""],
    ["Stiff","3x12","60s",2,"Isquiotibiais","Pernas quase estendidas. Quadril para tras. Lombar neutra.",""],
    ["Afundo","3x12","45s",2,"Quadriceps e gluteos","Passo largo. Joelho nao passa a ponta do pe.",""],
  ],
  core: [
    ["Prancha","3x45s","30s",1,"Core completo","Cotovelos sob ombros. Corpo reto. Contraia o abdomen.",""],
    ["Abdominal Crunch","3x20","30s",1,"Reto abdominal","Maos atras da cabeca. Suba usando o abdomen.",""],
    ["Elevacao de Pernas","3x15","30s",2,"Abdomen inferior","Pernas retas, eleve ate 90 graus. Lombar no chao.",""],
    ["Russian Twist","3x20","30s",1,"Obliquos","Rotacao de lado a lado. Com ou sem peso.",""],
  ],
  cardio: [
    ["Esteira Moderada","20min","--",1,"Cardiovascular","Velocidade 7-9 km/h. FC entre 60-70% da maxima.",""],
    ["HIIT","15min","--",3,"Cardiovascular","30s intenso / 30s recuperacao. FC acima de 85% nos tiros.",""],
    ["Bicicleta","20min","--",1,"Cardiovascular","Resistencia moderada. Cadencia 80-100 rpm.",""],
    ["Corda","15min","--",2,"Cardiovascular","Series de 2-3 min com 30s de descanso.",""],
  ],
});

var SPLITS = Object.freeze({
  2: [
    { name: "Full Body A", groups: ["peito","costas","pernas","core"] },
    { name: "Full Body B", groups: ["ombro","biceps","triceps","pernas","cardio"] },
  ],
  3: [
    { name: "Push - Empurrar", groups: ["peito","ombro","triceps"] },
    { name: "Pull - Puxar",    groups: ["costas","biceps"] },
    { name: "Legs + Core",     groups: ["pernas","core","cardio"] },
  ],
  4: [
    { name: "Peito + Triceps", groups: ["peito","triceps"] },
    { name: "Costas + Biceps", groups: ["costas","biceps"] },
    { name: "Pernas",          groups: ["pernas","core"] },
    { name: "Ombros + Cardio", groups: ["ombro","cardio"] },
  ],
  5: [
    { name: "Peito",          groups: ["peito","triceps"] },
    { name: "Costas",         groups: ["costas","biceps"] },
    { name: "Pernas",         groups: ["pernas"] },
    { name: "Ombros + Core",  groups: ["ombro","core"] },
    { name: "Cardio + Full",  groups: ["cardio","core"] },
  ],
});

var LEG_SPORTS = ["basquete","basketball","futebol","soccer","volei","volleyball","corrida","running","natacao","ciclismo","tenis"];

// ─── GOAL & MEAL DATA ─────────────────────────────────────────────────────────
var GOAL_META = Object.freeze({
  massa:           { short: "Massa",  long: "ganhar massa muscular",          diet: "Hipercalorico" },
  emagrecer:       { short: "Cutting",long: "emagrecer e definir",            diet: "Deficit Calorico" },
  condicionamento: { short: "Cardio", long: "melhorar condicionamento fisico", diet: "Manutencao" },
});

var MEAL_PLANS = Object.freeze({
  massa: [
    { time: "07:00", name: "Cafe da Manha", desc: "3 ovos mexidos + aveia 60g + banana + 200ml leite", kcal: 550 },
    { time: "10:00", name: "Lanche",        desc: "Iogurte grego 170g + castanhas 30g + mel",          kcal: 300 },
    { time: "13:00", name: "Almoco",        desc: "Arroz 150g + feijao + frango 180g + salada",        kcal: 700 },
    { time: "16:00", name: "Pre-Treino",    desc: "Batata-doce 200g + peito de frango 150g",           kcal: 400 },
    { time: "19:00", name: "Pos-Treino",    desc: "Whey 30g + banana + amendoim 30g",                  kcal: 350 },
    { time: "21:30", name: "Ceia",          desc: "Omelete 3 ovos + queijo cottage 100g",              kcal: 300 },
  ],
  emagrecer: [
    { time: "07:00", name: "Cafe da Manha", desc: "2 ovos cozidos + torrada integral + cafe s/ acucar", kcal: 350 },
    { time: "10:00", name: "Lanche",        desc: "Frutas 200g + iogurte natural 170g",                 kcal: 200 },
    { time: "13:00", name: "Almoco",        desc: "Salada + frango grelhado 180g + legumes",            kcal: 450 },
    { time: "16:00", name: "Lanche",        desc: "Castanhas 20g + cha sem acucar",                     kcal: 180 },
    { time: "19:00", name: "Jantar",        desc: "Peixe 200g + vegetais refogados 200g",               kcal: 380 },
  ],
  condicionamento: [
    { time: "07:00", name: "Cafe da Manha", desc: "Aveia 50g + mix de frutas + 2 ovos",               kcal: 450 },
    { time: "12:30", name: "Almoco",        desc: "Arroz 130g + frango 160g + salada mista",           kcal: 600 },
    { time: "16:00", name: "Lanche",        desc: "Tapioca 2 unid + queijo + suco natural 200ml",      kcal: 300 },
    { time: "20:00", name: "Jantar",        desc: "Macarrao integral 120g + atum + azeite",            kcal: 500 },
  ],
});

// ─── PLAN CONFIG ──────────────────────────────────────────────────────────────
var CHAT_MAX     = 30;
var FREE_MSG_DAY = 5;

var PLAN_CONFIG = Object.freeze([
  {
    id: "free", name: "Gratuito", price: "R$0", sub: "para sempre",
    color: "#A0A0A0", badge: null, cta: "Continuar gratis", highlight: false, monthly: 0,
    features: [
      "Treino semanal adaptado e inteligente",
      "Sistema de XP e nivelamento",
      "Missoes diarias + streak visual",
      FREE_MSG_DAY + " msgs/dia no Coach IA",
      "Progresso e historico basico",
    ],
    locked: [
      "Treino 100% personalizado com IA",
      "Plano alimentar com seus ingredientes",
      "Chat ilimitado com memoria completa",
      "Analise pos-treino da IA",
      "Graficos avancados de evolucao",
      "Planejador semanal inteligente",
    ],
  },
  {
    id: "pro", name: "Pro", price: "R$19,90", sub: "/mes - 7 dias gratis",
    color: "#F97316", badge: "MAIS POPULAR", cta: "Comecar 7 dias gratis", highlight: true, monthly: 19.90,
    features: [
      "Tudo do plano Gratuito",
      "Treino IA com series, tecnicas e periodizacao",
      "Plano alimentar pelos ingredientes que voce tem",
      "Chat ilimitado com memoria do historico",
      "Analise pos-treino personalizada com IA",
      "Graficos avancados + analise de evolucao",
      "Planejador semanal inteligente",
      "Sem anuncios - Suporte prioritario",
    ],
    locked: [],
  },
  {
    id: "annual", name: "Pro Anual", price: "R$149", sub: "/ano - economize 38%",
    color: "#22C55E", badge: "MELHOR CUSTO", cta: "Assinar anualmente", highlight: false, monthly: 12.42,
    features: [
      "Tudo do Pro",
      "Equivale a R$12,42/mes",
      "Acesso a todas as atualizacoes do ano",
    ],
    locked: [],
  },
]);

var NAV_ITEMS = Object.freeze([
  { id: "home",      icon: "⚡", label: "Inicio" },
  { id: "workout",   icon: "🏋️", label: "Treinos" },
  { id: "coach",     icon: "🤖", label: "Coach" },
  { id: "nutrition", icon: "🥗", label: "Nutricao" },
  { id: "progress",  icon: "📈", label: "Progresso" },
]);

// ─── GAMIFICATION CONSTANTS (NEW v7) ─────────────────────────────────────────
// XP rewards
var XP_WORKOUT_COMPLETE = 120;
var XP_WORKOUT_PARTIAL  = 60;
var XP_CHECKIN_REST     = 20;
var XP_MISSION_DONE     = 30;
var XP_STREAK_BONUS_7   = 50;  // every 7-day streak milestone

// Level = floor(sqrt(totalXP / 80)) + 1, max 50
function xpToLevel(xp) {
  return Math.min(50, Math.floor(Math.sqrt(Math.max(0, xp) / 80)) + 1);
}

function levelToXpNeeded(level) {
  return Math.pow(level, 2) * 80;
}

function levelToXpNeededForNext(level) {
  return Math.pow(level + 1, 2) * 80;
}

// XP within the current level (0..xpForNext)
function xpInCurrentLevel(totalXP) {
  var lvl = xpToLevel(totalXP);
  var base = levelToXpNeeded(lvl);
  var next = levelToXpNeededForNext(lvl);
  return { current: totalXP - base, total: next - base, pct: Math.min(100, Math.round(((totalXP - base) / (next - base)) * 100)) };
}

// Level names
var LEVEL_TITLES = [
  "Novato","Iniciante","Aprendiz","Determinado","Dedicado",
  "Consistente","Focado","Resistente","Disciplinado","Experiente",
  "Veterano","Avancado","Elite","Mestre","Lenda",
];
function getLevelTitle(level) {
  var idx = Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 4));
  return LEVEL_TITLES[idx];
}

// Daily missions generator (3 per day, deterministic by date)
function generateDailyMissions(profile, logs) {
  var goal = (profile && profile.goal) || "condicionamento";
  var dateKey = new Date().toDateString();
  var trainedToday = logs.some(function(l) { return l.date === dateKey && l.trained; });

  var allMissions = [
    { id: "train", icon: "🏋️", label: "Completar o treino de hoje", xp: XP_MISSION_DONE, done: trainedToday },
    { id: "water", icon: "💧", label: "Beber 2L de agua", xp: XP_MISSION_DONE, done: false },
    { id: "sleep", icon: "😴", label: "Dormir 7h ou mais hoje", xp: XP_MISSION_DONE, done: false },
    { id: "protein", icon: "🥩", label: "Atingir meta de proteina", xp: XP_MISSION_DONE, done: false },
    { id: "stretch", icon: "🧘", label: "Fazer 5min de alongamento", xp: XP_MISSION_DONE, done: false },
    { id: "coach", icon: "🤖", label: "Perguntar algo ao Coach IA", xp: XP_MISSION_DONE, done: false },
  ];

  // Always include train mission + 2 others rotated by date
  var others = allMissions.filter(function(m) { return m.id !== "train"; });
  var seed = dateKey.split("").reduce(function(a, c) { return a + c.charCodeAt(0); }, 0);
  var idx1 = seed % others.length;
  var idx2 = (seed + 2) % others.length;
  if (idx2 === idx1) idx2 = (idx2 + 1) % others.length;

  return [allMissions[0], others[idx1], others[idx2]];
}

// North Star: % progress toward goal
function calcGoalProgress(logs, profile) {
  if (!logs || !logs.length || !profile) return { pct: 0, weeksIn: 0, estWeeksLeft: null };
  var trained      = logs.filter(function(l) { return l.trained; }).length;
  var targetPerWeek = profile.days || 3;
  // Estimate: beginner needs ~12 weeks, intermediate 20, advanced 30
  var totalWeeksNeeded = profile.level === "Avancado" ? 30 : profile.level === "Intermediario" ? 20 : 12;
  var totalTrainingsNeeded = totalWeeksNeeded * targetPerWeek;
  var pct = Math.min(99, Math.round((trained / totalTrainingsNeeded) * 100));
  var weeksIn = Math.floor(trained / Math.max(targetPerWeek, 1));
  var estWeeksLeft = Math.max(0, Math.ceil((totalTrainingsNeeded - trained) / targetPerWeek));
  return { pct: pct, weeksIn: weeksIn, estWeeksLeft: estWeeksLeft, trained: trained, needed: totalTrainingsNeeded };
}

// Smart daily message
function getDailyMessage(profile, logs, workout, todayWorkout) {
  var dateKey = new Date().toDateString();
  var todayLog = logs.find(function(l) { return l.date === dateKey; });
  var streak = logs.filter(function(l) { return l.trained; }).length;
  var gm = GOAL_META[(profile && profile.goal)] || GOAL_META.condicionamento;

  if (todayLog && todayLog.trained) return "Treino concluido hoje! Descanse bem.";
  if (todayLog && !todayLog.trained) return "Dia de descanso registrado. Volte forte amanha!";

  // Check if close to streak record
  var sevenStreak = streak > 0 && streak % 7 === 6;
  if (sevenStreak) return "Falta 1 treino para completar 7 dias seguidos! Bora?";

  if (streak === 0) return "Comece hoje. O primeiro passo e o mais importante.";
  if (streak >= 20) return "Voce esta em um ritmo excelente! " + streak + " treinos no total.";

  // Workout context
  if (todayWorkout) {
    var muscleNames = {
      peito: "peito", costas: "costas", pernas: "pernas",
      ombro: "ombros", biceps: "biceps", triceps: "triceps",
      core: "core", cardio: "cardio",
    };
    var mainGroup = todayWorkout.groups && todayWorkout.groups[0];
    var muscleName = mainGroup ? (muscleNames[mainGroup] || mainGroup) : "";
    if (muscleName) return "Hoje e dia de " + muscleName + ". " + todayWorkout.duration + " minutos. Ja pode comecar!";
  }

  return "Seu objetivo: " + gm.long + ". Cada treino conta.";
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
var fmt = {
  time: function() { return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); },
  date: function() { return new Date().toLocaleDateString("pt-BR"); },
  dateLabel: function() { return new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }); },
  firstName: function(n) { return (n || "").split(" ")[0] || "atleta"; },
};

function safeJSON(text, fallback) {
  if (fallback === undefined) fallback = null;
  try { return JSON.parse((text || "").replace(/```json|```/g, "").trim()); }
  catch(e) { return fallback; }
}

// ─── LOCAL STORAGE ────────────────────────────────────────────────────────────
var lsGet = function(key) {
  try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch(e) { return null; }
};
var lsSet = function(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
};
var lsDel = function(key) {
  try { localStorage.removeItem(key); } catch(e) {}
};

// ─── DB LAYER ────────────────────────────────────────────────────────────────
var DB = (function() {
  async function _get(key) {
    try { var r = await window.storage.get(key); if (r) return JSON.parse(r.value); } catch(e) {}
    return lsGet(key);
  }
  async function _set(key, val) {
    lsSet(key, val);
    try { await window.storage.set(key, JSON.stringify(val)); } catch(e) {}
  }
  async function _del(key) {
    lsDel(key);
    try { await window.storage.delete(key); } catch(e) {}
  }

  return {
    getUser:          function(email)  { return _get("user:" + email); },
    saveUser:         function(user)   { return _set("user:" + user.email, user); },
    getCurrentUser:   function()       { return _get("currentUser"); },
    setCurrentUser:   function(u)      { return _set("currentUser", u); },
    clearCurrentUser: function()       { return _del("currentUser"); },
    getProfile:       function(uid)    { return _get("profile:" + uid); },
    saveProfile:      function(uid, p) { return _set("profile:" + uid, p); },
    getWorkout:       function(uid)    { return _get("workout:" + uid); },
    saveWorkout:      function(uid, w) { return _set("workout:" + uid, w); },
    getLogs: function(uid) {
      return _get("logs:" + uid).then(function(v) { return v || []; });
    },
    saveLogs:  function(uid, l) { return _set("logs:" + uid, l); },
    getPlan: function(uid) {
      return _get("plan:" + uid).then(function(v) { return v || { type: "free" }; });
    },
    savePlan:          function(uid, p) { return _set("plan:" + uid, p); },
    getRoutine: function(uid) {
      return _get("routine:" + uid).then(function(v) { return v || null; });
    },
    saveRoutine:       function(uid, r) { return _set("routine:" + uid, r); },
    getChatHistory: function(uid) {
      return _get("chat:" + uid).then(function(v) { return v || []; });
    },
    saveChatHistory:   function(uid, m) { return _set("chat:" + uid, m.slice(-CHAT_MAX)); },
    clearChatHistory:  function(uid)    { return _del("chat:" + uid); },
    getMsgCount: function(uid) {
      return _get("msgcount:" + uid).then(function(v) { return v || { date: "", count: 0 }; });
    },
    incMsgCount: async function(uid) {
      var today = fmt.date();
      var cur = await _get("msgcount:" + uid) || { date: "", count: 0 };
      var next = cur.date === today ? { date: today, count: cur.count + 1 } : { date: today, count: 1 };
      await _set("msgcount:" + uid, next);
      return next;
    },
    // Gamification (NEW v7)
    getGamification: function(uid) {
      return _get("gami:" + uid).then(function(v) { return v || { xp: 0, lastXPDate: "", missionsDone: {} }; });
    },
    saveGamification: function(uid, g) { return _set("gami:" + uid, g); },
    getMissionState: function(uid) {
      return _get("missions:" + uid).then(function(v) { return v || {}; });
    },
    saveMissionState: function(uid, ms) { return _set("missions:" + uid, ms); },
  };
})();

// ─── ENGINE ───────────────────────────────────────────────────────────────────
function calcUserLevel(days) {
  if (days <= 2) return "Iniciante";
  if (days <= 3) return "Intermediario";
  return "Avancado";
}

function getIntensityFactor(recentLogs, sleepHours) {
  if (!recentLogs) recentLogs = [];
  if (!sleepHours) sleepHours = 7;
  var avgFatigue = recentLogs.length
    ? recentLogs.reduce(function(s, l) { return s + (l.fatigue || 3); }, 0) / recentLogs.length
    : 3;
  var sleepPenalty = sleepHours < 6 ? 0.15 : sleepHours < 7 ? 0.08 : 0;
  var raw = avgFatigue + sleepPenalty * 5;
  if (raw > 4.5) return 0.65;
  if (raw > 4.0) return 0.75;
  if (raw > 3.5) return 0.88;
  if (raw < 2.5) return 1.10;
  return 1.0;
}

function scaleSets(baseSets, factor) {
  var m = baseSets.match(/^(\d+)x(.+)$/);
  if (!m) return baseSets;
  return Math.max(2, Math.round(parseInt(m[1]) * factor)) + "x" + m[2];
}

function generateWorkout(profile, recentLogs, routine) {
  if (!recentLogs) recentLogs = [];
  if (!routine) routine = null;
  var days           = (profile && profile.days)           ? profile.days           : 3;
  var level          = (profile && profile.level)          ? profile.level          : "Iniciante";
  var sessionMinutes = (profile && profile.sessionMinutes) ? profile.sessionMinutes : 45;

  var sportsToday = routine && routine.sportsToday ? routine.sportsToday.toLowerCase() : "";
  var hasLegSport = LEG_SPORTS.some(function(s) { return sportsToday.indexOf(s) !== -1; });
  var sleepHours  = routine && routine.sleepHours ? Number(routine.sleepHours) : 7;

  var exPerGroup  = sessionMinutes <= 30 ? 1 : sessionMinutes <= 60 ? 2 : 3;
  var levelMultMap = { "Iniciante": 0.8, "Intermediario": 1.0, "Avancado": 1.2 };
  var levelMult   = levelMultMap[level] || 1.0;
  var factor      = Math.min(Math.max(levelMult * getIntensityFactor(recentLogs, sleepHours), 0.55), 1.4);
  var splitKey    = Math.min(days, 5);
  var split       = SPLITS[splitKey] || SPLITS[3];

  return split.slice(0, days).map(function(day, id) {
    var groups = hasLegSport
      ? day.groups.map(function(g) { return g === "pernas" ? "core" : g; })
      : day.groups;

    var exercises = groups.reduce(function(acc, g) {
      var pool   = EXERCISE_DB[g] || [];
      var mapped = pool.slice(0, exPerGroup).map(function(ex) {
        return {
          name: ex[0], sets: scaleSets(ex[1], factor), rest: ex[2],
          difficulty: ex[3] || 1, muscle: ex[4] || g, group: g,
          icon: MUSCLE_ICONS[g] || "💪",
          instructions: ex[5] || "Execute com amplitude controlada.",
          videoUrl: ex[6] || "",
        };
      });
      return acc.concat(mapped);
    }, []);

    return {
      id: id, name: day.name, groups: groups,
      duration:   Math.round(sessionMinutes * levelMult),
      adaptedFor: hasLegSport ? "Pernas reduzidas - pratica esportiva hoje" : null,
      sleepAlert: sleepHours < 6 ? "Volume reduzido - sono insuficiente detectado" : null,
      exercises:  exercises,
    };
  });
}

function calcNutrition(profile) {
  var weight = (profile && profile.weight) ? profile.weight : 70;
  var height = (profile && profile.height) ? profile.height : 170;
  var age    = (profile && profile.age)    ? profile.age    : 25;
  var sex    = (profile && profile.sex)    ? profile.sex    : "Masculino";
  var goal   = (profile && profile.goal)   ? profile.goal   : "condicionamento";
  var bmr = sex === "Masculino"
    ? 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age
    : 447.6  +  9.2 * weight + 3.1 * height - 4.3 * age;
  var tdee     = Math.round(bmr * 1.55);
  var calories = goal === "massa" ? tdee + 300 : goal === "emagrecer" ? tdee - 400 : tdee;
  var protein  = Math.round(goal === "massa" ? weight * 2.2 : goal === "emagrecer" ? weight * 1.8 : weight * 1.6);
  var carbs    = Math.round((calories * (goal === "emagrecer" ? 0.35 : 0.45)) / 4);
  var fat      = Math.round((calories * 0.25) / 9);
  var water    = parseFloat((weight * 0.035).toFixed(1));
  return { calories: calories, protein: protein, carbs: carbs, fat: fat, water: water, mealPlan: MEAL_PLANS[goal] || MEAL_PLANS.condicionamento };
}

function calcStats(logs) {
  if (!logs || !logs.length) return { trained: 0, completed: 0, rate: 0, avgFatigue: 0, avgDiff: 0, total: 0 };
  var trained    = logs.filter(function(l) { return l.trained; }).length;
  var completed  = logs.filter(function(l) { return l.completed; }).length;
  var rate       = Math.round((trained / logs.length) * 100);
  var avgFatigue = parseFloat((logs.reduce(function(s, l) { return s + (l.fatigue || 0); }, 0) / logs.length).toFixed(1));
  var avgDiff    = parseFloat((logs.reduce(function(s, l) { return s + (l.difficulty || 0); }, 0) / logs.length).toFixed(1));
  return { total: logs.length, trained: trained, completed: completed, rate: rate, avgFatigue: avgFatigue, avgDiff: avgDiff };
}

function calcBestWorkoutTime(routine) {
  if (!routine) return null;
  if (routine.freeTimeStart) return routine.freeTimeStart;
  if (routine.sportsToday) return "Apos o esporte (com 2h de descanso)";
  if (routine.wakeUpTime) {
    var h = parseInt((routine.wakeUpTime || "07:00").split(":")[0]) + 1;
    return (h < 10 ? "0" : "") + h + ":00";
  }
  return "18:00";
}

// ─── AI SERVICE ───────────────────────────────────────────────────────────────
var CLAUDE_MODEL = "claude-sonnet-4-20250514";

var AI = {
  buildSystemPrompt: function(profile, logs, plan, workout, routine, gami) {
    var p        = profile || {};
    var stats7   = calcStats(logs ? logs.slice(-7) : []);
    var allStats = calcStats(logs);
    var gm       = GOAL_META[p.goal] || GOAL_META.condicionamento;
    var isPro    = plan && plan.type !== "free";
    var lastNotes = (logs || []).filter(function(l) { return l.notes; }).slice(-3).map(function(l) { return '"' + l.notes + '"'; }).join(", ") || "nenhuma";
    var wSummary = workout && workout.length
      ? workout.map(function(w) { return "  Dia " + (w.id + 1) + ": " + w.name + " (~" + w.duration + "min, " + w.exercises.length + " ex)" + (w.adaptedFor ? " [" + w.adaptedFor + "]" : ""); }).join("\n")
      : "  Nenhum plano gerado.";

    var fatigueAlert = stats7.avgFatigue > 4.2
      ? "ALERTA SOBRECARGA: cansaco " + stats7.avgFatigue + "/5 - recomende reduzir volume ou descanso ativo."
      : stats7.avgFatigue < 2 && allStats.total > 3
      ? "Cansaco baixo (" + stats7.avgFatigue + "/5) - proponha progressao de carga."
      : "";

    var routineCtx = routine ? (
      "\nROTINA DIARIA:" +
      "\nAcorda: " + (routine.wakeUpTime || "--") +
      " | Dorme: " + (routine.bedTime || "--") +
      " | Sono: " + (routine.sleepHours || "--") + "h" +
      "\nEsporte hoje: " + (routine.sportsToday || "nenhum") +
      " | Lesoes: " + (routine.injuryNotes || "nenhuma") +
      "\nMelhor horario: " + (calcBestWorkoutTime(routine) || "--")
    ) : "";

    var gamiCtx = gami ? (
      "\nGAMIFICACAO:" +
      "\nXP total: " + (gami.xp || 0) +
      " | Nivel: " + xpToLevel(gami.xp || 0) +
      " | Titulo: " + getLevelTitle(xpToLevel(gami.xp || 0))
    ) : "";

    // Compare last workout vs week before for context
    var lastLog = (logs || []).filter(function(l) { return l.trained; }).slice(-1)[0];
    var prevLog = (logs || []).filter(function(l) { return l.trained; }).slice(-2)[0];
    var trendCtx = "";
    if (lastLog && prevLog) {
      var trend = (lastLog.fatigue || 3) < (prevLog.fatigue || 3) ? "melhorando (menos cansaco)" : "mais cansativo que o anterior";
      trendCtx = "\nUltimo treino vs anterior: " + trend;
    }

    return "Voce e o Coach FitPro - personal trainer e nutricionista esportivo certificado.\n" +
      "Responda em portugues. Tom: direto, tecnico, motivador. Use o nome do usuario quando natural.\n\n" +
      "PERFIL:\n" +
      "Nome: " + (p.name || "Atleta") + " | Sexo: " + (p.sex || "--") + " | Idade: " + (p.age || "--") + "a\n" +
      "Corpo: " + (p.weight || "--") + "kg / " + (p.height || "--") + "cm\n" +
      "Objetivo: " + gm.long + " | Nivel: " + (p.level || "Iniciante") + "\n" +
      "Frequencia: " + (p.days || 3) + "x/sem / " + (p.sessionMinutes || 45) + "min/sessao\n" +
      "Plano: " + (isPro ? "Pro (acesso completo)" : "Gratuito") + "\n" +
      routineCtx + gamiCtx + "\n\n" +
      "PLANO ATUAL:\n" + wSummary + "\n\n" +
      "HISTORICO 7 DIAS:\n" +
      "Treinos: " + stats7.trained + "/7 | Taxa: " + stats7.rate + "% | Cansaco: " + stats7.avgFatigue + "/5\n" +
      "Total acumulado: " + allStats.trained + " treinos\n" +
      "Observacoes recentes: " + lastNotes + "\n" +
      trendCtx + "\n" +
      (fatigueAlert ? fatigueAlert + "\n" : "") + "\n" +
      "REGRAS DE COMPORTAMENTO:\n" +
      "1. Respostas ACIONAVEIS: sempre termine com uma sugestao concreta do que o usuario pode fazer.\n" +
      "2. Exercicios: inclua series e reps. Alimentos: inclua gramas.\n" +
      "3. Maximo 3 paragrafos curtos ou lista com 4 itens.\n" +
      "4. Se detectar fadiga alta, priorize recuperacao antes de qualquer progressao.\n" +
      "5. Se FREE pedir recurso Pro, mencione brevemente e siga ajudando com o que for possivel.\n" +
      "6. Nunca repita o que o usuario acabou de dizer. Va direto ao ponto.\n" +
      "7. Foco: fitness, nutricao, recuperacao, rotina. Fora disso, redirecione educadamente.";
  },

  call: async function(system, messages) {
    var res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CLAUDE_MODEL, max_tokens: 1000, system: system,
        messages: messages.map(function(m) { return { role: m.role, content: m.content }; }),
      }),
    });
    if (!res.ok) throw new Error("Claude API " + res.status);
    var data = await res.json();
    return (data.content || []).map(function(b) { return b.text || ""; }).join("").trim();
  },

  generateWorkoutPlan: async function(profile, routine) {
    var gm = GOAL_META[profile && profile.goal] || GOAL_META.condicionamento;
    var rCtx = routine
      ? "Rotina: acorda " + routine.wakeUpTime + ", dorme " + routine.bedTime + ", sono " + routine.sleepHours + "h, esporte hoje: " + (routine.sportsToday || "nenhum") + ", lesoes: " + (routine.injuryNotes || "nenhuma")
      : "";
    var prompt = "Personal trainer expert. Plano semanal para:\n" +
      (profile.sex || "") + ", " + (profile.age || "") + "a, " + (profile.weight || "") + "kg, " + (profile.height || "") + "cm\n" +
      "Objetivo: " + gm.long + " | Nivel: " + (profile.level || "") + " | " + (profile.days || 3) + "x/sem | " + (profile.sessionMinutes || 45) + "min\n" +
      rCtx + "\n\n" +
      'JSON exato sem markdown:\n{"resumo":"2 frases motivacionais","ajuste_chave":"insight tecnico","horario_ideal":"HH:MM","semana":[{"dia":"Dia 1","treino":"nome","foco":"grupos","aquecimento":"aquecimento 5min","exercicios":[{"nome":"...","volume":"4x12","execucao":"dica 1 linha","descanso":"60s"}],"finalizacao":"volta a calma"}]}';
    var raw    = await AI.call("Responda APENAS JSON valido sem markdown.", [{ role: "user", content: prompt }]);
    var result = safeJSON(raw);
    if (!result || !result.semana || !result.semana.length) throw new Error("Resposta invalida da IA.");
    return result;
  },

  generateMeals: async function(profile, ingredients, nutrition) {
    var gm = GOAL_META[profile && profile.goal] || GOAL_META.condicionamento;
    var prompt = "Nutricionista esportivo. Plano de refeicoes HOJE com ingredientes disponiveis.\n" +
      "Perfil: " + (profile.sex || "") + ", " + (profile.age || "") + "a | Objetivo: " + gm.long + "\n" +
      "Metas: " + nutrition.calories + "kcal | P:" + nutrition.protein + "g | C:" + nutrition.carbs + "g | G:" + nutrition.fat + "g\n" +
      "Ingredientes: " + ingredients + "\n\n" +
      'JSON sem markdown: {"aviso":"observacao nutricional","refeicoes":[{"horario":"07:00","nome":"Cafe","descricao":"preparo com quantidades","proteina":30,"carbs":45,"kcal":400}]}';
    var raw    = await AI.call("Responda APENAS JSON valido sem markdown.", [{ role: "user", content: prompt }]);
    var result = safeJSON(raw);
    if (!result || !result.refeicoes || !result.refeicoes.length) throw new Error("Resposta invalida da IA.");
    return result;
  },

  analyzeRoutine: async function(profile, routine) {
    var gm = GOAL_META[profile && profile.goal] || GOAL_META.condicionamento;
    var prompt = "Personal trainer. Analise a rotina e gere recomendacoes.\n" +
      "Perfil: " + (profile.sex || "") + ", " + (profile.age || "") + "a, nivel " + (profile.level || "") + ", objetivo: " + gm.long + "\n" +
      "Acorda: " + (routine.wakeUpTime || "") + " | Dorme: " + (routine.bedTime || "") + " | Sono: " + (routine.sleepHours || "") + "h\n" +
      "Esporte hoje: " + (routine.sportsToday || "nenhum") + " | Lesoes: " + (routine.injuryNotes || "nenhuma") + "\n\n" +
      'JSON sem markdown: {"melhor_horario":"HH:MM","intensidade_recomendada":"baixa|moderada|alta","duracao_ideal":"Xmin","motivo":"2 frases","avisos":["aviso se houver"],"dica_sono":"dica se sono baixo"}';
    var raw = await AI.call("Responda APENAS JSON valido sem markdown.", [{ role: "user", content: prompt }]);
    return safeJSON(raw);
  },

  // NEW: Generate post-workout AI analysis
  postWorkoutAnalysis: async function(profile, logs, lastEntry) {
    var stats7 = calcStats(logs.slice(-7));
    var prev   = logs.filter(function(l) { return l.trained; }).slice(-3);
    var avgPrevFatigue = prev.length ? prev.reduce(function(s, l) { return s + (l.fatigue || 3); }, 0) / prev.length : 3;
    var trend = lastEntry.fatigue < avgPrevFatigue ? "melhor que a media recente" : lastEntry.fatigue > avgPrevFatigue ? "mais cansativo que o habitual" : "dentro do esperado";
    var prompt = "Personal trainer. Analise pos-treino em 2 frases curtas e diretas.\n" +
      "Usuario: " + (profile.sex || "") + ", " + (profile.age || "") + "a, " + (profile.weight || "") + "kg, objetivo " + ((GOAL_META[profile.goal] || {}).long || "condicionamento") + "\n" +
      "Treino hoje: " + (lastEntry.completed ? "completo" : "parcial") + " | Cansaco: " + lastEntry.fatigue + "/5 | Dificuldade: " + lastEntry.difficulty + "/5\n" +
      "Tendencia vs historico: " + trend + "\n" +
      "Observacao do usuario: " + (lastEntry.notes || "nenhuma") + "\n" +
      "Historico 7 dias: " + stats7.trained + " treinos, cansaco medio " + stats7.avgFatigue + "/5\n\n" +
      "Responda: 1 frase sobre o treino de hoje + 1 sugestao concreta para amanha. Maximo 40 palavras. Sem JSON.";
    return await AI.call("Responda apenas o texto, sem saudacao, sem introducao.", [{ role: "user", content: prompt }]);
  },

  quickSuggestions: function(profile, logs, routine) {
    var highFatigue  = (logs || []).slice(-3).some(function(l) { return (l.fatigue || 0) >= 4; });
    var shortSession = ((profile && profile.sessionMinutes) || 45) <= 30;
    var hasSport     = !!(routine && routine.sportsToday);
    var badSleep     = ((routine && routine.sleepHours) || 7) < 6;
    var goal         = profile && profile.goal;

    var byGoal = {
      massa: [
        "Quantas calorias devo comer hoje?",
        "Melhor exercicio para ganho de massa no peito?",
        "Como melhorar minha recuperacao muscular?",
        "O que comer antes e depois do treino?",
      ],
      emagrecer: [
        "Como acelerar o metabolismo sem perder musculo?",
        "Qual cardio queima mais gordura?",
        "Posso comer carboidrato a noite?",
        "Como controlar a fome entre as refeicoes?",
      ],
      condicionamento: [
        "Como melhorar meu folego rapidamente?",
        "Cardio antes ou depois da musculacao?",
        "Como evitar lesoes no treino?",
        "Frequencia ideal para meu nivel?",
      ],
    };

    var base = [].concat((byGoal[goal] || byGoal.condicionamento));
    if (hasSport)     base.unshift("Tenho " + (routine && routine.sportsToday) + " hoje. Como adapto o treino?");
    if (badSleep)     base.unshift("Dormi pouco. Devo treinar hoje?");
    if (highFatigue)  base.unshift("Estou muito cansado. O que faco?");
    if (shortSession) base.unshift("Tenho so " + (profile && profile.sessionMinutes) + "min. Como otimizar?");
    return base.slice(0, 4);
  },
};

// ─── APP CONTEXT ──────────────────────────────────────────────────────────────
var AppCtx = createContext(null);
function useApp() {
  var ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

var INIT_STATE = {
  status:      "loading",  // loading | auth | onboard | app
  screen:      "home",
  checkout:    null,
  user:        null,
  profile:     null,
  workout:     [],
  logs:        [],
  plan:        { type: "free" },
  routine:     null,
  gami:        { xp: 0, lastXPDate: "", missionsDone: {} },  // NEW v7
  postWorkout: null,  // NEW v7: { xp, streak, aiMsg, isNewRecord, improvement }
};

function appReducer(state, action) {
  switch (action.type) {
    case "SET_STATUS":  return Object.assign({}, state, { status: action.payload });
    case "SET_SCREEN":  return Object.assign({}, state, { screen: action.payload });
    case "AUTH_OK":
      return Object.assign({}, state, {
        user: action.user, profile: action.profile || null,
        plan: action.plan || { type: "free" }, logs: action.logs || [],
        workout: action.workout || [], routine: action.routine || null,
        gami: action.gami || { xp: 0, lastXPDate: "", missionsDone: {} },
        status: action.profile ? "app" : "onboard", screen: "home",
      });
    case "ONBOARD_DONE":
      return Object.assign({}, state, {
        profile: action.profile, workout: action.workout,
        routine: action.routine || state.routine,
        status: "app", screen: "home",
      });
    case "ROUTINE_UPDATED":
      return Object.assign({}, state, { routine: action.routine, workout: action.workout || state.workout });
    case "CHECKOUT_START":
      return Object.assign({}, state, { checkout: action.payload, screen: "checkout" });
    case "CHECKOUT_CANCEL":
      return Object.assign({}, state, { checkout: null, screen: "paywall" });
    case "PLAN_UNLOCKED":
      return Object.assign({}, state, { plan: action.plan, checkout: null, screen: "home" });
    case "LOG_ADDED":
      return Object.assign({}, state, {
        logs: action.logs, workout: action.workout || state.workout,
        gami: action.gami || state.gami,
        postWorkout: action.postWorkout || null,
      });
    case "CLEAR_POST_WORKOUT":
      return Object.assign({}, state, { postWorkout: null });
    case "MISSION_DONE":
      var newGami = Object.assign({}, state.gami, {
        xp: (state.gami.xp || 0) + XP_MISSION_DONE,
        missionsDone: Object.assign({}, state.gami.missionsDone, { [action.missionId]: fmt.date() }),
      });
      return Object.assign({}, state, { gami: newGami });
    case "LOGOUT":
      return Object.assign({}, INIT_STATE, { status: "auth" });
    default:
      return state;
  }
}

// ─── HOOKS ────────────────────────────────────────────────────────────────────
var DAY_NAMES = ["Dom","Seg","Ter","Qua","Qui","Sex","Sab"];

function useProgress(logs) {
  return useMemo(function() {
    var stats  = calcStats(logs);
    var recent = logs.slice(-7);
    var today  = new Date().getDay();
    var factor = getIntensityFactor(recent);
    var weekLogs = DAY_NAMES.map(function(label, i) {
      return { label: label, isToday: i === today, log: logs[logs.length - (today - i) - 1] || null };
    });
    var intensityLabel = factor < 0.75 ? "Volume muito reduzido (sono/fadiga alta)"
      : factor < 0.85 ? "Reduzir volume esta semana"
      : factor > 1.05 ? "Pode progredir a carga"
      : "Intensidade adequada";
    return Object.assign({}, stats, { weekLogs: weekLogs, intensityFactor: factor, intensityLabel: intensityLabel });
  }, [logs]);
}

function useAsyncAction() {
  var _l = useState(false); var loading = _l[0]; var setLoad = _l[1];
  var _e = useState(null);  var error   = _e[0]; var setErr  = _e[1];
  var run = useCallback(async function(fn) {
    setLoad(true); setErr(null);
    try { return await fn(); }
    catch(e) { setErr(e && e.message ? e.message : "Ocorreu um erro. Tente novamente."); return null; }
    finally  { setLoad(false); }
  }, []);
  return { loading: loading, error: error, run: run };
}

function useChat(onUpgrade) {
  var appCtx  = useApp();
  var user    = appCtx.user;
  var profile = appCtx.profile;
  var logs    = appCtx.logs;
  var plan    = appCtx.plan;
  var workout = appCtx.workout;
  var routine = appCtx.routine;
  var gami    = appCtx.gami;

  var _m  = useState([]); var messages = _m[0]; var setMessages = _m[1];
  var _i  = useState(""); var input    = _i[0]; var setInput    = _i[1];
  var _l  = useState(false); var loading = _l[0]; var setLoading = _l[1];
  var _e  = useState(null);  var error   = _e[0]; var setError   = _e[1];
  var _u  = useState(0);     var used    = _u[0]; var setUsed    = _u[1];
  var initialized = useRef(false);

  var isPro    = plan && plan.type !== "free";
  var hitLimit = !isPro && used >= FREE_MSG_DAY;
  var uid      = user && user.id;

  useEffect(function() {
    if (!uid) return;
    var init = async function() {
      var results = await Promise.all([DB.getChatHistory(uid), DB.getMsgCount(uid)]);
      var history = results[0]; var counter = results[1];
      setUsed(counter.date === fmt.date() ? counter.count : 0);
      if (history && history.length) {
        setMessages(history);
      } else {
        var gm       = GOAL_META[(profile && profile.goal)] || GOAL_META.condicionamento;
        var lvl      = xpToLevel((gami && gami.xp) || 0);
        var title    = getLevelTitle(lvl);
        var sportHint = routine && routine.sportsToday
          ? "\n\nVi que voce tem " + routine.sportsToday + " hoje — ja adaptei o treino de pernas!"
          : "";
        setMessages([{
          role: "assistant",
          content: "Ola, " + fmt.firstName(profile && profile.name) + "! Sou seu Coach FitPro.\n\n" +
            "Voce e nivel " + lvl + " (" + title + "), com " + ((gami && gami.xp) || 0) + " XP. " +
            "Objetivo: " + gm.long + ". Treina " + ((profile && profile.days) || 3) + "x/sem." +
            sportHint + "\n\nPergunta sobre treino, alimentacao ou rotina. Estou aqui!",
          time: fmt.time(),
        }]);
      }
      initialized.current = true;
    };
    init();
  }, [uid]);

  useEffect(function() {
    if (!initialized.current || !messages.length || !uid) return;
    DB.saveChatHistory(uid, messages);
  }, [messages, uid]);

  var send = useCallback(async function(text) {
    var trimmed = (text || "").trim();
    if (!trimmed || loading) return;
    if (hitLimit) {
      setError("Limite de " + FREE_MSG_DAY + " mensagens gratuitas atingido.");
      if (onUpgrade) onUpgrade();
      return;
    }
    setError(null);
    var userMsg = { role: "user", content: trimmed, time: fmt.time() };
    var thread  = messages.concat([userMsg]);
    setMessages(thread); setInput(""); setLoading(true);
    if (!isPro) {
      var updated = await DB.incMsgCount(uid);
      setUsed(updated.count);
    }
    try {
      var sys  = AI.buildSystemPrompt(profile, logs, plan, workout, routine, gami);
      var reply = await AI.call(sys, thread);
      setMessages(function(prev) { return prev.concat([{ role: "assistant", content: reply, time: fmt.time() }]); });
    } catch(e) {
      setMessages(function(prev) { return prev.concat([{ role: "assistant", content: "Erro ao processar. Verifique a conexao e tente novamente.", time: fmt.time() }]); });
    }
    setLoading(false);
  }, [messages, loading, hitLimit, isPro, profile, logs, plan, workout, routine, gami, uid, onUpgrade]);

  var clearHistory = useCallback(async function() {
    if (!uid) return;
    await DB.clearChatHistory(uid);
    var gm = GOAL_META[(profile && profile.goal)] || GOAL_META.condicionamento;
    initialized.current = false;
    setMessages([{ role: "assistant", content: "Conversa reiniciada. Foco: " + gm.long + ". Como posso ajudar?", time: fmt.time() }]);
    setTimeout(function() { initialized.current = true; }, 0);
  }, [uid, profile]);

  return { messages: messages, input: input, setInput: setInput, loading: loading, error: error, used: used, hitLimit: hitLimit, remaining: FREE_MSG_DAY - used, send: send, clearHistory: clearHistory };
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────
function Txt(props) {
  var El = props.el || "span";
  return React.createElement(El, { style: Object.assign({ fontSize: props.s, color: props.c || T.text, fontWeight: props.w }, props.style || {}) }, props.children);
}

var Row = memo(function Row(props) {
  return (
    <div style={Object.assign({ display: "flex", flexDirection: "row", gap: props.gap !== undefined ? props.gap : 12, alignItems: props.align || "center", justifyContent: props.justify || "flex-start", flexWrap: props.wrap ? "wrap" : undefined }, props.style || {})}>
      {props.children}
    </div>
  );
});

var Col = memo(function Col(props) {
  return (
    <div style={Object.assign({ display: "flex", flexDirection: "column", gap: props.gap !== undefined ? props.gap : 8 }, props.style || {})}>
      {props.children}
    </div>
  );
});

var Card = memo(function Card(props) {
  var _h = useState(false); var hov = _h[0]; var setHov = _h[1];
  var border = props.glow ? T.orange + "55" : (props.accent ? props.accent + "55" : (hov && props.onClick ? T.border2 : T.border));
  var shadow = props.glow ? "0 0 32px " + T.orange + "1A" : (props.accent ? "0 0 24px " + props.accent + "14" : "none");
  return (
    <div
      onClick={props.onClick}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={function() { setHov(false); }}
      style={Object.assign({
        background: T.surface, border: "1px solid " + border, borderRadius: 18,
        padding: props.pad !== undefined ? props.pad : 18,
        boxShadow: shadow, cursor: props.onClick ? "pointer" : "default",
        transition: "border-color 0.2s, box-shadow 0.2s",
        animation: props.animate !== false ? "fadeUp 0.22s ease" : "none",
      }, props.style || {})}
    >
      {props.children}
    </div>
  );
});

var Btn = memo(function Btn(props) {
  var _p = useState(false); var press = _p[0]; var setPress = _p[1];
  var PAD  = { sm: "9px 14px", md: "13px 22px", lg: "16px 28px" };
  var FS   = { sm: 12, md: 15, lg: 16 };
  var VARS = {
    fill:   { background: "linear-gradient(135deg," + T.orange + "," + T.orangeHi + ")", color: "#fff", border: "none" },
    ghost:  { background: "transparent", color: T.orange, border: "1px solid " + T.orange + "55" },
    dim:    { background: T.surface2, color: T.text2, border: "1px solid " + T.border2 },
    danger: { background: T.red + "22", color: T.red, border: "1px solid " + T.red + "44" },
    green:  { background: T.green + "22", color: T.green, border: "1px solid " + T.green + "44" },
    purple: { background: "linear-gradient(135deg," + T.purple + "," + T.purple + "cc)", color: "#fff", border: "none" },
  };
  var isDisabled = props.disabled || props.loading;
  var base = VARS[props.variant] || VARS.fill;
  return (
    <button
      onClick={isDisabled ? undefined : props.onPress}
      onMouseDown={function() { if (!isDisabled) setPress(true); }}
      onMouseUp={function() { setPress(false); }}
      onMouseLeave={function() { setPress(false); }}
      style={Object.assign({}, base, {
        padding: PAD[props.size] || PAD.md, fontSize: FS[props.size] || FS.md,
        fontWeight: 700, borderRadius: 14, cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.45 : (press ? 0.85 : 1),
        transform: press && !isDisabled ? "scale(0.98)" : "scale(1)",
        transition: "opacity 0.15s, transform 0.15s",
        width: props.full ? "100%" : "auto",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }, props.style || {})}
    >
      {props.loading && (
        <span style={{ width: 14, height: 14, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", flexShrink: 0 }} />
      )}
      {props.children}
    </button>
  );
});

function FInput(props) {
  var _f = useState(false); var focus = _f[0]; var setFocus = _f[1];
  var baseStyle = Object.assign({
    width: "100%", boxSizing: "border-box",
    background: focus ? T.surface2 : T.surface,
    border: "1px solid " + (focus ? T.orange + "88" : T.border2),
    borderRadius: 13, color: T.text, fontSize: 15, outline: "none",
    transition: "background 0.2s, border-color 0.2s",
    padding: "14px " + (props.suffix ? "48px" : "16px") + " 14px " + (props.icon ? "42px" : "16px"),
  }, props.style || {});
  return (
    <Col gap={6}>
      {props.label && <span style={{ fontSize: 11, color: T.text2, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{props.label}</span>}
      <div style={{ position: "relative" }}>
        {props.icon && <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>{props.icon}</span>}
        {props.multiline
          ? <textarea rows={props.rows || 3} value={props.value} onChange={function(e) { props.onChange(e.target.value); }} placeholder={props.placeholder} onFocus={function() { setFocus(true); }} onBlur={function() { setFocus(false); }} style={Object.assign({}, baseStyle, { resize: "none", lineHeight: 1.5 })} />
          : <input type={props.type || "text"} value={props.value} onChange={function(e) { props.onChange(e.target.value); }} placeholder={props.placeholder} onFocus={function() { setFocus(true); }} onBlur={function() { setFocus(false); }} style={baseStyle} />
        }
        {props.suffix && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: T.text2, fontSize: 13, fontWeight: 600 }}>{props.suffix}</span>}
      </div>
    </Col>
  );
}

var FTag = memo(function FTag(props) {
  var color = props.color || T.orange;
  return (
    <span style={{ background: color + "18", color: color, border: "1px solid " + color + "33", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>
      {props.children}
    </span>
  );
});

var Bar = memo(function Bar(props) {
  var pct = Math.min(((props.value || 0) / (props.max || 100)) * 100, 100);
  return (
    <div style={{ background: T.border2, borderRadius: 99, height: props.thin ? 4 : 7, overflow: "hidden" }}>
      <div style={{ width: pct + "%", height: "100%", background: "linear-gradient(90deg," + (props.color || T.orange) + "," + (props.color || T.orange) + "cc)", borderRadius: 99, transition: "width 0.5s ease" }} />
    </div>
  );
});

var Badge = memo(function Badge(props) {
  var color = props.color || T.orange;
  return <span style={{ background: color, color: "#fff", fontSize: 9, fontWeight: 900, padding: "2px 7px", borderRadius: 99, letterSpacing: "0.08em" }}>{props.children}</span>;
});

// ─── GAMIFICATION COMPONENTS (NEW v7) ─────────────────────────────────────────

// Animated XP bar showing level progress
var XPBar = memo(function XPBar(props) {
  var xp    = props.xp || 0;
  var lvl   = xpToLevel(xp);
  var title = getLevelTitle(lvl);
  var prog  = xpInCurrentLevel(xp);

  return (
    <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: 14, padding: "12px 16px" }}>
      <Row justify="space-between" style={{ marginBottom: 8 }}>
        <Row gap={8}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg," + T.purple + ",#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
            {lvl}
          </div>
          <Col gap={1}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{title}</span>
            <span style={{ fontSize: 10, color: T.text2 }}>Nivel {lvl} / XP: {xp}</span>
          </Col>
        </Row>
        <span style={{ fontSize: 11, color: T.text2, fontWeight: 600 }}>{prog.current}/{prog.total} XP</span>
      </Row>
      <div style={{ background: T.border2, borderRadius: 99, height: 6, overflow: "hidden" }}>
        <div style={{ width: prog.pct + "%", height: "100%", background: "linear-gradient(90deg," + T.purple + ",#a78bfa)", borderRadius: 99, transition: "width 0.8s ease" }} />
      </div>
      <Row justify="space-between" style={{ marginTop: 5 }}>
        <span style={{ fontSize: 10, color: T.text3 }}>Nivel {lvl}</span>
        <span style={{ fontSize: 10, color: T.purple, fontWeight: 600 }}>+{prog.total - prog.current} XP para nivel {lvl + 1}</span>
      </Row>
    </div>
  );
});

// Visual streak badge — stronger than before
var StreakBadge = memo(function StreakBadge(props) {
  var count = props.count || 0;
  var active = count >= 3;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: active ? T.orange + "18" : T.surface2,
      border: "1px solid " + (active ? T.orange + "44" : T.border),
      borderRadius: 12, padding: "8px 14px",
      animation: active ? "streakPulse 2s infinite" : "none",
    }}>
      <span style={{ fontSize: 18 }}>{count >= 7 ? "🔥" : count >= 3 ? "🔥" : "💤"}</span>
      <Col gap={1}>
        <span style={{ fontSize: 16, fontWeight: 900, color: active ? T.orange : T.text2 }}>{count}</span>
        <span style={{ fontSize: 9, color: active ? T.orange : T.text3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>dias</span>
      </Col>
    </div>
  );
});

// North Star goal journey bar
var GoalJourneyBar = memo(function GoalJourneyBar(props) {
  var progress = props.progress;
  var goal     = props.goal;
  var gm       = GOAL_META[goal] || GOAL_META.condicionamento;
  var pct      = progress.pct || 0;

  var milestones = [25, 50, 75, 100];

  return (
    <Card style={{ padding: 16 }} animate={false}>
      <Row justify="space-between" style={{ marginBottom: 10 }}>
        <Col gap={2}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Jornada: {gm.long}</span>
          <span style={{ fontSize: 11, color: T.text2 }}>
            {progress.weeksIn > 0 ? "Semana " + progress.weeksIn : "Comece hoje"} 
            {progress.estWeeksLeft > 0 ? " — ~" + progress.estWeeksLeft + " sem restantes" : ""}
          </span>
        </Col>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 900, color: pct >= 50 ? T.green : T.orange }}>
          {pct}%
        </div>
      </Row>
      <div style={{ position: "relative", background: T.border2, borderRadius: 99, height: 10, overflow: "visible" }}>
        <div style={{ width: pct + "%", height: "100%", background: "linear-gradient(90deg," + T.orange + "," + T.green + ")", borderRadius: 99, transition: "width 0.8s ease", position: "relative" }}>
          {pct > 5 && (
            <div style={{ position: "absolute", right: -6, top: -3, width: 16, height: 16, borderRadius: "50%", background: pct >= 50 ? T.green : T.orange, border: "2px solid " + T.bg, boxShadow: "0 0 8px " + (pct >= 50 ? T.green : T.orange) + "66" }} />
          )}
        </div>
        {milestones.map(function(m) {
          return (
            <div key={m} style={{ position: "absolute", left: m + "%", top: -2, transform: "translateX(-50%)", width: 4, height: 14, background: pct >= m ? T.green + "88" : T.border2, borderRadius: 2 }} />
          );
        })}
      </div>
      <Row justify="space-between" style={{ marginTop: 8 }}>
        <span style={{ fontSize: 9, color: T.text3 }}>{progress.trained || 0} treinos feitos</span>
        <span style={{ fontSize: 9, color: T.text3 }}>Meta: {progress.needed || "—"} treinos</span>
      </Row>
    </Card>
  );
});

// Daily mission card
var MissionCard = memo(function MissionCard(props) {
  var mission = props.mission;
  var done    = props.done;
  var onDone  = props.onDone;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: done ? T.green + "08" : T.surface2,
      border: "1px solid " + (done ? T.green + "33" : T.border),
      borderRadius: 12, padding: "12px 14px",
      transition: "all 0.3s",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
        background: done ? T.green : T.border2,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: done ? 16 : 18, transition: "all 0.3s",
        boxShadow: done ? "0 0 10px " + T.green + "44" : "none",
      }}>
        {done ? "✓" : mission.icon}
      </div>
      <Col gap={2} style={{ flex: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: done ? T.green : T.text, textDecoration: done ? "line-through" : "none" }}>
          {mission.label}
        </span>
        <span style={{ fontSize: 10, color: T.text3, fontWeight: 700 }}>+{mission.xp} XP</span>
      </Col>
      {!done && (
        <button onClick={onDone} style={{ background: "none", border: "1px solid " + T.orange + "55", borderRadius: 8, color: T.orange, fontSize: 11, fontWeight: 700, padding: "4px 10px", cursor: "pointer" }}>
          Feito
        </button>
      )}
    </div>
  );
});

// XP popup animation
function XPPopup(props) {
  var xp      = props.xp;
  var visible = props.visible;
  if (!visible) return null;
  return (
    <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)", zIndex: 999, pointerEvents: "none", animation: "xpPop 1.8s ease forwards", textAlign: "center" }}>
      <div style={{ background: "linear-gradient(135deg," + T.purple + "," + T.orange + ")", borderRadius: 20, padding: "10px 20px", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 4px 24px " + T.orange + "44" }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>+{xp} XP</span>
      </div>
    </div>
  );
}

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
var Skeleton = memo(function Skeleton(props) {
  return (
    <div style={Object.assign({
      width: props.w !== undefined ? props.w : "100%",
      height: props.h !== undefined ? props.h : 16,
      background: "linear-gradient(90deg," + T.surface + " 0%," + T.surface2 + " 50%," + T.surface + " 100%)",
      backgroundSize: "400px 100%",
      animation: "shimmer 1.4s ease-in-out infinite",
      borderRadius: 10,
    }, props.style || {})} />
  );
});

var SkeletonCard = memo(function SkeletonCard() {
  return (
    <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: 18, padding: 18 }}>
      <Skeleton h={18} w="60%" style={{ marginBottom: 10 }} />
      <Skeleton h={13} w="80%" style={{ marginBottom: 6 }} />
      <Skeleton h={13} w="50%" />
    </div>
  );
});

function LockGate(props) {
  var appCtx = useApp();
  var plan   = appCtx.plan;
  if (plan && plan.type !== "free") return props.children;
  return (
    <Card style={{ textAlign: "center", padding: 28 }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
      <p style={{ fontSize: 16, color: T.text, fontWeight: 700 }}>{props.feature}</p>
      {props.description && <p style={{ fontSize: 13, color: T.text2, marginTop: 6, marginBottom: 18, lineHeight: 1.6 }}>{props.description}</p>}
      {!props.description && <div style={{ height: 14 }} />}
      <Btn onPress={props.onUpgrade} full>Desbloquear Pro — R$19,90/mes</Btn>
    </Card>
  );
}

var SelectOption = memo(function SelectOption(props) {
  return (
    <div
      onClick={props.onSelect}
      style={{ padding: "16px 18px", border: "2px solid " + (props.selected ? T.orange : T.border2), borderRadius: 16, cursor: "pointer", background: props.selected ? T.orangeGl : T.surface, transition: "border-color 0.2s, background 0.2s" }}
    >
      <Row gap={12}>
        {props.icon && <span style={{ fontSize: 24, flexShrink: 0 }}>{props.icon}</span>}
        <Col gap={2}>
          <span style={{ fontSize: 15, fontWeight: 700, color: props.selected ? T.orange : T.text }}>{props.label}</span>
          {props.desc && <span style={{ fontSize: 12, color: T.text2 }}>{props.desc}</span>}
        </Col>
      </Row>
    </div>
  );
});

function SelectGrid(props) {
  var cols = props.cols || 4;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(" + cols + ", 1fr)", gap: 10 }}>
      {props.options.map(function(opt) {
        var sel = props.value === opt.value;
        return (
          <div key={opt.value} onClick={function() { props.onSelect(opt.value); }} style={{ padding: "20px 0", textAlign: "center", border: "2px solid " + (sel ? T.orange : T.border2), borderRadius: 16, cursor: "pointer", background: sel ? T.orangeGl : T.surface, transition: "border-color 0.2s, background 0.2s" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 900, color: sel ? T.orange : T.text }}>{opt.value}</div>
            <span style={{ fontSize: 11, color: T.text2 }}>{opt.label}</span>
          </div>
        );
      })}
    </div>
  );
}

var StatCard = memo(function StatCard(props) {
  var color = props.color || T.orange;
  return (
    <Card animate={false} style={{ padding: 16, textAlign: "center" }}>
      {props.icon && <div style={{ fontSize: 20, marginBottom: 4 }}>{props.icon}</div>}
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 900, color: color }}>{props.value}</div>
      <p style={{ fontSize: 11, color: T.text2, marginTop: 4 }}>{props.label}</p>
    </Card>
  );
});

var WeekCalendar = memo(function WeekCalendar(props) {
  return (
    <Row gap={4} justify="space-between">
      {props.weekLogs.map(function(entry, i) {
        return (
          <Col key={i} gap={5} style={{ alignItems: "center", flex: 1 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: entry.log && entry.log.trained ? T.orange : T.surface2, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid " + (entry.isToday ? T.orange : T.border2), fontSize: 15, transition: "background 0.3s" }}>
              {entry.log && entry.log.trained ? "✓" : (entry.log && entry.log.trained === false ? "💤" : "")}
            </div>
            <span style={{ fontSize: 9, color: entry.isToday ? T.orange : T.text3, fontWeight: 700 }}>{entry.label}</span>
          </Col>
        );
      })}
    </Row>
  );
});

var ProgressRow = memo(function ProgressRow(props) {
  return (
    <Col gap={6}>
      <Row justify="space-between">
        <span style={{ fontSize: 13, color: T.text }}>{props.label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: props.color }}>{props.suffix}</span>
      </Row>
      <Bar value={props.value} max={props.max} color={props.color} />
    </Col>
  );
});

var ExerciseCard = memo(function ExerciseCard(props) {
  var ex   = props.exercise;
  var diffColors = [T.green, T.yellow, T.red];
  var diffLabels = ["Facil", "Medio", "Dificil"];
  var diffColor  = diffColors[(ex.difficulty || 1) - 1] || T.text2;
  var diffLabel  = diffLabels[(ex.difficulty || 1) - 1] || "--";
  return (
    <Card onClick={props.onToggle} style={{ padding: 16 }} animate={false}>
      <Row justify="space-between" align="center">
        <Row gap={10}>
          <span style={{ fontSize: 22 }}>{ex.icon}</span>
          <Col gap={2}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{ex.name}</span>
            <Row gap={6}><FTag color={T.text3}>{ex.muscle || ex.group}</FTag><FTag color={diffColor}>{diffLabel}</FTag></Row>
          </Col>
        </Row>
        <Col gap={2} style={{ textAlign: "right", flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: T.orange }}>{ex.sets}</span>
          <span style={{ fontSize: 11, color: T.text2 }}>desc {ex.rest}</span>
        </Col>
      </Row>
      {props.expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid " + T.border, animation: "fadeUp 0.2s ease" }}>
          <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.65, marginBottom: ex.videoUrl ? 10 : 0 }}>{ex.instructions}</p>
          {ex.videoUrl && (
            <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: T.orange, fontSize: 12, fontWeight: 700, textDecoration: "none", background: T.orangeGl, padding: "6px 12px", borderRadius: 10, border: "1px solid " + T.orange + "33" }} onClick={function(e) { e.stopPropagation(); }}>
              Ver demonstracao
            </a>
          )}
        </div>
      )}
    </Card>
  );
});

var ScreenHeader = memo(function ScreenHeader(props) {
  return (
    <div style={{ padding: "52px 20px 20px", borderBottom: "1px solid " + T.border }}>
      <Row justify="space-between" align="flex-start">
        <Col gap={4}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 900, color: T.text }}>{props.title}</div>
          {props.subtitle && <span style={{ fontSize: 13, color: T.text2 }}>{props.subtitle}</span>}
        </Col>
        {props.right && <div>{props.right}</div>}
      </Row>
    </div>
  );
});

var EmptyState = memo(function EmptyState(props) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{props.icon || "📭"}</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{props.title}</p>
      {props.body && <p style={{ fontSize: 13, color: T.text2, marginTop: 8, lineHeight: 1.6, maxWidth: 260, margin: "8px auto 0" }}>{props.body}</p>}
      {props.action && <Btn onPress={props.onAction} style={{ marginTop: 20 }}>{props.action}</Btn>}
    </div>
  );
});

var LoadingDots = memo(function LoadingDots() {
  return (
    <div style={{ display: "flex", marginBottom: 14 }}>
      <div style={{ background: T.surface, border: "1px solid " + T.border2, borderRadius: 18, borderBottomLeftRadius: 4, padding: "12px 18px", display: "flex", gap: 5 }}>
        {[0, 1, 2].map(function(i) { return <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: T.orange, animation: "bounce 1.2s " + (i * 0.2) + "s infinite ease-in-out" }} />; })}
      </div>
    </div>
  );
});

var Nav = memo(function Nav(props) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: T.surface, borderTop: "1px solid " + T.border, display: "flex", paddingTop: 8, paddingBottom: 16, zIndex: 100 }}>
      {NAV_ITEMS.map(function(item) {
        var active = props.screen === item.id;
        return (
          <div key={item.id} onClick={function() { props.go(item.id); }} style={{ flex: 1, textAlign: "center", cursor: "pointer", opacity: active ? 1 : 0.4, transition: "opacity 0.2s" }}>
            <div style={{ fontSize: 20 }}>{item.icon}</div>
            <span style={{ display: "block", fontSize: 9, color: active ? T.orange : T.text2, fontWeight: 700, marginTop: 2, letterSpacing: "0.05em" }}>{item.label.toUpperCase()}</span>
          </div>
        );
      })}
    </div>
  );
});

// ─── SCREEN: POST-WORKOUT CELEBRATION (NEW v7) ────────────────────────────────
function PostWorkoutScreen(props) {
  var go     = props.go;
  var appCtx = useApp();
  var data   = appCtx.postWorkout;
  var dispatch = appCtx.dispatch;

  var _xpVisible = useState(false);
  var xpVisible  = _xpVisible[0];
  var setXPVis   = _xpVisible[1];

  useEffect(function() {
    var t = setTimeout(function() { setXPVis(true); }, 300);
    var t2 = setTimeout(function() { setXPVis(false); }, 2200);
    return function() { clearTimeout(t); clearTimeout(t2); };
  }, []);

  if (!data) { dispatch({ type: "SET_SCREEN", payload: "home" }); return null; }

  var streak = data.streak || 0;

  function dismiss() {
    dispatch({ type: "CLEAR_POST_WORKOUT" });
    dispatch({ type: "SET_SCREEN", payload: "progress" });
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, textAlign: "center", animation: "celebIn 0.4s ease" }}>
      <XPPopup xp={data.xp} visible={xpVisible} />

      {/* Main icon */}
      <div style={{ fontSize: 64, marginBottom: 8 }}>
        {streak >= 7 ? "🔥" : streak >= 3 ? "💪" : "✅"}
      </div>

      {/* Title */}
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 900, color: T.text, marginBottom: 6 }}>
        {data.isNewRecord ? "Novo recorde!" : streak >= 7 ? "Sequencia de fogo!" : streak >= 3 ? "Arrasou!" : "Treino concluido!"}
      </div>

      {/* XP gained */}
      <div style={{ background: "linear-gradient(135deg," + T.purple + "," + T.orange + ")", borderRadius: 16, padding: "10px 24px", display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20, boxShadow: "0 4px 20px " + T.orange + "33" }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>+{data.xp} XP</span>
      </div>

      {/* Stats row */}
      <Row gap={12} justify="center" style={{ marginBottom: 20 }}>
        <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: 12, padding: "12px 18px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.orange, fontFamily: "'Syne',sans-serif" }}>{streak}</div>
          <span style={{ fontSize: 10, color: T.text2 }}>treinos feitos</span>
        </div>
        {streak >= 7 && (
          <div style={{ background: T.orange + "18", border: "1px solid " + T.orange + "44", borderRadius: 12, padding: "12px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>🔥</div>
            <span style={{ fontSize: 10, color: T.orange, fontWeight: 700 }}>7 dias seguidos!</span>
          </div>
        )}
        {data.improvement && (
          <div style={{ background: T.green + "11", border: "1px solid " + T.green + "33", borderRadius: 12, padding: "12px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>📈</div>
            <span style={{ fontSize: 10, color: T.green, fontWeight: 700 }}>Melhorou!</span>
          </div>
        )}
      </Row>

      {/* AI message */}
      {data.aiMsg && (
        <div style={{ background: T.surface, border: "1px solid " + T.border2, borderRadius: 14, padding: "14px 18px", marginBottom: 24, maxWidth: 320, textAlign: "left" }}>
          <Row gap={8} style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 16 }}>🤖</span>
            <span style={{ fontSize: 11, color: T.orange, fontWeight: 700, letterSpacing: "0.06em" }}>COACH</span>
          </Row>
          <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65 }}>{data.aiMsg}</p>
        </div>
      )}
      {!data.aiMsg && (
        <p style={{ fontSize: 13, color: T.text2, marginBottom: 24, maxWidth: 280, lineHeight: 1.6 }}>
          {streak >= 3 ? "Voce esta em uma sequencia incrivel! Continue assim." : "Cada treino te aproxima do objetivo. Amanha, de novo!"}
        </p>
      )}

      <Btn onPress={dismiss} full size="lg">Ver meu progresso</Btn>
      <button onClick={function() { dispatch({ type: "CLEAR_POST_WORKOUT" }); dispatch({ type: "SET_SCREEN", payload: "home" }); }} style={{ background: "none", border: "none", color: T.text2, fontSize: 13, cursor: "pointer", marginTop: 14 }}>
        Voltar ao inicio
      </button>
    </div>
  );
}

// ─── SCREEN: AUTH ─────────────────────────────────────────────────────────────
function AuthScreen() {
  var appCtx = useApp(); var dispatch = appCtx.dispatch;
  var _mode = useState("login"); var mode = _mode[0]; var setMode = _mode[1];
  var _email = useState(""); var email = _email[0]; var setEmail = _email[1];
  var _pass  = useState(""); var pass  = _pass[0];  var setPass  = _pass[1];
  var _name  = useState(""); var name  = _name[0];  var setName  = _name[1];
  var _err   = useState(""); var err   = _err[0];   var setErr   = _err[1];
  var _load  = useState(false); var loading = _load[0]; var setLoading = _load[1];

  function switchMode(m) { setMode(m); setErr(""); }

  function validate() {
    if (!email || !pass) return "Preencha todos os campos.";
    if (pass.length < 6) return "Senha minima: 6 caracteres.";
    if (mode === "register" && !name) return "Informe seu nome.";
    return null;
  }

  async function submit() {
    var e = validate(); if (e) { setErr(e); return; }
    setErr(""); setLoading(true);
    try {
      if (mode === "register") {
        var existing = await DB.getUser(email);
        if (existing) { setErr("E-mail ja cadastrado."); return; }
        var user = { id: Date.now().toString(), email: email, name: name, createdAt: new Date().toISOString() };
        await DB.saveUser(user); await DB.setCurrentUser(user);
        dispatch({ type: "AUTH_OK", user: user, profile: null });
      } else {
        var foundUser = await DB.getUser(email);
        if (!foundUser) { setErr("Usuario nao encontrado."); return; }
        await DB.setCurrentUser(foundUser);
        var results = await Promise.all([
          DB.getProfile(foundUser.id), DB.getPlan(foundUser.id), DB.getLogs(foundUser.id),
          DB.getWorkout(foundUser.id), DB.getRoutine(foundUser.id), DB.getGamification(foundUser.id),
        ]);
        var profile = results[0]; var plan = results[1]; var logs = results[2];
        var workout = results[3]; var routine = results[4]; var gami = results[5];
        dispatch({
          type: "AUTH_OK", user: foundUser, profile: profile, plan: plan, logs: logs,
          routine: routine, gami: gami,
          workout: workout || (profile ? generateWorkout(profile, logs || [], routine) : []),
        });
      }
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 52 }}>🔥</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 38, fontWeight: 900, color: T.text, letterSpacing: -1, marginTop: 4 }}>
          FIT<span style={{ color: T.orange }}>PRO</span>
        </div>
        <p style={{ fontSize: 14, color: T.text2, marginTop: 4 }}>Evolua todo dia. Sinta a diferenca.</p>
      </div>
      <div style={{ display: "flex", background: T.surface, borderRadius: 14, padding: 4, marginBottom: 28 }}>
        {["login","register"].map(function(m) {
          return (
            <div key={m} onClick={function() { switchMode(m); }} style={{ flex: 1, textAlign: "center", padding: "10px 0", background: mode === m ? T.orange : "transparent", borderRadius: 11, cursor: "pointer", transition: "background 0.2s", color: mode === m ? "#fff" : T.text2, fontWeight: 700, fontSize: 14 }}>
              {m === "login" ? "Entrar" : "Cadastrar"}
            </div>
          );
        })}
      </div>
      <Col gap={14}>
        {mode === "register" && <FInput label="Nome completo" value={name} onChange={setName} placeholder="Joao Silva" icon="👤" />}
        <FInput label="E-mail" value={email} onChange={setEmail} type="email" placeholder="joao@email.com" icon="✉️" />
        <FInput label="Senha"  value={pass}  onChange={setPass}  type="password" placeholder="••••••••" icon="🔒" />
        {err && <p style={{ fontSize: 13, color: T.red, textAlign: "center" }}>{err}</p>}
        <Btn onPress={submit} disabled={loading} loading={loading} full size="lg" style={{ marginTop: 8 }}>
          {mode === "login" ? "Entrar na conta" : "Criar conta gratis"}
        </Btn>
      </Col>
      {mode === "register" && (
        <p style={{ fontSize: 11, color: T.text3, textAlign: "center", marginTop: 16, lineHeight: 1.7 }}>
          Ao criar conta voce concorda com os Termos de Uso e Politica de Privacidade.
        </p>
      )}
    </div>
  );
}

// ─── SCREEN: ONBOARDING ───────────────────────────────────────────────────────
var GOALS_LIST = [
  { k: "massa",           icon: "💪", label: "Ganhar Massa",    desc: "Hipertrofia e forca maxima" },
  { k: "emagrecer",       icon: "🔥", label: "Emagrecer",       desc: "Queima de gordura e definicao" },
  { k: "condicionamento", icon: "🏃", label: "Condicionamento", desc: "Resistencia, disposicao e saude" },
];
var SESSION_OPTS = [
  { value: 30, label: "30 min" }, { value: 45, label: "45 min" },
  { value: 60, label: "60 min" }, { value: 90, label: "90 min" },
];
var SESSION_DESC_MAP = {
  30: "Treino enxuto: foco total, 1 exercicio por grupo.",
  45: "Treino eficiente: 2 exercicios por grupo.",
  60: "Treino completo: volume moderado.",
  90: "Treino extenso: alto volume.",
};

function OnboardingScreen() {
  var appCtx = useApp(); var user = appCtx.user; var dispatch = appCtx.dispatch;
  var _step = useState(0); var step = _step[0]; var setStep = _step[1];
  var _f = useState({ weight: "", height: "", age: "", sex: "", goal: "", days: "", sessionMinutes: "", wakeUpTime: "07:00", bedTime: "23:00", sleepHours: "", sportsToday: "", injuryNotes: "" });
  var f = _f[0]; var setF = _f[1];
  function set(k, v) { setF(function(p) { return Object.assign({}, p, { [k]: v }); }); }

  var steps = [
    {
      emoji: "⚖️", title: "Dados fisicos",
      content: (<Col gap={14}><FInput label="Peso" value={f.weight} onChange={function(v) { set("weight", v); }} type="number" placeholder="Ex: 75" suffix="kg" /><FInput label="Altura" value={f.height} onChange={function(v) { set("height", v); }} type="number" placeholder="Ex: 175" suffix="cm" /><FInput label="Idade" value={f.age} onChange={function(v) { set("age", v); }} type="number" placeholder="Ex: 25" suffix="anos" /></Col>),
      valid: !!(f.weight && f.height && f.age),
    },
    {
      emoji: "🙋", title: "Qual seu sexo?",
      content: (<Row gap={12}>{["Masculino","Feminino"].map(function(s) { return <SelectOption key={s} label={s} selected={f.sex === s} onSelect={function() { set("sex", s); }} />; })}</Row>),
      valid: !!f.sex,
    },
    {
      emoji: "🎯", title: "Qual seu objetivo?",
      content: (<Col gap={10}>{GOALS_LIST.map(function(g) { return <SelectOption key={g.k} label={g.label} desc={g.desc} icon={g.icon} selected={f.goal === g.k} onSelect={function() { set("goal", g.k); }} />; })}</Col>),
      valid: !!f.goal,
    },
    {
      emoji: "📅", title: "Dias por semana?",
      content: (<Col gap={16}><SelectGrid options={[2,3,4,5].map(function(d) { return { value: d, label: "dias/sem" }; })} value={f.days} onSelect={function(v) { set("days", v); }} />{!!f.days && <div style={{ background: T.orangeGl, border: "1px solid " + T.orange + "33", borderRadius: 14, padding: 14 }}><span style={{ fontSize: 13, color: T.orange, fontWeight: 600 }}>Nivel: {calcUserLevel(f.days)}</span></div>}</Col>),
      valid: !!f.days,
    },
    {
      emoji: "⏱️", title: "Tempo por sessao?",
      content: (<Col gap={16}><SelectGrid options={SESSION_OPTS} value={f.sessionMinutes} onSelect={function(v) { set("sessionMinutes", v); }} cols={4} />{!!f.sessionMinutes && <div style={{ background: T.orangeGl, border: "1px solid " + T.orange + "33", borderRadius: 14, padding: 14 }}><span style={{ fontSize: 13, color: T.orange, fontWeight: 600 }}>{SESSION_DESC_MAP[f.sessionMinutes]}</span></div>}</Col>),
      valid: !!f.sessionMinutes,
    },
    {
      emoji: "🕐", title: "Sua rotina diaria",
      content: (<Col gap={14}><p style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>O Coach usa isso para sugerir o melhor horario e intensidade.</p><Row gap={12}><div style={{ flex: 1 }}><FInput label="Acorda as" value={f.wakeUpTime} onChange={function(v) { set("wakeUpTime", v); }} type="time" icon="🌅" /></div><div style={{ flex: 1 }}><FInput label="Dorme as" value={f.bedTime} onChange={function(v) { set("bedTime", v); }} type="time" icon="🌙" /></div></Row><FInput label="Horas de sono" value={f.sleepHours} onChange={function(v) { set("sleepHours", v); }} type="number" placeholder="Ex: 7" suffix="h" icon="😴" /><FInput label="Esporte hoje (opcional)" value={f.sportsToday} onChange={function(v) { set("sportsToday", v); }} placeholder="Ex: basquete, futebol..." icon="🏀" /><FInput label="Lesoes ou dores (opcional)" value={f.injuryNotes} onChange={function(v) { set("injuryNotes", v); }} placeholder="Ex: dor no joelho..." icon="🩹" /></Col>),
      valid: true,
    },
  ];

  var cur = steps[step];

  async function finish() {
    var level   = calcUserLevel(Number(f.days));
    var profile = { name: (user && user.name) || "", sex: f.sex, goal: f.goal, level: level, days: Number(f.days), weight: Number(f.weight), height: Number(f.height), age: Number(f.age), sessionMinutes: Number(f.sessionMinutes), updatedAt: new Date().toISOString() };
    var routine = (f.wakeUpTime || f.sportsToday || f.injuryNotes) ? { wakeUpTime: f.wakeUpTime, bedTime: f.bedTime, sleepHours: f.sleepHours ? Number(f.sleepHours) : 7, sportsToday: f.sportsToday, injuryNotes: f.injuryNotes, freeTimeStart: null, updatedAt: new Date().toISOString() } : null;
    var workout = generateWorkout(profile, [], routine);
    var saves = [DB.saveProfile(user.id, profile), DB.saveWorkout(user.id, workout)];
    if (routine) saves.push(DB.saveRoutine(user.id, routine));
    await Promise.all(saves);
    dispatch({ type: "ONBOARD_DONE", profile: profile, workout: workout, routine: routine });
  }

  function next() {
    if (step < steps.length - 1) setStep(function(s) { return s + 1; });
    else finish();
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "48px 24px 32px", display: "flex", flexDirection: "column" }}>
      <Row gap={6} style={{ marginBottom: 36 }}>
        {steps.map(function(_, i) { return <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= step ? T.orange : T.border2, transition: "background 0.3s" }} />; })}
      </Row>
      <div style={{ fontSize: 40, marginBottom: 8 }}>{cur.emoji}</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 900, color: T.text, marginBottom: 6 }}>{cur.title}</div>
      <p style={{ fontSize: 12, color: T.text3, marginBottom: 28 }}>Passo {step + 1} de {steps.length}</p>
      <div style={{ flex: 1 }}>{cur.content}</div>
      <Row gap={10} style={{ marginTop: 32 }}>
        {step > 0 && <Btn variant="dim" onPress={function() { setStep(function(s) { return s - 1; }); }} style={{ flex: 1 }}>Voltar</Btn>}
        <Btn onPress={next} disabled={!cur.valid} style={{ flex: 2 }}>
          {step === steps.length - 1 ? "Comecar meu treino" : "Continuar"}
        </Btn>
      </Row>
    </div>
  );
}

// ─── SCREEN: PAYWALL ──────────────────────────────────────────────────────────
function PaywallScreen(props) {
  var appCtx   = useApp();
  var plan     = appCtx.plan;
  var dispatch = appCtx.dispatch;

  function handleSelect(p) {
    if (p.id === "free") { dispatch({ type: "PLAN_UNLOCKED", plan: { type: "free" } }); return; }
    dispatch({ type: "CHECKOUT_START", payload: { planId: p.id, planName: p.name, price: p.price, sub: p.sub, monthly: p.monthly } });
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "48px 20px 32px", overflowY: "auto" }}>
      {props.onBack && <button onClick={props.onBack} style={{ background: "none", border: "none", color: T.orange, fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 20, padding: 0 }}>Voltar</button>}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 40 }}>💎</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 900, color: T.text, marginTop: 8 }}>
          Escolha seu <span style={{ color: T.orange }}>Plano</span>
        </div>
        <p style={{ fontSize: 13, color: T.text2, marginTop: 4 }}>7 dias gratis — Cancele quando quiser</p>
      </div>
      <Col gap={14} style={{ maxWidth: 400, margin: "0 auto" }}>
        {PLAN_CONFIG.map(function(p) {
          return (
            <Card key={p.id} glow={p.highlight} style={{ position: "relative", overflow: "hidden" }}>
              {p.badge && <div style={{ position: "absolute", top: 14, right: 14, background: p.color, color: "#fff", fontSize: 9, fontWeight: 900, padding: "3px 9px", borderRadius: 99, letterSpacing: "0.07em" }}>{p.badge}</div>}
              <Row justify="space-between" align="flex-start" style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: p.color }}>{p.name}</span>
                <Col gap={1} style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: T.text }}>{p.price}</span>
                  <span style={{ fontSize: 11, color: T.text2 }}>{p.sub}</span>
                  {p.monthly > 0 && <span style={{ fontSize: 10, color: T.text3 }}>{"R$" + p.monthly.toFixed(2).replace(".", ",") + "/mes"}</span>}
                </Col>
              </Row>
              <Col gap={5} style={{ marginBottom: 14 }}>
                {p.features.map(function(feat) { return <p key={feat} style={{ fontSize: 13, color: T.text }}>{"+ " + feat}</p>; })}
                {p.locked.map(function(feat)   { return <p key={feat} style={{ fontSize: 13, color: T.text3, textDecoration: "line-through" }}>{"- " + feat}</p>; })}
              </Col>
              {plan && plan.type === p.id
                ? <Btn variant="dim" full disabled>Plano atual</Btn>
                : <Btn variant={p.highlight ? "fill" : "ghost"} full onPress={function() { handleSelect(p); }}>{p.cta}</Btn>
              }
            </Card>
          );
        })}
      </Col>
      <p style={{ fontSize: 11, color: T.text3, textAlign: "center", marginTop: 24, lineHeight: 1.7 }}>
        Pagamento seguro — Cancele a qualquer momento
      </p>
    </div>
  );
}

// ─── SCREEN: CHECKOUT ─────────────────────────────────────────────────────────
function CheckoutScreen() {
  var appCtx   = useApp();
  var user     = appCtx.user;
  var checkout = appCtx.checkout;
  var dispatch = appCtx.dispatch;

  var _phase = useState("form"); var phase = _phase[0]; var setPhase = _phase[1];
  var _card  = useState({ number: "", name: "", expiry: "", cvv: "" });
  var card   = _card[0]; var setCard = _card[1];
  var _err   = useState(""); var err = _err[0]; var setErr = _err[1];

  if (!checkout) return null;

  function setC(k, v) { setCard(function(p) { return Object.assign({}, p, { [k]: v }); }); }
  function formatCard(v)   { return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); }
  function formatExpiry(v) { var d = v.replace(/\D/g, "").slice(0, 4); return d.length >= 2 ? d.slice(0, 2) + "/" + d.slice(2) : d; }
  function validate() {
    if (card.number.replace(/\s/g, "").length < 16) return "Numero do cartao invalido.";
    if (!card.name.trim()) return "Informe o nome no cartao.";
    if (card.expiry.length < 5) return "Data de validade invalida.";
    if (card.cvv.length < 3) return "CVV invalido.";
    return null;
  }

  async function confirmPayment() {
    var e = validate(); if (e) { setErr(e); return; }
    setErr(""); setPhase("processing");
    await new Promise(function(r) { setTimeout(r, 2200); });
    setPhase("success");
    var trialEnd = new Date(Date.now() + 7 * 86400000).toISOString();
    var p = { type: checkout.planId, planName: checkout.planName, activatedAt: new Date().toISOString(), trialEnds: trialEnd };
    await DB.savePlan(user.id, p);
    setTimeout(function() { dispatch({ type: "PLAN_UNLOCKED", plan: p }); }, 1800);
  }

  if (phase === "processing") return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ width: 60, height: 60, border: "4px solid " + T.border2, borderTopColor: T.orange, borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 24 }} />
      <p style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Processando pagamento...</p>
    </div>
  );

  if (phase === "success") return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", animation: "scaleIn 0.3s ease" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg," + T.green + ",#16A34A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 24, boxShadow: "0 0 40px " + T.green + "44" }}>✓</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 900, color: T.text, marginBottom: 8 }}>Bem-vindo ao Pro!</div>
      <p style={{ fontSize: 15, color: T.text2 }}>7 dias gratis ativados. Aproveite tudo!</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, overflowY: "auto", paddingBottom: 40 }}>
      <div style={{ padding: "52px 20px 20px", borderBottom: "1px solid " + T.border }}>
        <button onClick={function() { dispatch({ type: "CHECKOUT_CANCEL" }); }} style={{ background: "none", border: "none", color: T.orange, fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 16, padding: 0 }}>Voltar aos planos</button>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 900, color: T.text }}>Finalizar Assinatura</div>
        <p style={{ fontSize: 13, color: T.text2 }}>{checkout.planName} — {checkout.price}</p>
      </div>
      <div style={{ padding: "20px 20px 0" }}>
        <Card glow style={{ marginBottom: 20, padding: 16 }}>
          <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>RESUMO DO PEDIDO</p>
          <Row justify="space-between" style={{ marginBottom: 6 }}><span style={{ fontSize: 14, color: T.text }}>{checkout.planName}</span><span style={{ fontSize: 14, fontWeight: 700, color: T.orange }}>{checkout.price}</span></Row>
          <Row justify="space-between" style={{ marginBottom: 8 }}><span style={{ fontSize: 13, color: T.text2 }}>Periodo de teste</span><span style={{ fontSize: 13, fontWeight: 700, color: T.green }}>7 dias gratis</span></Row>
          <div style={{ height: 1, background: T.border, marginBottom: 8 }} />
          <Row justify="space-between"><span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Cobrado hoje</span><span style={{ fontSize: 14, fontWeight: 700, color: T.green }}>R$0,00</span></Row>
        </Card>
        <Col gap={14} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.08em" }}>DADOS DO CARTAO</p>
          <FInput label="Numero do cartao" value={card.number} onChange={function(v) { setC("number", formatCard(v)); }} placeholder="0000 0000 0000 0000" icon="💳" />
          <FInput label="Nome no cartao" value={card.name} onChange={function(v) { setC("name", v.toUpperCase()); }} placeholder="NOME SOBRENOME" icon="👤" />
          <Row gap={12}>
            <div style={{ flex: 1 }}><FInput label="Validade" value={card.expiry} onChange={function(v) { setC("expiry", formatExpiry(v)); }} placeholder="MM/AA" icon="📅" /></div>
            <div style={{ flex: 1 }}><FInput label="CVV" value={card.cvv} onChange={function(v) { setC("cvv", v.replace(/\D/g, "").slice(0, 4)); }} placeholder="123" type="password" icon="🔒" /></div>
          </Row>
        </Col>
        {err && <p style={{ fontSize: 13, color: T.red, textAlign: "center", marginBottom: 14 }}>{err}</p>}
        <Btn onPress={confirmPayment} full size="lg">Confirmar assinatura — {checkout.price}</Btn>
        <p style={{ fontSize: 11, color: T.text3, textAlign: "center", marginTop: 14 }}>Simulacao — nenhum dado real e processado.</p>
      </div>
    </div>
  );
}

// ─── SCREEN: HOME (upgraded v7) ───────────────────────────────────────────────
function HomeScreen(props) {
  var go     = props.go;
  var appCtx = useApp();
  var user   = appCtx.user;
  var profile = appCtx.profile;
  var workout = appCtx.workout;
  var logs    = appCtx.logs;
  var plan    = appCtx.plan;
  var routine = appCtx.routine;
  var gami    = appCtx.gami;
  var dispatch = appCtx.dispatch;

  var progress     = useProgress(logs);
  var goalProgress = useMemo(function() { return calcGoalProgress(logs, profile); }, [logs, profile]);
  var isPro        = plan && plan.type !== "free";
  var workoutLen   = (workout && workout.length) || 1;
  var todayWorkout = workout && workout[logs.length % workoutLen];
  var dateKey      = new Date().toDateString();
  var todayLog     = useMemo(function() { return logs.find(function(l) { return l.date === dateKey; }); }, [logs]);
  var bestTime     = useMemo(function() { return calcBestWorkoutTime(routine); }, [routine]);

  // Daily missions state
  var missions = useMemo(function() { return generateDailyMissions(profile, logs); }, [profile, logs]);
  var missionsDoneToday = (gami && gami.missionsDone) || {};

  // Dynamic daily message
  var dailyMsg = useMemo(function() { return getDailyMessage(profile, logs, workout, todayWorkout); }, [profile, logs, workout, todayWorkout]);

  // XP popup state
  var _xpPop = useState(false); var xpPop = _xpPop[0]; var setXpPop = _xpPop[1];

  function completeMission(mId) {
    if (missionsDoneToday[mId] === fmt.date()) return;
    dispatch({ type: "MISSION_DONE", missionId: mId });
    setXpPop(true);
    setTimeout(function() { setXpPop(false); }, 2200);
    if (appCtx.user) DB.saveGamification(appCtx.user.id, Object.assign({}, gami, { xp: (gami.xp || 0) + XP_MISSION_DONE, missionsDone: Object.assign({}, missionsDoneToday, { [mId]: fmt.date() }) }));
  }

  var xp    = (gami && gami.xp) || 0;
  var lvl   = xpToLevel(xp);
  var streak = progress.trained;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 90 }}>
      <XPPopup xp={XP_MISSION_DONE} visible={xpPop} />

      {/* Hero header */}
      <div style={{ padding: "52px 20px 20px", background: "linear-gradient(180deg,#1c0d00 0%," + T.bg + " 100%)", borderBottom: "1px solid " + T.border }}>
        <Row justify="space-between" align="flex-start">
          <Col gap={2}>
            <span style={{ fontSize: 12, color: T.text2, textTransform: "capitalize" }}>{fmt.dateLabel()}</span>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 900, color: T.text }}>
              Ola, {fmt.firstName(user && user.name)}!
            </div>
          </Col>
          <FTag color={isPro ? T.orange : T.text3}>{isPro ? "PRO" : "FREE"}</FTag>
        </Row>

        {/* Streak + Level row */}
        <Row gap={10} style={{ marginTop: 16 }}>
          <StreakBadge count={streak} />
          <div style={{ flex: 1, background: T.surface, border: "1px solid " + T.border, borderRadius: 12, padding: "10px 12px" }}>
            <Row gap={8} align="center">
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg," + T.purple + ",#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff" }}>{lvl}</div>
              <Col gap={1}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{getLevelTitle(lvl)}</span>
                <span style={{ fontSize: 9, color: T.text2 }}>{xp} XP total</span>
              </Col>
            </Row>
          </div>
          <div style={{ flex: 1, background: T.surface, border: "1px solid " + T.border, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 900, color: T.orange }}>{goalProgress.pct}%</div>
            <span style={{ fontSize: 9, color: T.text2 }}>da meta</span>
          </div>
        </Row>

        {/* XP bar compact */}
        <div style={{ marginTop: 12 }}>
          <XPBar xp={xp} />
        </div>
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        {/* Smart daily message */}
        <div style={{ marginBottom: 14, padding: "12px 16px", background: T.orangeGl, borderRadius: 12, border: "1px solid " + T.orange + "22" }}>
          <Row gap={8}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{dailyMsg}</span>
          </Row>
        </div>

        {/* Alerts */}
        {routine && routine.sportsToday && (
          <div style={{ marginBottom: 10, padding: "10px 14px", background: T.blue + "11", borderRadius: 12, border: "1px solid " + T.blue + "33" }}>
            <Row gap={8}><span>🏀</span><span style={{ fontSize: 13, color: T.blue }}>{routine.sportsToday} hoje — pernas reduzidas no treino</span></Row>
          </div>
        )}
        {routine && routine.sleepHours && Number(routine.sleepHours) < 6 && (
          <div style={{ marginBottom: 10, padding: "10px 14px", background: T.yellow + "11", borderRadius: 12, border: "1px solid " + T.yellow + "33" }}>
            <Row gap={8}><span>😴</span><span style={{ fontSize: 13, color: T.yellow }}>Sono baixo — intensidade reduzida hoje</span></Row>
          </div>
        )}

        {/* TODAY'S WORKOUT — main CTA */}
        {todayWorkout ? (
          <>
            <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>TREINO DE HOJE</p>
            <div onClick={function() { go("workout"); }} style={{ background: todayLog && todayLog.completed ? T.surface : "linear-gradient(135deg," + T.orangeLo + " 0%," + T.surface + " 100%)", border: "1px solid " + (todayLog && todayLog.completed ? T.border : T.orange + "44"), borderRadius: 18, padding: 18, cursor: "pointer", marginBottom: 16, boxShadow: todayLog && todayLog.completed ? "none" : "0 0 24px " + T.orange + "14", transition: "all 0.2s" }}>
              {(todayWorkout.adaptedFor || todayWorkout.sleepAlert) && (
                <div style={{ background: T.blue + "11", border: "1px solid " + T.blue + "22", borderRadius: 10, padding: "5px 10px", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: T.blue }}>{todayWorkout.adaptedFor || todayWorkout.sleepAlert}</span>
                </div>
              )}
              <Row justify="space-between" align="center" style={{ marginBottom: 12 }}>
                <Col gap={4}>
                  <span style={{ fontSize: 17, fontWeight: 800, color: todayLog && todayLog.completed ? T.text2 : T.orange }}>{todayWorkout.name}</span>
                  <span style={{ fontSize: 12, color: T.text2 }}>{todayWorkout.exercises.length} exercicios — ~{todayWorkout.duration}min</span>
                </Col>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: todayLog && todayLog.completed ? T.border2 : T.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff" }}>
                  {todayLog && todayLog.completed ? "✓" : "▶"}
                </div>
              </Row>
              <Bar value={todayLog && todayLog.completed ? 100 : 0} />
              <Row justify="space-between" style={{ marginTop: 8 }}>
                <span style={{ fontSize: 11, color: T.text2 }}>{todayLog && todayLog.completed ? "Concluido! Excelente trabalho." : "Toque para comecar"}</span>
                {!todayLog && <span style={{ fontSize: 11, color: T.orange, fontWeight: 700 }}>+{XP_WORKOUT_COMPLETE} XP</span>}
              </Row>
            </div>
          </>
        ) : (
          <EmptyState icon="🏋️" title="Sem treino gerado" body="Atualize seu perfil para gerar um plano personalizado." action="Configurar perfil" onAction={function() { go("settings"); }} />
        )}

        {/* NORTH STAR — Goal journey */}
        {logs.length >= 2 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>SUA JORNADA</p>
            <GoalJourneyBar progress={goalProgress} goal={profile && profile.goal} />
          </div>
        )}

        {/* DAILY MISSIONS */}
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.08em" }}>MISSOES DO DIA</p>
            <span style={{ fontSize: 11, color: T.purple, fontWeight: 600 }}>
              {missions.filter(function(m) { return missionsDoneToday[m.id] === fmt.date(); }).length}/{missions.length} completas
            </span>
          </Row>
          <Col gap={8}>
            {missions.map(function(m) {
              var done = missionsDoneToday[m.id] === fmt.date();
              return (
                <MissionCard
                  key={m.id}
                  mission={m}
                  done={done}
                  onDone={function() { completeMission(m.id); }}
                />
              );
            })}
          </Col>
        </div>

        {/* QUICK ACTIONS — reduced, less noise */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { icon: "🤖", label: "Coach IA",  screen: "coach",   pro: true  },
            { icon: "✅", label: "Check-in",  screen: "checkin", pro: false },
            { icon: "🗓️", label: "Planejar",  screen: "planner", pro: true  },
          ].map(function(a) {
            return (
              <Card key={a.label} onClick={function() { go(a.screen); }} style={{ padding: 14, cursor: "pointer", textAlign: "center" }} animate={false}>
                <Row justify="space-between" align="flex-start" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 24 }}>{a.icon}</span>
                  {a.pro && !isPro && <Badge color={T.orange} style={{ fontSize: 8 }}>PRO</Badge>}
                </Row>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{a.label}</span>
              </Card>
            );
          })}
        </div>

        {/* UPSELL contextual (smart — only after user has some data) */}
        {!isPro && logs.length >= 3 && (
          <Card style={{ background: "linear-gradient(135deg," + T.orangeLo + ",#1a0900)", border: "1px solid " + T.orange + "44", marginBottom: 16 }} animate={false}>
            <Row gap={12}>
              <span style={{ fontSize: 28 }}>🔓</span>
              <Col gap={3} style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Ative o Pro agora</span>
                <span style={{ fontSize: 11, color: T.text2 }}>IA analisa seu historico e gera treino 100% unico</span>
              </Col>
            </Row>
            <Btn onPress={function() { go("paywall"); }} full variant="fill" style={{ marginTop: 12 }}>Ver Planos — 7 dias gratis</Btn>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── SCREEN: WORKOUT ──────────────────────────────────────────────────────────
function WorkoutScreen(props) {
  var go     = props.go;
  var appCtx = useApp();
  var workout = appCtx.workout;
  var profile = appCtx.profile;
  var plan    = appCtx.plan;

  var _day = useState(0); var dayIdx = _day[0]; var setDayIdx = _day[1];
  var _exp = useState(null); var expanded = _exp[0]; var setExpanded = _exp[1];

  var cur   = workout && workout[dayIdx];
  var isPro = plan && plan.type !== "free";
  var toggleExpand = useCallback(function(i) { setExpanded(function(p) { return p === i ? null : i; }); }, []);

  if (!workout || !workout.length) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <EmptyState icon="🏋️" title="Nenhum treino gerado" body="Complete o cadastro para gerar seu plano." />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 90 }}>
      <ScreenHeader
        title="Plano Semanal"
        subtitle={(profile && profile.level) + " — " + (profile && profile.days) + "x/sem — " + ((profile && profile.sessionMinutes) || 45) + "min"}
        right={<FTag color={T.text2}>{(profile && profile.sessionMinutes) || 45}min</FTag>}
      />
      <div style={{ display: "flex", gap: 8, padding: "14px 20px", overflowX: "auto" }}>
        {workout.map(function(_, i) {
          var active = dayIdx === i;
          return (
            <div key={i} onClick={function() { setDayIdx(i); setExpanded(null); }} style={{ padding: "8px 16px", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0, background: active ? T.orange : T.surface, color: active ? "#fff" : T.text2, border: "1px solid " + (active ? T.orange : T.border2), fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "background 0.2s" }}>
              Dia {i + 1}
            </div>
          );
        })}
      </div>
      <div style={{ padding: "0 20px" }}>
        <Card glow style={{ marginBottom: 16 }}>
          <Row gap={12}>
            <span style={{ fontSize: 32 }}>🏋️</span>
            <Col gap={3}>
              <span style={{ fontSize: 18, fontWeight: 900, color: T.orange }}>{cur && cur.name}</span>
              <span style={{ fontSize: 12, color: T.text2 }}>{cur && cur.exercises.length} exercicios — ~{cur && cur.duration}min</span>
            </Col>
          </Row>
          {cur && (cur.adaptedFor || cur.sleepAlert) && (
            <div style={{ marginTop: 12, padding: "8px 12px", background: T.blue + "11", borderRadius: 10, border: "1px solid " + T.blue + "22" }}>
              <span style={{ fontSize: 12, color: T.blue }}>{cur.adaptedFor || cur.sleepAlert}</span>
            </div>
          )}
        </Card>
        {!isPro && (
          <Card style={{ marginBottom: 16, background: T.purpleGl, border: "1px solid " + T.purple + "33" }} animate={false}>
            <Row gap={10} align="center">
              <span style={{ fontSize: 20 }}>🤖</span>
              <Col gap={1} style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Quer tecnicas e series personalizadas com IA?</span>
                <span style={{ fontSize: 12, color: T.text2 }}>O Coach Pro cria um plano unico para seu perfil</span>
              </Col>
            </Row>
            <Btn onPress={function() { go("coach"); }} full size="sm" variant="purple" style={{ marginTop: 12 }}>Abrir Coach IA</Btn>
          </Card>
        )}
        <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>EXERCICIOS — TOQUE PARA DETALHES</p>
        <Col gap={10}>
          {cur && cur.exercises.map(function(ex, i) {
            return <ExerciseCard key={ex.name + i} exercise={ex} expanded={expanded === i} onToggle={function() { toggleExpand(i); }} />;
          })}
        </Col>
        <div style={{ height: 20 }} />
        <Btn onPress={function() { go("checkin"); }} full size="lg">Registrar treino de hoje</Btn>
      </div>
    </div>
  );
}

// ─── SCREEN: COACH ────────────────────────────────────────────────────────────
var ChatBubble = memo(function ChatBubble(props) {
  var msg    = props.msg;
  var isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", marginBottom: 14, animation: "fadeUp 0.2s ease" }}>
      <span style={{ fontSize: 10, color: T.text3, fontWeight: 700, marginBottom: 4, letterSpacing: "0.06em" }}>{isUser ? "VOCE" : "COACH"}</span>
      <div style={{ maxWidth: "84%", padding: "12px 16px", borderRadius: 18, borderBottomRightRadius: isUser ? 4 : 18, borderBottomLeftRadius: isUser ? 18 : 4, background: isUser ? "linear-gradient(135deg," + T.orange + "," + T.orangeHi + ")" : T.surface, border: isUser ? "none" : "1px solid " + T.border2, fontSize: 14, lineHeight: 1.65, color: T.text }}>
        {(msg.content || "").split("\n").map(function(line, i, arr) { return <span key={i}>{line}{i < arr.length - 1 ? <br /> : null}</span>; })}
      </div>
      {msg.time && <span style={{ fontSize: 9, color: T.text3, marginTop: 4 }}>{msg.time}</span>}
    </div>
  );
});

function ChatTab(props) {
  var onUpgrade = props.onUpgrade;
  var appCtx    = useApp();
  var profile   = appCtx.profile;
  var logs      = appCtx.logs;
  var plan      = appCtx.plan;
  var routine   = appCtx.routine;
  var chat      = useChat(onUpgrade);
  var scrollRef = useRef(null);
  var isPro     = plan && plan.type !== "free";
  var suggestions = useMemo(function() { return AI.quickSuggestions(profile, logs, routine); }, [profile, logs, routine]);

  useEffect(function() { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [chat.messages, chat.loading]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {!isPro && (
        <div style={{ padding: "8px 16px", background: T.surface2, borderBottom: "1px solid " + T.border, flexShrink: 0 }}>
          <Row justify="space-between" style={{ marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: chat.remaining <= 0 ? T.red : T.text2, fontWeight: 600 }}>
              {chat.remaining <= 0 ? "Limite diario atingido" : chat.remaining + " msgs restantes hoje"}
            </span>
            <span onClick={onUpgrade} style={{ color: T.orange, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Upgrade</span>
          </Row>
          <Bar value={chat.used} max={FREE_MSG_DAY} color={chat.remaining <= 0 ? T.red : T.orange} thin />
        </div>
      )}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {chat.messages.map(function(msg, i) { return <ChatBubble key={i} msg={msg} />; })}
        {chat.loading && <LoadingDots />}
        {!chat.loading && chat.messages.length <= 2 && (
          <Col gap={8} style={{ marginTop: 8 }}>
            <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.06em" }}>SUGESTOES RAPIDAS</p>
            {suggestions.map(function(s, i) {
              return (
                <div key={i} onClick={function() { if (!chat.hitLimit) chat.send(s); }} style={{ background: T.surface, border: "1px solid " + T.border2, borderRadius: 12, padding: "10px 14px", cursor: chat.hitLimit ? "not-allowed" : "pointer", opacity: chat.hitLimit ? 0.5 : 1, fontSize: 13, transition: "opacity 0.2s" }}>
                  {s}
                </div>
              );
            })}
          </Col>
        )}
        {chat.error && (
          <div style={{ marginTop: 12, background: T.red + "11", border: "1px solid " + T.red + "33", borderRadius: 14, padding: 14 }}>
            <p style={{ fontSize: 13, color: T.red }}>{chat.error}</p>
            {!isPro && <Btn onPress={onUpgrade} size="sm" style={{ marginTop: 10 }}>Desbloquear Pro</Btn>}
          </div>
        )}
      </div>
      <div style={{ padding: "10px 16px 24px", background: T.surface, borderTop: "1px solid " + T.border, flexShrink: 0 }}>
        {chat.hitLimit ? (
          <Btn onPress={onUpgrade} full>Upgrade para mensagens ilimitadas</Btn>
        ) : (
          <Row gap={10} align="flex-end">
            <textarea value={chat.input} onChange={function(e) { chat.setInput(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); chat.send(chat.input); } }} placeholder="Treino, alimentacao, rotina..." rows={1} style={{ flex: 1, background: T.surface2, border: "1px solid " + T.border2, borderRadius: 14, padding: "12px 14px", color: T.text, fontSize: 14, outline: "none", resize: "none", lineHeight: 1.5, maxHeight: 100, overflowY: "auto" }} />
            <button onClick={function() { chat.send(chat.input); }} disabled={chat.loading || !chat.input.trim()} style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: (chat.loading || !chat.input.trim()) ? T.border2 : "linear-gradient(135deg," + T.orange + "," + T.orangeHi + ")", border: "none", cursor: (chat.loading || !chat.input.trim()) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "background 0.2s" }}>
              {chat.loading ? "..." : ">"}
            </button>
          </Row>
        )}
        <p style={{ fontSize: 10, color: T.text3, textAlign: "center", marginTop: 8 }}>
          {isPro ? "Chat ilimitado com memoria — Enter para enviar" : Math.max(0, chat.remaining) + " msgs gratis hoje"}
        </p>
      </div>
    </div>
  );
}

function GenerateTab(props) {
  var onUpgrade = props.onUpgrade;
  var appCtx  = useApp();
  var profile = appCtx.profile;
  var plan    = appCtx.plan;
  var routine = appCtx.routine;
  var async   = useAsyncAction();
  var _res    = useState(null); var result = _res[0]; var setResult = _res[1];
  var isPro   = plan && plan.type !== "free";

  var generate = useCallback(function() {
    async.run(async function() {
      var r = await AI.generateWorkoutPlan(profile, routine);
      setResult(r);
    });
  }, [profile, routine, async]);

  if (!isPro) return (
    <div style={{ padding: "20px 20px 90px" }}>
      <LockGate feature="Geracao de Treino com IA" description="A IA analisa seu perfil completo, rotina e historico para criar um programa unico com tecnicas reais de execucao." onUpgrade={onUpgrade} />
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 90px" }}>
      {!result ? (
        <Card glow style={{ textAlign: "center", padding: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🤖</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>Treino 100% personalizado</p>
          <p style={{ fontSize: 13, color: T.text2, marginBottom: 24, lineHeight: 1.6 }}>A IA analisa seu perfil, rotina, nivel e historico para criar um programa unico.</p>
          <Btn onPress={generate} loading={async.loading} disabled={async.loading} full size="lg">Gerar Treino com IA</Btn>
          {async.error && <p style={{ fontSize: 13, color: T.red, marginTop: 14 }}>{async.error}</p>}
        </Card>
      ) : (
        <Col gap={14}>
          <Card glow>
            <p style={{ fontSize: 11, color: T.orange, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>MENSAGEM DA IA</p>
            <p style={{ fontSize: 14, color: T.text, lineHeight: 1.7 }}>{result.resumo}</p>
            {result.ajuste_chave && <div style={{ background: T.orangeGl, borderRadius: 10, padding: "10px 14px", marginTop: 12, border: "1px solid " + T.orange + "22" }}><span style={{ fontSize: 13, color: T.orange }}>{result.ajuste_chave}</span></div>}
            {result.horario_ideal && <div style={{ background: T.green + "11", borderRadius: 10, padding: "10px 14px", marginTop: 8, border: "1px solid " + T.green + "22" }}><span style={{ fontSize: 13, color: T.green }}>Melhor horario: <strong>{result.horario_ideal}</strong></span></div>}
          </Card>
          {(result.semana || []).map(function(d, i) {
            return (
              <Card key={i} style={{ padding: 18 }} animate={false}>
                <p style={{ fontSize: 16, fontWeight: 900, color: T.orange, marginBottom: 4 }}>{d.dia} — {d.treino}</p>
                <FTag color={T.text2}>{d.foco}</FTag>
                {d.aquecimento && <p style={{ fontSize: 12, color: T.text2, marginTop: 10 }}>Aquecimento: {d.aquecimento}</p>}
                <Col gap={0} style={{ marginTop: 12 }}>
                  {(d.exercicios || []).map(function(ex, j) {
                    return (
                      <div key={j} style={{ paddingTop: 10, borderTop: j > 0 ? "1px solid " + T.border : "none" }}>
                        <Row justify="space-between">
                          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{ex.nome}</span>
                          <span style={{ fontSize: 13, fontWeight: 900, color: T.orange }}>{ex.volume}</span>
                        </Row>
                        {ex.execucao && <p style={{ fontSize: 11, color: T.text2, marginTop: 3 }}>{ex.execucao}</p>}
                        {ex.descanso && <p style={{ fontSize: 11, color: T.text2 }}>Descanso: {ex.descanso}</p>}
                      </div>
                    );
                  })}
                </Col>
                {d.finalizacao && <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + T.border }}><span style={{ fontSize: 12, color: T.text2 }}>{d.finalizacao}</span></div>}
              </Card>
            );
          })}
          <Btn variant="ghost" onPress={function() { setResult(null); }} full>Gerar Novo Plano</Btn>
        </Col>
      )}
    </div>
  );
}

function CoachScreen(props) {
  var go     = props.go;
  var appCtx = useApp(); var plan = appCtx.plan;
  var _tab   = useState("chat"); var tab = _tab[0]; var setTab = _tab[1];
  var isPro  = plan && plan.type !== "free";
  var goPaywall = useCallback(function() { go("paywall"); }, [go]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg }}>
      <div style={{ padding: "52px 20px 0", background: T.surface, borderBottom: "1px solid " + T.border, flexShrink: 0 }}>
        <Row justify="space-between" align="center" style={{ marginBottom: 16 }}>
          <Row gap={10}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg," + T.orange + "," + T.orangeLo + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
            <Col gap={1}>
              <span style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Coach FitPro</span>
              <Row gap={5}><div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green }} /><span style={{ fontSize: 11, color: T.green }}>Online — Conhece seu historico</span></Row>
            </Col>
          </Row>
          <FTag color={isPro ? T.orange : T.text3}>{isPro ? "PRO" : "FREE"}</FTag>
        </Row>
        <div style={{ display: "flex" }}>
          {[["chat","Chat"],["generate","Gerar Treino"]].map(function(pair) {
            return (
              <div key={pair[0]} onClick={function() { setTab(pair[0]); }} style={{ flex: 1, textAlign: "center", padding: "12px 0", borderBottom: "2px solid " + (tab === pair[0] ? T.orange : "transparent"), color: tab === pair[0] ? T.orange : T.text2, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "color 0.2s, border-color 0.2s" }}>
                {pair[1]}
              </div>
            );
          })}
        </div>
      </div>
      {tab === "chat"     && <ChatTab     onUpgrade={goPaywall} />}
      {tab === "generate" && <GenerateTab onUpgrade={goPaywall} />}
    </div>
  );
}

// ─── SCREEN: NUTRITION ────────────────────────────────────────────────────────
function NutritionScreen(props) {
  var go     = props.go;
  var appCtx = useApp(); var profile = appCtx.profile; var plan = appCtx.plan;
  var _tab   = useState("macros"); var tab = _tab[0]; var setTab = _tab[1];
  var _ing   = useState(""); var ingredients = _ing[0]; var setIngredients = _ing[1];
  var _meals = useState(null); var aiMeals = _meals[0]; var setAiMeals = _meals[1];
  var async  = useAsyncAction();
  var nut    = useMemo(function() { return calcNutrition(profile); }, [profile]);
  var isPro  = plan && plan.type !== "free";
  var goal   = GOAL_META[(profile && profile.goal)] || GOAL_META.condicionamento;

  var MACRO_CFG = [
    { key: "protein", label: "Proteina",  unit: "g", icon: "🥩", color: "#E879F9", cf: 4 },
    { key: "carbs",   label: "Carboidr.", unit: "g", icon: "🍚", color: T.blue,    cf: 4 },
    { key: "fat",     label: "Gorduras",  unit: "g", icon: "🫒", color: T.green,   cf: 9 },
  ];
  var WATER_SCHED = [
    ["🌅","Ao acordar","300ml"],["☕","Antes do cafe","200ml"],["🥗","Antes do almoco","300ml"],
    ["🏋️","Pre-treino","500ml"],["💧","Durante treino","400ml"],["🔄","Pos-treino","400ml"],
    ["🍽️","Antes do jantar","200ml"],["🌙","Antes de dormir","200ml"],
  ];
  var genMeals = useCallback(function() {
    if (!ingredients.trim()) return;
    async.run(async function() { var r = await AI.generateMeals(profile, ingredients, nut); setAiMeals(r); });
  }, [ingredients, profile, nut, async]);

  var TABS = [["macros","Macros"],["meals","Refeicoes"],["water","Hidratacao"],["ingredients","Ingredientes"]];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 90 }}>
      <ScreenHeader title="Nutricao" subtitle={goal.diet} right={!isPro ? <FTag color={T.orange}>PRO</FTag> : null} />
      <div style={{ display: "flex", borderBottom: "1px solid " + T.border, overflowX: "auto" }}>
        {TABS.map(function(pair) {
          return (
            <div key={pair[0]} onClick={function() { setTab(pair[0]); }} style={{ flex: 1, minWidth: 80, textAlign: "center", padding: "13px 4px", whiteSpace: "nowrap", borderBottom: "2px solid " + (tab === pair[0] ? T.orange : "transparent"), color: tab === pair[0] ? T.orange : T.text2, fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "color 0.2s, border-color 0.2s" }}>
              {pair[1]}
            </div>
          );
        })}
      </div>
      <div style={{ padding: "20px 20px 0" }}>
        {tab === "macros" && (
          <Col gap={12}>
            <Card glow>
              <p style={{ fontSize: 11, color: T.text2, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 12 }}>META CALORICA DIARIA</p>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 44, fontWeight: 900, color: T.orange }}>{nut.calories}</div>
              <span style={{ fontSize: 13, color: T.text2 }}>kcal/dia — {(profile && profile.weight) || "--"}kg</span>
            </Card>
            {isPro ? MACRO_CFG.map(function(m) {
              var val = nut[m.key] || 0;
              var pct = Math.round((val * m.cf / nut.calories) * 100);
              return (
                <Card key={m.key} style={{ padding: 16 }} animate={false}>
                  <Row justify="space-between" align="center" style={{ marginBottom: 10 }}>
                    <Row gap={8}><span style={{ fontSize: 20 }}>{m.icon}</span><span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{m.label}</span></Row>
                    <Row gap={4} align="baseline"><span style={{ fontSize: 20, fontWeight: 900, color: m.color }}>{val}</span><span style={{ fontSize: 12, color: T.text2 }}>{m.unit}</span></Row>
                  </Row>
                  <Bar value={pct} color={m.color} />
                  <p style={{ fontSize: 11, color: T.text2, marginTop: 5 }}>{pct}% das calorias totais</p>
                </Card>
              );
            }) : <LockGate feature="Analise Detalhada de Macros" description={"Proteina, carboidratos e gorduras para " + goal.long + "."} onUpgrade={function() { go("paywall"); }} />}
          </Col>
        )}
        {tab === "meals" && (
          isPro ? (
            <Col gap={10}>
              {nut.mealPlan.map(function(m, i) {
                return (
                  <Card key={i} style={{ padding: 16 }} animate={false}>
                    <Row justify="space-between" align="center" style={{ marginBottom: 8 }}>
                      <Row gap={10}><div style={{ background: T.orangeGl, borderRadius: 8, padding: "6px 10px" }}><span style={{ fontSize: 12, fontWeight: 700, color: T.orange }}>{m.time}</span></div><span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{m.name}</span></Row>
                      <span style={{ fontSize: 12, color: T.text2 }}>{m.kcal}kcal</span>
                    </Row>
                    <span style={{ fontSize: 13, color: T.text2 }}>{m.desc}</span>
                  </Card>
                );
              })}
            </Col>
          ) : <LockGate feature="Plano de Refeicoes" description="Horarios e calorias adaptadas ao seu objetivo." onUpgrade={function() { go("paywall"); }} />
        )}
        {tab === "water" && (
          <Col gap={12}>
            <Card glow>
              <p style={{ fontSize: 11, color: T.blue, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 12 }}>META DIARIA</p>
              <Row gap={8} align="baseline"><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 52, fontWeight: 900, color: T.blue }}>{nut.water}</div><span style={{ fontSize: 18, color: T.text2 }}>litros</span></Row>
              <p style={{ fontSize: 12, color: T.text2, marginTop: 4 }}>{Math.round(nut.water * 1000 / 250)} copos — {(profile && profile.weight) || "--"}kg</p>
            </Card>
            {WATER_SCHED.map(function(entry) {
              return (
                <Card key={entry[1]} style={{ padding: 14 }} animate={false}>
                  <Row justify="space-between"><Row gap={10}><span style={{ fontSize: 18 }}>{entry[0]}</span><span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{entry[1]}</span></Row><FTag color={T.blue}>{entry[2]}</FTag></Row>
                </Card>
              );
            })}
          </Col>
        )}
        {tab === "ingredients" && (
          isPro ? (
            <Col gap={14}>
              <Card>
                <p style={{ fontSize: 11, color: T.text2, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>O QUE VOCE TEM EM CASA?</p>
                <p style={{ fontSize: 13, color: T.text2, marginBottom: 14, lineHeight: 1.6 }}>A IA monta um plano respeitando suas metas: {nut.protein}g proteina / {nut.calories}kcal</p>
                <FInput value={ingredients} onChange={setIngredients} placeholder="Ex: frango, ovos, arroz, batata-doce..." multiline rows={3} />
                {async.error && <p style={{ fontSize: 13, color: T.red, marginTop: 8 }}>{async.error}</p>}
                <Btn onPress={genMeals} loading={async.loading} disabled={async.loading || !ingredients.trim()} full size="lg" style={{ marginTop: 14 }}>Gerar Refeicoes com IA</Btn>
              </Card>
              {aiMeals && (
                <Col gap={12}>
                  {aiMeals.aviso && <div style={{ background: T.orangeGl, border: "1px solid " + T.orange + "33", borderRadius: 14, padding: 14 }}><span style={{ fontSize: 13, color: T.orange }}>{aiMeals.aviso}</span></div>}
                  {(aiMeals.refeicoes || []).map(function(r, i) {
                    return (
                      <Card key={i} style={{ padding: 16 }} animate={false}>
                        <Row justify="space-between" align="center" style={{ marginBottom: 8 }}>
                          <Row gap={10}><div style={{ background: T.orangeGl, borderRadius: 8, padding: "6px 10px" }}><span style={{ fontSize: 12, fontWeight: 700, color: T.orange }}>{r.horario}</span></div><span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{r.nome}</span></Row>
                          <span style={{ fontSize: 12, color: T.text2 }}>{r.kcal}kcal</span>
                        </Row>
                        <p style={{ fontSize: 13, color: T.text2 }}>{r.descricao}</p>
                        <Row gap={10} style={{ marginTop: 10 }}><FTag color="#E879F9">{r.proteina}g prot</FTag><FTag color={T.blue}>{r.carbs}g carbs</FTag></Row>
                      </Card>
                    );
                  })}
                  <Btn variant="ghost" onPress={function() { setAiMeals(null); }} full>Gerar Novo Plano</Btn>
                </Col>
              )}
            </Col>
          ) : <LockGate feature="Refeicoes por Ingredientes" description="Informe o que tem em casa e a IA monta um plano com seus macros exatos." onUpgrade={function() { go("paywall"); }} />
        )}
      </div>
    </div>
  );
}

// ─── SCREEN: PROGRESS ────────────────────────────────────────────────────────
function ProgressScreen(props) {
  var go     = props.go;
  var appCtx = useApp();
  var logs   = appCtx.logs; var profile = appCtx.profile; var plan = appCtx.plan; var gami = appCtx.gami;
  var prog   = useProgress(logs);
  var goalProg = useMemo(function() { return calcGoalProgress(logs, profile); }, [logs, profile]);
  var isPro  = plan && plan.type !== "free";
  var xp     = (gami && gami.xp) || 0;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 90 }}>
      <ScreenHeader title="Progresso" subtitle={(profile && profile.level) + " — " + (profile && profile.days) + "x/sem"} />
      <div style={{ padding: "20px 20px 0" }}>
        {/* XP Summary */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>SEU NIVEL</p>
          <XPBar xp={xp} />
        </div>

        {/* Week */}
        <Card style={{ marginBottom: 16 }} animate={false}>
          <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 14 }}>ESTA SEMANA</p>
          <WeekCalendar weekLogs={prog.weekLogs} />
        </Card>

        {/* Intensity */}
        {logs.length >= 3 && (
          <Card style={{ marginBottom: 16, background: prog.intensityFactor < 0.85 ? T.red + "11" : prog.intensityFactor > 1.05 ? T.green + "11" : T.orangeGl, border: "1px solid " + (prog.intensityFactor < 0.85 ? T.red : prog.intensityFactor > 1.05 ? T.green : T.orange) + "33" }} animate={false}>
            <Row gap={8}>
              <span style={{ fontSize: 20 }}>{prog.intensityFactor < 0.85 ? "⚠️" : prog.intensityFactor > 1.05 ? "🚀" : "✅"}</span>
              <Col gap={2}>
                <span style={{ fontSize: 14, fontWeight: 700, color: prog.intensityFactor < 0.85 ? T.red : prog.intensityFactor > 1.05 ? T.green : T.orange }}>{prog.intensityLabel}</span>
                <span style={{ fontSize: 12, color: T.text2 }}>Cansaco medio {prog.avgFatigue}/5 — Dificuldade {prog.avgDiff}/5</span>
              </Col>
            </Row>
          </Card>
        )}

        {/* Goal Journey */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>JORNADA DO OBJETIVO</p>
          <GoalJourneyBar progress={goalProg} goal={profile && profile.goal} />
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <StatCard value={prog.trained}              label="Treinos feitos"    color={T.orange} icon="🏋️" />
          <StatCard value={prog.rate + "%"}           label="Taxa conclusao"    color={T.green}  icon="✅" />
          <StatCard value={prog.avgFatigue + "/5"}    label="Cansaco medio"     color={prog.avgFatigue > 4 ? T.red : T.green} icon="😓" />
          <StatCard value={xp}                        label="XP total"          color={T.purple} icon="⚡" />
        </div>

        {/* Progress bars */}
        <Card style={{ marginBottom: 16 }} animate={false}>
          <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16 }}>METAS SEMANAIS</p>
          <Col gap={16}>
            <ProgressRow label="Treinos realizados" value={prog.trained}   max={(profile && profile.days) || 3} color={T.orange} suffix={prog.trained + "/" + ((profile && profile.days) || 3)} />
            <ProgressRow label="Consistencia"       value={prog.rate}      max={100}                            color={T.green}  suffix={prog.rate + "%"} />
            <ProgressRow label="Treinos completos"  value={prog.completed} max={prog.trained || 1}              color={T.blue}   suffix={prog.completed + "/" + prog.trained} />
          </Col>
        </Card>

        {/* Chart (Pro) */}
        {isPro ? (
          <Card style={{ marginBottom: 16 }} animate={false}>
            <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16 }}>VOLUME — ULTIMOS 7 DIAS</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
              {prog.weekLogs.map(function(entry, i) {
                var h = entry.log && entry.log.trained ? Math.max(20, 100 - (entry.log.fatigue || 3) * 12) : 6;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", height: h + "%", background: entry.log && entry.log.trained ? "linear-gradient(180deg," + T.orange + "," + T.orangeLo + ")" : T.border2, borderRadius: "5px 5px 0 0", transition: "height 0.5s ease" }} />
                    <span style={{ fontSize: 9, color: entry.isToday ? T.orange : T.text3 }}>{entry.label}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <LockGate feature="Graficos Avancados" description="Volume de treino e analise de performance semana a semana." onUpgrade={function() { go("paywall"); }} />
        )}

        {!logs.length && <EmptyState icon="📋" title="Sem check-ins ainda" body="Registre seus treinos diariamente para ver sua evolucao." action="Fazer check-in" onAction={function() { go("checkin"); }} />}

        {logs.length > 0 && (
          <>
            <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10, marginTop: 16 }}>ULTIMOS CHECK-INS</p>
            <Col gap={8}>
              {[].concat(logs).reverse().slice(0, 5).map(function(l, i) {
                return (
                  <Card key={i} style={{ padding: 14 }} animate={false}>
                    <Row justify="space-between">
                      <Row gap={8}>
                        <span>{l.trained ? "✅" : "💤"}</span>
                        <Col gap={2}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{l.trained ? "Treinou" : "Descanso"}</span>
                          <span style={{ fontSize: 11, color: T.text2 }}>{new Date(l.timestamp).toLocaleDateString("pt-BR")}</span>
                        </Col>
                      </Row>
                      {l.trained && <Row gap={8}><span style={{ fontSize: 11, color: T.text2 }}>Cansaco {l.fatigue}/5</span><span style={{ fontSize: 11, color: T.purple, fontWeight: 700 }}>+{l.xpGained || 0} XP</span></Row>}
                    </Row>
                    {l.notes && <p style={{ fontSize: 12, color: T.text2, marginTop: 8, fontStyle: "italic" }}>"{l.notes}"</p>}
                  </Card>
                );
              })}
            </Col>
          </>
        )}
      </div>
    </div>
  );
}

// ─── SCREEN: CHECKIN (upgraded v7 — leads to post-workout celebration) ─────────
function CheckinScreen(props) {
  var go     = props.go;
  var appCtx = useApp();
  var user   = appCtx.user; var profile = appCtx.profile; var logs = appCtx.logs;
  var routine = appCtx.routine; var plan = appCtx.plan; var gami = appCtx.gami;
  var dispatch = appCtx.dispatch;

  var INIT_D = { trained: null, completed: null, difficulty: 3, fatigue: 3, notes: "" };
  var _d   = useState(INIT_D); var d = _d[0]; var setD = _d[1];
  var _sav = useState(false);  var saving = _sav[0]; var setSaving = _sav[1];

  function setVal(k, v) { setD(function(p) { return Object.assign({}, p, { [k]: v }); }); }

  async function save() {
    setSaving(true);
    var dateKey  = new Date().toDateString();
    var trained  = logs.filter(function(l) { return l.trained; }).length;
    var newStreak = d.trained ? trained + 1 : trained;

    // Calculate XP
    var xpGained = 0;
    if (d.trained && d.completed) xpGained = XP_WORKOUT_COMPLETE;
    else if (d.trained && !d.completed) xpGained = XP_WORKOUT_PARTIAL;
    else xpGained = XP_CHECKIN_REST;

    // Streak bonus
    var isStreakMilestone = d.trained && newStreak > 0 && newStreak % 7 === 0;
    if (isStreakMilestone) xpGained += XP_STREAK_BONUS_7;

    var entry    = Object.assign({}, d, { timestamp: new Date().toISOString(), date: dateKey, xpGained: xpGained });
    var newLogs  = logs.concat([entry]);
    var newWorkout = generateWorkout(profile, newLogs.slice(-5), routine);

    // Update gami
    var prevGami = gami || { xp: 0, lastXPDate: "", missionsDone: {} };
    var prevXP   = prevGami.xp || 0;
    var newGami  = Object.assign({}, prevGami, { xp: prevXP + xpGained, lastXPDate: dateKey });

    // Check improvement (compare fatigue with last 3 logged trainings)
    var prevLogs    = logs.filter(function(l) { return l.trained; }).slice(-3);
    var avgPrevFat  = prevLogs.length ? prevLogs.reduce(function(s, l) { return s + (l.fatigue || 3); }, 0) / prevLogs.length : 5;
    var improvement = d.trained && d.fatigue < avgPrevFat;
    var isNewRecord = newStreak > 0 && newStreak % 7 === 0;

    // Get AI analysis (Pro only, non-blocking)
    var aiMsg = null;
    if (plan && plan.type !== "free" && d.trained) {
      try { aiMsg = await AI.postWorkoutAnalysis(profile, logs, entry); } catch(e) { aiMsg = null; }
    }

    await Promise.all([
      DB.saveLogs(user.id, newLogs),
      DB.saveWorkout(user.id, newWorkout),
      DB.saveGamification(user.id, newGami),
    ]);

    dispatch({
      type: "LOG_ADDED",
      logs: newLogs,
      workout: newWorkout,
      gami: newGami,
      postWorkout: d.trained ? {
        xp:          xpGained,
        streak:      newStreak,
        aiMsg:       aiMsg,
        isNewRecord: isNewRecord,
        improvement: improvement,
      } : null,
    });

    if (d.trained) {
      go("postworkout");
    } else {
      go("home");
    }
    setSaving(false);
  }

  var FATIGUE_ICONS = ["😊","😌","😐","😓","😵"];
  var DIFF_ICONS    = ["😎","🙂","😐","😤","🥵"];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "52px 24px 32px", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 900, color: T.text, marginBottom: 4 }}>Check-in Diario</div>
      <p style={{ fontSize: 13, color: T.text2, marginBottom: 28 }}>Como foi hoje?</p>

      <Col gap={22} style={{ flex: 1 }}>
        <Col gap={10}>
          <p style={{ fontSize: 11, color: T.text2, fontWeight: 700, letterSpacing: "0.08em" }}>VOCE TREINOU HOJE?</p>
          <Row gap={10}>
            {[{ v: true, l: "Sim, treinei!", xp: "+120 XP" }, { v: false, l: "Dia de descanso", xp: "+20 XP" }].map(function(o) {
              return (
                <div key={String(o.v)} onClick={function() { setVal("trained", o.v); }} style={{ flex: 1, padding: "16px 12px", textAlign: "center", border: "2px solid " + (d.trained === o.v ? T.orange : T.border2), borderRadius: 16, cursor: "pointer", background: d.trained === o.v ? T.orangeGl : T.surface, transition: "all 0.2s" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: d.trained === o.v ? T.orange : T.text }}>{o.l}</p>
                  <p style={{ fontSize: 10, color: T.purple, fontWeight: 700, marginTop: 4 }}>{o.xp}</p>
                </div>
              );
            })}
          </Row>
        </Col>

        {d.trained && (
          <>
            <Col gap={10}>
              <p style={{ fontSize: 11, color: T.text2, fontWeight: 700, letterSpacing: "0.08em" }}>COMPLETOU O TREINO?</p>
              <Row gap={10}>
                {[{ v: true, l: "Completo", xp: "+120 XP" }, { v: false, l: "Parcial", xp: "+60 XP" }].map(function(o) {
                  return (
                    <div key={String(o.v)} onClick={function() { setVal("completed", o.v); }} style={{ flex: 1, padding: "14px 0", textAlign: "center", border: "2px solid " + (d.completed === o.v ? T.orange : T.border2), borderRadius: 16, cursor: "pointer", background: d.completed === o.v ? T.orangeGl : T.surface, transition: "all 0.2s" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: d.completed === o.v ? T.orange : T.text }}>{o.l}</p>
                      <p style={{ fontSize: 10, color: T.purple, fontWeight: 700, marginTop: 4 }}>{o.xp}</p>
                    </div>
                  );
                })}
              </Row>
            </Col>
            <Col gap={8}>
              <p style={{ fontSize: 11, color: T.text2, fontWeight: 700, letterSpacing: "0.08em" }}>CANSACO: {FATIGUE_ICONS[d.fatigue - 1]} {d.fatigue}/5</p>
              <input type="range" min={1} max={5} value={d.fatigue} onChange={function(e) { setVal("fatigue", Number(e.target.value)); }} style={{ accentColor: T.orange }} />
              <Row justify="space-between"><span style={{ fontSize: 11, color: T.text3 }}>Leve</span><span style={{ fontSize: 11, color: T.text3 }}>Exausto</span></Row>
            </Col>
            <Col gap={8}>
              <p style={{ fontSize: 11, color: T.text2, fontWeight: 700, letterSpacing: "0.08em" }}>DIFICULDADE: {DIFF_ICONS[d.difficulty - 1]} {d.difficulty}/5</p>
              <input type="range" min={1} max={5} value={d.difficulty} onChange={function(e) { setVal("difficulty", Number(e.target.value)); }} style={{ accentColor: T.blue }} />
              <Row justify="space-between"><span style={{ fontSize: 11, color: T.text3 }}>Facil</span><span style={{ fontSize: 11, color: T.text3 }}>Muito dificil</span></Row>
            </Col>
          </>
        )}

        <Col gap={8}>
          <p style={{ fontSize: 11, color: T.text2, fontWeight: 700, letterSpacing: "0.08em" }}>OBSERVACOES (opcional)</p>
          <textarea value={d.notes} onChange={function(e) { setVal("notes", e.target.value); }} placeholder="Como se sentiu? O que foi dificil?" style={{ width: "100%", boxSizing: "border-box", background: T.surface, border: "1px solid " + T.border2, borderRadius: 14, padding: "14px 16px", color: T.text, fontSize: 14, outline: "none", resize: "none", height: 80, lineHeight: 1.5 }} />
        </Col>
      </Col>

      <Btn onPress={save} loading={saving} disabled={d.trained === null || saving} full size="lg" style={{ marginTop: 24 }}>
        {saving ? "Salvando..." : "Registrar e ver resultado"}
      </Btn>
    </div>
  );
}

// ─── SCREEN: PLANNER ──────────────────────────────────────────────────────────
function PlannerScreen(props) {
  var go     = props.go;
  var appCtx = useApp();
  var profile = appCtx.profile; var workout = appCtx.workout; var logs = appCtx.logs;
  var plan   = appCtx.plan; var routine = appCtx.routine; var user = appCtx.user;
  var dispatch = appCtx.dispatch;
  var isPro  = plan && plan.type !== "free";
  var async  = useAsyncAction();
  var _anal  = useState(null); var analysis = _anal[0]; var setAnalysis = _anal[1];
  var _edit  = useState(false); var editMode = _edit[0]; var setEditMode = _edit[1];
  var _rt    = useState(routine || { wakeUpTime: "07:00", bedTime: "23:00", sleepHours: 7, sportsToday: "", injuryNotes: "", freeTimeStart: "" });
  var rt = _rt[0]; var setRt = _rt[1];
  function setR(k, v) { setRt(function(p) { return Object.assign({}, p, { [k]: v }); }); }

  var analyze = useCallback(function() {
    async.run(async function() { var r = await AI.analyzeRoutine(profile, rt); setAnalysis(r); });
  }, [profile, rt, async]);

  async function saveRoutine() {
    var updated = Object.assign({}, rt, { sleepHours: Number(rt.sleepHours) || 7, updatedAt: new Date().toISOString() });
    var newWorkout = generateWorkout(profile, logs.slice(-5), updated);
    await Promise.all([DB.saveRoutine(user.id, updated), DB.saveWorkout(user.id, newWorkout)]);
    dispatch({ type: "ROUTINE_UPDATED", routine: updated, workout: newWorkout });
    setEditMode(false);
  }

  if (!isPro) return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 90 }}>
      <ScreenHeader title="Planejador" subtitle="Semana inteligente" />
      <div style={{ padding: "20px 20px 0" }}>
        <LockGate feature="Planejador Semanal Inteligente" description="A IA analisa sua rotina diaria e gera o melhor horario, intensidade e estrutura de treino para cada dia." onUpgrade={function() { go("paywall"); }} />
      </div>
    </div>
  );

  var bestTime = calcBestWorkoutTime(rt);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 90 }}>
      <ScreenHeader title="Planejador" subtitle="Analise de rotina semanal" right={<FTag>PRO</FTag>} />
      <div style={{ padding: "20px 20px 0" }}>
        <Card style={{ marginBottom: 16 }} animate={false}>
          <Row justify="space-between" align="center" style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Minha Rotina</span>
            <button onClick={function() { setEditMode(function(e) { return !e; }); }} style={{ background: "none", border: "none", color: T.orange, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{editMode ? "Fechar" : "Editar"}</button>
          </Row>
          {editMode ? (
            <Col gap={12}>
              <Row gap={12}><div style={{ flex: 1 }}><FInput label="Acorda" value={rt.wakeUpTime} onChange={function(v) { setR("wakeUpTime", v); }} type="time" icon="🌅" /></div><div style={{ flex: 1 }}><FInput label="Dorme" value={rt.bedTime} onChange={function(v) { setR("bedTime", v); }} type="time" icon="🌙" /></div></Row>
              <FInput label="Horas de sono" value={String(rt.sleepHours)} onChange={function(v) { setR("sleepHours", v); }} type="number" suffix="h" icon="😴" />
              <FInput label="Esporte hoje" value={rt.sportsToday} onChange={function(v) { setR("sportsToday", v); }} placeholder="basquete, futebol..." icon="🏀" />
              <FInput label="Tempo livre a partir das" value={rt.freeTimeStart} onChange={function(v) { setR("freeTimeStart", v); }} type="time" icon="⏰" />
              <FInput label="Lesoes ou dores" value={rt.injuryNotes} onChange={function(v) { setR("injuryNotes", v); }} placeholder="ex: joelho esquerdo..." icon="🩹" />
              <Row gap={10}><Btn variant="dim" onPress={function() { setEditMode(false); }} style={{ flex: 1 }}>Cancelar</Btn><Btn onPress={saveRoutine} style={{ flex: 2 }}>Salvar e Atualizar Treino</Btn></Row>
            </Col>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { l: "Acorda",    v: rt.wakeUpTime || "--" },
                { l: "Dorme",     v: rt.bedTime || "--" },
                { l: "Sono",      v: (rt.sleepHours || "--") + "h" },
                { l: "Melhor hora", v: bestTime || "--" },
                { l: "Esporte",   v: rt.sportsToday || "Nenhum" },
                { l: "Lesao",     v: rt.injuryNotes || "Nenhuma" },
              ].map(function(item) {
                return (
                  <div key={item.l} style={{ background: T.surface2, borderRadius: 12, padding: "10px 12px" }}>
                    <p style={{ fontSize: 10, color: T.text3, marginBottom: 2 }}>{item.l}</p>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{item.v}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {!editMode && (
          <>
            <Btn onPress={analyze} loading={async.loading} disabled={async.loading} full style={{ marginBottom: 16 }}>Analisar minha rotina com IA</Btn>
            {async.error && <p style={{ fontSize: 13, color: T.red, textAlign: "center", marginBottom: 12 }}>{async.error}</p>}
            {analysis && (
              <Card glow style={{ marginBottom: 20 }} animate={false}>
                <p style={{ fontSize: 11, color: T.orange, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>ANALISE DA IA</p>
                <Col gap={8}>
                  {[{ l: "Melhor horario", v: analysis.melhor_horario },{ l: "Intensidade", v: analysis.intensidade_recomendada },{ l: "Duracao ideal", v: analysis.duracao_ideal }].filter(function(x) { return x.v; }).map(function(item) {
                    return <Row key={item.l} justify="space-between"><span style={{ fontSize: 13, color: T.text2 }}>{item.l}</span><span style={{ fontSize: 13, fontWeight: 700, color: T.orange }}>{item.v}</span></Row>;
                  })}
                </Col>
                {analysis.motivo && <div style={{ marginTop: 12, padding: "10px 14px", background: T.orangeGl, borderRadius: 10, border: "1px solid " + T.orange + "22" }}><span style={{ fontSize: 13, color: T.orange }}>{analysis.motivo}</span></div>}
                {(analysis.avisos || []).map(function(a, i) { return <div key={i} style={{ marginTop: 8, padding: "8px 12px", background: T.red + "11", borderRadius: 10 }}><span style={{ fontSize: 13, color: T.red }}>{a}</span></div>; })}
              </Card>
            )}
          </>
        )}

        <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>SEMANA DE TREINO</p>
        <Col gap={10}>
          {(workout || []).map(function(w, i) {
            return (
              <Card key={i} style={{ padding: 14 }} animate={false}>
                <Row justify="space-between" align="center">
                  <Row gap={10}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg," + T.orange + "," + T.orangeLo + ")", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 14, flexShrink: 0 }}>{i + 1}</div>
                    <Col gap={2}><span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{w.name}</span><span style={{ fontSize: 12, color: T.text2 }}>{w.exercises.length} ex — ~{w.duration}min</span></Col>
                  </Row>
                  {w.adaptedFor && <FTag color={T.blue}>adaptado</FTag>}
                </Row>
              </Card>
            );
          })}
        </Col>
      </div>
    </div>
  );
}

// ─── SCREEN: SETTINGS ─────────────────────────────────────────────────────────
function SettingsScreen(props) {
  var go     = props.go;
  var appCtx = useApp();
  var user   = appCtx.user; var profile = appCtx.profile; var plan = appCtx.plan; var gami = appCtx.gami;
  var dispatch = appCtx.dispatch;
  var isPro  = plan && plan.type !== "free";
  var xp     = (gami && gami.xp) || 0;
  var lvl    = xpToLevel(xp);

  var logout = useCallback(async function() {
    await DB.clearCurrentUser();
    dispatch({ type: "LOGOUT" });
  }, [dispatch]);

  var rePlan = useCallback(function() { dispatch({ type: "SET_STATUS", payload: "onboard" }); }, [dispatch]);

  var FIELDS = [
    { l: "Peso",        v: (profile && profile.weight) + "kg" },
    { l: "Altura",      v: (profile && profile.height) + "cm" },
    { l: "Idade",       v: (profile && profile.age) + " anos" },
    { l: "Nivel",       v: (profile && profile.level) || "--" },
    { l: "Sexo",        v: (profile && profile.sex)   || "--" },
    { l: "Treinos/sem", v: (profile && profile.days)  + "x" },
    { l: "Min/sessao",  v: ((profile && profile.sessionMinutes) || 45) + "min" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 90 }}>
      <ScreenHeader title="Conta" />
      <div style={{ padding: "20px 20px 0" }}>
        <Card glow style={{ marginBottom: 20 }} animate={false}>
          <Row gap={14}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg," + T.orange + "," + T.orangeLo + ")", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 900, color: "#fff" }}>
              {((user && user.name) || "?")[0].toUpperCase()}
            </div>
            <Col gap={3}>
              <span style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{(user && user.name) || "--"}</span>
              <span style={{ fontSize: 12, color: T.text2 }}>{(user && user.email) || "--"}</span>
              <Row gap={6}>
                <FTag color={isPro ? T.orange : T.text3}>{isPro ? "PRO" : "FREE"}</FTag>
                <FTag color={T.purple}>Nv {lvl} — {getLevelTitle(lvl)}</FTag>
              </Row>
            </Col>
          </Row>
          {isPro && plan && plan.trialEnds && new Date(plan.trialEnds) > new Date() && (
            <div style={{ marginTop: 12, padding: "8px 12px", background: T.green + "11", borderRadius: 10, border: "1px solid " + T.green + "22" }}>
              <span style={{ fontSize: 12, color: T.green }}>Periodo gratis ate {new Date(plan.trialEnds).toLocaleDateString("pt-BR")}</span>
            </div>
          )}
        </Card>

        <Card style={{ marginBottom: 14 }} animate={false}>
          <p style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 14 }}>MEU PERFIL</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {FIELDS.map(function(item) {
              return (
                <div key={item.l} style={{ background: T.surface2, borderRadius: 12, padding: "10px 12px" }}>
                  <p style={{ fontSize: 10, color: T.text3, marginBottom: 2 }}>{item.l.toUpperCase()}</p>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{item.v}</span>
                </div>
              );
            })}
          </div>
          <div style={{ height: 1, background: T.border, marginBottom: 12 }} />
          <p style={{ fontSize: 11, color: T.text3, marginBottom: 4 }}>OBJETIVO</p>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.orange }}>{(GOAL_META[(profile && profile.goal)] || {}).short || "--"}</span>
        </Card>

        <Col gap={10}>
          {!isPro && <Btn onPress={function() { go("paywall"); }} full>Upgrade para Pro — R$19,90/mes</Btn>}
          <Btn variant="dim"    onPress={rePlan}  full>Atualizar perfil e treino</Btn>
          <Btn variant="danger" onPress={logout}  full>Sair da conta</Btn>
        </Col>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <p style={{ fontSize: 11, color: T.text3 }}>FitPro v7.0 — Gamificado e focado em retencao</p>
          <p style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>Conecte Supabase + Stripe para lancamento</p>
        </div>
      </div>
    </div>
  );
}

// ─── APP PROVIDER + ROUTER + APP ─────────────────────────────────────────────
function AppProvider(props) {
  var _s   = useReducer(appReducer, INIT_STATE);
  var state    = _s[0];
  var dispatch = _s[1];

  useEffect(function() {
    var init = async function() {
      var u = await DB.getCurrentUser();
      if (!u) { dispatch({ type: "SET_STATUS", payload: "auth" }); return; }
      var results = await Promise.all([
        DB.getProfile(u.id), DB.getPlan(u.id), DB.getLogs(u.id),
        DB.getWorkout(u.id), DB.getRoutine(u.id), DB.getGamification(u.id),
      ]);
      var profile = results[0]; var plan = results[1]; var logs = results[2];
      var workout = results[3]; var routine = results[4]; var gami = results[5];
      dispatch({
        type: "AUTH_OK", user: u, profile: profile, plan: plan, logs: logs,
        routine: routine, gami: gami,
        workout: workout || (profile ? generateWorkout(profile, logs || [], routine) : []),
      });
    };
    init();
  }, []);

  var value = useMemo(function() { return Object.assign({}, state, { dispatch: dispatch }); }, [state]);
  return React.createElement(AppCtx.Provider, { value: value }, props.children);
}

function Router() {
  var appCtx   = useApp();
  var status   = appCtx.status;
  var screen   = appCtx.screen;
  var dispatch = appCtx.dispatch;
  var postWO   = appCtx.postWorkout;

  var go = useCallback(function(s) { dispatch({ type: "SET_SCREEN", payload: s }); }, [dispatch]);

  if (status === "loading") return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Col gap={16} style={{ alignItems: "center" }}>
        <div style={{ fontSize: 52 }}>🔥</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 900, color: T.text }}>FIT<span style={{ color: T.orange }}>PRO</span></div>
        <SkeletonCard />
      </Col>
    </div>
  );

  if (status === "auth")    return <AuthScreen />;
  if (status === "onboard") return <OnboardingScreen />;

  var noNav = ["checkin","checkout","postworkout"].indexOf(screen) !== -1;

  return (
    <>
      {screen === "home"        && <HomeScreen        go={go} />}
      {screen === "workout"     && <WorkoutScreen     go={go} />}
      {screen === "coach"       && <CoachScreen       go={go} />}
      {screen === "nutrition"   && <NutritionScreen   go={go} />}
      {screen === "progress"    && <ProgressScreen    go={go} />}
      {screen === "checkin"     && <CheckinScreen     go={go} />}
      {screen === "postworkout" && <PostWorkoutScreen go={go} />}
      {screen === "planner"     && <PlannerScreen     go={go} />}
      {screen === "settings"    && <SettingsScreen    go={go} />}
      {screen === "paywall"     && <PaywallScreen     onBack={function() { go("home"); }} />}
      {screen === "checkout"    && <CheckoutScreen />}
      {!noNav && <Nav screen={screen} go={go} />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div style={{ width: "100%", minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.text, position: "relative", overflowX: "hidden" }}>
        <style>{FONTS + GLOBAL_CSS}</style>
        <Router />
      </div>
    </AppProvider>
  );
}import { supabase } from "./lib/supabase"
import { useEffect } from "react"

function App() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      console.log(data, error)
    })
  }, [])

  return <div>FitPro</div>
}

export default App