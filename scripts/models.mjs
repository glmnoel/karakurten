const { StringField, NumberField, HTMLField } = foundry.data.fields;

export class PersonnageData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      identite: new foundry.data.fields.SchemaField({
        nom:          new StringField({ initial: "" }),
        prenom:       new StringField({ initial: "" }),
        sexe:         new StringField({ initial: "N/A" }),
        age:          new StringField({ initial: "" }),
        taille:       new StringField({ initial: "" }),
        nationalite:  new StringField({ initial: "" }),
        langue:       new StringField({ initial: "" }),
        profession:   new StringField({ initial: "" }),
        photographie: new StringField({ initial: "" }),
      }),
      statistiques: new foundry.data.fields.SchemaField({
        force: new foundry.data.fields.SchemaField({
          label:  new StringField({ initial: "Force / Constitution" }),
          valeur: new NumberField({ initial: 5, min: 1, max: 9, integer: true }),
        }),
        agilite: new foundry.data.fields.SchemaField({
          label:  new StringField({ initial: "Agilité / Dextérité" }),
          valeur: new NumberField({ initial: 5, min: 1, max: 9, integer: true }),
        }),
        intelligence: new foundry.data.fields.SchemaField({
          label:  new StringField({ initial: "Intelligence / Psychologie" }),
          valeur: new NumberField({ initial: 5, min: 1, max: 9, integer: true }),
        }),
        observation: new foundry.data.fields.SchemaField({
          label:  new StringField({ initial: "Sens de L'Observation / Anticipation" }),
          valeur: new NumberField({ initial: 5, min: 1, max: 9, integer: true }),
        }),
      }),
      competences:  new HTMLField({ initial: "" }),
      historique:   new HTMLField({ initial: "" }),
      pointsDeVie: new foundry.data.fields.SchemaField({
        valeur: new NumberField({ initial: 5, integer: true }),
      }),
    };
  }
}

export class PnjData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      identite: new foundry.data.fields.SchemaField({
        nom:         new StringField({ initial: "" }),
        prenom:      new StringField({ initial: "" }),
        portrait:    new StringField({ initial: "" }),
        description: new HTMLField({ initial: "" }),
      }),
    };
  }
}
