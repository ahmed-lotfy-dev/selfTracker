import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations";

const expoDb = openDatabaseSync("selftracker.db");

export const db = drizzle(expoDb);

export const useDatabaseMigrations = () => {
  return useMigrations(db, migrations);
};
