import db from './database.js';
import { format, startOfDay } from 'date-fns';

function toSqliteDateString(date = new Date()) {
    return date.toISOString().replace('T', ' ').substring(0, 19);
}

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

    checkReminderFrequency: async () => {
        const frequency = db.prepare('SELECT reminder_frequency FROM users WHERE id = 1').get();
        return frequency;
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
    importInventory(items) {
        const insert = db.prepare(`
        INSERT INTO inventory (
            item_name,
            date_set,
            num_dates_set,
            days_until_next_expiration,
            created_at,
            updated_at
        ) VALUES (
            @item_name,
            1,
            @num_dates_set,
            @days_until_next_expiration,
            @created_at,
            @updated_at
        )
        ON CONFLICT(item_name) DO UPDATE SET
            date_set=1,
            num_dates_set=excluded.num_dates_set,
            days_until_next_expiration=excluded.days_until_next_expiration,
            updated_at=CURRENT_TIMESTAMP
    `);

        const insertMany = db.transaction((items) => {
            for (const item of items) {
                insert.run({
                    item_name: item.item_name || item['Item Name'],
                    num_dates_set: item.num_dates_set ?? 0,
                    days_until_next_expiration: item.days_until_next_expiration ?? null,
                    created_at: item.created_at ?? toSqliteDateString(new Date()),
                    updated_at: item.updated_at ?? toSqliteDateString(new Date())
                });
            }
        });

        insertMany(items);
    },

    importExpiredInventory(items) {
        const insert = db.prepare(`
        INSERT INTO expired_inventory (
            item_name,
            expiration_date,
            created_at,
            updated_at
        ) VALUES (
            @item_name,
            @expiration_date,
            @created_at,
            @updated_at
        )
    `);

        const insertMany = db.transaction((items) => {
            for (const item of items) {
                insert.run({
                    item_name: item.item_name || item['Item Name'],
                    expiration_date: item.expiration_date ?? null,
                    created_at: item.created_at ?? toSqliteDateString(new Date()),
                    updated_at: item.updated_at ?? toSqliteDateString(new Date())
                });
            }
        });

        insertMany(items);
    },

    importBatches(batches) {
        const insert = db.prepare(`
        INSERT INTO batches (
            inventory_id,
            expiration_date,
            quantity,
            created_at,
            updated_at
        ) VALUES (
            @inventory_id,
            @expiration_date,
            @quantity,
            @created_at,
            @updated_at
        )
    `);

        const insertMany = db.transaction((batches) => {
            for (const batch of batches) {
                insert.run({
                    inventory_id: batch.inventory_id ?? null,
                    expiration_date: batch.expiration_date ?? null,
                    quantity: batch.quantity ?? 1,
                    created_at: batch.created_at ?? toSqliteDateString(new Date()),
                    updated_at: batch.updated_at ?? toSqliteDateString(new Date())
                });
            }
        });

        insertMany(batches);
    },

    moveExpiredItems: () => {
        const moveExpired = db.transaction(() => {
            const today = format(startOfDay(new Date()), 'yyyy-MM-dd HH:mm:ss');

            // Get expired batches and join inventory to get item names
            const expiredItems = db.prepare(`
                    SELECT 
                        b.id as batch_id,
                        i.id as iventory_id,
                        i.item_name,
                        b.expiration_date,
                        b.quantity
                    FROM batches b
                    JOIN inventory i ON b.inventory_id = i.id
                    WHERE b.expiration_date <= ?
            `).all(today);

            if (expiredItems.length === 0) {
                return [];
            }

            const insertExpired = db.prepare(`
                INSERT INTO expired_inventory (item_name, expiration_date)
                VALUES (? ,?)    
            `);

            const deleteBatch = db.prepare(`
                DELETE FROM batches WHERE id = ?
            `);

            const deleteFromInventory = db.prepare(`
                DELETE FROM inventory 
                WHERE num_dates_set = 1
                AND NOT EXISTS (
                    SELECT 1 FROM batches WHERE batches.inventory_id = inventory.id
                )
            `);

            for (const item of expiredItems) {
                insertExpired.run(item.item_name, item.expirataion_date);
                deleteBatch.run(item.batch_id);
                deleteFromInventory.run()
            }

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

            const updateNumDatesSet = db.prepare(`
                UPDATE inventory
                SET num_dates_set = (
                    SELECT COUNT(*) FROM batches WHERE inventory_id = inventory.id
                )
                WHERE id = ?;    
            `)

            for (const item of expiredItems) {
                updateExpirationDays.run(item.inventory_id, item.inventory_id)
                updateNumDatesSet.run(item.inventory_id)
            }

            return expiredItems;
        });

        try {
            return moveExpired();
        } catch (error) {
            console.error('Error moving expired items:', error);
            return [];
        }
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
            return true;
        } catch (error) {
            console.error("Error restoring expired item: ", error);
            return false;
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