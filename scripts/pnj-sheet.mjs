/**
 * Karakurten — Feuille de Personnage Non Joueur (PNJ)
 */

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class KarakurtenPNJSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

  /* ------------------------------------------ */
  /*  État interne                               */
  /* ------------------------------------------ */

  #editMode = false;

  /* ------------------------------------------ */
  /*  Configuration statique                     */
  /* ------------------------------------------ */

  static DEFAULT_OPTIONS = {
    classes: ["karakurten", "actor", "pnj"],
    position: {
      width: 500,
      height: 600
    },
    window: {
      resizable: true
    },
    actions: {
      "toggle-edit":   KarakurtenPNJSheet.#onToggleEdit,
      "edit-portrait": KarakurtenPNJSheet.#onEditPortrait
    }
  };

  static PARTS = {
    sheet: {
      template: "systems/karakurten/templates/pnj-sheet.hbs"
    }
  };

  /* ------------------------------------------ */
  /*  Préparation des données                    */
  /* ------------------------------------------ */

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.document = this.document;
    context.system   = this.document.system;
    context.editMode = this.#editMode;
    return context;
  }

  /* ------------------------------------------ */
  /*  Listeners                                  */
  /* ------------------------------------------ */

  _onRender(context, options) {
    super._onRender?.(context, options);

    this.element.querySelectorAll("input[name], textarea[name]").forEach(el => {
      el.addEventListener("change", async (ev) => {
        const fieldName = ev.currentTarget.name;
        const value     = ev.currentTarget.value;
        const updates   = { [fieldName]: value };

        // Synchronise actor.name avec prénom + nom
        if (fieldName === "system.identite.prenom" || fieldName === "system.identite.nom") {
          const prenom = fieldName === "system.identite.prenom" ? value : (this.document.system.identite.prenom || "");
          const nom    = fieldName === "system.identite.nom"    ? value : (this.document.system.identite.nom    || "");
          updates["name"] = [prenom, nom].filter(Boolean).join(" ") || "PNJ";
        }

        await this.document.update(updates);
      });
    });
  }

  /* ------------------------------------------ */
  /*  Actions                                    */
  /* ------------------------------------------ */

  static async #onToggleEdit(event, target) {
    this.#editMode = !this.#editMode;
    this.render();
  }

  static async #onEditPortrait(event, target) {
    const current = this.document.system.identite.portrait || this.document.img || "";
    const fp = new FilePicker({
      type: "image",
      current: current,
      callback: async (path) => {
        await this.document.update({
          "img": path,
          "system.identite.portrait": path
        });
      },
      top:  this.position.top  + 40,
      left: this.position.left + 10
    });
    fp.browse(current);
  }
}
