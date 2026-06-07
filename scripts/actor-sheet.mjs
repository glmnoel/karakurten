/**
 * Karakurten — Feuille de Personnage
 * Utilise l'API ApplicationV2 de Foundry VTT v12+
 */

import { KarakurtenRoll } from "./roll.mjs";

const { ActorSheetV2, HandlebarsApplicationMixin } = foundry.applications.sheets;

export class KarakurtenActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

  /* ------------------------------------------ */
  /*  Configuration statique                     */
  /* ------------------------------------------ */

  static DEFAULT_OPTIONS = {
    classes: ["karakurten", "actor", "personnage"],
    position: {
      width: 780,
      height: 900
    },
    window: {
      resizable: true
    },
    actions: {
      "roll-stat":   KarakurtenActorSheet.#onRollStat,
      "stat-minus":  KarakurtenActorSheet.#onStatMinus,
      "stat-plus":   KarakurtenActorSheet.#onStatPlus
    }
  };

  static PARTS = {
    sheet: {
      template: "systems/karakurten/templates/actor-sheet.hbs"
    }
  };

  /* ------------------------------------------ */
  /*  Préparation des données                    */
  /* ------------------------------------------ */

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.document = this.document;
    context.system  = this.document.system;
    context.config  = CONFIG.KARAKURTEN ?? {};
    return context;
  }

  /* ------------------------------------------ */
  /*  Actions (statiques, liées via DEFAULT_OPTIONS) */
  /* ------------------------------------------ */

  /**
   * Ouvre la boîte de dialogue de jet pour une statistique.
   * @param {PointerEvent} event
   * @param {HTMLElement}  target
   */
  static async #onRollStat(event, target) {
    const statKey = target.dataset.stat;
    await KarakurtenRoll.openDialog(this.document, statKey);
  }

  /**
   * Diminue la valeur d'une statistique (min 1).
   */
  static async #onStatMinus(event, target) {
    const statKey = target.dataset.stat;
    const current = this.document.system.statistiques[statKey].valeur;
    if (current <= 1) return;
    await this.document.update({ [`system.statistiques.${statKey}.valeur`]: current - 1 });
  }

  /**
   * Augmente la valeur d'une statistique (max 9).
   */
  static async #onStatPlus(event, target) {
    const statKey = target.dataset.stat;
    const current = this.document.system.statistiques[statKey].valeur;
    if (current >= 9) return;
    await this.document.update({ [`system.statistiques.${statKey}.valeur`]: current + 1 });
  }

  /* ------------------------------------------ */
  /*  Gestion de la photo (drag & drop)          */
  /* ------------------------------------------ */

  _onDropImage(event) {
    // Foundry gère nativement le data-edit sur l'img
  }
}
