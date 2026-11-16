// Copies the web app from ./app into ./www and adds the native layer. Run: npm run sync:app
import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync, existsSync } from "node:fs";
const fail = (m) => { console.error("sync-app: " + m); process.exit(1); };
if (!existsSync("app/index.html")) fail("put your app files (index.html, manifest.webmanifest, icons) in ./app first");
mkdirSync("www", { recursive: true });
for (const f of readdirSync("app")) if (!/\.md$/i.test(f) && f !== "sw.js") cpSync("app/" + f, "www/" + f, { recursive: true });
let html = readFileSync("app/index.html", "utf8");
const a = '<meta charset="utf-8">', b = 'location.href.split("#")[0] + "#b="';
if (!html.includes(a)) fail("expected " + a + " in index.html");
if (!html.includes(b)) fail("expected the makeLink() line in index.html; the app may have changed");
html = html.replace(a, a + '\n<script src="native.js"></script>').replace(b, '(window.SHARE_BASE || location.href.split("#")[0]) + "#b="');
writeFileSync("www/index.html", html);
console.log("www/ is ready. Next: npx cap sync ios");
