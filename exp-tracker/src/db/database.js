import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// init db
const db = new Database(path.join(process.env.APPDATA || process.env.HOME, '.inventory.db'), {
    verbose: console.log
});

const dbPath = path.join(process.env.APPDATA || process.env.HOME, '.inventory.db');
console.log('ACTUAL DATABASE PATH:', dbPath);
// console.log('Does database file exist?', fs.existsSync(dbPath));

// Create tables
const initDb = () => {
    // Create inventory table
    // TODO: will need to change this to be either dynamic based on the columns headers
    db.exec(`
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT NOT NULL,
            expiration_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create Expired item table
    db.exec(`
        CREATE TABLE IF NOT EXISTS expired_inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT NOT NULL,
            expiration_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create trigger to update the updated_at timestamp
    db.exec(`
        CREATE TRIGGER IF NOT EXISTS update_timestamp
        AFTER UPDATE ON inventory
        BEGIN
            UPDATE inventory
            SET updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.id;
        END
    `);
};

// Initialize database
initDb();

// export database instance
export default db;