/* =========================
   DATI & CONFIG
========================= */

// Tassi gacha (%)
const RATES = { "3": 20, "2": 50, "1": 30 };

// LocalStorage
const LS_KEY = "mgrpg_owned_v2";
const saveOwned = (arr)=>localStorage.setItem(LS_KEY, JSON.stringify(arr));
const loadOwned = ()=>{
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
};

// Util
const randInt = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const choice = (arr)=>arr[Math.floor(Math.random()*arr.length)];
const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
function weightedPick(rates){
  const ent = Object.entries(rates);
  const total = ent.reduce((a,[,w])=>a+w,0);
  let r = Math.random()*total;
  for(const [k,w] of ent){ if(r < w) return parseInt(k,10); r -= w; }
  return parseInt(ent[0][0],10);
}

/* =========================
   STATUS
========================= */
// Generici
const GENERIC_STATUS = {
  Schivata: { name:"Schivata", desc:"Ignora gli attacchi ricevuti mentre è attiva." },
  Amplificazione: { name:"Amplificazione", desc:"Raddoppia i valori numerici della skill." },
  Scudo: { name:"Scudo", desc:"Ignora i danni ricevuti per la durata (eccetto attacchi ad area)." },
  Indebolito: { name:"Indebolito", desc:"Dimezza i valori numerici delle skill." },
  Blocco: { name:"Blocco", desc:"La skill bersagliata non può essere usata per la durata." }
};

// Esclusivi
const EXCLUSIVE_STATUS = {
  NubeStatica: { name:"Nube Statica", desc:"Se il bersaglio usa una skill subisce danno extra." },
  Sbornia: { name:"Sbornia", desc:"Funziona come Indebolito e infligge danno ATK di Faendal quando si usa una skill." },
  CateneSpettrali: { name:"Catene Spettrali", desc:"Status cumulabile, a 4 stack diventa Indebolito." }
};

/* =========================
   PERSONAGGI
========================= */
const CHARACTER_TEMPLATES = [
  { 
    id:"Selas", stars:3, HP:100, ATK:6, DIF:2, AF:[1,10], VOL:6, 
    skills:["selas_s1","selas_s2","selas_s3"], passive:"selas_core" 
  },
  { 
    id:"Edgar", stars:2, HP:100, ATK:2, DIF:2, AF:[2,12], VOL:4, 
    skills:["edgar_s1","edgar_s2","edgar_s3"], passive:"edgar_core" 
  },
  { 
    id:"Faendal", stars:2, HP:100, ATK:2, DIF:2, AF:[2,12], VOL:4, 
    skills:["faendal_s1","faendal_s2","faendal_s3"], passive:"faendal_core" 
  },
  { 
    id:"Furio", stars:1, HP:100, ATK:2, DIF:4, AF:[1,4], VOL:6, 
    skills:["furio_s1","furio_s2","furio_s3"], passive:"furio_core" 
  }
];

function templateById(id){ 
  return CHARACTER_TEMPLATES.find(c=>c.id===id); 
}

function instantiateOwnedFromTemplate(tmpl){
  const uid = `${tmpl.id}_${Date.now()}_${Math.floor(Math.random()*9999)}`;
  return {
    uid,
    baseId: tmpl.id,
    name: tmpl.id,
    stars: tmpl.stars,
    PFmax: tmpl.HP,
    ATK: tmpl.ATK,
    DIF: tmpl.DIF,
    AF: [tmpl.AF[0], tmpl.AF[1]],
    VOL: tmpl.VOL,
    skills: [...tmpl.skills],
    passive: tmpl.passive
  };
}

/* =========================
   ESPORTA GLOBALI
========================= */
window.RATES = RATES;
window.LS_KEY = LS_KEY;
window.saveOwned = saveOwned;
window.loadOwned = loadOwned;
window.randInt = randInt;
window.choice = choice;
window.clamp = clamp;
window.weightedPick = weightedPick;
window.GENERIC_STATUS = GENERIC_STATUS;
window.EXCLUSIVE_STATUS = EXCLUSIVE_STATUS;
window.CHARACTER_TEMPLATES = CHARACTER_TEMPLATES;
window.templateById = templateById;
window.instantiateOwnedFromTemplate = instantiateOwnedFromTemplate;
