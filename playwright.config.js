import { defineConfig, devices } from "@playwright/test";

// Os testes de ponta a ponta rodam contra o servidor estático do projeto,
// nos três motores de navegador.
export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://localhost:5173",
  },
  webServer: {
    command: "node scripts/servir.mjs 5173",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
