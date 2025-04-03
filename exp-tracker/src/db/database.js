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
            date_set INTEGER NOT NULL CHECK(date_set IN (0, 1)),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create Expired item table
    db.exec(`
        CREATE TABLE IF NOT EXISTS expired_inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT UNIQUE NOT NULL,
            expiration_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create a batches table
    db.exec(`
        CREATE TABLE IF NOT EXISTS batches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inventory_id INTEGER NOT NULL,
            expiration_date DATETIME,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
            UNIQUE (inventory_id, expiration_date)
        )    
    `)

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

    // create an view for inventory sorted by expiration
    db.exec(`
        CREATE VIEW IF NOT EXISTS sorted_inventory AS
        SELECT * FROM inventory ORDER BY expiration_date ASC    
    `);

    // create an view expired_invenotry sorted by expiration
    db.exec(`
        CREATE VIEW IF NOT EXISTS sorted_expired_inventory AS
        SELECT * FROM expired_inventory ORDER BY expiration_date DESC    
    `);
};

// Initialize database
initDb();

// export database instance
export default db;