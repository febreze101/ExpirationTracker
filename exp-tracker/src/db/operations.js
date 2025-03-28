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
    updateExpirationDate: (itemName, expirationDate, quantity = 1) => {
        try {
            console.log('DB received:', { itemName, expirationDate });
            console.log('item name:', itemName);
            console.log('Expiration Date:', expirationDate);

            const checkItem = db.prepare(`SELECT id FROM inventory WHERE item_name = ?`);
            let item = checkItem.get(itemName);

            console.log("ITEM FOUND: ", item);

            let itemId;

            if (!item) {
                // item does not exist, add it
                console.log('Item does not exist, adding it to inventory');
                const insertItem = db.prepare(`INSERT INTO inventory (item_name) VALUES (?)`);
                const result = insertItem.run(itemName);
                itemId = result.lastInsertRowid;
                console.log("DB insert result:", result);
            } else {
                itemId = item.id;
            }

            // insert date into batch
            const insertBatch = db.prepare(`
                INSERT INTO batches (inventory_id, expiration_date, quantity)
                VALUES (?, ?, ?)
            `);
            insertBatch.run(itemId, expirationDate, quantity);

            return true;

        } catch (error) {
            console.error("Error updating expiration date: ", error);
            return false;
        }
    },



    // Get all inventory items
    getAllItems: () => {
        const stmt = db.prepare(`
            SELECT i.id, i.item_name AS "Item Name",
                    b.expiration_date AS "Expiration Date",
                    b.quantity,
                    i.created_at, i.updated_at
            FROM inventory i
            LEFT JOIN batches b ON i.id = b.inventory_id
            ORDER BY b.expiration_date ASC 
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
            WHERE id NOT IN (SELECT DISTINCT inventory_id FROM batches)
        `);

        return stmt.all();
    },

    // Get items with expiration date
    getItemsWithExpiration: () => {
        const stmt = db.prepare(`
            SELECT i.item_name, b.expiration_date, b.quantity
            FROM batches b
            JOIN inventory i ON i.id = b.inventory_id
            ORDER BY b.expiration_date ASC
        `);

        const items = stmt.all();
        return items.map(item => ({
            ...item,
            "Expiration Date": new Date(item["Expiration Date"]),
        }));
    },

    // Get items expiring in "x" amount of days
    getItemsExpiringSoon: (numDays) => {
        if (typeof numDays !== 'number') throw new Error("numDays should be a number.");

        const stmt = db.prepare(`
            SELECT i.item_name, b.expiration_date, b.quantity
            FROM batches b
            JOIN inventory i ON i.id = b.inventory_id
            WHERE b.expiration_date BETWEEN DATE('now') AND DATE('now', ? || ' days')
        `);

        return stmt.all(numDays.toString());  // Append 'days' to numDays
    },

    // Get expired items
    getExpiredItems: () => {
        return db.prepare('SELECT * FROM expired_inventory').all();
    },

    // Clear all inventory
    clearInventory: () => {
        try {
            db.transaction(() => {
                db.prepare('DELETE FROM batches').run();
                db.prepare('DELETE FROM inventory').run();
            })();
            return true;
        } catch (error) {
            console.error("Error clearing inventory:", error);
            return false;
        }
    },

    // Delete specific item
    deleteItem: (itemName) => {
        try {
            const getItem = db.prepare(`SELECT id FROM inventory WHERE item_name = ?`).get(itemName);
            if (!getItem) throw new Error('Item not found');

            const deleteBatches = db.prepare('DELETE FROM batches WHERE inventory_id = ?')
            const deleteItem = db.prepare('DELETE FROM inventory WHERE id = ?')

            db.transaction(() => {
                deleteBatches.run(getItem.id);
                deleteItem.run(getItem.id);
            })();

            return truel
        } catch (error) {
            console.error("Error deleting item: ", itemName);
            return false
        }
    },

    // Move expired items to expired_inventory table
    moveExpiredItems: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log('Today:', today.toISOString());

        // get expired items
        const expiredItems = db.prepare(`
            SELECT i.id, i.item_name, b.expiration_date, b.quantity, b.id AS batch_id
            FROM batches b
            JOIN inventory i ON i.id = b.inventory_id 
            WHERE date(b.expiration_date) <= date(?)
        `).all(today.toISOString());

        console.log('Expired items:', expiredItems);

        if (expiredItems.length > 0) {
            // Copy expired items to expired_inventory table
            const insertExpired = db.prepare(`
                INSERT INTO expired_inventory (item_name, expiration_date)
                VALUES (?, ?)
                ON CONFLICT(item_name) DO NOTHING
            `);

            // Delete expired items from inventory table
            const deleteExpired = db.prepare(`DELETE FROM batches WHERE inventory_id = ?`);

            // Execute the statements
            db.transaction(() => {
                for (const item of expiredItems) {
                    // insert expired item into expired_inventory table
                    insertExpired.run(item.item_name, item.expiration_date);

                    // delete the batch from batches
                    deleteExpired.run(item.id);
                }
            })();

            console.log(`Moved ${expiredItems.length} expired items`);
            return expiredItems;
        }
        return [];

    },

    restoreExpiredItem: (itemName) => {
        console.log('Restoring expired item:', itemName);
        try {
            const getItemStmt = db.prepare(`SELECT * from expired_inventory WHERE item_name = ?`);
            const item = getItemStmt.get(itemName);

            if (!item) throw new Error('Item not found in expired_inventory');

            const insertStmt = db.prepare(`
                INSERT INTO inventory (item_name) VALUES (?)
            `);

            const deleteStmt = db.prepare(`
                DELETE FROM expired_inventory WHERE item_name = ?
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
        return {
            inventory: db.prepare('SELECT * FROM inventory').all(),
            batches: db.prepare('SELECT * FROM batches').all(),
            expired: db.prepare('SELECT * FROM expired_inventory').all()
        };
    }


}

export default dbOperations;