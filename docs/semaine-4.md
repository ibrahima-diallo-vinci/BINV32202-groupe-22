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

_À compléter (partie B)._

## 3. Recherche — cas essayés et `npm run check`

_À compléter (partie B)._

## 4. Hook Tool Guardian

_À compléter._
