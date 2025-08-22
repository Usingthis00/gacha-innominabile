import { calculateDamage } from "./damage.js";
import { applyStatus } from "./status.js";

// Selas
export const SKILLS = {
  selas_skill1: (attacker, defenders) => {
    let log = [];
    for (let def of defenders) {
      const hits = Math.floor(Math.random() * 6) + 1;
      for (let i = 0; i < hits; i++) {
        const dmg = calculateDamage(attacker, def, 0);
        def.stats.PF -= dmg;
      }
      log.push(`${attacker.name} colpisce ${def.name} ${hits} volte!`);
    }
    return log;
  },

  selas_skill2: (attacker, defenders) => {
    defenders.forEach(def => applyStatus(def, "nubeStatica"));
    return `${attacker.name} tenta di applicare Nube Statica a tutti i nemici!`;
  },

  selas_skill3: (attacker) => {
    applyStatus(attacker, "schivata");
    return `${attacker.name} ottiene Schivata!`;
  },

  // Faendal
  faendal_skill1: (attacker, defenders) => {
    const target = defenders[0];
    const hits = Math.floor(Math.random() * 4) + 1;
    let totalDmg = 0;
    for (let i = 0; i < hits; i++) {
      const dmg = calculateDamage(attacker, target, 0);
      target.stats.PF -= dmg;
      totalDmg += dmg;
    }
    return `${attacker.name} colpisce ${target.name} ${hits} volte infliggendo ${totalDmg} danni!`;
  },

  faendal_skill2: (attacker, defenders) => {
    defenders.forEach(def => applyStatus(def, "sbornia"));
    return `${attacker.name} applica Sbornia ai nemici!`;
  },

  faendal_skill3: (attacker, defenders) => {
    defenders.forEach(def => {
      def.stats.DIF -= 5;
      applyStatus(def, "difDown"); // status per gestire durata del malus
    });
    return `${attacker.name} riduce la DIF dei nemici!`;
  },

  // Furio
  furio_skill1: (attacker, defenders) => {
    const target = defenders[0];
    const hits = Math.floor(Math.random() * 4) + 1;
    let totalDmg = 0;
    for (let i = 0; i < hits; i++) {
      const dmg = calculateDamage(attacker, target, 0);
      target.stats.PF -= dmg;
      totalDmg += dmg;
    }
    return `${attacker.name} colpisce ${target.name} ${hits} volte infliggendo ${totalDmg} danni!`;
  },

  furio_skill2: (attacker, allies) => {
    const target = allies[0]; // scegli un alleato
    applyStatus(target, "scudo");
    return `${attacker.name} conferisce Scudo a ${target.name}!`;
  },

  furio_skill3: (attacker, allies) => {
    allies.forEach(al => {
      al.stats.PF = Math.min(al.stats.maxPF, al.stats.PF + attacker.stats.ATK * 10);
    });
    return `${attacker.name} cura gli alleati di ${attacker.stats.ATK * 10} punti!`;
  }
};
