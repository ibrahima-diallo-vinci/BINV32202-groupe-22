# Semaine 4 — Skills, tests et hooks

## 1. Audit des tests des candidatures (EF-32 / EF-33)

Skill `test-gap-audit` (dépôt `github/awesome-copilot`) installé dans
`.github/skills/test-gap-audit/`. L'en-tête YAML était déjà valide : toute la description est
sur une seule ligne dans le champ `description`. Le script `scripts/coverage_map.py` a été lu
avant usage : il est en lecture seule et n'appelle que `git ls-files`. Le skill a été rechargé
avec `/skills reload` puis lancé avec
`/test-gap-audit les tests des candidatures (EF-32 et EF-33)`.

Copilot a proposé trois manques (un P1, deux P2). Chaque constat a été vérifié dans les tests
et le code avant d'être retenu.

| Cas à vérifier | Test existant et assertion utile | Manque confirmé ou constat écarté |
|---|---|---|
| Refus d'une candidature à une offre non publiée | `backend/tests/applications.test.ts` « refuse les offres qui ne sont pas publiées » : 4 offres non publiées, 409 `OFFER_NOT_PUBLISHED` et absence de la candidature dans la liste | Couvert |
| Retrait d'une candidature déjà traitée | `applications.test.ts` « refuse de retirer une candidature %s » : SELECTED, REJECTED et WITHDRAWN, 409 `APPLICATION_NOT_WITHDRAWABLE` et statut inchangé | Couvert |
| Accès aux candidatures d'un autre étudiant | `applications.test.ts` : `toEqual` sur la liste exacte de l'étudiant (GET) ; DELETE par un autre étudiant renvoie 404 et la candidature reste `IN_PROGRESS` | Couvert |
| Re-candidature après retrait depuis la page Offres (P1) | Backend couvert (« permet de candidater à nouveau après retrait »). `OfferTable.tsx` réaffiche « Candidater » pour un statut `WITHDRAWN`, mais aucun test de `OffersPage.test.tsx` n'utilise ce statut | **Manque confirmé** (non traité cette séance) |
| Historique EF-33 vide ou en erreur (P2) | `ApplicationsPage.tsx` gère l'état vide et l'erreur de chargement, mais `ApplicationsPage.test.tsx` ne testait qu'une liste remplie | **Manque confirmé → traité** |
| Candidatures ou retraits concurrents (P2) | `better-sqlite3` est synchrone : deux requêtes ne s'entrelacent pas dans le même processus, donc un test « concurrent » passerait sans rien prouver. Les doublons sont aussi bloqués par l'index unique de la migration 002, testé dans `constraints.test.ts` | **Écarté** |

### Tests ajoutés

Deux tests dans `frontend/tests/ApplicationsPage.test.tsx` (aucun code applicatif modifié) :

- liste vide : le message exact « Vous n'avez pas encore candidaté à une offre. » est affiché
  et aucun tableau n'est rendu ;
- GET en erreur 500 : le message « Chargement des candidatures impossible (statut 500) » est
  affiché et aucun tableau n'est rendu.

Résultat : `npm.cmd run test -w frontend -- tests/ApplicationsPage.test.tsx` → 6/6 tests
réussis.

**Contrôle par mutation** : les états vide et erreur ont été désactivés temporairement dans
`ApplicationsPage.tsx`. Les deux nouveaux tests ont alors échoué (2 échecs, 4 réussis), puis
le fichier a été restauré. Les tests protègent donc bien le comportement. Aucun défaut
applicatif n'a été révélé.

Remarque : lors de l'audit, un premier lancement des tests backend a échoué sur un timeout
du setup, puis a réussi (23/23) à la relance. L'environnement de test est donc parfois instable.

## 2. TDD — recherche d'offres par titre (EF-30)

Le skill `test-driven-development` de Superpowers a été installé dans `.github/skills/test-driven-development/`, avec `SKILL.md`, `writing-good-tests.md` et `LICENSE`.

Une consigne de validation obligatoire avant l'implémentation a été ajoutée dans `SKILL.md`, ainsi qu'une instruction de déclenchement automatique dans `.github/copilot-instructions.md`.

Après `/skills reload` (14 skills chargés), une nouvelle conversation Copilot a été ouverte. La demande EF-30 a été formulée sans appeler explicitement le skill et sans demander de commencer par les tests.

**Copilot a automatiquement lu le skill TDD**, puis `writing-good-tests.md`, avant de préparer les tests.

### Phase RED — tests avant implémentation

Sept tests ont été ajoutés : cinq tests backend et deux tests frontend.

| Cas testé | Résultat avant implémentation |
|---|---|
| Recherche insensible à la casse et espaces périphériques | Échec : l'API renvoie toutes les offres |
| Recherche de plusieurs mots comme expression entière | Échec : le filtre est ignoré |
| Recherche composée uniquement d'espaces | Réussite : les offres accessibles sont affichées |
| Combinaison recherche et période | Échec : seule la période est filtrée |
| Recherche étudiant et visibilité des offres | Échec : la recherche est ignorée, mais la visibilité reste respectée |
| Champ de recherche et combinaison avec la période dans l'interface | Échec : le champ de recherche n'existe pas |
| Message lorsqu'aucune offre ne correspond | Échec : le champ de recherche n'existe pas |

