/* =========================
   NAVIGAZIONE
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
   GACHA
========================= */
const gachaResultEl = document.getElementById("gachaResult");

function gachaPull(){
  const pickedStars = weightedPick(RATES);
  const pool = CHARACTER_TEMPLATES.filter(c=>c.stars===pickedStars);
  const tmpl = choice(pool);
  const inst = instantiateOwnedFromTemplate(tmpl);
  const owned = loadOwned();
  owned.push(inst);
  saveOwned(owned);
  updateOwnedCount();
  showGachaResult(inst);
}

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

document.getElementById("pullBtn").addEventListener("click", gachaPull);
document.getElementById("resetData").addEventListener("click", ()=>{
  if(confirm("Sicuro di cancellare la collezione locale?")){
    localStorage.removeItem(LS_KEY);
    updateOwnedCount();
    gachaResultEl.classList.add("hidden");
    document.getElementById("collectionGrid").innerHTML="";
    document.getElementById("detailPane").classList.add("hidden");
    setView("gacha");
  }
});

function updateOwnedCount(){
  document.getElementById("ownedCount").textContent = loadOwned().length;
}

/* =========================
   COLLEZIONE
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
      const uid = (e.target instanceof HTMLButtonElement && e.target.dataset.uid) ? e.target.dataset.uid : ch.uid;
      showDetails(uid);
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
      ${ch.skills.map(id=>`<li><b>${(SKILLS[id]?.name)||id}</b> — ${(SKILLS[id]?.desc)||''}</li>`).join("")}
    </ul>
  `;
  pane.scrollIntoView({behavior:"smooth"});
}

/* =========================
   AVVIO
========================= */
updateOwnedCount();
setView("gacha");

// Hook pulsante "Avvia Battaglia" (già gestito in renderBattleSetup, qui solo sicurezza)
document.getElementById("startBattle").addEventListener("click", ()=>{/* noop: handler in combat.js */});
