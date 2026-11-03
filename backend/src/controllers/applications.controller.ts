import { Router } from "express";
import { toApplicationDto } from "../mappers/application.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import { authorize } from "../middlewares/authorize.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import { isStudent } from "../services/permissions.ts";
import { HttpError } from "../utils/httpError.ts";

interface CreateApplicationBody {
  offerId: number;
  message: string | null;
}

const parseCreateApplicationBody = (value: unknown): CreateApplicationBody => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new HttpError(400, "INVALID_BODY", "Le corps doit contenir un offerId positif");
  }
  const body = value as Record<string, unknown>;
  if (typeof body.offerId !== "number" || !Number.isInteger(body.offerId) || body.offerId <= 0) {
    throw new HttpError(400, "INVALID_BODY", "offerId doit être un entier positif");
  }
  if (body.message !== undefined && typeof body.message !== "string") {
    throw new HttpError(400, "INVALID_BODY", "message doit être une chaîne de caractères");
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  return { offerId: body.offerId, message: message === "" ? null : message };
};

const parsePositiveId = (value: unknown, name: string): number => {
  if (typeof value !== "string") {
    throw new HttpError(400, "INVALID_QUERY", `${name} doit être un entier positif`);
  }
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "INVALID_QUERY", `${name} doit être un entier positif`);
  }
  return id;
};

export const createApplicationsRouter = (applicationsService: ApplicationsService) => {
  const router = Router();

  router.get("/", authorize(isStudent), (req, res) => {
    res.json(
      applicationsService
        .listApplications(getCurrentUser(req))
        .map(toApplicationDto),
    );
  });

  router.post("/", authorize(isStudent), (req, res) => {
    const { offerId, message } = parseCreateApplicationBody(req.body);
    const application = applicationsService.apply(getCurrentUser(req), offerId, message);
    res.status(201).json(toApplicationDto(application));
  });

  router.delete("/:applicationId", authorize(isStudent), (req, res) => {
    const applicationId = parsePositiveId(req.params.applicationId, "applicationId");
    applicationsService.withdraw(getCurrentUser(req), applicationId);
    res.status(204).end();
  });

  return router;
};
