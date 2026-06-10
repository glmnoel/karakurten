/**
 * Karakurten — Logique de Jets de Dés
 *
 * Mécaniques :
 *  - Simple      : 1d10 ≤ seuil → réussite
 *  - Avantage    : 2d10, au moins 1 résultat ≤ seuil → réussite
 *  - Désavantage : 2d10, les DEUX résultats ≤ seuil → réussite
 */

export class KarakurtenRoll {

  /**
   * Ouvre la boîte de dialogue de choix du type de test,
   * puis effectue le jet et publie le résultat dans le chat.
   *
   * @param {Actor}  actor   L'acteur qui effectue le test
   * @param {string} statKey La clé de statistique ("force", "agilite", …)
   */
  static async openDialog(actor, statKey) {
    const stat = actor.system.statistiques[statKey];
    if (!stat) return;

    // Rendu du template de dialogue
    const content = await renderTemplate(
      "systems/karakurten/templates/roll-dialog.hbs",
      { statLabel: stat.label, statValeur: stat.valeur }
    );

    // Affichage de la dialogue
    const typeTest = await new Promise((resolve) => {
      new Dialog({
        title: `Test — ${stat.label}`,
        content,
        buttons: {
          lancer: {
            icon:  '<i class="fas fa-dice-d10"></i>',
            label: "Lancer le dé",
            callback: (html) => {
              const type = html.find('input[name="typeTest"]:checked').val();
              resolve(type ?? "simple");
            }
          },
          annuler: {
            icon:  '<i class="fas fa-times"></i>',
            label: "Annuler",
            callback: () => resolve(null)
          }
        },
        default: "lancer",
        close:   () => resolve(null)
      }, {
        classes: ["karakurten", "kk-roll-dialog"],
        width: 360
      }).render(true);
    });

    if (!typeTest) return;

    // Exécution du jet
    await KarakurtenRoll.executeRoll(actor, statKey, typeTest);
  }

  /**
   * Effectue le jet de dé(s) et envoie le résultat dans le chat.
   *
   * @param {Actor}  actor
   * @param {string} statKey
   * @param {string} typeTest  "simple" | "avantage" | "desavantage"
   */
  static async executeRoll(actor, statKey, typeTest) {
    const stat  = actor.system.statistiques[statKey];
    const seuil = stat.valeur;

    let reussite  = false;
    let rollObjs  = [];   // objets Roll natifs → animation + affichage Foundry
    let typeLabel = "";
    let detail    = "";

    if (typeTest === "simple") {
      const r = await new Roll("1d10").evaluate();
      rollObjs  = [r];
      reussite  = r.total <= seuil;
      typeLabel = "Test Simple";
      detail    = `Résultat : <strong>${r.total}</strong> / Seuil : <strong>${seuil}</strong>`;

    } else if (typeTest === "avantage") {
      const r1 = await new Roll("1d10").evaluate();
      const r2 = await new Roll("1d10").evaluate();
      rollObjs  = [r1, r2];
      reussite  = r1.total <= seuil || r2.total <= seuil;
      typeLabel = "Test avec Avantage";
      detail    = `Résultats : <strong>${r1.total}</strong> et <strong>${r2.total}</strong> / Seuil : <strong>${seuil}</strong>`;

    } else if (typeTest === "desavantage") {
      const r1 = await new Roll("1d10").evaluate();
      const r2 = await new Roll("1d10").evaluate();
      rollObjs  = [r1, r2];
      reussite  = r1.total <= seuil && r2.total <= seuil;
      typeLabel = "Test avec Désavantage";
      detail    = `Résultats : <strong>${r1.total}</strong> et <strong>${r2.total}</strong> / Seuil : <strong>${seuil}</strong>`;
    }

    const resultatLabel = reussite
      ? `<span class="kk-reussite">✅ Réussite</span>`
      : `<span class="kk-echec">❌ Échec</span>`;

    const chatContent = `
      <div class="kk-chat-card">
        <div class="kk-chat-header">
          <strong>${actor.name}</strong> — ${stat.label}
        </div>
        <div class="kk-chat-type">${typeLabel}</div>
        <div class="kk-chat-detail">${detail}</div>
        <div class="kk-chat-resultat">${resultatLabel}</div>
      </div>
    `;

    // Passer les objets Roll dans "rolls" déclenche :
    //  - l'animation native des dés dans Foundry v14
    //  - l'animation 3D si Dice So Nice est installé
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: chatContent,
      rolls:   rollObjs,
      style:   CONST.CHAT_MESSAGE_STYLES.ROLL
    });
  }
}
