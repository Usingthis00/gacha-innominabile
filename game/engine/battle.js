import { SKILLS } from "./skills.js";
import { PASSIVES } from "./passives.js";
import { tickStatuses, reduceStatusDuration } from "./status.js";

export class Battle {
  constructor(playerTeam, enemyTeam) {
    this.playerTeam = playerTeam;
    this.enemyTeam = enemyTeam;
    this.round = 1;
    this.turnIndex = 0;
    this.turnOrder = [...playerTeam, ...enemyTeam]; // semplice, poi puoi fare speed/initiative
    this.logs = [];
  }

  // Inizio turno
  startTurn() {
    const actor = this.turnOrder[this.turnIndex];
    if (actor.stats.PF <= 0) {
      this.endTurn(); // salta i morti
      return;
    }

    // Tick status
    tickStatuses("onTurnStart", actor);

    // Se affascinato o incapacitato non può agire
    if (actor.canAct === false) {
      this.logs.push(`${actor.name} è incapacitato e non può agire!`);
      this.endTurn();
      return;
    }

    // Se è il player → qui devi agganciarti alla UI per far scegliere la skill
    // Per semplicità: facciamo che se è IA sceglie random
    if (this.enemyTeam.includes(actor)) {
      this.enemyAction(actor);
    } else {
      this.logs.push(`${actor.name} è in attesa di comando...`);
      // Aspetta input da UI → chiama `this.useSkill(actor, skillKey, targetTeam)`
    }
  }

  // Usa una skill
  useSkill(actor, skillKey, targets) {
    if (!SKILLS[skillKey]) {
      this.logs.push(`Skill non trovata: ${skillKey}`);
      return;
    }

    const result = SKILLS[skillKey](actor, targets);
    if (Array.isArray(result)) this.logs.push(...result);
    else this.logs.push(result);

    // Hook passivi → ad esempio: danno elementale extra, counter, ecc.
    this.triggerPassives("onSkillUsed", actor, targets);

    this.endTurn();
  }

  // Fine turno
  endTurn() {
    const actor = this.turnOrder[this.turnIndex];

    // Tick fine turno
    tickStatuses("onTurnEnd", actor);
    reduceStatusDuration(actor);

    // Passa al prossimo
    this.turnIndex++;
    if (this.turnIndex >= this.turnOrder.length) {
      this.turnIndex = 0;
      this.round++;
      this.logs.push(`--- Round ${this.round} ---`);
      // reset eventuali status round-based
      this.turnOrder.forEach(p => tickStatuses("onRoundStart", p));
    }

    // Controllo fine battaglia
    if (this.isBattleOver()) {
      this.logs.push("La battaglia è terminata!");
      return;
    }

    this.startTurn();
  }

  // IA semplice: sceglie skill casuale e target random
  enemyAction(actor) {
    const skills = actor.skills;
    const skillKey = skills[Math.floor(Math.random() * skills.length)];
    const targets = this.playerTeam.filter(p => p.stats.PF > 0);
    this.useSkill(actor, skillKey, targets);
  }

  // Controllo vittoria/sconfitta
  isBattleOver() {
    const playerAlive = this.playerTeam.some(p => p.stats.PF > 0);
    const enemyAlive = this.enemyTeam.some(e => e.stats.PF > 0);
    return !playerAlive || !enemyAlive;
  }

  // Trigger passivi (hook system)
  triggerPassives(event, actor, target) {
    const passives = actor.passives || [];
    for (let passiveKey of passives) {
      const passive = PASSIVES[passiveKey];
      if (passive && passive[event]) {
        passive[event](actor, target, this);
      }
    }
  }
}
