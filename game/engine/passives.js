import { applyStatus } from "./status.js";
import { calculateDamage } from "./damage.js";

export const PASSIVES = {
  selas_core: {
    onImpulseDamage: (attacker, defender, dmg, state) => {
      if (defender.statuses.some(s => s.key === "nubeStatica")) {
        const bonusDmg = Math.floor(Math.random() * 6) + 1;
        defender.stats.PF -= bonusDmg;
        state.logs.push(`${defender.name} subisce ${bonusDmg} danni extra da Nube Statica!`);
        attacker.custom.caricheStatiche++;
        if (attacker.custom.caricheStatiche >= 10) {
          attacker.custom.caricheStatiche = 0;
          applyStatus(attacker, "amplificato");
          state.logs.push(`${attacker.name} consuma Cariche Statiche ed ottiene Amplificato!`);
        }
      }
    },
    onStatusApplied: (attacker, statusKey) => {
      if (statusKey === "schivata") {
        attacker.stats.AF = [2, 12];
      }
    },
    onStatusExpired: (attacker, statusKey) => {
      if (statusKey === "schivata") {
        attacker.stats.AF = [1, 6];
      }
    }
  },

  faendal_core: {
    onEnemySkill: (enemy, attacker) => {
      if (enemy.statuses.some(s => s.key === "sbornia")) {
        const dmg = attacker.stats.ATK;
        enemy.stats.PF -= dmg;
      }
    },
    onCheckATK: (attacker) => {
      const bonus = attacker.battle.enemies.filter(e => e.stats.DIF <= 0).length * 2;
      return attacker.stats.ATK + bonus;
    }
  },

  furio_core: {
    onAllyDamaged: (attacker, ally, source) => {
      if (ally.statuses.some(s => s.key === "scudo")) {
        const hits = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < hits; i++) {
          const dmg = attacker.stats.DIF;
          source.stats.PF -= dmg;
        }
      }
    }
  }
};
