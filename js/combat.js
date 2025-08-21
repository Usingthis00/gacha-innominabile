/* =========================
   STATO BATTAGLIA
========================= */
const Battle = {
  turnSide: "player",
  player: [],
  enemy: [],
  selectedActor: null,
  selectedSkill: null,
  ended: false,
};

function resetBattleState(){
  Battle.turnSide = "player";
  Battle.player = [];
  Battle.enemy = [];
  Battle.selectedActor = null;
  Battle.selectedSkill = null;
  Battle.ended = false;
}

/* =========================
   CLONE PER BATTAGLIA
========================= */
function cloneForBattle(owned, side){
  return {
    uid: owned.uid || `${owned.baseId}_enemy_${Math.floor(Math.random()*99999)}`,
    baseId: owned.baseId || owned.id || owned.name,
    name: owned.name || owned.id,
    stars: owned.stars,
    PFmax: owned.PFmax ?? owned.HP,
    PF: owned.PFmax ?? owned.HP,
    ATK: owned.ATK,
    DIF: owned.DIF,
    AF: owned.AF ? [owned.AF[0], owned.AF[1]] : [1,1],
    VOL: owned.VOL ?? 0,
    skills: owned.skills ? [...owned.skills] : ["basic_attack"],
    passive: owned.passive ?? null,
    side,
    alive: true,
    turnEnded: false,
    statuses: [],        // [{name, rounds}]
    nubeStatica: 0,      // contatore esclusivo
    staticCharges: 0     // cariche core di Selas
  };
}

/* =========================
   UI: SETUP BATTAGLIA
========================= */
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
      <label class="small"><input type="checkbox" data-uid="${ch.uid}"> Aggiungi</label>
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
    const team = ownedNow.filter(c=>chosen.has(c.uid)).map(c=>cloneForBattle(c,"player"));
    startBattle(team);
  };
}

document.getElementById("restartBattle").addEventListener("click", ()=>{
  document.getElementById("battle-area").classList.add("hidden");
  document.getElementById("battle-setup").classList.remove("hidden");
  document.getElementById("battleLog").innerHTML = "";
  resetBattleState();
  renderBattleSetup();
});

/* =========================
   AVVIO BATTAGLIA
========================= */
function startBattle(playerTeam){
  resetBattleState();
  Battle.player = playerTeam;

  // Nemici casuali (3 unità)
  const enemyTemplates = Array.from({length:3}, ()=>choice(CHARACTER_TEMPLATES));
  Battle.enemy = enemyTemplates.map(t=>{
    const tmpOwned = instantiateOwnedFromTemplate(t);
    return cloneForBattle(tmpOwned,"enemy");
  });

  document.getElementById("battle-setup").classList.add("hidden");
  document.getElementById("battle-area").classList.remove("hidden");

  setTurnIndicator();
  clearBattleLog();
  logBattle("La battaglia inizia! È il turno del Giocatore.");
  renderTeams();
}

function setTurnIndicator(){
  document.getElementById("turnIndicator").textContent =
    `Turno: ${Battle.turnSide==='player' ? 'Giocatore' : 'Nemico'}`;
}

/* =========================
   RENDER TEAMS
========================= */
function fighterCardHTML(u){
  const hpPerc = Math.round(100 * u.PF / u.PFmax);
  return `
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
      <div>
        <div style="font-weight:700">${u.name}</div>
        <div class="small muted">ATK ${u.ATK} · DIF ${u.DIF}</div>
      </div>
      <div class="small muted">${u.side==='player'?'🟦':'🟥'}</div>
    </div>
    <div class="hpbar"><span style="width:${hpPerc}%"></span></div>
    <div class="small muted" style="margin-top:4px">PF ${u.PF} / ${u.PFmax}</div>
    <div class="statuses">
      ${u.turnEnded && u.alive ? `<span class="badge">turno concluso</span>` : ``}
      ${u.statuses.find(s=>s.name==='Schivata') ? `<span class="badge">Schivata</span>` : ``}
      ${u.statuses.find(s=>s.name==='Amplificazione') ? `<span class="badge">Amplificazione</span>` : ``}
      ${u.nubeStatica>0 ? `<span class="badge">Nube Statica (${u.nubeStatica})</span>` : ``}
    </div>
  `;
}

function renderTeams(){
  const playerRow = document.getElementById("team-player");
  const enemyRow  = document.getElementById("team-enemy");
  playerRow.innerHTML = ""; enemyRow.innerHTML = "";

  const mkCard = (u)=>{
    const el = document.createElement("div");
    el.className = "fighter";
    if(!u.alive) el.classList.add("dead");
    el.dataset.uid = u.uid;
    el.innerHTML = fighterCardHTML(u);

    if(Battle.turnSide==="player" && u.side==="player" && u.alive && !u.turnEnded && !Battle.ended){
      el.style.cursor="pointer";
      el.addEventListener("click", ()=>openSkillMenu(u));
    }
    return el;
  };

  Battle.stateChanged && (Battle.stateChanged=false);
  Battle.player.forEach(u=>playerRow.appendChild(mkCard(u)));
  Battle.enemy.forEach(u=>enemyRow.appendChild(mkCard(u)));
}

