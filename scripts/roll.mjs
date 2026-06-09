/**
 * Karakurten — Logique de Jets de Dés
 *
 * Mécaniques :
 *  - Simple    : 1d10 ≤ seuil → réussite
 *  - Avantage  : 2d10, 1 seul résultat ≤ seuil → réussite
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
    let seuil = stat.valeur;
    
    if (stat === "force") {
      seuil = actor.system.pointsDeVie;
    }

    let reussite  = false;
    let rolls     = [];
    let typeLabel = "";
    let detail    = "";

    if (typeTest === "simple") {
      // --- Test simple : 1d10 ---
      const roll = await new Roll("1d10").evaluate();
      rolls = [roll.total];
      reussite  = rolls[0] <= seuil;
      typeLabel = "Test Simple";
      detail    = `Résultat : <strong>${rolls[0]}</strong> / Seuil : <strong>${seuil}</strong>`;

    } else if (typeTest === "avantage") {
      // --- Avantage : 2d10, au moins un ≤ seuil ---
      const r1 = await new Roll("1d10").evaluate();
      const r2 = await new Roll("1d10").evaluate();
      rolls    = [r1.total, r2.total];
      reussite  = rolls[0] <= seuil || rolls[1] <= seuil;
      typeLabel = "Test avec Avantage";
      detail    = `Résultats : <strong>${rolls[0]}</strong> et <strong>${rolls[1]}</strong> / Seuil : <strong>${seuil}</strong>`;

    } else if (typeTest === "desavantage") {
      // --- Désavantage : 2d10, les deux ≤ seuil ---
      const r1 = await new Roll("1d10").evaluate();
      const r2 = await new Roll("1d10").evaluate();
      rolls    = [r1.total, r2.total];
      reussite  = rolls[0] <= seuil && rolls[1] <= seuil;
      typeLabel = "Test avec Désavantage";
      detail    = `Résultats : <strong>${rolls[0]}</strong> et <strong>${rolls[1]}</strong> / Seuil : <strong>${seuil}</strong>`;
    }

    // --- Construction du message de chat ---
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

    await ChatMessage.create({
      user:    game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: chatContent,
      rolls:   [], // Les rolls sont affichés manuellement dans le contenu
      type:    CONST.CHAT_MESSAGE_STYLES?.OTHER ?? 0
    });
  }
}
