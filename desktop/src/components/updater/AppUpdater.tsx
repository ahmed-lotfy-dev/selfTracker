import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { toast } from 'sonner';

export function AppUpdater() {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkForUpdates = async () => {
      if (checking) return;

      try {
        console.log('[Updater] Checking for updates...');
        setChecking(true);
        const update = await check();

        if (update) {
          console.log(`[Updater] Found update: ${update.version}`);

          toast.info(`Update Available (${update.version})`, {
            description: 'A new version of SelfTracker is available. Would you like to install it now?',
            duration: Infinity,
            action: {
              label: 'Update & Restart',
              onClick: async () => {
                try {
                  toast.loading('Downloading update...', { id: 'updater-toast' });

                  let downloaded = 0;
                  let contentLength = 0;

                  await update.downloadAndInstall((event) => {
                    switch (event.event) {
                      case 'Started':
                        contentLength = event.data.contentLength || 0;
                        break;
                      case 'Progress':
                        downloaded += event.data.chunkLength;
                        if (contentLength > 0) {
                          const percent = Math.round((downloaded / contentLength) * 100);
                          toast.loading(`Downloading: ${percent}%`, { id: 'updater-toast' });
                        }
                        break;
                      case 'Finished':
                        toast.success('Download complete!', { id: 'updater-toast' });
                        break;
                    }
                  });

                  toast.success('Update installed! Relaunching...', { id: 'updater-toast' });
                  await relaunch();
                } catch (err: any) {
                  console.error('[Updater] Download/Install error:', err);
                  toast.error('Failed to install update', {
                    id: 'updater-toast',
                    description: err?.message || String(err)
                  });
                }
              }
            }
          });
        } else {
          console.log('[Updater] No updates found.');
        }
      } catch (err) {
        console.error('[Updater] Check failed:', err);
      } finally {
        setChecking(false);
      }
    };

    checkForUpdates();
  }, []);

  return null;
}
