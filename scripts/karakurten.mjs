/**
 * Karakurten — Système Foundry VTT v14
 * Point d'entrée principal
 */

import { KarakurtenActorSheet } from "./actor-sheet.mjs";
import { KarakurtenRoll } from "./roll.mjs";

/* ------------------------------------------ */
/*  Hooks d'initialisation                     */
/* ------------------------------------------ */

Hooks.once("init", () => {
  console.log("Karakurten | Initialisation du système");

  // Enregistrement des feuilles d'acteur

 foundry.documents.collections.Actors.registerSheet(
		"karakurten",
		KarakurtenActorSheet,
		{
			types: ["personnage"],
			makeDefault: true,
      label: "Feuille de Personnage Karakurten"
		}
	);

  // Helpers Handlebars
  _registerHandlebarsHelpers();

  // Pré-chargement des templates
  foundry.applications.handlebars.loadTemplates([
    "systems/karakurten/templates/actor-sheet.hbs",
    "systems/karakurten/templates/roll-dialog.hbs"
  ]);

  console.log("Karakurten | Système initialisé avec succès");
});

/* ------------------------------------------ */
/*  Helpers Handlebars                         */
/* ------------------------------------------ */

function _registerHandlebarsHelpers() {
  // Génère un tableau de N éléments pour {{#each (times N)}}
  Handlebars.registerHelper("times", (n) => Array.from({ length: n }, (_, i) => i + 1));

  // Inférieur ou égal
  Handlebars.registerHelper("lte", (a, b) => a <= b);

  // Égalité
  Handlebars.registerHelper("eq", (a, b) => a === b);

  // Pourcentage HP (clampé entre 0 et 100)
  Handlebars.registerHelper("hpPercent", (current, max) => {
    if (!max || max <= 0) return 0;
    return Math.clamp(Math.round((current / max) * 100), 0, 100);
  });
}

/* ------------------------------------------ */
/*  Export utilitaire roll (accessible globalement) */
/* ------------------------------------------ */

globalThis.KarakurtenRoll = KarakurtenRoll;
