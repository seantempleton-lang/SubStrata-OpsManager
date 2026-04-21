import process from "node:process";
import { spawn } from "node:child_process";

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      ...options,
    });

    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(" ")} failed with ${signal ? `signal ${signal}` : `exit code ${code}`}.`,
        ),
      );
    });

    child.on("error", reject);
  });
}

async function main() {
  if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL detected. Running PostgreSQL migrations...");
    await run(process.execPath, ["scripts/db-migrate.mjs", "up"]);
  } else {
    console.log("DATABASE_URL not set. Skipping PostgreSQL migrations.");
  }

  console.log("Starting API server...");
  await run(process.execPath, ["server/index.mjs"]);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
