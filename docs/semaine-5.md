# Semaine 5 — MCP et tests end-to-end avec Playwright

## 1. Scénarios

Les scénarios sont décrits dans
[`e2e/recherche-offres/scenarios.md`](../e2e/recherche-offres/scenarios.md). Ils ont été
rédigés avant toute demande à Copilot, à partir des règles EF-30 de la semaine 9
(`docs/semaine-4.md`) et des offres du seed (`backend/src/db/seed/offersData.ts`).

État initial commun : base du seed, étudiant **Lucas Dupont** connecté par la connexion de
démonstration, page « Offres », toutes périodes, champ de recherche vide. L'étudiant voit
4 offres publiées.

| N° | Scénario | Action | Résultat attendu |
|---|---|---|---|
| 1 | Recherche avec résultat (nominal) | Saisir `application` | « 1 offre », uniquement « Application React de gestion de flotte » ; « Migration d'une application vers le cloud » (ASSIGNED) reste masquée |
| 2 | Recherche sans résultat (limite) | Saisir `blockchain` | Message « Aucune offre ne correspond à votre recherche. », ni tableau ni compteur |

**Justification du choix**

- Le scénario 1 vérifie en une seule saisie trois règles : correspondance partielle,
  insensibilité à la casse (`application` trouve « Application… ») et visibilité étudiant.
  Le mot a été choisi parce qu'une offre **non publiée** le contient aussi : si la règle de
  visibilité cassait, le test le verrait.
- Le scénario 2 vérifie la liste vide et le message propre à la recherche, distinct du
  message générique « Aucune offre à afficher. ».

Les données ont été contrôlées par l'API (`GET /offers` en tant que Lucas) : 4 offres sans
recherche, 1 avec `search=application`, 0 avec `search=blockchain`. La recherche ne modifie
aucune donnée, donc les scénarios sont répétables sans nettoyage.

## 2. Playwright MCP — scénario 1

**Mise en place**

- Serveur local : `npx -y @playwright/mcp@latest --isolated --browser chromium --port 8931`,
  qui écoute uniquement sur `localhost` (`[::1]:8931`).
- Client : Copilot en mode Agent. `.mcp.json` a été créé à la racine comme demandé, mais
  les outils Playwright ne sont pas apparus dans la session. Après ajout de
  `.vscode/mcp.json` (format `servers`), le serveur a été détecté.
- Application : `npm run db:reset` puis `npm run dev` (backend `:3000`, frontend `:5173`).

**Difficultés rencontrées (conservées dans les conversations)**

1. *Conversation 1* : le serveur MCP n'était pas lancé. Copilot a quand même « exécuté » le
   scénario avec le **navigateur intégré de VS Code** (« Clic effectué … dans
   [Navigateur] ») et il a trouvé une session déjà ouverte (Aminata Diallo), ce qui est
   impossible avec un profil `--isolated`. Le résultat annoncé était juste, mais **aucun
   outil MCP n'avait été utilisé**. Une affirmation de l'agent ne suffit donc pas. Relancé
   avec la consigne « uniquement les outils Playwright MCP », Copilot a ensuite reconnu
   qu'il ne voyait pas ces outils et a demandé quoi faire, au lieu de contourner.
2. *Conversation 2, premier essai* : les outils MCP étaient visibles, mais ils échouaient
   (`Chromium distribution 'chrome' is not found`). Par défaut, le serveur cherche Google
   Chrome, absent du poste. Il a été corrigé en installant le Chromium de Playwright et en
   relançant le serveur avec `--browser chromium`. Copilot avait aussi tenté d'ouvrir
   `scenarios.md` dans le navigateur (`file:///…`) au lieu de le lire comme un fichier.
3. *Conversation 2, second essai* : **réussi**.

**Résultat : scénario 1 conforme.** Une fenêtre Chromium isolée s'est ouverte directement sur
« Connexion de démonstration ». Lucas Dupont a été choisi, puis la page « Offres » a affiché
4 offres. Après saisie de `application` : « 1 offre », « Application React de gestion de
flotte » ; les 3 autres offres publiées et « Migration d'une application vers le cloud »
ne sont plus affichées.

**Appels d'outils observés**

| Outil MCP | Entrée | Ce qui a été renvoyé à l'agent |
|---|---|---|
| `browser_navigate` | `{"url": "http://localhost:5173"}` | La page chargée (URL, titre) avec son instantané d'accessibilité : la page de connexion de démonstration |
| `browser_snapshot` | `{}` | L'arbre d'accessibilité de la page, où chaque élément porte une référence. C'est là que Copilot a trouvé `e30` (bouton « Lucas Dupont »), `e123` (lien « Offres ») et `e140` (champ « Rechercher par titre »), qu'il a réutilisés dans les appels suivants |
| `browser_click` | `{"target": "e30", "element": "Lucas Dupont"}` | Confirmation du clic et nouvel état de la page (utilisateur connecté) |
| `browser_type` | `{"target": "e140", "element": "champ Rechercher par titre", "text": "application"}` | Confirmation de la saisie. Le `browser_snapshot` suivant a renvoyé la page filtrée (« 1 offre ») |

