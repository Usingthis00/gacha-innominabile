import { CHARACTERS } from "../data/characters.js";

export class CollectionUI {
  constructor(playerCollection) {
    this.collection = playerCollection; // array di ID personaggi posseduti
    this.container = document.getElementById("collection");
    this.render();
  }

  render() {
    this.container.innerHTML = this.collection.map(id => {
      const c = CHARACTERS[id];
      return `<div class="char-card">
        <h3>${c.name} (${c.rarity}★)</h3>
        <p>Elemento: ${c.element}</p>
        <p>PF: ${c.stats.PF}, ATK: ${c.stats.ATK}, DIF: ${c.stats.DIF}</p>
      </div>`;
    }).join("");
  }
}
