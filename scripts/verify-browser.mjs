import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Uses an installed Playwright or the existing Codex browser runtime, without
// adding browser tooling to the website's runtime dependencies.
const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE_PATH || "playwright",
);
const base = process.env.PREVIEW_URL || "http://127.0.0.1:3000";
const output = path.resolve("review");
await mkdir(path.join(output, "screenshots"), { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
const writes = [];
const results = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("request", (request) => {
  if (!["GET", "HEAD"].includes(request.method()))
    writes.push(`${request.method()} ${request.url()}`);
});

async function visit(route) {
  const response = await page.goto(`${base}${route}`, {
    waitUntil: "networkidle",
  });
  assert.equal(response.status(), 200);
  await page.evaluate(() => document.fonts.ready);
}
async function fit(label) {
  const metrics = await page.evaluate(() => ({
    width: innerWidth,
    content: document.documentElement.scrollWidth,
  }));
  assert.ok(
    metrics.content <= metrics.width,
    `${label}: horizontal overflow ${JSON.stringify(metrics)}`,
  );
  results.push({ check: label, ...metrics, passed: true });
}
async function placeholder(button, title, screenshot) {
  await button.click();
  const dialog = page.locator(".preview-dialog");
  await dialog.waitFor({ state: "visible" });
  assert.equal(await dialog.getByRole("heading").textContent(), title);
  assert.equal(await dialog.locator("form").count(), 0);
  assert.equal(
    await dialog
      .locator(
        "input:enabled, select:enabled, textarea:enabled, button[type=submit]",
      )
      .count(),
    0,
  );
  assert.ok(await dialog.locator("fieldset:disabled").count());
  if (screenshot)
    await page.screenshot({
      path: path.join(output, "screenshots", screenshot),
    });
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    assert.ok(
      await page.evaluate(() => !!document.activeElement.closest("dialog")),
      "Dialog focus should stay contained",
    );
  }
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached" });
  await page.waitForFunction(
    (node) => document.activeElement === node,
    await button.elementHandle(),
  );
  results.push({
    check: `${title}: inactive fields, focus containment, Escape and restoration`,
    passed: true,
  });
}
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 960 });
    for (const route of ["/", "/community", "/assets"]) {
      await visit(route);
      await page.locator("h1").waitFor();
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(
        await page.locator(`nav a[href="${route}"][aria-current=page]`).count(),
        1,
      );
      await fit(`${route} at ${width}px`);
      await page.locator("footer").scrollIntoViewIfNeeded();
      await page.waitForLoadState("networkidle");
      await page.evaluate(async () => {
        await Promise.all(
          Array.from(document.images).map((img) =>
            img.decode().catch(() => {}),
          ),
        );
      });
      const broken = await page.evaluate(() =>
        Array.from(document.images)
          .filter((img) => !img.complete || !img.naturalWidth)
          .map((img) => img.src),
      );
      assert.deepEqual(broken, []);
      await page.evaluate(() => scrollTo(0, 0));
      if ([1440, 768, 390, 320].includes(width))
        await page.screenshot({
          path: path.join(
            output,
            "screenshots",
            `${route === "/" ? "home" : route.slice(1)}-${width}.png`,
          ),
          fullPage: true,
        });
    }
    if (width <= 768) {
      await page.getByRole("button", { name: "Menu", exact: false }).click();
      assert.equal(
        await page.locator(".menu-toggle").getAttribute("aria-expanded"),
        "true",
      );
      await page
        .locator("nav")
        .getByRole("link", { name: "Community", exact: true })
        .click();
      await page.waitForURL("**/community");
      assert.equal(
        await page.locator(".menu-toggle").getAttribute("aria-expanded"),
        "false",
      );
      results.push({ check: `Mobile navigation at ${width}px`, passed: true });
    }
  }
  await page.setViewportSize({ width: 1440, height: 960 });
  await visit("/");
  await placeholder(
    page.locator(".header-action"),
    "Request engine access",
    "access-placeholder-1440.png",
  );
  await page.locator(".header-action").click();
  await page
    .getByRole("button", { name: "View publishing placeholder" })
    .click();
  assert.equal(
    await page.getByRole("dialog").getByRole("heading").textContent(),
    "Submit a game",
  );
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    (node) => document.activeElement === node,
    await page.locator(".header-action").elementHandle(),
  );
  await placeholder(
    page.locator(".hero-copy").getByRole("button", { name: "Submit a game" }),
    "Submit a game",
  );
  await placeholder(
    page.locator("#bootcamp").getByRole("button"),
    "Register Bootcamp interest",
  );
  await placeholder(
    page
      .locator("#partners")
      .getByRole("button", { name: "Discuss investment or funding" }),
    "Investment or game funding enquiry",
  );
  await placeholder(
    page
      .locator("#partners")
      .getByRole("button", { name: "Discuss technology licensing" }),
    "Technology licensing enquiry",
  );
  for (const name of ["Documentation", "News & updates", "Privacy & terms"]) {
    await page
      .locator("footer")
      .getByRole("button", { name, exact: true })
      .click();
    assert.ok(await page.getByRole("dialog").isVisible());
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Done", exact: true })
      .click();
  }
  await visit("/community?topic=access");
  assert.match(
    await page.locator("#discussion-title").textContent(),
    /requesting engine access/,
  );
  await page
    .getByRole("button", { name: "Close discussion", exact: true })
    .click();
  await page.getByLabel("Search questions").fill("MULTIPLAYER");
  assert.equal(await page.locator(".discussion-card").count(), 3);
  await page.getByLabel("Topic", { exact: true }).selectOption("Assets");
  assert.equal(await page.locator(".discussion-card").count(), 0);
  assert.equal(
    await page.locator("#discussion-panel").getByRole("button").count(),
    0,
  );
  await page.getByRole("button", { name: "Clear filters" }).click();
  assert.equal(await page.locator(".discussion-card").count(), 8);
  await page.locator(".discussion-card").nth(1).click();
  assert.match(
    await page.locator("#discussion-title").textContent(),
    /voxel asset/,
  );
  assert.ok(
    await page
      .locator("#discussion-title")
      .evaluate((node) => document.activeElement === node),
  );
  await placeholder(
    page.getByRole("button", { name: "Reply", exact: true }),
    "Reply on website",
  );
  await page
    .getByRole("button", { name: "Close discussion", exact: true })
    .click();
  await placeholder(
    page
      .locator(".market-intro")
      .getByRole("button", { name: "Ask a question" }),
    "Ask a question",
  );
  await page
    .getByLabel("Search questions")
    .fill('<img src=x onerror="alert(1)">');
  assert.equal(await page.locator(".discussion-card").count(), 0);
  await page.screenshot({
    path: path.join(output, "screenshots", "community-empty-1440.png"),
    fullPage: true,
  });
  results.push({
    check:
      "Forum deep link, search, combined filter, empty state and inline selection",
    passed: true,
  });
  await visit("/assets?asset=robot");
  assert.equal(
    await page.locator("#asset-title").textContent(),
    "Utility robot",
  );
  await page.getByRole("button", { name: "Get asset — preview" }).click();
  assert.match(
    await page.getByRole("dialog").textContent(),
    /not a downloadable product/,
  );
  await page.keyboard.press("Escape");
  await visit("/assets");
  await page.getByLabel("Search assets").fill("CABIN");
  assert.equal(await page.locator(".market-card").count(), 2);
  await page
    .getByLabel("Category", { exact: true })
    .selectOption("Environments");
  assert.equal(await page.locator(".market-card").count(), 0);
  await page.getByRole("button", { name: "Clear filters" }).click();
  assert.equal(await page.locator(".market-card").count(), 10);
  await page.getByLabel("Sort by").selectOption("name");
  const names = await page.locator(".market-card h3").allTextContents();
  assert.deepEqual(
    names,
    [...names].sort((a, b) => a.localeCompare(b)),
  );
  await page.getByRole("button", { name: "Reset catalogue" }).click();
  await placeholder(
    page
      .locator(".market-intro")
      .getByRole("button", { name: "Share or sell your work" }),
    "Share or sell your work",
  );
  await page
    .getByRole("link", { name: "View Timber cabin kit", exact: true })
    .click();
  await page.waitForURL("**/assets/cabin");
  assert.equal(
    await page.locator("#asset-title").textContent(),
    "Timber cabin kit",
  );
  assert.equal(
    await page
      .locator('nav[aria-label="Main navigation"] a[href="/assets"]')
      .getAttribute("aria-current"),
    "page",
  );
  await page.getByRole("button", { name: "Next preview", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Show related world concept", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page
    .getByRole("button", { name: "Show asset concept", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Expand image preview", exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ state: "visible" });
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page
    .getByRole("tab", { name: "Technical details", exact: true })
    .click();
  assert.equal(
    await page
      .getByRole("tabpanel", { name: "Technical details", exact: true })
      .isVisible(),
    true,
  );
  await page
    .getByRole("tab", { name: "Technical details", exact: true })
    .press("ArrowRight");
  assert.equal(
    await page
      .getByRole("tab", { name: "Reviews", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  await page.getByRole("tab", { name: "Overview", exact: true }).click();
  await page.screenshot({
    path: path.join(output, "screenshots", "asset-detail-1440.png"),
    fullPage: true,
  });
  results.push({
    check:
      "Catalogue search/category/sort/empty/reset states; detail navigation, gallery, expansion, information tabs, legacy deep link and acquisition placeholder",
    passed: true,
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await visit("/");
    await placeholder(
      page
        .locator(".hero-copy")
        .getByRole("button", { name: "Request engine access" }),
      "Request engine access",
      `access-placeholder-${width}.png`,
    );
    await visit("/assets");
    await page
      .getByRole("link", { name: "View Utility robot", exact: true })
      .click();
    await page.waitForURL("**/assets/robot");
    await fit(`Asset detail at ${width}px`);
    await visit("/community");
    await page.locator(".discussion-card").first().click();
    await page.getByRole("button", { name: "Reply", exact: true }).click();
    await fit(`Reply placeholder at ${width}px`);
    await page.keyboard.press("Escape");
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
    "auto",
  );
  assert.deepEqual(errors, [], "Browser console and runtime errors");
  assert.deepEqual(
    writes,
    [],
    "The frontend draft must not send POST or other write requests",
  );
  await writeFile(
    path.join(output, "browser-results.json"),
    JSON.stringify(
      { base, browser: await browser.version(), results, errors, writes },
      null,
      2,
    ),
  );
  console.log(
    `PASS: ${results.length} browser checks; zero errors or write requests. Screenshots: ${output}/screenshots`,
  );
} finally {
  await browser.close();
}
