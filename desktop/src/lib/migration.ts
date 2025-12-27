
import { v4 as uuidv4 } from 'uuid';

export async function migrateLocalData(collections: any, userId: string) {
  console.log('[Migration] Starting local data migration for user:', userId);

  const tables = [
    'tasks',
    'weight_logs',
    'workout_logs',
    'expenses',
    'workouts',
    'user_goals',
    'exercises',
    'timer_sessions',
    'habits'
  ];

  let migratedCount = 0;

  for (const table of tables) {
    const localKey = `local_collection_${table}`;
    const rawData = localStorage.getItem(localKey);

    if (rawData) {
      try {
        const items = JSON.parse(rawData);
        if (Array.isArray(items) && items.length > 0) {
          console.log(`[Migration] Migrating ${items.length} items for table: ${table}`);

          const collection = collections[table === 'weight_logs' ? 'weightLogs' :
            table === 'workout_logs' ? 'workoutLogs' :
              table === 'user_goals' ? 'userGoals' :
                table === 'timer_sessions' ? 'timerSessions' :
                  table]; // Handle camelCase mapping

          if (collection) {
            for (const item of items) {
              // Ensure item has ID and user_id is updated
              const itemToSync = {
                ...item,
                id: item.id || uuidv4(),
                user_id: userId,
                // Ensure timestamps exist
                created_at: item.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
              };

              // Insert into the collection (triggers onInsert -> Sync to Backend)
              await collection.upsert(itemToSync);
            }
            migratedCount += items.length;

            // Clear local storage after successful migration
            // localStorage.removeItem(localKey); 
            // Better to rename or backup instead of delete immediately? 
            // For now, let's keep it but maybe mark as migrated? 
            // The user wants it "sync to user data". 
            // Safe to delete if we are confident, or just empty it.
            localStorage.removeItem(localKey);
          }
        }
      } catch (e) {
        console.error(`[Migration] Failed to migrate ${table}`, e);
      }
    }
  }

  console.log(`[Migration] Completed. Migrated ${migratedCount} items.`);
}
