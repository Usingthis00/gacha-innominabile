/* =========================
   CONFIG & DATA
========================= */

// Gacha rates (percentages). Modifica qui se vuoi cambiare i tassi.
const RATES = { "3": 20, "2": 50, "1": 30 };

// LocalStorage key
const LS_KEY = "mgrpg_owned_v1";

// Personaggi base (come richiesto)
const CHARACTER_TEMPLATES = [
  { id:"Selas",   stars:3, PF:100, ATK:6, DIF:2, AF:[1,10], VOL:6 },
  { id:"Edgar",   stars:2, PF:100, ATK:2, DIF:2, AF:[2,12], VOL:4 },
  { id:"Faendal", stars:2, PF:100, ATK:2, DIF:2, AF:[2,12], VOL:4 },
  { id:"Furio",   stars:1, PF:100, ATK:2, DIF:4, AF:[1,4],  VOL:6 },
];

// Una sola skill comune per ora
const SKILL_ASSALTO = {
  id: "assalto",
  name: "Assalto",
  desc: "Attacca da 1 a 4 volte. Ogni colpo infligge max(1, ATK - DIF).",
  type: "damage_multi"
};


/* =========================
   STORAGE
========================= */
const saveOwned = (arr)=>localStorage.setItem(LS_KEY, JSON.stringify(arr));
const loadOwned = ()=>{
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
};


/* =========================
   UTILS
========================= */
const randInt = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const choice = (arr)=>arr[Math.floor(Math.random()*arr.length)];
const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

function weightedPick(rates){
  const entries = Object.entries(rates); // [["3",20],["2",50],["1",30]]
  const total = entries.reduce((a, [,w])=>a+w,0);
  let r = Math.random()*total;
  for(const [k,w] of entries){
    if(r < w) return parseInt(k,10);
    r -= w;
  }
  return parseInt(entries[0][0],10);
}

function templateById(id){ return CHARACTER_TEMPLATES.find(c=>c.id===id); }


/* =========================
   GACHA
========================= */
function instantiateChar(template){
  // Nota: AF rimane come range, lo useremo quando introdurremo debuff
  const uid = `${template.id}_${Date.now()}_${Math.floor(Math.random()*9999)}`;
  return {
    uid,
    baseId: template.id,
    name: template.id,
    stars: template.stars,
    PFmax: template.PF,
    ATK: template.ATK,
    DIF: template.DIF,
    AF: template.AF, // [min,max]
    VOL: template.VOL,
    // Per battaglia
    PF: template.PF,
    alive: true,
    acted: false,
    turnEnded: false,
    skills: [SKILL_ASSALTO],
  };
}

function gachaPull(){
  const pickedStars = weightedPick(RATES);
  const pool = CHARACTER_TEMPLATES.filter(c=>c.stars===pickedStars);
  const tmpl = choice(pool);
  const inst = instantiateChar(tmpl);
  const owned = loadOwned();
  owned.push(inst);
  saveOwned(owned);
  updateOwnedCount();
  showGachaResult(inst);
}


/* =========================
   UI NAVIGATION
========================= */
function setView(view){
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active", t.dataset.view===view));
  document.querySelectorAll("section[id^='view-']").forEach(s=>s.classList.add("hidden"));
  document.getElementById(`view-${view}`).classList.remove("hidden");
  if(view==="collection") renderCollection();
  if(view==="battle") renderBattleSetup();
  updateOwnedCount();
}

document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=>setView(btn.dataset.view));
});


/* =========================
   GACHA UI
========================= */
const gachaResultEl = document.getElementById("gachaResult");
document.getElementById("pullBtn").addEventListener("click", gachaPull);
document.getElementById("resetData").addEventListener("click", ()=>{
  if(confirm("Sicuro di cancellare la collezione locale?")){
    localStorage.removeItem(LS_KEY);
    updateOwnedCount();
    gachaResultEl.classList.add("hidden");
    const grid = document.getElementById("collectionGrid");
    if(grid) grid.innerHTML="";
    const setupGrid = document.getElementById("setupGrid");
    if(setupGrid) setupGrid.innerHTML="";
    // torna al gacha
    setView("gacha");
  }
});

