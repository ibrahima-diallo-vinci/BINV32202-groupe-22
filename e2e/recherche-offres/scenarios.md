# Scénarios E2E — recherche d'offres par titre (EF-30)

Règles de la semaine 9 (voir `docs/semaine-4.md`) : la recherche porte sur le titre, ignore
la casse et les espaces au début et à la fin, cherche l'expression entière, se combine avec
le filtre par période et respecte la visibilité (un étudiant ne voit que les offres
publiées). Sans correspondance, la liste est vide et un message adapté est affiché.

## État initial commun

- **Données** : base initialisée avec le seed du projet (`npm run db:reset` si elle a été
  modifiée). La recherche ne modifie aucune donnée : les scénarios sont répétables.
- **Application** : backend (`http://localhost:3000`) et frontend
  (`http://localhost:5173`) démarrés avec `npm run dev`.
- **Rôle** : étudiant **Lucas Dupont**, connecté via la page « Connexion de démonstration »
  (bouton « Lucas Dupont »).
- **Page** : « Offres » (`/offres`), période « Toutes les périodes », champ
  « Rechercher par titre » vide.
- **Offres du seed utiles** :

| Titre | Statut | Visible par l'étudiant |
|---|---|---|
| Application React de gestion de flotte | PUBLISHED | Oui |
| API REST de facturation | PUBLISHED | Oui |
| Tableau de bord de qualité des données | PUBLISHED | Oui |
| Assistant conversationnel interne | PUBLISHED | Oui |
| Migration d'une application vers le cloud | ASSIGNED | **Non** |

Avant la recherche, l'étudiant voit donc **4 offres** (« 4 offres »).

## Scénarios

| Numéro | Scénario | Actions dans l'interface | Résultat attendu |
|---|---|---|---|
| 1 | Recherche avec résultat (cas nominal, casse et visibilité) | Saisir `application` (en minuscules) dans « Rechercher par titre » | Le compteur affiche « 1 offre ». Le tableau contient une seule ligne : « Application React de gestion de flotte ». « Migration d'une application vers le cloud » n'est **pas** affichée, bien que son titre contienne le mot, car elle n'est pas publiée. Les 3 autres offres publiées ne sont plus affichées. |
| 2 | Recherche sans résultat (cas limite) | Saisir `blockchain` dans « Rechercher par titre » | Le message « Aucune offre ne correspond à votre recherche. » est affiché. Aucun tableau d'offres ni compteur « N offre(s) » n'est affiché. |

## Justification du choix

- Le **scénario 1** vérifie en une seule saisie trois règles : la correspondance partielle
  dans le titre, l'insensibilité à la casse (`application` trouve « Application… ») et la
  visibilité étudiant (une offre non publiée contenant le mot reste masquée).
- Le **scénario 2** vérifie le cas sans correspondance : la liste vide et le message propre
  à la recherche. Il est différent du message générique « Aucune offre à afficher. ».
