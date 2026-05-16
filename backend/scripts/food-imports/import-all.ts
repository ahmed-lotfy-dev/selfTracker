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
  console.log(`\n[MASTER] ========================================`)
  console.log(`[MASTER] Running: bun run ${script} ${args.join(" ")}`)
  console.log(`[MASTER] ========================================`)

  const startTime = Date.now()
  const proc = Bun.spawn(["bun", "run", script, ...args], {
    stdout: "inherit",
    stderr: "inherit",
  })
  const exitCode = await proc.exitCode
  const elapsed = Date.now() - startTime

  if (exitCode !== 0) {
    console.error(`[MASTER] ✗ ${script} FAILED with exit code ${exitCode} (${elapsed}ms)`)
  } else {
    console.log(`[MASTER] ✓ ${script} completed successfully (${elapsed}ms)`)
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

  console.log("╔════════════════════════════════════════╗")
  console.log("║  Food Database Import - Master Script  ║")
  console.log("╚════════════════════════════════════════╝")
  console.log(`SFDA seed:  ${skipSfda ? "SKIPPED" : "ENABLED"}`)
  console.log(`OFF import: ${skipOff ? "SKIPPED" : "ENABLED"}`)
  console.log(`USDA import: ${skipUsda ? "SKIPPED" : "ENABLED"}`)
  console.log("")

  const totalStart = Date.now()

  // Step 1: SFDA seed data (always runs unless skipped)
  if (!skipSfda) {
    console.log("\n[MASTER] ─── Step 1/3: SFDA Arabic Food Seed Data ───")
    await runScript("scripts/food-imports/import-sfda.ts", ["--seed"])
  }

  // Step 2: Open Food Facts
  if (!skipOff) {
    console.log("\n[MASTER] ─── Step 2/3: Open Food Facts ───")
    const offLimit = parseArg("--off-limit", "0")
    const offArgs = offLimit !== "0" ? ["--limit", offLimit] : []
    await runScript("scripts/food-imports/import-openfoodfacts.ts", offArgs)
  }

  // Step 3: USDA
  if (!skipUsda) {
    console.log("\n[MASTER] ─── Step 3/3: USDA FoodData Central ───")
    const usdaLimit = parseArg("--usda-limit", "0")
    const usdaArgs = usdaLimit !== "0" ? ["--limit", usdaLimit] : []
    await runScript("scripts/food-imports/import-usda.ts", usdaArgs)
  }

  const totalElapsed = ((Date.now() - totalStart) / 1000).toFixed(0)

  console.log("\n╔════════════════════════════════════════╗")
  console.log("║  Import Complete!                      ║")
  console.log(`║  Total time: ${totalElapsed}s                      ║`)
  console.log("╚════════════════════════════════════════╝")
}

main().catch(console.error)
