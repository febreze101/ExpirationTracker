import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loadInventoryQuery, loadExpiringInventoryQuery, LoadExpiredInventoryQuery } from "../queryOptions/inventoryQueries";
import { addInventoryItemsMutation, updateInventoryItemMutation, deleteInventoryItemMutation } from "../mutations/inventoryMutations";
import { useUser } from "../Component/UserProvider";
import { useEffect } from "react";

// This hook returns the queries for use in components
export default function useInventory(session) {
    const queryClient = useQueryClient();

    const { workspace } = useUser();

    useEffect(() => {
        console.log("Workspace ID:", workspace?.workspace_id);
    }, [workspace]);

    // Fetching all inventory, expiring inventory, and expired inventory using React Query
    const inventoryQuery = useQuery({ ...loadInventoryQuery(workspace?.workspace_id), enabled: !!session && !!workspace?.workspace_id });
    const expiringInventoryQuery = useQuery({ ...loadExpiringInventoryQuery(workspace?.workspace_id), enabled: !!session && !!workspace?.workspace_id });
    const expiredInventoryQuery = useQuery({ ...LoadExpiredInventoryQuery(workspace?.workspace_id), enabled: !!session && !!workspace?.workspace_id });

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