Les références `e30`, `e123` et `e140` ne figurent pas dans la demande : elles ne peuvent
venir que des instantanés renvoyés par le serveur. C'est la preuve que l'agent a bien
lu la page réelle avant d'agir. Le serveur MCP a été arrêté après l'exploration.

**Traces conservées** : le serveur a enregistré les instantanés renvoyés à l'agent. Ils
sont copiés dans [`docs/semaine-5/traces-mcp/`](semaine-5/traces-mcp/) :

- `1-connexion.yml` : `heading "Connexion de démonstration"`, groupe « Étudiants »,
  `button [ref=e30]` → `strong: Lucas Dupont` ;
- `2-accueil-lucas.yml` : `heading "Bonjour Lucas"`, `link "Offres" [ref=e123]` ;
- `3-offres-avant-recherche.yml` : `heading "Offres de stage"`, `searchbox "Rechercher par
  titre" [ref=e140]`, `paragraph: 4 offres` et 4 lignes, dont « Application React de
  gestion de flotte ».

L'instantané qui suit la saisie (« 1 offre ») a été renvoyé directement dans la
conversation, sans fichier. Le résultat filtré a été contrôlé par l'API.

Conversations : `docs/semaine-5/conversation-1.md` et `docs/semaine-5/conversation-2.md`.

## 3. Playwright Test

Playwright Test a été installé comme dépendance de développement, avec TypeScript et le
navigateur Chromium. La configuration `playwright.config.ts` utilise `testDir: './e2e'`,
`baseURL: 'http://localhost:5173/'` et le seul projet Chromium. Le spec
[`e2e/recherche-offres/recherche-offres.spec.ts`](../e2e/recherche-offres/recherche-offres.spec.ts)
contient deux tests nommés avec le numéro de leur scénario.

Chaque test utilise sa propre page, se connecte par l'interface en choisissant Lucas Dupont,
ouvre « Offres » et utilise le champ accessible « Rechercher par titre ».

- **Scénario 1** : saisit `application`, attend exactement « 1 offre », puis vérifie que le
  tableau ne contient que la ligne « Application React de gestion de flotte ». Il vérifie
  également l'absence de « Migration d'une application vers le cloud » (non publiée) et des
  trois autres offres publiées.
- **Scénario 2** : saisit `blockchain`, attend exactement « Aucune offre ne correspond à
  votre recherche. », puis vérifie l'absence de tableau et de compteur.

Les sélecteurs s'appuient sur les rôles, noms accessibles et libellés exacts. La connexion
est refaite dans chaque test ; aucune donnée n'est modifiée, ce qui rend les scénarios
indépendants de leur ordre et répétables.

Les premières tentatives manuelles n'ont pas pu démarrer car le frontend était inaccessible
sur le port 5173. Après redémarrage de l'application, les tests Playwright sont passés lors
de deux exécutions successives :

| Exécution | Résultat |
|---|---|
| 1 | 2/2 tests réussis en 3,4 s |
| 2 | 2/2 tests réussis en 2,2 s |

`npm run check` a également réussi : lint, typecheck, build, 147 tests backend et 63 tests
frontend.

## 4. Vérification par un défaut temporaire

Pour vérifier que les tests détectent réellement une régression, le filtrage par titre a
été temporairement désactivé dans
[`backend/src/repositories/offers.repository.ts`](../backend/src/repositories/offers.repository.ts).
Les tests Playwright ont alors échoué comme prévu :

- **Scénario 1** : échec à la ligne 17, car le compteur attendu « 1 offre » n'apparaissait
  pas ;
- **Scénario 2** : échec à la ligne 61, car le message attendu « Aucune offre ne correspond
  à votre recherche. » n'apparaissait pas.

Le prédicat de recherche a ensuite été restauré. Après restauration, les deux tests ont
réussi (2/2 en 2,0 s) et `git diff` ne montrait aucun changement dans
`offers.repository.ts`. Les tests E2E n'ont pas été modifiés pour provoquer ou masquer les
échecs.

Lors de l'installation, des erreurs temporaires `ENOSPC` sont survenues. L'installation a
finalement abouti ; les deux exécutions Playwright et `npm run check` ont ensuite réussi.

## 5. Comparaison MCP / Playwright Test

_À compléter ensemble._
