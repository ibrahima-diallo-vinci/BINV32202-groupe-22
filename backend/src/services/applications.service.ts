import { toApplication } from "../mappers/application.mapper.ts";
import type { Application } from "../models/application.ts";
import type { User } from "../models/user.ts";
import type { ApplicationsRepository } from "../repositories/applications.repository.ts";
import { HttpError } from "../utils/httpError.ts";
import { isStudent } from "./permissions.ts";

export const createApplicationsService = (repository: ApplicationsRepository) => ({
  listApplications: (student: User): Application[] => {
    if (!isStudent(student)) {
      throw new HttpError(403, "FORBIDDEN", "Seul un étudiant peut consulter ses candidatures");
    }
    return repository.listForStudent(student.id).map(toApplication);
  },

  apply: (student: User, offerId: number, message: string | null): Application => {
    if (!isStudent(student)) {
      throw new HttpError(403, "FORBIDDEN", "Seul un étudiant peut candidater");
    }

    const application = repository.createForStudent({
      offerId,
      studentId: student.id,
      message,
    });
    if (application !== undefined) return toApplication(application);

    const offerStatus = repository.findOfferStatus(offerId);
    if (offerStatus === undefined) {
      throw new HttpError(404, "NOT_FOUND", "Offre introuvable");
    }
    if (offerStatus !== "PUBLISHED") {
      throw new HttpError(409, "OFFER_NOT_PUBLISHED", "Seule une offre publiée peut recevoir une candidature");
    }
    if (repository.hasNonWithdrawnForOffer(offerId, student.id)) {
      throw new HttpError(409, "APPLICATION_EXISTS", "Vous avez déjà une candidature pour cette offre");
    }

    throw new Error("La candidature n'a pas pu être créée malgré des données valides");
  },

  withdraw: (student: User, applicationId: number): void => {
    if (!isStudent(student)) {
      throw new HttpError(403, "FORBIDDEN", "Seul un étudiant peut retirer une candidature");
    }

    const application = repository.findForStudentById(applicationId, student.id);
    if (application === undefined) {
      throw new HttpError(404, "NOT_FOUND", "Candidature introuvable");
    }
    if (application.status !== "IN_PROGRESS") {
      throw new HttpError(
        409,
        "APPLICATION_NOT_WITHDRAWABLE",
        "Seule une candidature en cours peut être retirée",
      );
    }
    if (!repository.withdrawInProgress(applicationId, student.id)) {
      const current = repository.findForStudentById(applicationId, student.id);
      if (current === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Candidature introuvable");
      }
      if (current.status !== "IN_PROGRESS") {
        throw new HttpError(
          409,
          "APPLICATION_NOT_WITHDRAWABLE",
          "Seule une candidature en cours peut être retirée",
        );
      }
      throw new Error("La candidature en cours n'a pas pu être retirée");
    }
  },
});

export type ApplicationsService = ReturnType<typeof createApplicationsService>;
