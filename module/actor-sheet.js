export class KarakurtenActorSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/karakurten/templates/actor-sheet.hbs",
            width: 600,
            height: 800
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('.stat-roll').click(this._onRollStat.bind(this));
    }

    async _onRollStat(event) {
        const statName = event.currentTarget.dataset.stat;
        const statValue = parseInt(event.currentTarget.dataset.value);
        //event.preventDefault();
        //const element = event.currentTarget;
        //const statName = element.dataset.label; // ex: "force"
        //const statValue = parseInt(element.dataset.value); // ex: 5

        // Appel de votre fonction de test
        await effectuerTest(statName, statValue);
    }
}