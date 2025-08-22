export const STATUSES = {
  affascinato: {
    name: "Affascinato",
    type: "debuff",
    category: "control",
    duration: 1,
    immuneAfter: 1, // immune per 1 round dopo
    effect: {
      onTurnStart: (target) => { target.canAct = false; }
    }
  },

  amplificato: {
    name: "Amplificato",
    type: "buff",
    category: "variabili",
    duration: 2,
    effect: {
      onVariable: (value) => value * 2
    }
  },

  confuso: {
    name: "Confuso",
    type: "debuff",
    category: "variabili",
    duration: 2,
    usedThisRound: false,
    effect: {
      onVariable: (value, variableRange, status) => {
        if (!status.usedThisRound) {
          status.usedThisRound = true;
          return Math.min(...variableRange);
        }
        return value;
      },
      onRoundStart: (status) => { status.usedThisRound = false; }
    }
  },

  indebolito: {
    name: "Indebolito",
    type: "debuff",
    category: "variabili",
    duration: 2,
    effect: {
      onVariable: (value) => Math.floor(value / 2)
    }
  },

  risolutezza: {
    name: "Risolutezza",
    type: "buff",
    category: "difensivo",
    duration: 2,
    effect: {
      onDefeated: (target) => {
        if (target.stats.PF <= 0) {
          target.stats.PF = Math.floor(target.stats.maxPF / 2);
          return true; // consuma status
        }
        return false;
      }
    }
  },

  schivata: {
    name: "Schivata",
    type: "buff",
    category: "difensivo",
    duration: 1,
    usedThisRound: false,
    effect: {
      onAttackReceived: (target, attack, status) => {
        if (!status.usedThisRound) {
          status.usedThisRound = true;
          attack.cancel = true;
        }
      },
      onRoundStart: (status) => { status.usedThisRound = false; }
    }
  },

  scudo: {
    name: "Scudo",
    type: "buff",
    category: "difensivo",
    duration: 2,
    effect: {
      onAttackReceived: (target, attack) => {
        if (attack.type === "ST") { attack.cancel = true; }
      }
    }
  },

  sgomento: {
    name: "Sgomento",
    type: "debuff",
    category: "stat",
    duration: 2,
    effect: {
      onApply: (target) => { target.stats.VOL -= 2; },
      onExpire: (target) => { target.stats.VOL += 2; }
    }
  },

  veleno: {
    name: "Veleno",
    type: "debuff",
    category: "danno",
    duration: 3,
    stackable: true,
    effect: {
      onTurnStart: (target, status) => {
        target.stats.PF -= 1 * (status.stacks ?? 1);
      }
    }
  }
};
