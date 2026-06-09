# Karakurten — Système Foundry VTT v14

## Installation

1. Copier le dossier `karakurten/` dans le répertoire de données Foundry :
   ```
   {userData}/Data/systems/karakurten/
   ```

2. Redémarrer Foundry VTT.

3. Créer un nouveau monde en sélectionnant le système **Karakurten**.

## Structure des fichiers

```
karakurten/
├── system.json           ← Manifeste du système
├── template.json         ← Structure des données
├── README.md
├── assets/
│   └──scenes/
│      └──scene-default.jpg
├── lang/
│   ├── fr.json           ← Traduction française
│   └── en.json           ← Traduction anglaise
├── scripts/
│   ├── karakurten.mjs    ← Point d'entrée
│   ├── actor-sheet.mjs   ← Feuille de personnage (ApplicationV2)
│   └── roll.mjs          ← Logique des jets de dés
├── styles/
│   └── karakurten.css    ← Styles de la feuille
└── templates/
    ├── actor-sheet.hbs   ← Template Handlebars de la feuille
    └── roll-dialog.hbs   ← Template de la fenêtre de jet
```

## Mécaniques de jeu

### Statistiques
4 statistiques de 1 à 9 :
- Force / Constitution
- Agilité / Dextérité
- Intelligence / Psychologie
- Sens de l'Observation / Anticipation

### Jets de dés
Cliquer sur la valeur d'une statistique ouvre la fenêtre de jet.

| Type         | Mécanique                                       |
|--------------|-------------------------------------------------|
| Simple       | 1d10, résultat ≤ seuil → Réussite              |
| Avantage     | 2d10, au moins 1 résultat ≤ seuil → Réussite   |
| Désavantage  | 2d10, les DEUX résultats ≤ seuil → Réussite    |

## Compatibilité
- Foundry VTT : v12 minimum, v14 vérifié
- API : ApplicationV2 (HandlebarsApplicationMixin)
