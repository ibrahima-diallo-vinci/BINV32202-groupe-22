-- Un étudiant ne conserve qu'une candidature non retirée par offre.
-- Les candidatures retirées restent en historique et peuvent être recréées.
CREATE UNIQUE INDEX applications_student_offer_not_withdrawn
  ON applications (student_id, offer_id)
  WHERE status <> 'WITHDRAWN';