function showGachaResult(ch){
  gachaResultEl.classList.remove("hidden");
  gachaResultEl.innerHTML = `
    <div style="flex:1">
      <div class="small muted">Nuovo personaggio</div>
      <h3 style="margin:4px 0">${ch.name}</h3>
      <div class="small muted">⭐️ ${"★".repeat(ch.stars)}</div>
      <div class="small muted">PF ${ch.PFmax} · ATK ${ch.ATK} · DIF ${ch.DIF} · AF ${ch.AF[0]}–${ch.AF[1]} · VOL ${ch.VOL}</div>
    </div>
    <button class="btn secondary" onclick="setView('collection')">Vedi in Collezione</button>
  `;
}

function updateOwnedCount(){
  document.getElementById("ownedCount").textContent = loadOwned().length;
}


/* =========================
   COLLECTION
========================= */
function renderCollection(){
  const owned = loadOwned();
  const grid = document.getElementById("collectionGrid");
  const pane = document.getElementById("detailPane");
  pane.classList.add("hidden");
  grid.innerHTML = "";

  if(owned.length===0){
    grid.innerHTML = `<div class="muted">Non possiedi ancora personaggi. Vai al Gacha!</div>`;
    return;
  }

  owned.forEach(ch=>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4>${ch.name} <span class="small muted">(${ "★".repeat(ch.stars) })</span></h4>
      <div class="small muted">PF ${ch.PFmax} · ATK ${ch.ATK} · DIF ${ch.DIF}</div>
      <button class="btn ghost small" data-uid="${ch.uid}">Dettagli</button>
    `;
    card.addEventListener("click",(e)=>{
      if(e.target instanceof HTMLButtonElement && e.target.dataset.uid){
        showDetails(e.target.dataset.uid);
      } else { showDetails(ch.uid); }
    });
    grid.appendChild(card);
  });
}

function showDetails(uid){
  const owned = loadOwned();
  const ch = owned.find(x=>x.uid===uid);
  if(!ch) return;
  const pane = document.getElementById("detailPane");
  pane.classList.remove("hidden");
  pane.innerHTML = `
    <h3>${ch.name} ${"★".repeat(ch.stars)}</h3>
    <div class="small muted">Statistiche</div>
    <p>PF ${ch.PFmax} · ATK ${ch.ATK} · DIF ${ch.DIF} · AF ${ch.AF[0]}–${ch.AF[1]} · VOL ${ch.VOL}</p>
    <div class="small muted">Skill</div>
    <ul>
      <li><b>${SKILL_ASSALTO.name}</b> — ${SKILL_ASSALTO.desc}</li>
    </ul>
  `;
  pane.scrollIntoView({behavior:"smooth"});
}


/* =========================
   BATTLE SYSTEM
========================= */
const Battle = {
  state: {
    phase:"setup",
    turnSide:"player",
    player:[],
    enemy:[],
    selectedActor:null,
    selectedSkill:null,
    targetMode:null,
    ended:false
  },
  reset(){
    this.state = {
      phase:"setup",
      turnSide:"player",
      player:[],
      enemy:[],
      selectedActor:null,
      selectedSkill:null,
      targetMode:null,
      ended:false
    };
  }
};

// Setup UI
function renderBattleSetup(){
  const owned = loadOwned();
  const grid = document.getElementById("setupGrid");
  const btn = document.getElementById("startBattle");
  grid.innerHTML = "";
  btn.disabled = true;

  if(owned.length < 3){
    grid.innerHTML = `<div class="muted">Ti servono almeno 3 personaggi per iniziare. Vai al Gacha!</div>`;
    return;
  }

  const chosen = new Set();
  owned.forEach(ch=>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4>${ch.name} ${"★".repeat(ch.stars)}</h4>
      <div class="small muted">PF ${ch.PFmax} · ATK ${ch.ATK} · DIF ${ch.DIF}</div>
      <label class="small"><input type="checkbox" data-uid="${ch.uid}"> Aggiungi alla squadra</label>
    `;
    const cb = card.querySelector("input");
    cb.addEventListener("change", ()=>{
      if(cb.checked){
        if(chosen.size>=3){ cb.checked=false; return; }
        chosen.add(ch.uid);
      } else { chosen.delete(ch.uid); }
      btn.disabled = chosen.size !== 3;
    });
    grid.appendChild(card);
  });

  btn.onclick = ()=>{
    const ownedNow = loadOwned();
    const selected = ownedNow.filter(c=>chosen.has(c.uid)).map(c=>cloneForBattle(c,"player"));
    startBattle(selected);
  };
}

