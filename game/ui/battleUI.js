import { Battle } from "../engine/battle.js";
import { CHARACTERS } from "../data/characters.js";

export class BattleUI {
  constructor(playerTeamIds, enemyTeamIds) {
    this.playerTeam = playerTeamIds.map(id => JSON.parse(JSON.stringify(CHARACTERS[id])));
    this.enemyTeam = enemyTeamIds.map(id => JSON.parse(JSON.stringify(CHARACTERS[id])));
    this.battle = new Battle(this.playerTeam, this.enemyTeam);

    this.logBox = document.getElementById("battle-log");
    this.playerArea = document.getElementById("player-team");
    this.enemyArea = document.getElementById("enemy-team");
    this.skillsArea = document.getElementById("skill-buttons");

    this.renderTeams();
    this.battle.startTurn();
    this.updateUI();
  }

  renderTeams() {
    this.playerArea.innerHTML = this.playerTeam.map(p =>
      `<div class="char-box" id="char-${p.id}">
        <strong>${p.name}</strong><br>
        PF: <span class="hp">${p.stats.PF}/${p.stats.maxPF}</span>
      </div>`
    ).join("");

    this.enemyArea.innerHTML = this.enemyTeam.map(e =>
      `<div class="char-box" id="char-${e.id}">
        <strong>${e.name}</strong><br>
        PF: <span class="hp">${e.stats.PF}/${e.stats.maxPF}</span>
      </div>`
    ).join("");
  }

  updateUI() {
    // HP update
    [...this.playerTeam, ...this.enemyTeam].forEach(c => {
      const box = document.getElementById(`char-${c.id}`);
      if (box) {
        box.querySelector(".hp").innerText = `${c.stats.PF}/${c.stats.maxPF}`;
      }
    });

    // Log update
    this.logBox.innerHTML = this.battle.logs.join("<br>");
    this.battle.logs = [];

    // Se è turno player → mostra pulsanti skill
    const actor = this.battle.turnOrder[this.battle.turnIndex];
    if (this.playerTeam.includes(actor) && actor.stats.PF > 0) {
      this.skillsArea.innerHTML = actor.skills.map(s =>
        `<button data-skill="${s}">${s}</button>`
      ).join("");
      [...this.skillsArea.querySelectorAll("button")].forEach(btn => {
        btn.addEventListener("click", () => {
          this.battle.useSkill(actor, btn.dataset.skill, this.enemyTeam);
          this.updateUI();
        });
      });
    } else {
      this.skillsArea.innerHTML = "";
    }
  }
}
