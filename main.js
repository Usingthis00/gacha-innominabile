import { SummonUI } from "./ui/summonUI.js";
import { CollectionUI } from "./ui/collectionUI.js";
import { BattleUI } from "./ui/battleUI.js";

// Collezione del giocatore
const playerCollection = ["selas", "faendal"]; // iniziale

// UI
let summonUI = new SummonUI(playerCollection);
let collectionUI = new CollectionUI(playerCollection);
let battleUI = null;

// Funzione per switchare schermate
window.showScreen = (id) => {
  document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";

  if (id === "collection") {
    collectionUI.render();
  }
  if (id === "battle" && !battleUI) {
    battleUI = new BattleUI(["selas", "furio"], ["faendal"]);
  }
};