/* =========================
   LOG
========================= */
function clearBattleLog(){ document.getElementById("battleLog").innerHTML=""; }
function logBattle(msg){
  const area = document.getElementById("battleLog");
  const t = new Date().toLocaleTimeString();
  area.innerHTML += `[${t}] ${msg}<br>`;
  area.scrollTop = area.scrollHeight;
}

/* =========================
   STATUS HELPERS
========================= */
function addStatus(u, name, rounds=1){
  u.statuses.push({name, rounds});
}
function hasStatus(u, name){
  return u.statuses.some(s=>s.name===name);
}
function removeStatus(u, name){
  u.statuses = u.statuses.filter(s=>s.name!==name);
}
function tickStatuses(team){
  team.forEach(u=>{
    u.statuses.forEach(s=>s.rounds--);
    u.statuses = u.statuses.filter(s=>s.rounds>0);
    if(u.nubeStatica>0) u.nubeStatica--;
  });
}

function getAFRange(u){
  // Core: mentre Selas ha Schivata, AF diventa 2-12
  if(u.baseId==="Selas" && hasStatus(u,"Schivata")) return [2,12];
  return u.AF;
}

/* =========================
   DANNI
========================= */
function applyDamage(attacker, target, dmg){
  if(!target.alive) return 0;
  if(hasStatus(target,"Schivata")){
    logBattle(`→ ${target.name} schiva l'attacco!`);
    return 0;
  }
  target.PF = clamp(target.PF - dmg, 0, target.PFmax);
  if(target.PF<=0){ target.alive=false; logBattle(`💀 ${target.name} è stato sconfitto!`); }
  // Passiva Core: se a colpire è Selas, applica Nube Statica e cariche
  if(attacker.baseId==="Selas" && target.alive){
    target.nubeStatica = 2;               // (nota: parte Impulso avanzata la aggiungeremo poi)
    attacker.staticCharges++;
    if(attacker.staticCharges>=10){
      attacker.staticCharges=0;
      if(!hasStatus(attacker,"Amplificazione")) addStatus(attacker,"Amplificazione",1);
      logBattle(`⚡ ${attacker.name} ottiene Amplificazione!`);
    }
  }
  return dmg;
}

/* =========================
   SKILL REGISTRY
========================= */
const SKILLS = {
  basic_attack: {
    name: "Attacco",
    desc: "Colpisce un singolo nemico.",
    target: "enemy_single",
    exec: (actor, target)=>{
      const dmg = Math.max(1, actor.ATK - target.DIF);
      const dealt = applyDamage(actor, target, dmg);
      logBattle(`${actor.name} attacca ${target.name} per ${dealt} danni.`);
    }
  },

  // Selas: Skill 1
  selas_s1: {
    name: "Tempesta di Colpi",
    desc: "Attacca da 1 a 6 volte tutti i nemici. (Amplificazione: raddoppia i colpi)",
    target: "enemy_all",
    exec: (actor)=>{
      let hits = randInt(1,6);
      if(hasStatus(actor,"Amplificazione")){
        hits *= 2;
        removeStatus(actor,"Amplificazione");
      }
      logBattle(`${actor.name} usa Tempesta di Colpi (${hits} colpi per bersaglio)!`);
      Battle.enemy.filter(e=>e.alive).forEach(enemy=>{
        for(let i=0;i<hits;i++){
          if(!enemy.alive) break;
          const dmg = Math.max(1, actor.ATK - enemy.DIF);
          applyDamage(actor, enemy, dmg);
        }
      });
      renderTeams();
    }
  },

  // Selas: Skill 2
  selas_s2: {
    name: "Nube Statica",
    desc: "Tenta di applicare Nube Statica (2 round) a tutti i nemici. AF vs VOL. (Amplificazione: raddoppia il tiro AF)",
    target: "enemy_all",
    exec: (actor)=>{
      const [minAF,maxAF] = getAFRange(actor);
      Battle.enemy.filter(e=>e.alive).forEach(enemy=>{
        let afRoll = randInt(minAF, maxAF);
        if(hasStatus(actor,"Amplificazione")){
          afRoll *= 2;
        }
        logBattle(`→ Tiro AF ${afRoll} vs VOL ${enemy.VOL} su ${enemy.name}`);
        if(afRoll >= enemy.VOL){
          enemy.nubeStatica = 2;
          logBattle(`   ${enemy.name} è afflitto da Nube Statica!`);
        } else {
          logBattle(`   ${enemy.name} resiste!`);
        }
      });
      if(hasStatus(actor,"Amplificazione")) removeStatus(actor,"Amplificazione");
      renderTeams();
    }
  },

  // Selas: Skill 3
  selas_s3: {
    name: "Schivata",
    desc: "Ottiene Schivata per 1 round.",
    target: "self",
    exec: (actor)=>{
      addStatus(actor,"Schivata",1);
      logBattle(`${actor.name} ottiene Schivata (1 round).`);
      renderTeams();
    }
  }
};

