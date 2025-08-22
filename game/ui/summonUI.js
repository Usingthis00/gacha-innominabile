import { CHARACTERS } from "../data/characters.js";

export class SummonUI {
  constructor(playerCollection) {
    this.collection = playerCollection;
    this.container = document.getElementById("summon");
    this.resultBox = document.getElementById("summon-result");

    document.getElementById("summon-btn").addEventListener("click", () => {
      this.summon();
    });
  }

  summon() {
    // Probabilità base (puoi raffinarle)
    const pool = Object.values(CHARACTERS);
    const char = pool[Math.floor(Math.random() * pool.length)];
    this.collection.push(char.id);
    this.resultBox.innerHTML = `<p>Hai evocato: <strong>${char.name}</strong> (${char.rarity}★)</p>`;
  }
}
