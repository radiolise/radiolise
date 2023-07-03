#!/usr/bin/env node
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { createServer } from "@radiolise/api";
import gradient from "gradient-string";
import open from "open";
import pico from "picocolors";
import sade from "sade";
import serveStatic from "serve-static";

const { version: VERSION } = createRequire(import.meta.url)("../package.json");
const staticPath = fileURLToPath(new URL("../dist", import.meta.url));

const program = sade("radiolise", true);

program.version(VERSION);

program
  .describe("Start up a local Radiolise instance.")
  .example("--no-launch")
  .option("--launch", "Launches instance in browser automatically", true)
  .option("--host", "Sets host to bind", "127.0.0.1")
  .option("-p, --port", "Sets port number to bind", 56225)
  .action(async ({ port, host, launch }) => {
    console.log(pico.bold(gradient.teen(`ᯤ  Welcome to Radiolise v${VERSION}`)));
    console.log(`${pico.dim("Enjoy your favorite TV and radio streams!")}
`);
    if (host === "") {
      throw new Error("the --host flag requires a value");
    }
    await createServer(port, host, (app) => {
      app.use(serveStatic(staticPath));
    });
    if (host.includes(":")) {
      host = `[${host}]`;
    }
    console.log(`Server listening on: ${pico.cyan(`http://${host}:${pico.bold(port)}/`)}`);
    if (launch) {
      open(`http://${host}:${port}/`);
    }
  });

program.parse(process.argv);

process.on("SIGINT", handleExitSignal);
process.on("SIGTERM", handleExitSignal);
process.on("SIGQUIT", handleExitSignal);

function handleExitSignal() {
  console.log("\rDone.");
  process.exit();
}