**Résultats RED :**
- Backend : 4 nouveaux tests en échec, 21 tests réussis.
- Frontend : 2 nouveaux tests en échec, 7 tests réussis.

Les échecs provenaient de l'absence de la fonctionnalité et non d'erreurs de syntaxe. Le test des espaces seuls réussissait déjà, car le paramètre de recherche était ignoré.

Copilot s'est arrêté avant de modifier le code applicatif et a demandé une validation explicite.

### Validation des tests

Avant de donner mon accord, j'ai demandé à Copilot de présenter les sept tests, leurs assertions et leurs messages d'échec exacts.

Les résultats correspondaient aux règles EF-30. J'ai donc validé le lot de tests pour autoriser l'implémentation.

### Phase GREEN — implémentation

Copilot a ajouté la recherche dans le frontend et le backend en conservant l'architecture existante.

Après l'implémentation, les tests ciblés ont réussi :
- Backend : 25/25 tests.
- Frontend : 9/9 tests.

La conversation complète est conservée dans `docs/semaine-4/conversation-3.md`.

## 3. Recherche — cas essayés et `npm run check`

La fonctionnalité EF-30 permet de rechercher les offres de stage par titre.

### Fonctionnalités vérifiées par les tests

- Recherche d'une sous-chaîne du titre sans distinction entre majuscules et minuscules.
- Suppression des espaces au début et à la fin de la recherche.
- Recherche vide : affichage des offres normalement accessibles.
- Recherche sans correspondance : liste vide et message adapté.
- Recherche de plusieurs mots comme expression entière.
- Combinaison avec le filtre par période.
- Conservation des règles de visibilité des offres publiées pour les étudiants.

La recherche approximative et le traitement particulier des accents sont hors périmètre.

### Essai dans le navigateur

L'application a été lancée avec `npm run dev`.

Au premier lancement, le backend ne démarrait pas car `JWT_SECRET` était absent ou trop court. La commande `npm run setup` a permis de corriger le problème.

Après redémarrage, la connexion de démonstration était accessible. La recherche a été essayée dans le navigateur avec un compte étudiant, notamment avec un titre existant et une recherche sans correspondance. Le fonctionnement a été confirmé.

### Vérification globale

Copilot a exécuté `npm.cmd run check` avec succès :

| Vérification | Résultat |
|---|---|
| Lint | Réussi |
| TypeScript | Réussi |
| Tests backend | 147/147 réussis |
| Tests frontend | 63/63 réussis |
| Build | Réussi |
| `git diff --check` | Aucune erreur |

**Total : 210 tests réussis.**

Aucun problème fonctionnel restant n'a été signalé à l'issue des vérifications.
## 4. Hook Tool Guardian

Fichiers du zip Moodle placés dans `.github/hooks/` (`tool-guardian.json`, `guard-tool.cjs`)
et lus avant installation : le script lit l'événement sur l'entrée standard et répond, sans
écriture ni accès réseau. Fichier `demo-protected.txt` créé à la racine.

- **Événement utilisé** : `preToolUse`, déclenché avant chaque appel d'outil de l'agent.
- **Commande** : `node .github/hooks/guard-tool.cjs` (timeout 10 s).
- **Règle** : si l'appel mentionne `demo-protected.txt` et qu'il s'agit d'une suppression
  (commande shell `rm`, `del`, `Remove-Item`…, outil de suppression ou patch `Delete File`),
  le script répond `permissionDecision: "deny"`. Sinon il répond `{}` et les permissions
  habituelles s'appliquent.

### Essais dans Copilot (nouvelle session, conversation 2)

| Demande | Appel d'outil | Résultat |
|---|---|---|
| « Exécute git status » | `git status` | Exécuté normalement |
| « Supprime demo-protected.txt avec une commande du terminal » | `Remove-Item -LiteralPath 'demo-protected.txt'; git status --short` | **Refusé avant exécution** |

**Preuve du déclenchement** : Copilot a bien tenté l'appel d'outil, puis la trace affiche
`Tool execution failed: Denied by preToolUse hook: Démonstration Tool Guardian : suppression
de demo-protected.txt interdite.` Le refus vient donc du hook et non d'un refus spontané de
l'agent. Après l'essai, `demo-protected.txt` existe toujours avec son contenu.

### Vérification du script hors Copilot (événements simulés)

| Événement envoyé au script | Réponse |
|---|---|
| `run_in_terminal` + `git status` | `{}` (aucune décision) |
| `run_in_terminal` + `Remove-Item demo-protected.txt` | `deny` |
| JSON illisible | `deny` (refus par défaut si l'événement est invalide) |

### Limites

Le hook ne reconnaît que quelques formes de suppression par motif de texte. Par exemple, un
script Node ou Python qui supprime le fichier, ou un nom construit dynamiquement, ne serait pas
détecté. C'est un garde-fou de démonstration, pas une protection complète.
