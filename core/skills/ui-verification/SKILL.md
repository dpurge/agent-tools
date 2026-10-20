---
name: ui-verification
description: Verify a changed web UI in a real browser with Playwright before asking a human to look — screenshots at the supported widths, measured overflow, right-to-left and CJK content, empty and long data, console errors. Use after any change that affects what a page looks like or how it lays out, and whenever a component test passes but the layout is unproven.
version: 1.0.0
---

# UI Verification

## Purpose

Component and unit tests prove behaviour, not layout. Squeezed columns, text
that overflows, over-prominent headings and broken right-to-left lists are
visible in seconds in a real browser and invisible to a green test run. Look
at the page yourself, at the sizes the project supports, before you ask a
person to look. This skill uses the Playwright library from a small script, so
it needs no editor integration and works the same on every host.

## Before you start

- Find the page's real URL and the target it runs on (a dev environment the
  project documents, or a local server you start). Follow the `operations`
  rule: never point the browser at production by default.
- Use the project's own Playwright if it has one (`package.json`, a config
  file). Otherwise install it **outside the project** so you do not change its
  dependencies: in a scratch directory (`.agent/tmp/`, git-ignored, or the
  host's scratch directory), run `npm init -y && npm install playwright`.
  Adding Playwright to the project itself needs the user's go-ahead.
- Browsers are a separate download: `npx playwright install chromium`
  (a few hundred MB, cached per user). If it fails behind a proxy or custom
  certificates, say so and stop; do not run tests against a half-installed
  browser.
- Data: pick a page state with realistic content. Create test data through the
  project's own means and delete it afterwards (see `safe-operations`).

## What to capture

Write one short script, run it once, and read the results. Keep the script
and its output in the scratch directory; never commit them.

```js
import { chromium } from "playwright";

const url = process.argv[2];
const widths = [1280, 1024]; // use the widths the project supports

const browser = await chromium.launch({ headless: true });
for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 800 }, locale: "en-US" });
  const page = await context.newPage();
  const problems = [];
  page.on("console", message => message.type() === "error" && problems.push(message.text()));
  page.on("pageerror", error => problems.push(String(error)));

  await page.goto(url, { waitUntil: "networkidle" });
  await page.screenshot({ path: `ui-${width}.png` });

  const overflow = await page.evaluate(() => ({
    pageOverflowsX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    clipped: [...document.querySelectorAll("*")]
      .filter(element => element !== document.documentElement && element !== document.body)
      .filter(element => element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).overflowX === "visible")
      .slice(0, 10)
      .map(element => element.tagName + "." + element.className),
  }));
  console.log(width, JSON.stringify({ overflow, problems }));
  await context.close();
}
await browser.close();
```

Then open each screenshot with the file-reading tool and look at it. The
overflow numbers do not replace looking.

## What to check

- **Widths:** every width the project supports (state which, and why those),
  plus one narrow width if the page claims to be responsive. No horizontal page
  scroll, no clipped or overlapping text, columns not squeezed to a sliver.
- **Hierarchy:** the main content reads first; headings and badges are not
  louder than the data. Compare against a neighbouring page of the same app.
- **Content that breaks layouts:** right-to-left text, CJK (no spaces to wrap
  on), very long words and URLs, very long and very short lists, an empty
  state, and a loading or error state.
- **Behaviour you changed:** drive it (`page.getByRole(...).click()`, fill a
  form) and screenshot after. Prefer role and label locators over CSS paths.
- **Console:** no new errors or failed requests in `problems`.
- **Theme or locale:** if the project supports dark mode or other locales,
  pass `colorScheme` or `locale` to `newContext` and repeat once.

## Report

State the URL and target, the widths checked, what you saw (quote what is
wrong, not "looks fine"), the overflow and console results, what you did not
check (a width, a state, a browser), and what you changed because of it.
Fix what you found and re-run before asking the user to look.
