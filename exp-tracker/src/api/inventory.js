import { supabase } from "../utils/supabaseClient.js";

export const fetchInventory = async (inventoryId = null) => {
    if (inventoryId !== null) {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .eq('id', inventoryId)
            .single();

        if (error) {
            console.error("Error fetching item from Supabase:", error);
            throw new Error("Failed to fetch item from Supabase");
        }

        if (!data) {
            console.warn(`No item found with ID ${inventoryId}`);
            return null;
        }

        return data;
    } else {
        let { data, error } = await supabase
            .from('inventory')
            .select('*');

        if (error) {
            console.error("Error fetching data from Supabase:", error);
            throw new Error("Failed to fetch data from Supabase");
        }

        if (!data || data.length === 0) {
            console.warn("No data found in Supabase");
            return [];
        }

        return data
    }
}

export const fetchExpiredInventory = async (expiredId = null) => {
    if (expiredId !== null) {
        const { data, error } = await supabase
            .from('batches')
            .select(`
                id,
                expiration_date,
                starting_stock,
                expired_stock,
                cost,
                price,
                supplier,
                notes,
                inventory (
                    id,
                    item_name
                )
        `)
            .eq('id', expiredId)
            .single();

        if (error) {
            console.error("Error fetching expired item from Supabase:", error);
            throw new Error("Failed to fetch expired item from Supabase");
        }

        if (!data) {
            console.warn(`No expired item found with ID ${expiredId}`);
            return null;
        }

        return data;
    } else {
        const { data: expiredInventory, error } = await supabase
            .from('batches')
            .select(`
                id,
                expiration_date,
                starting_stock,
                expired_stock,
                cost,
                price,
                supplier,
                notes,
                inventory (
                    id,
                    item_name
                )
        `)
            .lt('expiration_date', new Date().toISOString())
            .order('expiration_date', { ascending: true });

        if (error) {
            console.error("Error fetching expired inventory from Supabase:", error);
            throw new Error("Failed to fetch expired inventory from Supabase");
        }

        if (!expiredInventory || expiredInventory.length === 0) {
            console.warn("No expired inventory found in Supabase");
            return [];
        }

        console.log("Fetched expired inventory:", expiredInventory);
        return expiredInventory;
    }
}

export const fetchExpiringInventory = async (expiringId = null) => {
    if (expiringId !== null) {
        const { data, error } = await supabase
            .from('batches')
            .select(`
                id,
                expiration_date,
                starting_stock,
                expired_stock,
                cost,
                price,
                supplier,
                notes,
                inventory (
                    id,
                    item_name
                )
        `)
            .eq('id', expiringId)
            .single();

        if (error) {
            console.error("Error fetching expiring item from Supabase:", error);
            throw new Error("Failed to fetch expiring item from Supabase");
        }

        if (!data) {
            console.warn(`No expiring item found with ID ${expiringId}`);
            return null;
        }

        return data;
    } else {
        const { data: expiringInventory, error } = await supabase
            .from('batches')
            .select(`
                id,
                expiration_date,
                starting_stock,
                expired_stock,
                cost,
                price,
                supplier,
                notes,
                inventory (
                    id,
                    item_name
                )
        `)
            .gt('expiration_date', new Date().toISOString())
            .order('expiration_date', { ascending: true });

        if (error) {
            console.error("Error fetching expiring inventory from Supabase:", error);
            throw new Error("Failed to fetch expiring inventory from Supabase");
        }

        if (!expiringInventory || expiringInventory.length === 0) {
            console.warn("No expiring inventory found in Supabase");
            return [];
        }

        console.log("Fetched expiring inventory:", expiringInventory);
        return expiringInventory;
    }
}

export const addInventoryItems = async (items) => {
    // Validate input
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Invalid input: items must be a non-empty array");
    }

    // Add a single item or multiple items
    if (items.length() === 1) {
        const { data, error } = await supabase
            .from('inventory')
            .insert([items[0]]);

        if (error) {
            console.error("Error adding item to Supabase:", error);
            throw new Error("Failed to add item to Supabase");
        }

        return data;
    } else if (items.length > 1) {
        const { data, error } = await supabase
            .from('inventory')
            .insert(items);

        if (error) {
            console.error("Error adding items to Supabase:", error);
            throw new Error("Failed to add items to Supabase");
        }

        return data;
    }
}

export const updateInventoryItem = async (id, updates) => {
    const { data: updatedData, error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error("Error updating item in Supabase:", error);
        throw new Error("Failed to update item in Supabase");
    }

    return updatedData;
}

export const deleteInventoryItem = async (id) => {
    const { data, error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting item from Supabase:", error);
        throw new Error("Failed to delete item from Supabase");
    }

    return data;
}