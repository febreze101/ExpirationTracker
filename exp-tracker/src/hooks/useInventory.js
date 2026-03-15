import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loadInventoryQuery, loadExpiringInventoryQuery, LoadExpiredInventoryQuery } from "../queryOptions/inventoryQueries";
import { addInventoryItemsMutation, updateInventoryItemMutation, deleteInventoryItemMutation } from "../mutations/inventoryMutations";

// This hook returns the queries for use in components
export default function useInventory(session) {
    const queryClient = useQueryClient();

    // Fetching all inventory, expiring inventory, and expired inventory using React Query
    const inventoryQuery = useQuery({ ...loadInventoryQuery(), enabled: !!session });
    const expiringInventoryQuery = useQuery({ ...loadExpiringInventoryQuery(), enabled: !!session });
    const expiredInventoryQuery = useQuery({ ...LoadExpiredInventoryQuery(), enabled: !!session });

    // These mutations will automatically invalidate the inventory queries on success
    // Mutation for adding inventory items
    const addInventoryMutation = useMutation(addInventoryItemsMutation(queryClient));

    // Mutation for updating and deleting inventory items
    const updateInventoryMutation = useMutation(updateInventoryItemMutation(queryClient));

    // Mutation for deleting inventory items
    const deleteInventoryMutation = useMutation(deleteInventoryItemMutation(queryClient));

    return {
        inventoryQuery, 
        expiringInventoryQuery,
        expiredInventoryQuery,
        addInventoryMutation,
        updateInventoryMutation,
        deleteInventoryMutation
    }
}