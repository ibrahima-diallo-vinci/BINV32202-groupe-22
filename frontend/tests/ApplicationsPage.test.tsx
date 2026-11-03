import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ApplicationsPage from "../src/pages/ApplicationsPage.tsx";
import { stubFetch } from "./helpers/fetchMock.ts";

const applications = [
  {
    id: 1,
    offer: {
      id: 3,
      title: "API REST de facturation",
      companyShortName: "Orbis",
      academicYear: "2026-2027",
      period: "P2",
    },
    message: "Je souhaite approfondir la conception d'API.",
    status: "IN_PROGRESS",
    appliedAt: "2026-10-04 14:50:00",
  },
  {
    id: 2,
    offer: {
      id: 6,
      title: "Migration cloud",
      companyShortName: "Datavia",
      academicYear: "2026-2027",
      period: "P2",
    },
    message: null,
    status: "SELECTED",
    appliedAt: "2026-09-22 12:00:00",
  },
  {
    id: 3,
    offer: {
      id: 4,
      title: "Tests end-to-end",
      companyShortName: "Orbis",
      academicYear: "2026-2027",
      period: "OTHER",
    },
    message: null,
    status: "REJECTED",
    appliedAt: "2026-09-23 17:25:00",
  },
  {
    id: 4,
    offer: {
      id: 3,
      title: "API REST de facturation",
      companyShortName: "Orbis",
      academicYear: "2026-2027",
      period: "P2",
    },
    message: null,
    status: "WITHDRAWN",
    appliedAt: "2026-09-30 10:30:00",
  },
];

describe("ApplicationsPage", () => {
  it("affiche les candidatures, leurs statuts et le retrait seulement pour celles en cours", async () => {
    stubFetch({ "/api/applications": () => Response.json(applications) });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findAllByText("API REST de facturation")).toHaveLength(2);
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Retenue")).toBeInTheDocument();
    expect(screen.getByText("Non retenue")).toBeInTheDocument();
    expect(screen.getByText("Retirée")).toBeInTheDocument();
    expect(screen.getByText("Je souhaite approfondir la conception d'API.")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Retirer" })).toHaveLength(1);
  });

  it("retire une candidature en cours et actualise son statut sans recharger", async () => {
    const fetchMock = stubFetch({
      "/api/applications": (_input, init) =>
        init?.method === "DELETE"
          ? new Response(null, { status: 204 })
          : Response.json([applications[0]]),
    });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Retirer" }));

    expect(await screen.findByText("Retirée")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retirer" })).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/applications/1",
      expect.objectContaining({ method: "DELETE", headers: { Authorization: "jeton" } }),
    );
  });

  it("affiche l'erreur si le retrait échoue", async () => {
    stubFetch({
      "/api/applications": (_input, init) =>
        init?.method === "DELETE"
          ? new Response(null, { status: 409 })
          : Response.json([applications[0]]),
    });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Retirer" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("statut 409");
  });

  it("déconnecte l'étudiant quand sa session a expiré", async () => {
    stubFetch({ "/api/applications": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();

    render(<ApplicationsPage token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });
});
