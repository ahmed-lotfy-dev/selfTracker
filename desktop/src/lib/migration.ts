
export async function migrateLocalData(collections: any, userId: string) {
  // List of all keys we use for guest data
  const TABLES = [
    'tasks',
    'habits',
    'workouts',
    'weight_logs',
    'expenses',
    'user_goals',
    'exercises',
    'timer_sessions'
  ];

  let migratedCount = 0;

  for (const table of TABLES) {
    const localKey = `local_collection_${table}`;
    const localDataString = localStorage.getItem(localKey);

    if (!localDataString) continue;

    try {
      const localData = JSON.parse(localDataString);
      if (!Array.isArray(localData) || localData.length === 0) continue;

      console.log(`[Migration] Migrating ${localData.length} items for ${table}...`);

      for (const item of localData) {
        // 1. Prepare item for cloud (assign ownership)
        const cloudItem = {
          ...item,
          user_id: userId, // CRITICAL: Assign ownership
          // Ensure timestamps are valid strings if they aren't
          created_at: item.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // 2. Insert into the Authenticated Collection
        // This 'collections[table]' is now the ElectricSQL version
        try {
          if (collections[table]) {
            await collections[table].insert(cloudItem);
            migratedCount++;
          }
        } catch (err) {
          console.error(`[Migration] Failed to migrate item ${item.id} in ${table}`, err);
        }
      }

      // 3. Clean up (Optional: keep backup or clear)
      // We clear it to prevent double-migration next time
      localStorage.removeItem(localKey);

    } catch (e) {
      console.error(`[Migration] Error parsing local data for ${table}`, e);
    }
  }

  if (migratedCount > 0) {
    console.log(`[Migration] Successfully migrated ${migratedCount} items to cloud.`);
  }
}
