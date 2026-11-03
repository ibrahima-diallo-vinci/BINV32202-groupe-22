import type { Db } from "../db/database.ts";
import type { ApplicationDbo, ApplicationStatus } from "../models/application.ts";
import type { OfferStatus } from "../models/offer.ts";

interface CreateApplicationParams {
  offerId: number;
  studentId: number;
  message: string | null;
}

const APPLICATION_SELECT = `
  SELECT a.id, a.offer_id, o.title AS offer_title,
         c.short_name AS company_short_name, ay.label AS academic_year_label,
         p.code AS period_code, a.message, a.status, a.applied_at
  FROM applications a
  JOIN offers o ON o.id = a.offer_id
  JOIN companies c ON c.id = o.company_id
  JOIN academic_years ay ON ay.id = o.academic_year_id
  JOIN periods p ON p.id = o.period_id
`;

export const createApplicationsRepository = (db: Db) => {
  const findForStudent = db.prepare<{ studentId: number }, ApplicationDbo>(`
    ${APPLICATION_SELECT}
    WHERE a.student_id = @studentId
    ORDER BY a.applied_at DESC, a.id DESC
  `);
  const findForStudentById = db.prepare<
    { applicationId: number; studentId: number },
    ApplicationDbo
  >(`
    ${APPLICATION_SELECT}
    WHERE a.id = @applicationId AND a.student_id = @studentId
  `);
  const findOfferStatus = db.prepare<{ offerId: number }, { status: OfferStatus }>(
    "SELECT status FROM offers WHERE id = @offerId",
  );
  const findNonWithdrawnForOffer = db.prepare<
    { offerId: number; studentId: number },
    { status: ApplicationStatus }
  >(`
    SELECT status
    FROM applications
    WHERE offer_id = @offerId AND student_id = @studentId AND status <> 'WITHDRAWN'
  `);
  const insertIfEligible = db.prepare<CreateApplicationParams>(`
    INSERT INTO applications (offer_id, student_id, message, status)
    SELECT @offerId, @studentId, @message, 'IN_PROGRESS'
    WHERE EXISTS (
      SELECT 1 FROM offers WHERE id = @offerId AND status = 'PUBLISHED'
    )
      AND NOT EXISTS (
        SELECT 1 FROM applications
        WHERE offer_id = @offerId AND student_id = @studentId AND status <> 'WITHDRAWN'
      )
  `);
  const findInserted = db.prepare<{ id: number }, ApplicationDbo>(`
    ${APPLICATION_SELECT}
    WHERE a.id = @id
  `);
  const withdrawInProgress = db.prepare<{ applicationId: number; studentId: number }>(`
    UPDATE applications
    SET status = 'WITHDRAWN'
    WHERE id = @applicationId AND student_id = @studentId AND status = 'IN_PROGRESS'
  `);

  return {
    listForStudent: (studentId: number): ApplicationDbo[] =>
      findForStudent.all({ studentId }),

    findForStudentById: (applicationId: number, studentId: number): ApplicationDbo | undefined =>
      findForStudentById.get({ applicationId, studentId }),

    findOfferStatus: (offerId: number): OfferStatus | undefined =>
      findOfferStatus.get({ offerId })?.status,

    hasNonWithdrawnForOffer: (offerId: number, studentId: number): boolean =>
      findNonWithdrawnForOffer.get({ offerId, studentId }) !== undefined,

    createForStudent: (params: CreateApplicationParams): ApplicationDbo | undefined => {
      const result = insertIfEligible.run(params);
      if (result.changes === 0) return undefined;

      const application = findInserted.get({ id: Number(result.lastInsertRowid) });
      if (application === undefined) {
        throw new Error("La candidature créée est introuvable");
      }
      return application;
    },

    withdrawInProgress: (applicationId: number, studentId: number): boolean =>
      withdrawInProgress.run({ applicationId, studentId }).changes === 1,
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
