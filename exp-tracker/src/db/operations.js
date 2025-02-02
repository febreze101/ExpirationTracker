import db from './database.js';

const dbOperations = {
    // Add multiple items to inventory
    addItems: (items) => {
        const insert = db.prepare(`
            INSERT INTO inventory (item_name, category, quantity, expiration_date)
            VALUES (@itemName, @category, @quantity, @expirationDate)    
        `);

        const insertMany = db.transaction((items) => {
            for (const item of items) {
                // Convert expiration date string or Date object to ISO string
                let expirationDate = null;
                if (item['Expiration Date'] || item.expirationDate) {
                    const date = new Date(item['Expiration Date'] || item.expirationDate);
                    expirationDate = isNaN(date.getTime()) ? null : date.toISOString();
                }

                insert.run({
                    itemName: item['Item Name'],
                    category: item['Category'],
                    quantity: item['Quantity'],
                    expirationDate: expirationDate,
                });
            }
        });

        return insertMany(items);
    },

    // Update items's expiration date
    updateExpirationDate: (itemName, category, expirationDate) => {
        const stmt = db.prepare(`
            UPDATE inventory
            SET expiration_date = ?
            WHERE item_name = ? AND category = ?
        `);

        // Convert date to ISO string if valid
        let dateToStore = null;
        if (expirationDate) {
            const date = new Date(expirationDate);
            dateToStore = isNaN(date.getTime()) ? null : date.toISOString();
        }

        return stmt.run(dateToStore, itemName, category);
    },

    // Get all inventory items
    getAllItems: () => {
        const stmt = db.prepare(`
            SELECT 
                id,
                item_name as "Item Name",
                category as "Category",
                quantity as "Quantity",
                expiration_date as "Expiration Date",
                created_at,
                updated_at
            FROM inventory
        `);

        const items = stmt.all();

        // convert ISO date strings back to Date objects
        return items.map(item => ({
            ...item,
            "Expiration Date": item["Expiration Date"] ? new Date(item["Expiration Date"]) : null,
            created_at: new Date(item.created_at),
            updated_at: new Date(item.updated_at)
        }))
    },

    // Get items without expiration
    getItemsWithoutExpiration: () => {
        const stmt = db.prepare(`
            SELECT 
                id,
                item_name as "Item Name",
                category as "Category",
                quantity as "Quantity",
                expiration_date as "Expiration Date",
                created_at,
                updated_at
            FROM inventory 
            WHERE expiration_date IS NULL
        `);


        const items = stmt.all();
        return items.map(item => ({
            ...item,
            created_at: new Date(item.created_at),
            updated_at: new Date(item.updated_at)
        }));
    },

    // Get items with expiration date
    getItemsWithExpiration: () => {
        const stmt = db.prepare(`
            SELECT 
                id,
                item_name as "Item Name",
                category as "Category",
                quantity as "Quantity",
                expiration_date as "Expiration Date",
                created_at,
                updated_at
            FROM inventory 
            WHERE expiration_date IS NOT NULL
        `);

        const items = stmt.all();
        return items.map(item => ({
            ...item,
            "Expiration Date": new Date(item["Expiration Date"]),
            created_at: new Date(item.created_at),
            updated_at: new Date(item.updated_at)
        }));
    },

    // Get expired items
    getExpiredItems: () => {
        const stmt = db.prepare(`
            SELECT * FROM expired_inventory
        `);
        const expiredItems = stmt.all();
        console.log("expiredItems", expiredItems);
        return expiredItems;
    },

    // Clear all inventory
    clearInventory: () => {
        const stmt = db.prepare('DELETE FROM inventory');
        return stmt.run();
    },

    // Delete specific item
    deleteItem: (itemName, category) => {
        const stmt = db.prepare('DELETE FROM inventory WHERE item_name = ? AND category = ?')
        return stmt.run(itemName, category)
    },

    // Move expired items to expired_inventory table
    moveExpiredItems: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log('Today:', today.toISOString());

        // get expired items
        const expiredItems = db.prepare(`
            SELECT * FROM inventory WHERE date(expiration_date) <= date(?)
        `).all(today.toISOString());

        console.log('Expired items:', expiredItems);

        if (expiredItems.length > 0) {
            // Copy expired items to expired_inventory table
            const insertStmt = db.prepare(`
                INSERT INTO expired_inventory (item_name, category, quantity, expiration_date)
                SELECT item_name, category, quantity, expiration_date 
                FROM inventory 
                WHERE date(expiration_date) <= date(?)
            `);

            // Delete expired items from inventory table
            const deleteStmt = db.prepare(`
                DELETE FROM inventory 
                WHERE date(expiration_date) <= date(?)
            `);

            // Execute the statements
            db.transaction(() => {
                insertStmt.run(today.toISOString());
                deleteStmt.run(today.toISOString());
            })();

            console.log(`Moved ${expiredItems.length} expired items`);
            return expiredItems;
        }
        return [];

    },

    // Add this function to check table contents
    checkTables: () => {
        const inventory = db.prepare('SELECT * FROM inventory').all();
        const expired = db.prepare('SELECT * FROM expired_inventory').all();
        console.log('Current inventory:', inventory);
        console.log('Expired inventory:', expired);
        return { inventory, expired };
    }


}

export default dbOperations;