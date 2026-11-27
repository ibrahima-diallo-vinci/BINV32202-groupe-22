# Bilan — semaine 5 : MCP et tests end-to-end avec Playwright

## Contributions des membres

- **Mamadou Diallo** a réalisé les sections 3 et 4 de la fiche : mise en place et tests
  Playwright Test, puis vérification par désactivation temporaire du filtrage par titre.
- **Son binôme** a réalisé la préparation des scénarios EF-30 et l'exploration du scénario 1
  avec Playwright MCP. Son nom n'est pas renseigné ici.

## Résultats

- **Playwright MCP** : le scénario 1 a été exécuté dans Chromium isolé avec Lucas Dupont.
  La recherche `application` a affiché « 1 offre » et « Application React de gestion de
  flotte » ; les autres offres publiées et l'offre non publiée correspondante étaient
  absentes.
- **Playwright Test** : deux tests E2E TypeScript couvrent les scénarios 1 et 2, au travers
  de l'interface et avec assertions explicites. La configuration utilise `testDir: './e2e'`,
  la base URL locale et Chromium uniquement.
- Les deux tests ont réussi lors de deux exécutions successives : 2/2 en 3,4 s, puis 2/2 en
  2,2 s. Après restauration du filtre par titre, ils ont aussi réussi en 2,0 s.
- Avec le filtrage par titre désactivé temporairement, les deux tests ont échoué sur les
  assertions attendues : le compteur « 1 offre » (scénario 1, ligne 17) et le message
  « Aucune offre ne correspond à votre recherche. » (scénario 2, ligne 61).
- `npm run check` a réussi : lint, typecheck, build, 147 tests backend et 63 tests frontend.
  Le prédicat du repository a été restauré et aucun diff n'y subsistait.

## Difficultés et enseignements

- Le serveur Playwright MCP n'était pas disponible lors d'un premier essai. Une autre
  tentative a échoué à l'initialisation, car la distribution Chrome était introuvable.
  Après lecture des scénarios comme fichiers et configuration du serveur avec Chromium, le
  scénario MCP a pu être exécuté.
- Les premiers tests Playwright Test ne pouvaient pas joindre le frontend sur le port 5173.
  Le redémarrage de l'application a permis leur exécution.
- L'installation a rencontré des erreurs temporaires `ENOSPC`, mais a finalement réussi.
- Le défaut contrôlé puis restauré a confirmé que les assertions détectent l'absence de
  recherche. Les essais MCP ont également montré qu'il faut vérifier la disponibilité et
  l'identité des outils réellement utilisés, plutôt que de se fier à une description
  d'exécution.

## Crédits d'utilisation de l'IA

Les crédits exacts de cette semaine ne sont pas consignés dans les documents disponibles.

| Membre | Crédits d'utilisation de l'IA |
|---|---|
| Mamadou Diallo | À compléter |
| Binôme — nom à compléter | À compléter |
