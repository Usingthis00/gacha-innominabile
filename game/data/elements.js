export const ELEMENTS = {
  ARDORE: { multipliers: { ALL: 2 } },  
  EQUILIBRIO: { multipliers: { ALL: 1 } },
  IMPULSO: { multipliers: { SPIRITO: 2, INNOCENZA: 0.5 } },
  SPIRITO: { multipliers: { PRESAGIO: 2, IMPULSO: 0.5 } },
  PRESAGIO: { multipliers: { INNOCENZA: 2, SPIRITO: 0.5 } },
  INNOCENZA: { multipliers: { IMPULSO: 2, PRESAGIO: 0.5 } },
};

function getElementMultiplier(attackerElement, defenderElement) {
  const rules = ELEMENTS[attackerElement].multipliers;
  return rules.ALL ?? rules[defenderElement] ?? 1;
}
