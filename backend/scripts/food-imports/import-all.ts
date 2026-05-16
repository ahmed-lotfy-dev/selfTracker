/**
 * Master Food Database Import Script
 * 
 * Runs all import scripts in sequence:
 * 1. SFDA Arabic food seed data (built-in, ~200 foods)
 * 2. Open Food Facts CSV dump (if available)
 * 3. USDA FoodData Central CSV dump (if available)
 * 
 * Usage (on VPS):
 *   cd /path/to/backend
 *   bun run scripts/food-imports/import-all.ts
 * 
 * Options:
 *   --skip-off       Skip Open Food Facts import
 *   --skip-usda      Skip USDA import
 *   --skip-sfda      Skip SFDA seed data
 *   --off-limit N    Limit OFF import to N foods
 *   --usda-limit N   Limit USDA import to N foods
 */

async function runScript(script: string, args: string[] = []) {
  console.log(`\n>> Running: bun run ${script} ${args.join(" ")}`)
  const proc = Bun.spawn(["bun", "run", script, ...args], {
    stdout: "inherit",
    stderr: "inherit",
  })
  const exitCode = await proc.exitCode
  if (exitCode !== 0) {
    console.error(`[ERROR] ${script} exited with code ${exitCode}`)
  }
  return exitCode
}

function parseArg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(name)
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback
}

async function main() {
  const skipOff = process.argv.includes("--skip-off")
  const skipUsda = process.argv.includes("--skip-usda")
  const skipSfda = process.argv.includes("--skip-sfda")

  console.log("========================================")
  console.log("  Food Database Import - Master Script")
  console.log("========================================\n")

  // Step 1: SFDA seed data (always runs unless skipped)
  if (!skipSfda) {
    console.log("\n--- Step 1: SFDA Arabic Food Seed Data ---")
    await runScript("scripts/food-imports/import-sfda.ts", ["--seed"])
  }

  // Step 2: Open Food Facts
  if (!skipOff) {
    console.log("\n--- Step 2: Open Food Facts ---")
    const offLimit = parseArg("--off-limit", "0")
    const offArgs = offLimit !== "0" ? ["--limit", offLimit] : []
    await runScript("scripts/food-imports/import-openfoodfacts.ts", offArgs)
  }

  // Step 3: USDA
  if (!skipUsda) {
    console.log("\n--- Step 3: USDA FoodData Central ---")
    const usdaLimit = parseArg("--usda-limit", "0")
    const usdaArgs = usdaLimit !== "0" ? ["--limit", usdaLimit] : []
    await runScript("scripts/food-imports/import-usda.ts", usdaArgs)
  }

  console.log("\n========================================")
  console.log("  Import Complete!")
  console.log("========================================")
}

main().catch(console.error)
