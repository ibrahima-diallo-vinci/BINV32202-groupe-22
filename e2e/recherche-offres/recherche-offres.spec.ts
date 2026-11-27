import { expect, test } from "@playwright/test";

const signInAsLucasAndOpenOffers = async (page: import("@playwright/test").Page) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Lucas Dupont" }).click();
  await page.getByRole("link", { name: "Offres" }).click();
  await expect(page.getByRole("heading", { name: "Offres de stage" })).toBeVisible();
};

test("Scénario 1 : recherche avec résultat et respect de la visibilité étudiant", async ({
  page,
}) => {
  await signInAsLucasAndOpenOffers(page);

  await page.getByRole("searchbox", { name: "Rechercher par titre" }).fill("application");

  await expect(page.getByText("1 offre", { exact: true })).toBeVisible();

  const offersTable = page.getByRole("table");
  await expect(offersTable.getByRole("row")).toHaveCount(2);
  await expect(
    offersTable.getByRole("cell", {
      name: "Application React de gestion de flotte",
      exact: true,
    }),
  ).toBeVisible();

  await expect(
    offersTable.getByRole("cell", {
      name: "Migration d'une application vers le cloud",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    offersTable.getByRole("cell", {
      name: "API REST de facturation",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    offersTable.getByRole("cell", {
      name: "Tableau de bord de qualité des données",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    offersTable.getByRole("cell", {
      name: "Assistant conversationnel interne",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("Scénario 2 : recherche sans résultat affiche le message dédié", async ({ page }) => {
  await signInAsLucasAndOpenOffers(page);

  await page.getByRole("searchbox", { name: "Rechercher par titre" }).fill("blockchain");

  await expect(
    page.getByText("Aucune offre ne correspond à votre recherche.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(page.getByText(/^\d+ offres?$/, { exact: true })).toHaveCount(0);
});
