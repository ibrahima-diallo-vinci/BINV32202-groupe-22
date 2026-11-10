# Semaine 8 — audit du harnais agentique

## Périmètre et méthode

L'audit porte sur les exigences EF-32 et EF-33 du cahier des charges, les assertions des
tests existants et le harnais de guides et de contrôles du dépôt. Les seuls changements de
code sont des ajouts/renforcements dans `backend/tests/applications.test.ts`. Aucun code
métier ni guide n'a été modifié.

Les contrôles ont été lancés avec `npm.cmd run check` depuis la racine du dépôt. Les tests
manuels navigateur ne font pas partie de cette exécution.

## Inventaire des guides et senseurs

La matrice croise la nature du mécanisme (guide ou senseur) avec son mode d'action
(inférentiel ou computationnel). Les identifiants renvoient à l'inventaire détaillé plus
bas. Les cellules sans mécanisme repéré restent vides : aucun senseur inférentiel dédié ni
guide computationnel n'a été identifié.

|  | Inférentiel | Computationnel |
|---|---|---|
| **Guide** | G1–G7 | — |
| **Senseur** | — | S1–S6 |

### Guides inférentiels

| ID | Emplacement complet relatif au dépôt | Rôle et exemple concret | État pendant cette séance |
|---|---|---|---|
| G1 | `.github/copilot-instructions.md` | Instructions projet : architecture, commandes, droits et conventions. Exemple : demander que les tests backend utilisent SQLite en mémoire. | Lu intégralement et appliqué. |
| G2 | `README.md` | Installation, commandes, état du projet. Exemple : `npm run check` combine lint, typecheck, tests et build. | Consulté. |
| G3 | `docs/architecture.md`; `backend/API.md` | Architecture en couches et contrat HTTP. Exemple : les droits sont vérifiés côté serveur et les erreurs ont un format commun. | Consultés. |
| G4 | `docs/cdc_gesta_developpement.md` | Exigences métier. Exemple : EF-32 porte sur la candidature à une offre publiée et le retrait avant traitement ; EF-33 liste les statuts à présenter. | Sections pertinentes relues. |
| G5 | `docs/seed.md` | Décrit les données fictives et les profils du seed. Exemple : les tests réutilisent des candidatures sélectionnées, rejetées et retirées. | Consulté. |
| G6 | `docs/semaine-2/tests-manuels.md` | Protocole manuel EF-32/33, indiqué « à exécuter ». Exemple : essayer une candidature à une offre non publiée. | Consulté ; aucun scénario manuel exécuté. |
| G7 | `.github/pull_request_template.md` | Checklist manuelle de revue : commande globale, tests, permissions, documentation et navigateur. | Consulté ; la checklist elle-même n'a pas été cochée. |

Les comptes rendus et conversations `docs/bilan-1.md`, `docs/semaine-2/bilan.md`,
`docs/conversation-1.md` et `docs/semaine-2/conversation-1.md` sont des archives
historiques, pas des guides ou des senseurs actifs.

### Senseurs computationnels

| ID | Emplacement complet relatif au dépôt | Rôle et exemple concret | État pendant cette séance |
|---|---|---|---|
| S1 — Oxlint | `backend/.oxlintrc.json`, `frontend/.oxlintrc.json`, scripts `lint` dans `backend/package.json` et `frontend/package.json` | Analyse statique ; par exemple, interdit `any` explicite et active les règles React Hooks. | Exécuté par le contrôle final ; réussi. |
| S2 — TypeScript | `backend/tsconfig.json`, `backend/tsconfig.build.json`, `frontend/tsconfig.json`, `frontend/tsconfig.app.json`, `frontend/tsconfig.node.json`, `backend/package.json`, `frontend/package.json` | Vérifie les types, les symboles inutilisés et les options strictes. | Exécuté par le contrôle final ; réussi. |
| S3 — Vitest | `backend/vitest.config.ts`, `frontend/vite.config.ts`, `backend/tests/`, `frontend/tests/` | Exécute tests API et interface. Exemple : refus des accès non étudiants et affichage des quatre libellés de candidature. | Exécuté par le contrôle final ; 142 tests backend et 59 frontend réussis. |
| S4 — Build | Scripts `build` de `package.json`, `backend/package.json` et `frontend/package.json`, plus `backend/tsconfig.build.json` et `frontend/vite.config.ts` | Compile le backend puis construit le bundle Vite de production. | Exécuté par le contrôle final ; réussi. |
| S5 — Garde de version Node | `backend/src/nodeVersion.ts`, `backend/src/requireSupportedNode.ts`, `backend/tests/helpers/requireSupportedNode.ts`, `backend/tests/nodeVersion.test.ts` | Refuse les versions sous le minimum ; le test vérifie notamment le refus de 22.12.0 et l'acceptation de 22.14.0. | Vérifications exécutées dans la suite backend avec Node 22.14.0 ; réussies. |
| S6 — Santé API | `backend/src/controllers/health.controller.ts`, `backend/tests/health.test.ts` | Le test appelle `GET /health` et attend `{ "status": "ok" }`. | Test exécuté dans la suite backend ; réussi. |

