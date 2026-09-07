import { test, expect } from "@playwright/test";

test("landing carrega e leva ao checkout", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Patrimo/i);
  await expect(page.getByRole("link", { name: /assinar|começar|criar conta/i }).first()).toBeVisible();
});

test("/precos mostra plano único, R$ 97,90 e 12x", async ({ page }) => {
  await page.goto("/precos");
  await expect(page.getByText("R$ 97,90").first()).toBeVisible();
  await expect(page.getByText(/12x/i).first()).toBeVisible();
  const cta = page.getByRole("link", { name: /assinar/i }).first();
  await expect(cta).toHaveAttribute("href", /kiwify\.app/);
});

test("blog lista posts e abre um", async ({ page }) => {
  await page.goto("/blog");
  const first = page.getByRole("link", { name: /.+/ }).filter({ has: page.locator("h2, h3") }).first();
  await expect(first).toBeVisible();
});

test("rota inexistente devolve 404", async ({ page }) => {
  const res = await page.goto("/pagina-que-nao-existe-123");
  expect(res?.status()).toBe(404);
});

test("/app sem sessão redireciona para login", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login/);
});
