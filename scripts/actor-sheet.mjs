/**
 * Karakurten — Feuille de Personnage
 * Utilise l'API ApplicationV2 de Foundry VTT v12+
 */

import { KarakurtenRoll } from "./roll.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class KarakurtenActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

  /* ------------------------------------------ */
  /*  État interne                               */
  /* ------------------------------------------ */

  /** @type {boolean} Mode édition actif ou non */
  #editMode = false;

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
      "roll-stat":      KarakurtenActorSheet.#onRollStat,
      "stat-minus":     KarakurtenActorSheet.#onStatMinus,
      "stat-plus":      KarakurtenActorSheet.#onStatPlus,
      "hp-minus":       KarakurtenActorSheet.#onHpMinus,
      "hp-plus":        KarakurtenActorSheet.#onHpPlus,
      "toggle-edit":    KarakurtenActorSheet.#onToggleEdit
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
    context.document  = this.document;
    context.system    = this.document.system;
    context.config    = CONFIG.KARAKURTEN ?? {};
    context.editMode  = this.#editMode;

    // HP max = valeur de Force
    const force = this.document.system.statistiques?.force?.valeur ?? 10;
    context.hpMax = force;

    return context;
  }

  /* ------------------------------------------ */
  /*  Listeners & sauvegarde des champs texte    */
  /* ------------------------------------------ */

  _onRender(context, options) {
    super._onRender?.(context, options);

    // Sauvegarde des champs texte/select lors du blur (perte de focus)
    const sheet = this.element;
    sheet.querySelectorAll("input[name], select[name], textarea[name]").forEach(el => {
      el.addEventListener("change", async (ev) => {
        const name  = ev.currentTarget.name;
        const value = ev.currentTarget.value;
        await this.document.update({ [name]: value });
      });
    });
  }

  /* ------------------------------------------ */
  /*  Actions (statiques, liées via DEFAULT_OPTIONS) */
  /* ------------------------------------------ */

  /**
   * Ouvre la boîte de dialogue de jet pour une statistique.
   */
  static async #onRollStat(event, target) {
    const statKey = target.dataset.stat;
    await KarakurtenRoll.openDialog(this.document, statKey);
  }

  /**
   * Diminue la valeur d'une statistique (min 1).
   * Si la stat est la Force, ajuste aussi les HP.
   */
  static async #onStatMinus(event, target) {
    const statKey = target.dataset.stat;
    const current = this.document.system.statistiques[statKey].valeur;
    if (current <= 1) return;

    const updates = { [`system.statistiques.${statKey}.valeur`]: current - 1 };

    // Si on diminue la Force, les HP max diminuent aussi
    if (statKey === "force") {
      const newMax  = current - 1;
      const hpVal   = this.document.system.pointsDeVie.valeur;
      updates["system.pointsDeVie.valeur"] = Math.min(hpVal, newMax);
    }

    await this.document.update(updates);
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

  /**
   * Diminue les HP de 1.
   * Fait aussi baisser la Force temporaire d'autant (sans descendre sous 1).
   */
  static async #onHpMinus(event, target) {
    const hp       = this.document.system.pointsDeVie.valeur;
    const force    = this.document.system.statistiques.force.valeur;
    if (hp <= 0) return;

    const newHp    = hp - 1;

    await this.document.update({
      "system.pointsDeVie.valeur":            newHp
    });
  }

  /**
   * Augmente les HP de 1 (max = valeur de Force).
   * Fait aussi remonter la Force d'autant (max 9).
   */
  static async #onHpPlus(event, target) {
    const force    = this.document.system.statistiques.force.valeur;
    const hp       = this.document.system.pointsDeVie.valeur;
    const hpMax    = force; // HP max est toujours égal à la Force
    if (hp >= hpMax) return;

    const newHp    = hp + 1;

    await this.document.update({
      "system.pointsDeVie.valeur":            newHp
    });
  }

  /**
   * Bascule le mode édition.
   */
  static async #onToggleEdit(event, target) {
    this.#editMode = !this.#editMode;
    this.render();
  }

  /* ------------------------------------------ */
  /*  Gestion de la photo (drag & drop)          */
  /* ------------------------------------------ */

  _onDropImage(event) {
    // Foundry gère nativement le data-edit sur l'img
  }
}
