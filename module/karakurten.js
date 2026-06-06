import { KarakurtenActorSheet } from "./actor-sheet.js";

Hooks.once("init", async function() {
    console.log("Karakurten | Initialisation du système...");

    // Enregistrement de la fiche d'acteur
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("karakurten", KarakurtenActorSheet, { 
        types: ["character"], 
        makeDefault: true 
    });
});

async function effectuerTest(statName, statValue) {
    // Demander le type de test via une boîte de dialogue simple
    let type = await Dialog.prompt({
        title: "Test de compétence",
        content: `<p>Test pour <b>${statName}</b> (Valeur: ${statValue})</p>
                  <select id="typeTest">
                    <option value="simple">Simple</option>
                    <option value="avantage">Avantage</option>
                    <option value="desavantage">Désavantage</option>
                  </select>`,
        callback: (html) => html.find("#typeTest")[0].value
    });

    let rolls = [];
    let reussite = false;

    if (type === "simple") {
        let r = new Roll("1d10").evaluate({async: false});
        rolls = [r.total];
        reussite = r.total <= statValue;
    } else if (type === "avantage") {
        let r1 = new Roll("1d10").evaluate({async: false});
        let r2 = new Roll("1d10").evaluate({async: false});
        rolls = [r1.total, r2.total];
        reussite = (r1.total <= statValue || r2.total <= statValue);
    } else { // désavantage
        let r1 = new Roll("1d10").evaluate({async: false});
        let r2 = new Roll("1d10").evaluate({async: false});
        rolls = [r1.total, r2.total];
        reussite = (r1.total <= statValue && r2.total <= statValue);
    }

    // Affichage dans le chat
    ChatMessage.create({
        content: `Test de ${statName} : <b>${reussite ? "Réussite" : "Échec"}</b><br>
                  Résultats : ${rolls.join(", ")} (Seuil: ${statValue})`
    });
}

