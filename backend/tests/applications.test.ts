import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { APPLICATION, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import type { Db } from "../src/db/database.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";
import { createTestDatabase } from "./helpers/testDatabase.ts";

let db: Db;
let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  db = createTestDatabase();
  app = createTestApp(db);
});

const getApplicationsAs = (studentId: number = STUDENT.LUCAS_DUPONT) =>
  request(app)
    .get("/applications")
    .set("Authorization", tokenFor("STUDENT", studentId));

const postApplicationAs = (studentId: number = STUDENT.LUCAS_DUPONT) =>
  request(app)
    .post("/applications")
    .set("Authorization", tokenFor("STUDENT", studentId));

const deleteApplicationAs = (applicationId: number, studentId: number = STUDENT.LUCAS_DUPONT) =>
  request(app)
    .delete(`/applications/${applicationId}`)
    .set("Authorization", tokenFor("STUDENT", studentId));

describe("GET /applications", () => {
  it("exige une session", async () => {
    const response = await request(app).get("/applications");

    expect(response.status).toBe(401);
  });

  it.each([
    ["administrateur", "ADMIN", 1],
    ["contact", "CONTACT", 2],
  ] as const)("réserve la route à l'étudiant (profil %s)", async (_profile, kind, id) => {
    const response = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor(kind, id));

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("retourne uniquement les candidatures de l'étudiant avec les informations de l'offre", async () => {
    const response = await getApplicationsAs();

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: APPLICATION.LUCAS_FLEET_APP,
        offer: {
          id: OFFER.FLEET_APP,
          title: "Application React de gestion de flotte",
          companyShortName: "Lumen Digital",
          academicYear: "2026-2027",
          period: "P2",
        },
        message: "Le développement React m'intéresse particulièrement.",
        status: "IN_PROGRESS",
        appliedAt: "2026-10-02 18:10:00",
      },
    ]);
  });

  it("conserve et retourne les candidatures retirées dans l'historique", async () => {
    const response = await getApplicationsAs(STUDENT.INES_HADDAD);

    expect(response.status).toBe(200);
    expect(response.body).toContainEqual(
      expect.objectContaining({
        id: APPLICATION.INES_BILLING_API,
        status: "WITHDRAWN",
      }),
    );
    expect(response.body).toHaveLength(2);
  });
});

describe("POST /applications", () => {
  it("réserve la route à l'étudiant et exige une session", async () => {
    const unauthenticated = await request(app)
      .post("/applications")
      .send({ offerId: OFFER.INTERNAL_CHATBOT });
    expect(unauthenticated.status).toBe(401);

    for (const [kind, id] of [
      ["ADMIN", 1],
      ["CONTACT", 2],
    ] as const) {
      const response = await request(app)
        .post("/applications")
        .set("Authorization", tokenFor(kind, id))
        .send({ offerId: OFFER.INTERNAL_CHATBOT });
      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
    }
  });

  it("crée une candidature avec un message facultatif", async () => {
    const response = await postApplicationAs().send({
      offerId: OFFER.INTERNAL_CHATBOT,
      message: "  Ce sujet m'intéresse.  ",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      offer: { id: OFFER.INTERNAL_CHATBOT },
      message: "Ce sujet m'intéresse.",
      status: "IN_PROGRESS",
    });
    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.appliedAt).toEqual(expect.any(String));
  });

  it("accepte une candidature sans message et normalise un message vide", async () => {
    const response = await postApplicationAs().send({
      offerId: OFFER.INTERNAL_CHATBOT,
      message: " ",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBeNull();
  });

  it("refuse une candidature en double non retirée", async () => {
    const response = await postApplicationAs().send({
      offerId: OFFER.FLEET_APP,
    });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_EXISTS");
  });

  it("permet de candidater à nouveau après retrait", async () => {
    const createResponse = await postApplicationAs(STUDENT.INES_HADDAD)
      .send({ offerId: OFFER.BILLING_API });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.status).toBe("IN_PROGRESS");
    expect(createResponse.body.id).not.toBe(APPLICATION.INES_BILLING_API);

    const withdrawResponse = await deleteApplicationAs(
      createResponse.body.id,
      STUDENT.INES_HADDAD,
    );
    expect(withdrawResponse.status).toBe(204);

    const reapplyResponse = await postApplicationAs(STUDENT.INES_HADDAD)
      .send({ offerId: OFFER.BILLING_API });
    expect(reapplyResponse.status).toBe(201);
    expect(reapplyResponse.body.status).toBe("IN_PROGRESS");
  });

  it("refuse une nouvelle candidature si l'ancienne a été traitée, même après retrait impossible", async () => {
    db.prepare("UPDATE applications SET status = 'REJECTED' WHERE id = ?").run(
      APPLICATION.LUCAS_FLEET_APP,
    );

    const response = await postApplicationAs().send({
      offerId: OFFER.FLEET_APP,
    });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_EXISTS");
  });

  it("refuse les offres qui ne sont pas publiées", async () => {
    for (const offerId of [OFFER.E2E_TESTS, OFFER.CLOUD_MIGRATION, OFFER.PDF_REPORTS]) {
      const response = await postApplicationAs().send({ offerId });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe("OFFER_NOT_PUBLISHED");
    }
  });

  it("renvoie 404 pour une offre inexistante", async () => {
    const response = await postApplicationAs().send({ offerId: 9999 });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("valide le corps de la requête", async () => {
    const invalidBodies: object[] = [
      [],
      {},
      { offerId: 0 },
      { offerId: "1" },
      { offerId: 1.5 },
      { offerId: 1, message: 123 },
    ];
    for (const body of invalidBodies) {
      const response = await postApplicationAs().send(body);
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("INVALID_BODY");
    }

    const response = await postApplicationAs().send("null");
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_BODY");
  });
});

describe("DELETE /applications/:applicationId", () => {
  it("réserve le retrait à l'étudiant et exige une session", async () => {
    const unauthenticated = await request(app).delete(
      `/applications/${APPLICATION.LUCAS_FLEET_APP}`,
    );
    expect(unauthenticated.status).toBe(401);

    for (const [kind, id] of [
      ["ADMIN", 1],
      ["CONTACT", 2],
    ] as const) {
      const response = await request(app)
        .delete(`/applications/${APPLICATION.LUCAS_FLEET_APP}`)
        .set("Authorization", tokenFor(kind, id));
      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
    }
  });

  it("retire une candidature en cours appartenant à l'étudiant", async () => {
    const response = await deleteApplicationAs(APPLICATION.LUCAS_FLEET_APP);

    expect(response.status).toBe(204);
    const listed = await getApplicationsAs();
    expect(listed.body[0].status).toBe("WITHDRAWN");
  });

  it("refuse de retirer une candidature déjà traitée", async () => {
    const response = await deleteApplicationAs(
      APPLICATION.MATEUSZ_CLOUD_MIGRATION,
      STUDENT.MATEUSZ_KOWALSKI,
    );

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_NOT_WITHDRAWABLE");
  });

  it("ne révèle pas la candidature d'un autre étudiant", async () => {
    const response = await deleteApplicationAs(
      APPLICATION.LUCAS_FLEET_APP,
      STUDENT.INES_HADDAD,
    );

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("valide l'identifiant de la candidature", async () => {
    const response = await deleteApplicationAs(0);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_QUERY");
  });
});
