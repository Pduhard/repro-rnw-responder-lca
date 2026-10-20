import { chromium } from "playwright-core";
import { createServer } from "vite";

// Press on A, then drag. While the pointer moves over A, the parent is asked.
// Once each move lands on B, a sibling of A, the parent is never asked.
// force: re-bundle react-native-web, so `npm run fix` takes effect
const server = await createServer({
  optimizeDeps: { force: true },
  server: { port: 5199, strictPort: true },
  logLevel: "error",
});
await server.listen();
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" },
);
const page = await browser.newPage();

async function drag(name, fromX, toX, steps) {
  await page.goto("http://localhost:5199/");
  const a = await page.getByTestId("A").boundingBox();
  const y = a.y + a.height / 2;
  await page.mouse.move(a.x + fromX, y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i += 1) await page.mouse.move(a.x + fromX + ((toX - fromX) * i) / steps, y);
  await page.mouse.up();
  const log = (await page.getByTestId("log").innerText()).split("\n").filter(Boolean);
  const asked = log.some((line) => line.startsWith("parent asked"));
  console.log(`${name}: parent ${asked ? "asked" : "NEVER asked"}`);
  console.log(log.map((line) => `  ${line}`).join("\n"));
  return asked;
}

// A spans x 0-150 and B x 170-320, relative to A.
const within = await drag("drag within A (control)", 10, 140, 4);
const across = await drag("drag from A onto B", 140, 300, 4);

await browser.close();
await server.close();
process.exitCode = within && across ? 0 : 1;
