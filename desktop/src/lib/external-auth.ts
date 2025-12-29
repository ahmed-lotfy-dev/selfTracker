
export async function waitForDeepLink() {
  console.log("[ExternalAuth] Waiting for deep link callback...");

  return new Promise<{ token: string } | null>(async (resolve, reject) => {
    let unlisten: (() => void) | null = null;

    try {
      const { onOpenUrl } = await import("@tauri-apps/plugin-deep-link");
      unlisten = await onOpenUrl((urls) => {
        console.log("[ExternalAuth] Deep link received:", urls);
        for (const url of urls) {
          if (url.startsWith("selftracker://auth")) {
            const urlObj = new URL(url.replace("selftracker://", "http://localhost/"));
            const token = urlObj.searchParams.get("token");

            if (token) {
              console.log("[ExternalAuth] Token extracted successfully");
              if (unlisten) unlisten();
              resolve({ token });
              return;
            }
          }
        }
      });

      setTimeout(() => {
        if (unlisten) unlisten();
        reject(new Error("Authentication timed out"));
      }, 300000);

    } catch (err) {
      if (unlisten) unlisten();
      reject(err);
    }
  });
}
