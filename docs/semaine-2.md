# Bilan de la semaine 7

## Planification

Après analyse de l’architecture et de la base, le travail a été organisé en trois étapes :
API et tests, interface étudiante, puis vérification globale. Le plan a été validé avant le
début du code. Les étapes 1 et 2 ont ensuite été réalisées séparément, sans commencer le
frontend avant la fin de l’API.

## Modifications

- **API** : ajout des routes permettant à un étudiant de candidater à une offre publiée, de
  consulter ses candidatures et de retirer une candidature en cours. Les contrôles d’accès
  restent côté serveur. Une migration ajoute une unicité sur les candidatures non retirées :
  elle empêche les doublons tout en autorisant une nouvelle candidature après retrait.
- **Frontend** : ajout du formulaire « Candidater » avec message facultatif, de la page
  « Mes candidatures », des statuts en français et du retrait des candidatures en cours.
- Documentation de l’API, de l’architecture et du README mise à jour.

## Vérifications et résultats

La commande globale a été exécutée sous PowerShell avec `npm.cmd run check` : lint,
vérifications TypeScript, tests et builds ont tous réussi.

- Backend : **138 tests réussis**, sur 10 fichiers.
- Frontend : **59 tests réussis**, sur 8 fichiers.
- Build backend et build de production frontend : réussis.
- `git diff --check` : réussi.

Les tests couvrent les autorisations, les candidatures en double, le refus des offres non
publiées, les statuts, le retrait, la confidentialité vis-à-vis des autres étudiants et
une nouvelle candidature après retrait. Les tests frontend couvrent le formulaire, la page
de suivi et les états de retrait.

## Difficultés et limites

PowerShell bloque l’exécution du script `npm.ps1` sur cette machine ; les commandes ont donc
été lancées avec `npm.cmd`. Les erreurs de typage et d’attentes de tests rencontrées pendant
le développement ont été corrigées avant le contrôle final.

La vérification porte sur les tests automatisés et les builds ; aucun essai manuel dans un
navigateur n’a été effectué. La sélection d’un candidat par l’administrateur (EF-34) et la
gestion de cette transition restent hors du périmètre de cette semaine.

## Bilan réflexif

Le découpage en étapes validées a permis de traiter d’abord les règles métier et la
persistance, puis de brancher l’interface sur un contrat API testé. Les tests ont aussi
confirmé un cas important de cycle de vie : le retrait conserve l’historique sans empêcher
une candidature ultérieure.