function cloneForBattle(ch, side){
  return {
    uid: ch.uid,
    baseId: ch.baseId,
    name: ch.name,
    stars: ch.stars,
    PFmax: ch.PFmax,
    PF: ch.PFmax,
    ATK: ch.ATK,
    DIF: ch.DIF,
    AF: ch.AF,
    VOL: ch.VOL,
    alive:true,
    acted:false,
    turnEnded:false,
    side,
    skills: [SKILL_ASSALTO]
  };
}

function startBattle(playerTeam){
  Battle.reset();
  Battle.state.phase = "battle";
  Battle.state.player = playerTeam;

  // Genera team nemico casuale (3 unità, può ripetere)
  const enemyTemplates = Array.from({length:3}, ()=>choice(CHARACTER_TEMPLATES));
  Battle.state.enemy = enemyTemplates.map(t=>cloneForBattle(instantiateChar(t), "enemy"));

  document.getElementById("battle-setup").classList.add("hidden");
  document.getElementById("battle-area").classList.remove("hidden");
  Battle.state.turnSide = "player";
  Battle.state.ended = false;

  setTurnIndicator();
  renderTeams();
  clearLog();
  log("La battaglia inizia! È il turno del Giocatore.");
}

function setTurnIndicator(){
  document.getElementById("turnIndicator").textContent =
    `Turno: ${Battle.state.turnSide==='player' ? 'Giocatore' : 'Nemico'}`;
}

function renderTeams(){
  const playerRow = document.getElementById("team-player");
  const enemyRow = document.getElementById("team-enemy");
  playerRow.innerHTML = ""; enemyRow.innerHTML = "";

  const mkCard = (u)=>{
    const el = document.createElement("div");
    el.className = "fighter";
    if(!u.alive) el.classList.add("dead");
    if(u.turnEnded && u.alive) {
      const tag = document.createElement("span");
      tag.className="tag"; tag.textContent="turno concluso";
      el.appendChild(tag);
    }
    const hpPerc = Math.round(100 * u.PF / u.PFmax);
    el.innerHTML += `
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
        <div>
          <div style="font-weight:700">${u.name}</div>
          <div class="small muted">ATK ${u.ATK} · DIF ${u.DIF}</div>
        </div>
        <div class="small muted">${u.side==='player'?'🟦':'🟥'}</div>
      </div>
      <div class="hpbar"><span style="width:${hpPerc}%"></span></div>
      <div class="small muted" style="margin-top:4px">PF ${u.PF} / ${u.PFmax}</div>
    `;

    // click per aprire skill menu (solo turno giocatore)
    if(Battle.state.phase==="battle" && Battle.state.turnSide==="player" &&
       u.side==="player" && u.alive && !u.turnEnded && !Battle.state.ended){
      el.style.cursor="pointer";
      el.addEventListener("click", ()=>openSkillMenu(u));
    }
    el.dataset.uid = u.uid;
    return el;
  };

  Battle.state.player.forEach(u=>playerRow.appendChild(mkCard(u)));
  Battle.state.enemy.forEach(u=>enemyRow.appendChild(mkCard(u)));
}

function clearLog(){ document.getElementById("battleLog").innerHTML = ""; }
function log(msg){
  const area = document.getElementById("battleLog");
  const t = new Date().toLocaleTimeString();
  area.innerHTML += `[${t}] ${msg}<br>`;
  area.scrollTop = area.scrollHeight;
}

/* ===== Skill Menu & Targeting ===== */
const skillMenu = document.getElementById("skillMenu");
document.getElementById("closeSkillMenu").addEventListener("click", closeSkillMenu);

function openSkillMenu(actor){
  Battle.state.selectedActor = actor;
  Battle.state.selectedSkill = null;
  Battle.state.targetMode = null;

  document.getElementById("skillHeader").textContent = `Skill di ${actor.name}`;
  const grid = document.getElementById("skillGrid");
  grid.innerHTML = "";

  actor.skills.forEach(s=>{
    const btn = document.createElement("button");
    btn.className = "btn secondary";
    btn.textContent = `${s.name}`;
    btn.title = s.desc;
    btn.addEventListener("click", ()=>chooseSkill(s));
    grid.appendChild(btn);
  });

  skillMenu.classList.remove("hidden");
}

function closeSkillMenu(){
  skillMenu.classList.add("hidden");
  clearTargetHints();
  Battle.state.selectedSkill = null;
  Battle.state.targetMode = null;
}

