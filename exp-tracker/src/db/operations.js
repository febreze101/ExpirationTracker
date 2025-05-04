import db from './database.js';
import { format, startOfDay } from 'date-fns';

const dbOperations = {
    // Check if is First launch
    isFirstLaunch: () => {
        try {
            const { count } = db.prepare(`SELECT COUNT(*) AS count FROM users`).get();
            return count === 0;
        } catch (error) {
            console.error('Error checking first launch: ', error)
            return true;
        }
    },

    // add user
    addUser: (user) => {
        const workspace_name = user.workspace_name;
        const reminder_frequency = user.reminder_frequency ?? 'daily';
        const onboarding_completed = user.onboardingComplete ?? 0;
        const emails = user.emails ?? [];

        const insertUserAndEmails = db.transaction(() => {
            const insertUserStmt = db.prepare(`
                INSERT INTO users (id, workspace_name, reminder_frequency, onboarding_completed)
                VALUES (1, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    workspace_name = excluded.workspace_name,
                    reminder_frequency = excluded.reminder_frequency,
                    onboarding_completed = excluded.onboarding_completed,
                    updated_at = CURRENT_TIMESTAMP
            `);

            // insert user and get userId
            const result = insertUserStmt.run(workspace_name, reminder_frequency, onboarding_completed);
            const userId = result.lastInsertRowid;

            const insertEmailStmt = db.prepare(`
                INSERT INTO emails (user_id, email)
                VALUES (?, ?)
            `);

            for (const email of emails) {
                insertEmailStmt.run(userId, email);
            }
        });

        insertUserAndEmails();
    },

    // get emails
    getNotificationEmails: () => {
        const emails = db.prepare("SELECT email FROM emails WHERE user_id = 1").all();
        return emails.map(email => email.email);
    },

    // check onboarding complete
    isOnboardingComplete: () => {
        const user = db.prepare("SELECT onboarding_completed FROM users WHERE id = 1").get();
        return user?.onboarding_completed === 1;
    },

    // Add multiple items to inventory
    addItems: (items) => {
        const insert = db.prepare(`
            INSERT INTO inventory (item_name, date_set)
            VALUES (@itemName, @dateSet)    
        `);

        const insertMany = db.transaction((items) => {
            for (const item of items) {
                insert.run({
                    itemName: item['Item Name'],
                    dateSet: 0
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

    // Add a single item
    addItem: (itemName) => {
        const insert = db.prepare("INSERT INTO inventory (item_name) VALUES (?)");
        insert.run(itemName)
        // console.log('backend: adding: ', itemName)
    },

    // Update items's expiration date
    updateExpirationDate: (itemName, expirationDates, quantity = 1) => {
        try {
            console.log('DB received:', { itemName, expirationDates });

            const inventoryStmt = db.prepare(`SELECT id FROM inventory WHERE item_name = ?`);

            const inventory = inventoryStmt.get(itemName);

            console.log('ITEM ID FOUND: ', inventory.id)

            if (!inventory) {
                throw new Error("Item not found in inventory.");
            }

            const inventoryId = inventory.id

            // ensure expirationDates is an array
            if (!Array.isArray(expirationDates)) {
                expirationDates = [expirationDates]
            }
            // insert date into batch
            const insertStmt = db.prepare(`
                INSERT INTO batches (inventory_id, expiration_date, quantity)
                VALUES (?, ?, ?)
            `);

            for (const date of expirationDates) {
                const formattedDate = format(startOfDay(new Date(date)), 'yyyy-MM-dd HH:mm:ss')
                console.log('Formatted date: ', formattedDate);
                insertStmt.run(inventoryId, formattedDate, quantity);
            }

            // Update the days_until_next_expiration manually for this item
            const updateExpirationDays = db.prepare(`
                UPDATE inventory 
                SET days_until_next_expiration = (
                    SELECT CAST(CEIL(MIN(JULIANDAY(expiration_date) - JULIANDAY(DATE('now')))) AS INTEGER)
                    FROM batches 
                    WHERE inventory_id = ?
                    AND DATE(expiration_date) >= DATE('now')
                ),
                date_set = 1
                WHERE id = ?
            `);
            updateExpirationDays.run(inventoryId, inventoryId);

            return true;

        } catch (error) {
            console.error("Error updating expiration date: ", error);
            return false;
        }
    },

    // Get all inventory items
    getAllItems: () => {
        const stmt = db.prepare(`SELECT * FROM inventory;`);
        const items = stmt.all();

        return items;
    },

    // Get items with expiration date
    getItemsWithExpiration: () => {
        console.log('Getting Items with expiration')
        const stmt = db.prepare(`
            SELECT
                i.item_name, 
                GROUP_CONCAT(b.expiration_date, ', ') as all_expiration_dates,
                MIN(b.expiration_date) AS earliest_expiration,
                SUM(b.quantity) AS total_quantity,
                COUNT(b.expiration_date) AS num_dates_set
            FROM batches b
            JOIN inventory i ON i.id = b.inventory_id
            WHERE i.date_set = 1
            GROUP BY i.item_name
            ORDER BY earliest_expiration ASC;
        `);

        const items = stmt.all();

        console.log('items with exp: ', items)
        return items;
    },

    // get expiration details about an item
    getExpirationDetails: (item) => {
        if (!item) return;
        const formattedItemDetails = {};

        const itemId = item.id;
        const itemName = item.item_name;
        const dateSet = item.date_set;

        try {
            console.log(`Retrieving expiration details about ${itemName}`)

            const stmt = db.prepare(`
                SELECT    
                    i.item_name, 
                    GROUP_CONCAT(b.expiration_date, ', ') as all_expiration_dates
                FROM batches b
                JOIN inventory i on i.id = b.inventory_id
                WHERE i.date_set = 1 and i.item_name = ?
                GROUP BY i.item_name
                ORDER BY all_expiration_dates ASC;
            `)

            const itemDetails = stmt.get(itemName);
            const dates = itemDetails.all_expiration_dates.split(', ');

            console.log('dates:', dates)

            formattedItemDetails.item_name = itemDetails.item_name
            formattedItemDetails.dates = dates


            console.log("formattedItemDetails: ", formattedItemDetails);
            return formattedItemDetails;
        } catch (error) {
            console.error('Error trying to retrieve expiration details for: ', itemName);
            return null;
        }
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
    deleteItem: (item) => {
        try {
            if (item && item) {
                const itemName = item.item_name;

                console.log('item being deleted: ', itemName)

                const removeStmt = db.prepare(`DELETE FROM expired_inventory WHERE item_name = ?`)
                const result = removeStmt.run(itemName);

                return true
            }
        } catch (error) {
            console.error("Error deleting item: ", itemName);
            return false
        }
    },

    removeFromInventory: (itemName) => {
        console.log('Remove from inventory called.')
        try {
            const removeStmt = db.prepare("DELETE FROM expired_inventory WHERE item_name = ?")
            const result = removeStmt.run(itemName);

            console.log(`Removed ${result.changes} items named "${itemName}" from inventory`);
            return result.changes > 0;
        } catch (error) {
            console.error(`Error removing Item: ${itemName} from inventory`)
            return false
        }
    },

    // Move expired items to expired_inventory table
    moveExpiredItems: (item = null) => {
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
            const deleteBatch = db.prepare(`DELETE FROM batches WHERE inventory_id = ?`);

            // Execute the statements
            db.transaction(() => {
                for (const item of expiredItems) {
                    const formattedDate = item.expiration_date
                    // insert expired item into expired_inventory table
                    insertExpired.run(item.item_name, formattedDate);

                    // delete the batch from batches
                    deleteBatch.run(item.id);

                    // Update the days_until_next_expiration for this item
                    const updateExpirationDays = db.prepare(`
                        UPDATE inventory 
                        SET days_until_next_expiration = (
                            SELECT CAST(CEIL(MIN(JULIANDAY(expiration_date) - JULIANDAY(DATE('now')))) AS INTEGER)
                            FROM batches 
                            WHERE inventory_id = ?
                            AND DATE(expiration_date) >= DATE('now')
                        )
                        WHERE id = ?
                    `);
                    updateExpirationDays.run(item.id, item.id);
                }
            })();

            console.log(`Moved ${expiredItems.length} expired items`);
            return expiredItems;
        }
        return [];

    },

    // Set item as expired
    setAsExpired: (item) => {
        try {
            const itemName = item.item_name;
            const today = startOfDay(new Date());
            const formattedDate = format(today, 'yyyy-MM-dd HH:mm:ss');

            // Move item out of inventory
            console.log(`Removing expired item ${itemName} from inventory.`);
            const removeFromInventory = db.prepare(`DELETE FROM inventory WHERE item_name = ?`)
            removeFromInventory.run(itemName)

            // add item to expired items
            console.log(`Adding item ${itemName} to expired Table on ${formattedDate}.`)
            const addToExpiredInventory = db.prepare(`
                INSERT INTO expired_inventory (item_name, expiration_date)
                VALUES (?, ?);    
            `);
            addToExpiredInventory.run(itemName, formattedDate)
            return true
        } catch (error) {
            console.error('Error setting item as expired:', error);
            return false
        }


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