/* =========================
   SKILL MENU & TARGETING
========================= */
const skillMenu = document.getElementById("skillMenu");
document.getElementById("closeSkillMenu").addEventListener("click", closeSkillMenu);

function openSkillMenu(actor){
  if(Battle.turnSide!=="player" || !actor.alive || actor.turnEnded) return;

  Battle.selectedActor = actor;
  document.getElementById("skillHeader").textContent = `Skill di ${actor.name}`;
  const grid = document.getElementById("skillGrid");
  grid.innerHTML = "";

  actor.skills.forEach(id=>{
    const s = SKILLS[id];
    if(!s) return;
    const btn = document.createElement("button");
    btn.className = "btn secondary";
    btn.textContent = s.name;
    btn.title = s.desc;
    btn.addEventListener("click", ()=>{
      if(s.target==="enemy_single"){
        chooseTargetEnemy((target)=>{ s.exec(actor,target); endPlayerAction(actor); });
      } else if(s.target==="enemy_all"){
        clearTargetHints();
        s.exec(actor);
        endPlayerAction(actor);
      } else if(s.target==="self"){
        clearTargetHints();
        s.exec(actor);
        endPlayerAction(actor);
      }
      closeSkillMenu();
    });
    grid.appendChild(btn);
  });

  // Annulla
  const cancel = document.createElement("button");
  cancel.className = "btn ghost";
  cancel.textContent = "Annulla";
  cancel.addEventListener("click", closeSkillMenu);
  grid.appendChild(cancel);

  skillMenu.classList.remove("hidden");
}

function closeSkillMenu(){
  skillMenu.classList.add("hidden");
  clearTargetHints();
}

function clearTargetHints(){
  document.querySelectorAll(".fighter").forEach(el=>{
    el.classList.remove("target-hint");
    el.style.cursor = "";
  });
  renderTeams(); // riattiva i listener base
}

function chooseTargetEnemy(cb){
  clearTargetHints();
  Battle.enemy.filter(e=>e.alive).forEach(u=>{
    const card = document.querySelector(`.fighter[data-uid="${u.uid}"]`);
    if(!card) return;
    card.classList.add("target-hint");
    card.style.cursor = "crosshair";
    card.addEventListener("click", ()=>cb(u), { once:true });
  });
}

/* =========================
   FINE AZIONE / TURNI
========================= */
function endPlayerAction(actor){
  actor.turnEnded = true;
  renderTeams();

  if(checkWin()) return;

  // Se tutti hanno concluso → turno nemico
  if(Battle.player.every(u=>!u.alive || u.turnEnded)){
    Battle.turnSide = "enemy";
    setTurnIndicator();
    logBattle("Tocca al Nemico.");
    setTimeout(enemyPhase, 500);
  }
}

function enemyPhase(){
  // Semplice IA: attacco base su bersaglio casuale
  const actors = Battle.enemy.filter(u=>u.alive);
  function step(i){
    if(i>=actors.length){
      if(checkWin()) return;
      // Tick status a fine turno nemico
      tickStatuses(Battle.player);
      tickStatuses(Battle.enemy);
      Battle.player.forEach(u=>{ if(u.alive) u.turnEnded=false; });
      Battle.turnSide = "player";
      setTurnIndicator();
      logBattle("Tocca al Giocatore.");
      renderTeams();
      return;
    }
    const a = actors[i];
    const targets = Battle.player.filter(u=>u.alive);
    if(targets.length){
      const t = choice(targets);
      SKILLS.basic_attack.exec(a,t);
      renderTeams();
      if(checkWin()) return;
    }
    setTimeout(()=>step(i+1), 650);
  }
  step(0);
}

function checkWin(){
  const playerAlive = Battle.player.some(u=>u.alive);
  const enemyAlive  = Battle.enemy.some(u=>u.alive);
  if(!playerAlive || !enemyAlive){
    Battle.ended = true;
    const winner = playerAlive ? "Giocatore" : "Nemico";
    logBattle(`🏁 Fine! Vince: ${winner}`);
    document.getElementById("turnIndicator").textContent = `Fine partita — ${winner}`;
    return true;
  }
  return false;
}

/* =========================
   ESPORTA FUNZIONI GLOBALI
========================= */
window.renderBattleSetup = renderBattleSetup;
window.startBattle = startBattle;
window.openSkillMenu = openSkillMenu;