Aucun workflow CI, hook pre-commit ni scan automatisé de sécurité/configuration n'a été
repéré dans le dépôt.

### Scripts et configurations examinés qui ne sont pas des senseurs

Les configurations et scripts suivants ont été consultés mais ne mesurent pas la qualité du
code : `.nvmrc` (version Node indiquée), `.npmrc` (scripts npm d'installation désactivés),
`backend/scripts/setupEnv.js`, `backend/scripts/copyMigrations.js`,
`backend/src/db/scripts/init.ts`, `backend/src/db/scripts/printSummary.ts` et
`backend/src/db/scripts/reset.ts` (préparation, copie ou gestion de la base locale).
`backend/scripts/copyMigrations.js` a été exécuté indirectement par le build backend dans
`npm.cmd run check`. Les autres scripts opérationnels listés n'ont pas été lancés.

## Exigences explicites et choix supplémentaires

**Exigences explicites du cahier des charges :**

- **EF-32** : l'étudiant peut candidater à une offre publiée avec un message facultatif et
  retirer sa candidature tant qu'elle n'a pas été traitée.
- **EF-33** : l'étudiant voit ses candidatures et leurs statuts « En cours », « Retenue »,
  « Non retenue » ou « Retirée ».
- Les restrictions d'accès côté serveur sont également exigées par **ENF-03** ; les
  tests de droits sont donc pertinents, même si leur formulation ne figure pas directement
  dans EF-32 ou EF-33.

**Comportements supplémentaires de ce projet, non énoncés par EF-32/EF-33 :**

- Une candidature non retirée déjà existante empêche une nouvelle candidature ; une
  candidature peut être recréée après retrait. Le contrat API documente le conflit
  `APPLICATION_EXISTS`.
- Le serveur normalise le message vide/en espaces en `null`, retourne des codes d'erreur
  déterminés (par exemple 404 pour offre inconnue) et conserve les candidatures retirées
  dans l'historique.
- Les statuts internes sont en anglais (`IN_PROGRESS`, `SELECTED`, `REJECTED`,
  `WITHDRAWN`) et sont traduits en français dans l'interface.

Ces choix sont évalués séparément dans la matrice ci-dessous ; ils ne sont pas présentés
comme des exigences explicites du cahier des charges.

## Matrice de couverture avant et après

Les noms ci-dessous sont les noms des tests Vitest, avec les cas substitués pour les tests
paramétrés. « Avant » décrit les assertions présentes avant les changements de cette
séance ; « après » décrit les assertions actuelles.

| Exigence / origine | Cas précis | Résultat attendu | Fichier et nom exact du test | Assertions utiles | Avant | Après |
|---|---|---|---|---|---|---|
| EF-32 explicite | Un étudiant candidate à une offre publiée avec message. | Création HTTP 201 ; offre associée, message conservé, statut en cours. | `backend/tests/applications.test.ts` — `crée une candidature avec un message facultatif` | `status === 201`, DTO contient l'offre, le message et `IN_PROGRESS`, identifiant/date présents. | Couvert | Couvert |
| EF-32 explicite | Le message est omis ou vide. | La candidature est créée ; le message vide est représenté comme absent (`null`). | `backend/tests/applications.test.ts` — `accepte une candidature sans message et normalise un message vide`; `frontend/tests/OffersPage.test.tsx` — `permet d'envoyer une candidature sans message et affiche les doublons refusés par l'API` | Réponse 201 et `message === null` côté API ; le corps POST de l'interface omet `message` lorsqu'il est vide. | Couvert | Couvert |
| EF-32 explicite, ENF-03 | Un non-étudiant ou une requête sans session tente de candidater ou de retirer. | Sans session : 401 ; administrateur/contact : 403 `FORBIDDEN`. | `backend/tests/applications.test.ts` — `réserve la route à l'étudiant et exige une session` dans les suites POST et DELETE | Statut HTTP et code d'erreur pour chaque profil, ainsi que 401 sans jeton. | Couvert | Couvert |
| EF-32 explicite | L'offre n'est pas publiée : soumise, en attente, attribuée ou archivée. | Candidature refusée par le serveur ; 409 `OFFER_NOT_PUBLISHED` et aucune ligne créée. | `backend/tests/applications.test.ts` — `refuse les offres qui ne sont pas publiées` | 409/code d'erreur et relecture GET vérifiant l'absence de candidature pour chacune de ces offres. La couverture avant omettait l'offre soumise et n'assertait pas l'absence de mutation. | Partiel | Couvert |
| EF-32 explicite | L'étudiant retire sa candidature en cours. | 204 ; statut devient `WITHDRAWN` ; l'interface affiche « Retirée » et n'offre plus le bouton. | `backend/tests/applications.test.ts` — `retire une candidature en cours appartenant à l'étudiant`; `frontend/tests/ApplicationsPage.test.tsx` — `retire une candidature en cours et actualise son statut sans recharger` | Statut HTTP puis relecture du statut ; côté UI, libellé, absence du bouton et requête DELETE avec jeton. | Couvert | Couvert |
| EF-32 explicite | Retrait d'une candidature sélectionnée, rejetée ou déjà retirée. | Refus 409 `APPLICATION_NOT_WITHDRAWABLE` ; statut initial inchangé. | Avant : `backend/tests/applications.test.ts` — `refuse de retirer une candidature déjà traitée` (seulement sélectionnée). Après : `backend/tests/applications.test.ts` — `refuse de retirer une candidature retenue sans changer son statut`, `refuse de retirer une candidature non retenue sans changer son statut`, `refuse de retirer une candidature déjà retirée sans changer son statut`. L'interface est vérifiée par `frontend/tests/ApplicationsPage.test.tsx` — `affiche les candidatures, leurs statuts et le retrait seulement pour celles en cours`. | 409 et `APPLICATION_NOT_WITHDRAWABLE`, puis GET confirme que le statut de la candidature reste celui d'origine. Le test UI vérifie les quatre libellés et qu'un seul des quatre éléments a le bouton. | Partiel | Couvert |
| EF-33 explicite | Consultation des candidatures de l'étudiant, sans divulguer celles des autres. | Réponse limitée aux candidatures du demandeur, avec les informations associées. | `backend/tests/applications.test.ts` — `retourne uniquement les candidatures de l'étudiant avec les informations de l'offre`; `backend/tests/applications.test.ts` — `réserve la route à l'étudiant (profil administrateur)` et `réserve la route à l'étudiant (profil contact)` | Égalité exacte au DTO attendu pour Lucas dans une base seedée contenant aussi des candidatures d'autres étudiants ; statut 403 pour les autres profils. | Couvert | Couvert |
| EF-33 explicite | Les quatre statuts sont présentés avec les libellés français attendus. | En cours, Retenue, Non retenue et Retirée s'affichent ; l'action de retrait n'est proposée qu'en cours. | `frontend/tests/ApplicationsPage.test.tsx` — `affiche les candidatures, leurs statuts et le retrait seulement pour celles en cours` | Assertions des quatre textes et un seul bouton « Retirer » pour les quatre candidatures mockées. | Couvert | Couvert |
| EF-33 explicite, contrat API du projet | L'API retourne les statuts sélectionné et rejeté pour les candidatures correspondantes. | Le DTO conserve `SELECTED` et `REJECTED` pour les étudiants concernés. | Avant : pas d'assertion de ces deux statuts dans le GET API. Après : `backend/tests/applications.test.ts` — `retourne une candidature retenue avec son statut API` et `retourne une candidature non retenue avec son statut API`. | GET 200 et présence du couple identifiant/statut dans le JSON. | Partiel | Couvert |
| EF-32 explicite / confidentialité | Un étudiant ne peut pas retirer la candidature d'un autre étudiant. | 404 `NOT_FOUND`, sans révéler la ressource ni modifier le statut de la candidature. | `backend/tests/applications.test.ts` — `ne révèle pas la candidature d'un autre étudiant` | 404 et code `NOT_FOUND`, puis GET en tant que propriétaire vérifiant que la candidature de Lucas reste `IN_PROGRESS`. | Partiel | Couvert |
| Choix du projet | Refuser un doublon non retiré, mais permettre une nouvelle candidature après retrait. | 409 `APPLICATION_EXISTS` en cas de doublon ; après retrait, une nouvelle candidature est créée. | `backend/tests/applications.test.ts` — `refuse une candidature en double non retirée`; `refuse une nouvelle candidature si l'ancienne a été traitée, même après retrait impossible`; `permet de candidater à nouveau après retrait` | Codes 409 ; nouvelle création 201 et nouvel identifiant après retrait. | Couvert | Couvert |
| Choix du projet | Conserver les candidatures retirées dans l'historique. | Le GET retourne encore la candidature retirée. | `backend/tests/applications.test.ts` — `conserve et retourne les candidatures retirées dans l'historique` | Réponse 200, identifiant et statut `WITHDRAWN`, nombre d'éléments attendu. | Couvert | Couvert |

## Tests ajoutés ou renforcés et défauts détectés

Toutes les modifications sont dans `backend/tests/applications.test.ts`.

1. **Ajout des offres soumises au test des offres non publiées.** Le test couvre désormais
   explicitement les quatre statuts non publiés représentatifs : soumise
   (`OFFER.CONSULTANT_PLANNING`), en attente, attribuée et archivée. Il relit aussi les
   candidatures du demandeur et vérifie qu'aucune n'a été créée pour l'offre refusée. Un
   défaut qui accepterait une candidature sur une offre soumise, ou l'insérerait avant de
   retourner une erreur, ferait échouer ces assertions.
2. **Ajout de deux cas GET API pour `SELECTED` et `REJECTED`.** Un statut qui serait perdu
   ou mal mappé lors de la lecture des candidatures ferait échouer l'assertion de présence
   du couple identifiant/statut.
3. **Extension du refus de retrait aux trois états non retirables.** Le test paramétré
   vérifie désormais les candidatures retenue, non retenue et déjà retirée, puis relit la
   liste pour confirmer que le statut n'a pas changé. Une régression qui accepterait le
   retrait d'une candidature traitée/retirée échouerait sur le 409 ; une mutation
   accidentelle échouerait sur la relecture.
4. **Renforcement du refus de retrait inter-étudiants.** Après le 404 reçu par Inès qui
   tente de retirer la candidature de Lucas, le test relit les candidatures de Lucas et
   vérifie que la candidature ciblée reste `IN_PROGRESS`. Une régression qui modifierait
   le statut tout en répondant 404 ferait échouer cette assertion.

Les tests existants sur les droits, la liste isolée par étudiant, le doublon actif, le
retrait d'une candidature appartenant à autrui et le retrait d'une candidature en cours
ont été conservés : leurs assertions couvrent déjà ces cas. Aucun défaut applicatif n'a
été détecté pendant cette vérification ; aucun code métier n'a été modifié.

Les défauts décrits dans les ajouts/renforcements ci-dessus sont des régressions
théoriques que ces assertions sont conçues pour détecter. Aucune mutation volontaire du
code n'a été effectuée pour vérifier qu'elles échouent.

## Vérifications réellement exécutées

Commande exécutée depuis la racine :

```text
npm.cmd run check
```

| Contrôle | Résultat |
|---|---|
| Lint backend et frontend (`oxlint --deny-warnings`) | Réussi |
| Typecheck backend et frontend (TypeScript) | Réussi |
| Tests backend (Vitest) | Réussi — 142 tests dans 10 fichiers |
| Tests frontend (Vitest) | Réussi — 59 tests dans 8 fichiers |
| Build backend et frontend | Réussi — compilation TypeScript backend et bundle de production Vite frontend |
| Résultat global | `npm.cmd run check` réussi sous Node 22.14.0 |

### Incidents de préparation

- La première tentative de `npm.cmd run check` a échoué au lint parce que `oxlint` n'était
  pas installé. `npm.cmd ci` a installé les dépendances verrouillées ; il a signalé
  `EBADENGINE` avec le Node initial 22.12.0, ainsi qu'une vulnérabilité de sévérité haute
  dans l'audit automatique npm. Aucun `npm audit` dédié ni correctif de dépendance n'a été
  lancé.
- Avec les dépendances présentes, les premiers contrôles lint et typecheck ont réussi ;
  les suites backend ont refusé de démarrer sous Node 22.12.0, inférieur au minimum projet
  22.14.0. Les 59 tests frontend réussissaient déjà sous cette première version.
- Node 22.14.0 a été installé via `nvm`, puis le contrôle final a été lancé avec le chemin
  de cette version préfixé uniquement dans le processus PowerShell. Aucune configuration
  ni version de dépendance du dépôt n'a été changée.

## Limites et suites

- Aucun test manuel navigateur n'a été effectué ; le protocole demeure documenté dans
  `docs/semaine-2/tests-manuels.md`.
- Les tests automatiques utilisent la base SQLite seedée en mémoire et des mocks frontend ;
  ils ne remplacent pas une validation manuelle end-to-end.
- Audit comparatif Web 2 non réalisé : supports du cours indisponibles pendant la séance.
  Cette partie reste à compléter.
- Aucun commit ni push n'a été effectué.
