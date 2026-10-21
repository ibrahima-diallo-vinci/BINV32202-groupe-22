import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OffersPage from "../src/pages/OffersPage.tsx";
import { adminUser, contactUser, stubFetch, studentUser } from "./helpers/fetchMock.ts";

const offers = [
  {
    id: 2,
    title: "Refonte du portail client",
    companyShortName: "Lumen Digital",
    academicYear: "2026-2027",
    period: "P2",
    status: "SUBMITTED",
  },
  {
    id: 5,
    title: "Tableau de bord de qualité des données",
    companyShortName: "Lumen Data",
    academicYear: "2026-2027",
    period: "OTHER",
    status: "ASSIGNED",
  },
];

describe("OffersPage", () => {
  it("affiche les offres avec leurs libellés français", async () => {
    stubFetch({ "/api/offers": () => Response.json(offers) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Refonte du portail client")).toBeInTheDocument();
    expect(screen.getByText("Soumise")).toBeInTheDocument();
    expect(screen.getByText("Attribuée")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Autre" })).toBeInTheDocument();
    expect(screen.getByText("2 offres")).toBeInTheDocument();
    expect(screen.getByText("Les offres que vous avez déposées.")).toBeInTheDocument();
  });

  it("affiche les résultats P1, P2, OTHER et toutes les périodes", async () => {
    const p1Offers = [{ ...offers[0], id: 10, title: "Offre P1", period: "P1" }];
    const p2Offers = [{ ...offers[0], id: 11, title: "Offre P2", period: "P2" }];
    const fetchMock = stubFetch({
      "/api/offers?period=P1": () => Response.json(p1Offers),
      "/api/offers?period=P2": () => Response.json(p2Offers),
      "/api/offers?period=OTHER": () => Response.json([]),
      "/api/offers": () => Response.json(offers),
    });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("2 offres")).toBeInTheDocument();
    const periodSelect = screen.getByLabelText("Période");
    expect(screen.getByRole("option", { name: "Toutes les périodes" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "P1" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "P2" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Autre" })).toBeInTheDocument();
    expect(
      new URL(String(fetchMock.mock.calls.at(0)?.[0]), "http://localhost").searchParams.has("period"),
    ).toBe(false);

    fireEvent.change(periodSelect, { target: { value: "P1" } });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(
      new URL(String(fetchMock.mock.calls.at(1)?.[0]), "http://localhost").searchParams.get("period"),
    ).toBe("P1");
    expect(await screen.findByText("Offre P1")).toBeInTheDocument();
    expect(screen.queryByText("Refonte du portail client")).not.toBeInTheDocument();

    fireEvent.change(periodSelect, { target: { value: "P2" } });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(
      new URL(String(fetchMock.mock.calls.at(2)?.[0]), "http://localhost").searchParams.get("period"),
    ).toBe("P2");
    expect(await screen.findByText("Offre P2")).toBeInTheDocument();
    expect(screen.queryByText("Offre P1")).not.toBeInTheDocument();

    fireEvent.change(periodSelect, { target: { value: "OTHER" } });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    expect(
      new URL(String(fetchMock.mock.calls.at(3)?.[0]), "http://localhost").searchParams.get("period"),
    ).toBe("OTHER");
    expect(await screen.findByText("Aucune offre à afficher.")).toBeInTheDocument();
    expect(screen.queryByText("Offre P2")).not.toBeInTheDocument();

    fireEvent.change(periodSelect, { target: { value: "" } });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(5));
    expect(
      new URL(String(fetchMock.mock.calls.at(4)?.[0]), "http://localhost").searchParams.has("period"),
    ).toBe(false);
    expect(await screen.findByText("2 offres")).toBeInTheDocument();
    expect(screen.getByText("Refonte du portail client")).toBeInTheDocument();
    expect(screen.getByText("Tableau de bord de qualité des données")).toBeInTheDocument();
  });

  it("adapte la description au profil", async () => {
    stubFetch({ "/api/offers": () => Response.json([]) });

    const { unmount } = render(
      <OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />,
    );
    expect(screen.getByText("Les offres publiées.")).toBeInTheDocument();
    expect(await screen.findByText("Aucune offre à afficher.")).toBeInTheDocument();
    unmount();

    render(<OffersPage user={adminUser} token="jeton" onUnauthorized={vi.fn()} />);
    expect(screen.getByText("Toutes les offres, tous statuts confondus.")).toBeInTheDocument();
  });

  it("affiche un refus d'accès renvoyé par le backend", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 403 }) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("statut 403");
  });

  it("signale une session expirée", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });
});
