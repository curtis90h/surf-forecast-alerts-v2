/**
 * Post-upgrade smoke test: nodemailer 10 + node-cron 4 API compatibility with
 * the shapes this repo actually uses. No network, no credentials.
 * Run: node smoke-upgrade.cjs   (from the repo root)
 */
const assert = require("assert");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

(async () => {
  // --- nodemailer: the repo builds an SMTP transporter with host/port/secure/auth
  const smtpShaped = nodemailer.createTransport({
    host: "smtp.example.com",
    port: 587,
    secure: false,
    auth: { user: "u", pass: "p" },
  });
  assert.ok(smtpShaped && typeof smtpShaped.sendMail === "function", "sendMail missing");

  // ...and sends {from,to,subject,text,html,attachments}. jsonTransport serializes
  // the message instead of delivering it, so we can assert the real output.
  const json = nodemailer.createTransport({ jsonTransport: true });
  const info = await json.sendMail({
    from: '"Surf Alerts" <alerts@example.com>',
    to: "someone@example.com",
    subject: "Test",
    text: "plain body",
    html: "<p>html body</p>",
    attachments: [{ filename: "a.txt", content: "hello" }],
  });
  const parsed = JSON.parse(info.message);
  assert.ok(info.envelope.from, "no envelope.from");
  assert.deepStrictEqual(info.envelope.to, ["someone@example.com"]);
  assert.strictEqual(parsed.subject, "Test");
  assert.ok(parsed.html.includes("html body"));
  assert.ok(Array.isArray(parsed.attachments) && parsed.attachments.length === 1);
  console.log("nodemailer OK — version", require("nodemailer/package.json").version);

  // --- node-cron 4: repo calls cron.schedule(expr, fn)
  assert.ok(typeof cron.schedule === "function", "cron.schedule missing");
  let fired = 0;
  const task = cron.schedule("*/1 * * * * *", () => { fired++; });
  await new Promise((r) => setTimeout(r, 2400));
  task.stop();
  assert.ok(fired >= 1, `cron task never fired (fired=${fired})`);
  console.log(`node-cron OK — version ${JSON.parse(require("fs").readFileSync("node_modules/node-cron/package.json")).version}, fired ${fired}x`);

  // --- axios + cheerio still load and export what the scraper uses
  const axios = require("axios");
  const cheerio = require("cheerio");
  assert.ok(typeof axios.get === "function", "axios.get missing");
  assert.ok(typeof cheerio.load === "function", "cheerio.load missing");
  const $ = cheerio.load("<html><body><div class='swell'>3 ft</div></body></html>");
  assert.strictEqual($(".swell").text(), "3 ft");
  console.log(`axios OK — ${require("axios/package.json").version}; cheerio OK — ${require("cheerio/package.json").version}`);

  console.log("\nALL SMOKE TESTS PASSED");
})().catch((e) => { console.error("SMOKE TEST FAILED:", e.message); process.exit(1); });