function chooseSkill(skill){
  Battle.state.selectedSkill = skill;
  // unica skill è offensiva: target nemico singolo
  Battle.state.targetMode = "enemy";
  highlightTargets("enemy");
}

function clearTargetHints(){
  document.querySelectorAll(".fighter").forEach(el=>{
    el.classList.remove("target-hint");
    el.style.cursor = "";
  });
  // re-render per ristabilire handler base
  renderTeams();
}

function highlightTargets(mode){
  clearTargetHints();
  const side = (mode==="ally") ? Battle.state.player : Battle.state.enemy;
  side.filter(u=>u.alive).forEach(u=>{
    const card = document.querySelector(`.fighter[data-uid="${u.uid}"]`);
    if(!card) return;
    card.classList.add("target-hint");
    card.style.cursor = "crosshair";
    card.addEventListener("click", ()=>confirmTarget(u), { once:true });
  });
}

function confirmTarget(target){
  const actor = Battle.state.selectedActor;
  const skill = Battle.state.selectedSkill;
  if(!actor || !skill || !target) return;
  executeSkill(actor, skill, target);
  closeSkillMenu();
  actor.turnEnded = true;
  renderTeams();

  if(checkWin()) return;

  // Se tutti i player hanno terminato il turno, passa al nemico
  if(Battle.state.player.every(u=>!u.alive || u.turnEnded)){
    Battle.state.turnSide = "enemy";
    Battle.state.enemy.forEach(u=>{ if(u.alive) u.turnEnded=false; });
    setTurnIndicator();
    log("Tocca al Nemico.");
    setTimeout(enemyPhase, 600);
  }
}

/* ===== Risoluzione Skill ===== */
function damagePerHit(attacker, target){
  return Math.max(1, attacker.ATK - target.DIF);
}

function executeSkill(actor, skill, target){
  if(!actor.alive) return;
  if(skill.type === "damage_multi"){
    const hits = randInt(1,4);
    let dealt = 0;
    for(let i=0;i<hits;i++){
      if(!target.alive) break;
      const dmg = damagePerHit(actor, target);
      target.PF = clamp(target.PF - dmg, 0, target.PFmax);
      dealt += dmg;
      if(target.PF <= 0){ target.alive = false; }
    }
    log(`${actor.name} usa ${skill.name} su ${target.name}: ${hits} colpi, ${dealt} danni totali${target.alive?'':' (KO)'}!`);
  }
  if(!target.alive) log(`${target.name} è stato sconfitto!`);
  renderTeams();
  checkWin();
}

function checkWin(){
  const playerAlive = Battle.state.player.some(u=>u.alive);
  const enemyAlive = Battle.state.enemy.some(u=>u.alive);
  if(!playerAlive || !enemyAlive){
    Battle.state.ended = true;
    const winner = playerAlive ? "Giocatore" : "Nemico";
    log(`🏁 Fine! Vince: ${winner}`);
    document.getElementById("turnIndicator").textContent = `Fine partita — ${winner}`;
    return true;
  }
  return false;
}

/* ===== Enemy AI ===== */
function enemyPhase(){
  const actors = Battle.state.enemy.filter(u=>u.alive && !u.turnEnded);
  function actNext(i){
    if(i>=actors.length){
      if(checkWin()) return;
      // torna al giocatore
      Battle.state.turnSide = "player";
      Battle.state.player.forEach(u=>{ if(u.alive) u.turnEnded=false; });
      setTurnIndicator();
      log("Tocca al Giocatore.");
      renderTeams();
      return;
    }
    const a = actors[i];
    const skill = a.skills[0]; // unico
    const target = choice(Battle.state.player.filter(u=>u.alive));
    if(target){
      executeSkill(a, skill, target);
      a.turnEnded = true;
      renderTeams();
      if(checkWin()) return;
    }
    setTimeout(()=>actNext(i+1), 650);
  }
  actNext(0);
}

/* ===== Battle controls ===== */
document.getElementById("restartBattle").addEventListener("click", ()=>{
  document.getElementById("battle-area").classList.add("hidden");
  document.getElementById("battle-setup").classList.remove("hidden");
  document.getElementById("battleLog").innerHTML = "";
  Battle.reset();
  renderBattleSetup();
});

/* =========================
   INIT
========================= */
updateOwnedCount();
setView("gacha");
