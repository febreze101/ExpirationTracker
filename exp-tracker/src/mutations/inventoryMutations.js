import { addInventoryItems, deleteInventoryItem, updateInventoryItem } from "../api/inventory";

export function addInventoryItemsMutation(queryClient) {
    return {
        mutationFn: addInventoryItems,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventoryData'] });
        }
    }
}

export function updateInventoryItemMutation(queryClient) {
    return {
        mutationFn: updateInventoryItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventoryData'] });
        }
    }
}

export function deleteInventoryItemMutation(queryClient) {
    return {
        mutationFn: deleteInventoryItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventoryData'] });
        }
    }
}