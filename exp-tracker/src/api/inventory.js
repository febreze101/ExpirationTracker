import supabase from "../utils/supabaseClient";

export async function fetchInventory(workspaceId) {
    if (!workspaceId) return [];

    const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('workspace_id', workspaceId);

    if (error) {
        console.error("Error fetching inventory:", error);
        return [];
    }
    return data;
}

export async function fetchExpiringInventory(workspaceId) {
    if (!workspaceId) return [];

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const { data: inventoryIds, error: inventoryError } = await supabase
        .from('inventory')
        .select('id')
        .eq('workspace_id', workspaceId);

    if (inventoryError) {
        console.error("Error fetching inventory IDs:", inventoryError);
        return [];
    }

    const { data, error } = await supabase
        .from('batches')
        .select(`
            *,
            inventory:inventory_id (
                item_name
            )
        `)
        .in('inventory_id', inventoryIds.map(i => i.id))
        .gte('expiration_date', today.toISOString())
        .lte('expiration_date', nextWeek.toISOString());

    if (error) {
        console.error("Error fetching expiring inventory:", error);
        return [];
    }
    return data;
}

export async function fetchExpiredInventory(workspaceId) {
    if (!workspaceId) return [];

    const today = new Date();

    const { data: inventoryIds, error: inventoryError } = await supabase
        .from('inventory')
        .select('id')
        .eq('workspace_id', workspaceId);

    if (inventoryError) {
        console.error("Error fetching inventory IDs:", inventoryError);
        return [];
    }

    const { data, error } = await supabase
        .from('batches')
        .select(`
            *,
            inventory:inventory_id (
                item_name
            )
        `)
        .in('inventory_id', inventoryIds.map(i => i.id))
        .lt('expiration_date', today.toISOString());

    if (error) {
        console.error("Error fetching expired inventory:", error);
        return [];
    }
    return data;
}

export async function addInventoryItems(items) {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return null;

    const newItems = items.map(item => ({
        ...item,
        workspace_id: workspaceId
    }));

    const { data, error } = await supabase
        .from('inventory')
        .insert(newItems)
        .select();

    if (error) {
        console.error("Error adding inventory items:", error);
        return null;
    }
    return data;
}

export async function updateInventoryItem(item) {
    const { data, error } = await supabase
        .from('inventory')
        .update(item)
        .eq('id', item.id)
        .select();

    if (error) {
        console.error("Error updating inventory item:", error);
        return null;
    }
    return data;
}

export async function deleteInventoryItem(itemId) {
    const { data, error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId);

    if (error) {
        console.error("Error deleting inventory item:", error);
        return null;
    }
    return data;
}
