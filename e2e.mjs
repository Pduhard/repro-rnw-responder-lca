import { chromium } from "playwright-core";
import { createServer } from "vite";

// Press on the middle of A, then drag onto B in small steps, like a hand.
// While the pointer moves over A, the parent is asked and says no. Once the
// pointer is over B, a sibling of A, the parent is never asked, so it never
// takes the gesture.
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

await page.goto("http://localhost:5199/");
const a = await page.getByTestId("A").boundingBox();
const y = a.y + a.height / 2;
// A spans x 0-150 and B x 170-320, relative to A.
await page.mouse.move(a.x + 75, y);
await page.mouse.down();
for (let x = 80; x <= 300; x += 5) await page.mouse.move(a.x + x, y);
await page.mouse.up();

const log = (await page.getByTestId("log").innerText()).split("\n").filter(Boolean);
const granted = log.includes("parent granted");
console.log(`drag from A onto B: parent ${granted ? "granted" : "NEVER granted"}`);
console.log(log.map((line) => `  ${line}`).join("\n"));

await browser.close();
await server.close();
process.exitCode = granted ? 0 : 1;
