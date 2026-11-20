# Bilan — semaine 9 : Skills, tests et hooks

## Travail réalisé

Les documents de la semaine décrivent les travaux du groupe, sans attribuer chaque tâche
à une personne nommément. Ils couvrent :

- l'audit des tests des candidatures EF-32 et EF-33 et l'ajout de deux tests d'interface ;
- la mise en place du workflow TDD puis l'implémentation de la recherche d'offres EF-30 ;
- l'installation et les essais du hook Tool Guardian.

**Membre 1 — nom et contribution individuelle : À compléter.**

**Membre 2 — nom et contribution individuelle : À compléter.**

Les conversations disponibles ne permettent pas de répartir ces tâches entre les deux
membres sans supposer qui les a réalisées.

## Audit EF-32 / EF-33

L'audit a confirmé que les règles principales déjà couvertes comprennent le refus des
candidatures à des offres non publiées, le refus du retrait d'une candidature traitée et
la protection des candidatures d'un autre étudiant. Aucun problème de priorité critique
n'a été relevé.

Un manque P1 a été confirmé : aucun test d'interface ne vérifiait la re-candidature depuis
la page des offres après le retrait d'une candidature. Ce manque reste à traiter. Le manque
P2 concernant l'historique EF-33 vide ou en erreur a été traité par deux tests de
`ApplicationsPage` : liste vide et erreur HTTP 500. Ils vérifient le message attendu et
l'absence de tableau ; le contrôle par mutation a confirmé qu'ils échouent si ces états sont
désactivés. Le scénario de concurrence a été écarté : SQLite (`better-sqlite3`) est synchrone
dans ce contexte et la contrainte d'unicité est déjà testée.

Résultats rapportés : les tests backend des candidatures ont réussi à la relance (23/23) ;
les tests frontend ciblés ont réussi (38/38), puis le fichier `ApplicationsPage.test.tsx`
seul a réussi (6/6).

## TDD et EF-30

Le skill TDD a été installé et une instruction du projet impose désormais d'écrire et
d'exécuter les tests, de présenter les résultats et d'attendre leur validation avant de
modifier l'application. Pour EF-30, sept tests ont été ajoutés avant l'implémentation.
En phase RED, quatre nouveaux tests backend et deux frontend ont échoué pour l'absence de
la fonctionnalité ; le test de recherche composée d'espaces passait déjà.

Après validation du lot, la recherche par titre a été reliée à l'interface, au hook, au
service frontend et aux couches API, métier et repository. Elle ignore la casse et les
espaces périphériques, permet le cumul avec la période, conserve les règles de visibilité
et affiche un message spécifique sans résultat. La documentation API a été mise à jour.
La recherche approximative et le traitement particulier des accents restent hors périmètre.

Après l'implémentation, les tests ciblés ont réussi : backend 25/25 et frontend 9/9. Une
vérification dans le navigateur avec un compte étudiant a également été rapportée.
`npm.cmd run check` a réussi : lint, TypeScript, 147 tests backend, 63 tests frontend et
build ; `git diff --check` n'a signalé aucune erreur (210 tests au total).

## Hook Tool Guardian

Le hook `preToolUse` a été configuré pour refuser les tentatives de suppression de
`demo-protected.txt`. Dans Copilot, `git status` a été autorisé et la suppression demandée
a été bloquée avant exécution ; le fichier a été conservé. Les essais directs du script
ont aussi confirmé `{}` pour une commande non bloquée, `deny` pour la suppression visée et
`deny` pour un événement JSON illisible. Le hook est un garde-fou de démonstration : ses
motifs ne détectent pas toutes les suppressions possibles, notamment via un script ou un
nom construit dynamiquement.

## Difficultés et enseignements

- Un premier lancement des tests backend de l'audit a échoué sur un timeout du setup ; la
  relance a réussi. Le résultat a été vérifié avant de conclure à un manque de tests.
- Sur Windows, `npm.ps1` était bloqué par la stratégie PowerShell ; `npm.cmd` a permis
  d'exécuter les mêmes commandes.
- Le backend de développement ne démarrait pas initialement faute de `JWT_SECRET` valide ;
  `npm run setup` a résolu le problème.
- Le cycle TDD a permis de vérifier que les nouveaux tests échouaient pour la raison
  attendue avant d'implémenter EF-30. La validation explicite du lot a précédé le code.
- L'essai Tool Guardian a montré l'intérêt d'un hook de pré-exécution, ainsi que les limites
  d'une détection fondée sur des motifs textuels.

## Crédits d'utilisation de l'IA

Les crédits exacts pour cette semaine ne figurent pas dans les documents consultés. Ils ne
sont pas estimés.

| Membre | Crédits d'utilisation de l'IA |
|---|---|
| Membre 1 — nom à compléter | À compléter |
| Membre 2 — nom à compléter | À compléter |
