import { SKILLS } from "../engine/skills.js";

export const CHARACTERS = {
  selas: {
    id: "selas",
    name: "Selas",
    rarity: 3,
    element: "IMPULSO",
    stats: {
      PF: 100,
      maxPF: 100,
      ATK: 6,
      DIF: 2,
      AF: [1, 10],
      VOL: 6
    },
    skills: ["selas_skill1", "selas_skill2", "selas_skill3"],
    passives: ["selas_core"],
    statuses: [],
    custom: {
      caricheStatiche: 0
    }
  },

  faendal: {
    id: "faendal",
    name: "Faendal",
    rarity: 2,
    element: "PRESAGIO",
    stats: {
      PF: 100,
      maxPF: 100,
      ATK: 2,
      DIF: 2,
      AF: [2, 12],
      VOL: 4
    },
    skills: ["faendal_skill1", "faendal_skill2", "faendal_skill3"],
    passives: ["faendal_core"],
    statuses: [],
  },

  furio: {
    id: "furio",
    name: "Furio",
    rarity: 1,
    element: "INNOCENZA",
    stats: {
      PF: 100,
      maxPF: 100,
      ATK: 2,
      DIF: 6,
      AF: [1, 6],
      VOL: 6
    },
    skills: ["furio_skill1", "furio_skill2", "furio_skill3"],
    passives: ["furio_core"],
    statuses: [],
  }
};
