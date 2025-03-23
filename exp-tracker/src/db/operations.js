import db from './database.js';

const dbOperations = {
    // Add multiple items to inventory
    addItems: (items) => {
        const insert = db.prepare(`
            INSERT INTO inventory (item_name)
            VALUES (@itemName)    
        `);

        const insertMany = db.transaction((items) => {
            for (const item of items) {
                insert.run({
                    itemName: item['Item Name'],
                });
            }
        });

        try {
            insertMany(items);
            return true;
        } catch (error) {
            console.error("Error adding items: ", error);
            return false;
        }
    },

    // Update items's expiration date
    updateExpirationDate: (itemName, expirationDate) => {
        try {
            console.log('DB received:', { itemName, expirationDate });
            console.log('item name:', itemName);
            console.log('Expiration Date:', expirationDate);

            const checkItem = db.prepare(`SELECT item_name FROM inventory WHERE item_name = ?`);
            const exist = checkItem.get(itemName);
            console.log('exist:', exist);
            if (!exist) {
                // item does not exist, add it
                console.log('Item does not exist, adding it');
                const insertItem = db.prepare(`
                    INSERT INTO inventory (item_name, expiration_date) 
                    VALUES (?, ?)`);
                const result = insertItem.run(itemName, expirationDate);
                console.log("DB insert result:", result);
                return result;
            } else {
                // item exists, update the expiration date
                const updateItem = db.prepare(`
                    UPDATE inventory 
                    SET expiration_date = ?,
                    updated_at = CURRENT_TIMESTAMP
                    WHERE item_name = ?
                `);
                const result = updateItem.run(expirationDate, itemName);
                console.log("DB result:", result);
                return result;
            }
        } catch (error) {
            console.error("Error updating expiration date: ", error);
            throw error;
        }
    },



    // Get all inventory items
    getAllItems: () => {
        const stmt = db.prepare(`
            SELECT 
                id,
                item_name as "Item Name",
                expiration_date as "Expiration Date",
                created_at,
                updated_at
            FROM sorted_inventory 
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
            SELECT * FROM inventory 
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
            SELECT * FROM sorted_inventory 
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

    // Get items expiring in "x" amount of days
    getItemsExpiringSoon: (numDays) => {
        if (typeof numDays !== 'number') {
            throw new Error("numDays should be a number.");
        }

        const stmt = db.prepare(`
            SELECT * FROM sorted_inventory
            WHERE expiration_date BETWEEN DATE('now') AND DATE('now', ? || ' days')
        `);
        return stmt.all(numDays.toString());  // Append 'days' to numDays
    },

    // Get expired items
    getExpiredItems: () => {
        return db.prepare('SELECT * FROM expired_inventory').all();
    },

    // Clear all inventory
    clearInventory: () => {
        const stmt = db.prepare('DELETE FROM inventory');
        return stmt.run();
    },

    // Delete specific item
    deleteItem: (itemName) => {
        const stmt = db.prepare('DELETE FROM inventory WHERE item_name = ?');
        return stmt.run(itemName);
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
                INSERT INTO expired_inventory (item_name, expiration_date)
                SELECT item_name, expiration_date 
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

    restoreExpiredItem: (itemName) => {
        console.log('Restoring expired item:', itemName);
        try {
            const getItemStmt = db.prepare(`
                SELECT * from expired_inventory
                WHERE item_name = ?
            `);

            const item = getItemStmt.get(itemName);

            if (!item) {
                throw new Error('Item not found in expired_inventory');
            }

            const insertStmt = db.prepare(`
                INSERT INTO inventory (item_name)
                VALUES (?)
            `);

            const deleteStmt = db.prepare(`
                DELETE FROM expired_inventory
                WHERE item_name = ?
            `);

            db.transaction(() => {
                insertStmt.run(item['item_name']);
                deleteStmt.run(itemName);
            })();
        } catch (error) {
            console.error("Error restoring expired item: ", error);
            throw error;
        }
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