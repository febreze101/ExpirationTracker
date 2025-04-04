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
            date_set INTEGER NOT NULL CHECK(date_set IN (0, 1)) DEFAULT 0,
            num_dates_set INTEGER DEFAULT 0,
            days_until_next_expiration INTEGER DEFAULT NULL,
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

    // create a trigger for num_dates_set
    db.exec(`
        CREATE TRIGGER IF NOT EXISTS update_num_dates_set
        AFTER INSERT ON batches
        BEGIN
            UPDATE inventory
            SET num_dates_set = (
                SELECT COUNT(*) FROM batches WHERE inventory_id = NEW.inventory_id
            )
            WHERE id = NEW.inventory_id;
        END;
    `);

    // Drop the existing trigger if it exists
    db.exec(`DROP TRIGGER IF EXISTS update_days_until_next_expiration`);

    // Create a fixed trigger for days until next expiration
    db.exec(`
        CREATE TRIGGER IF NOT EXISTS update_days_until_next_expiration
        AFTER INSERT ON batches
        BEGIN
            UPDATE inventory
            SET days_until_next_expiration = (
                SELECT CAST(CEIL(MIN(JULIANDAY(expiration_date) - JULIANDAY(DATE('now')))) AS INTEGER)
                FROM batches 
                WHERE inventory_id = NEW.inventory_id
                AND DATE(expiration_date) >= DATE('now')
            )
            WHERE id = NEW.inventory_id;
        END;
    `);

    // Add a trigger for when batches are deleted
    db.exec(`
        CREATE TRIGGER IF NOT EXISTS update_days_after_delete
        AFTER DELETE ON batches
        BEGIN
            UPDATE inventory
            SET days_until_next_expiration = (
                SELECT CAST(CEIL(MIN(JULIANDAY(expiration_date) - JULIANDAY(DATE('now')))) AS INTEGER)
                FROM batches 
                WHERE inventory_id = OLD.inventory_id
                AND DATE(expiration_date) >= DATE('now')
            )
            WHERE id = OLD.inventory_id;
        END;
    `);
};

// Initialize database
initDb();

// export database instance
export default db;