import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function analyzeWithLocalModel(base64Image: string) {
  // 1. Save Base64 to temp file
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const tempPath = path.join(os.tmpdir(), `food_${Date.now()}.jpg`);

  await fs.writeFile(tempPath, buffer);

  // 2. Spawn Python Process
  const scriptPath = path.resolve(process.cwd(), "scripts/food_classifier.py");

  // Check for venv python (Docker/Server) vs System python (Local)
  // Check for venv python (Docker/Server) vs System python (Local)
  // We prioritize /opt/venv (Docker safe) -> ./venv (Local) -> python3 (Fallback)
  const dockerVenv = "/opt/venv/bin/python";
  const localVenv = path.resolve(process.cwd(), "venv/bin/python");

  let pythonExecutable = "python3";
  if (await fs.stat(dockerVenv).catch(() => null)) {
    pythonExecutable = dockerVenv;
  } else if (await fs.stat(localVenv).catch(() => null)) {
    pythonExecutable = localVenv;
  }

  return new Promise((resolve, reject) => {
    const python = spawn(pythonExecutable, [scriptPath, tempPath]);

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => stdout += data.toString());
    python.stderr.on("data", (data) => stderr += data.toString());

    python.on("close", async (code) => {
      // Cleanup temp file
      try { await fs.unlink(tempPath); } catch { }

      if (code !== 0) {
        // If python failed, try falling back or erroring
        console.error("Local Model Error:", stderr);
        // Fallback or Reject? 
        reject(new Error("Local AI analysis failed. Check server logs. Is python installed?"));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      } catch (e) {
        console.error("Failed to parse python output:", stdout);
        reject(new Error("Invalid response from local AI"));
      }
    });
  });
}
