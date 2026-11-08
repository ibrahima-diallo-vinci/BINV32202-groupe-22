# Tests manuels end-to-end — EF-32 et EF-33

**Statut : à exécuter.** Ces scénarios sont préparés, mais aucun de ces tests manuels n’a
été réalisé dans le cadre de ce livrable. Laisser « Résultat observé » vide jusqu’à leur
exécution ; noter ensuite le résultat réel et tout écart.

## Préparation

- Démarrer l’application selon les instructions du README et ouvrir l’application dans le
  navigateur.
- Utiliser le mode de connexion de démonstration et des comptes étudiants de test.
- Pour les scénarios de refus, utiliser aussi un compte administrateur et un contact.
- Vérifier les offres et candidatures disponibles avant les essais afin de choisir une offre
  publiée sans candidature existante pour l’étudiant concerné. Ne pas modifier les données
  au cours d’un essai sans le noter.

| ID | Étapes | Résultat attendu | Résultat observé |
|---|---|---|---|
| M-01 — Candidature avec message (EF-32) | Se connecter comme étudiant ; ouvrir **Offres** ; sur une offre publiée, cliquer **Candidater** ; saisir un message ; envoyer. | La demande est acceptée. L’offre indique **En cours** et le message saisi est associé à la candidature. | |
| M-02 — Candidature sans message (EF-32) | Avec un étudiant et une autre offre publiée sans candidature existante, cliquer **Candidater** ; laisser le message facultatif vide ; envoyer. | La candidature est acceptée sans message et l’offre indique **En cours**. | |
| M-03 — Pas de doublon (EF-32) | Pour un étudiant ayant déjà une candidature non retirée, revenir aux offres et vérifier l’offre correspondante ; tenter de soumettre à nouveau si l’interface le permet. | L’interface indique la candidature existante et n’en crée pas une seconde. Si une nouvelle soumission est tentée, l’erreur est présentée sans afficher une réussite. | |
| M-04 — Offre non publiée (EF-32) | En utilisant une URL ou une requête contrôlée, tenter de candidater à une offre soumise, en attente, attribuée ou archivée. | La candidature est refusée par le serveur ; aucune candidature n’est créée. | |
| M-05 — Consulter ses candidatures (EF-33) | Se connecter comme étudiant ; ouvrir **Mes candidatures**. | La page liste uniquement les candidatures de cet étudiant, avec offre, entreprise, année, période, message, date et statut lisible en français. | |
| M-06 — Statuts traités (EF-33) | Ouvrir **Mes candidatures** avec un étudiant ayant des candidatures en cours, retenues, non retenues et retirées. | Les statuts affichés correspondent respectivement à **En cours**, **Retenue**, **Non retenue** et **Retirée**. | |
| M-07 — Retirer une candidature en cours (EF-32) | Dans **Mes candidatures**, cliquer **Retirer** pour une candidature en cours ; confirmer visuellement le statut après l’action. | Le retrait réussit ; le statut devient **Retirée** et l’action de retrait n’est plus disponible pour cette candidature. | |
| M-08 — Retirer une candidature traitée (EF-32) | Ouvrir **Mes candidatures** avec une candidature retenue ou non retenue. | Aucun bouton **Retirer** n’est proposé. Une tentative directe contre l’API est refusée et ne change pas le statut. | |
| M-09 — Données d’un autre étudiant (EF-33) | Se connecter avec un second compte étudiant et consulter **Mes candidatures**. | Seules les candidatures du compte courant sont visibles ; le retrait d’une candidature appartenant au premier étudiant est refusé. | |
| M-10 — Nouvelle candidature après retrait (EF-32) | Après M-07, retourner dans **Offres** et candidater de nouveau à la même offre publiée. | La nouvelle candidature est acceptée et apparaît **En cours** ; l’ancienne candidature reste dans l’historique avec le statut **Retirée**. | |
| M-11 — Accès par rôle | Se connecter comme administrateur puis comme contact ; essayer d’ouvrir **Mes candidatures** ou d’appeler ses routes. | Le lien et la page étudiant ne sont pas disponibles pour ces profils ; le serveur refuse les opérations non autorisées. | |
