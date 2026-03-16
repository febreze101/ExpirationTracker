import { fetchExpiredInventory, fetchInventory, fetchExpiringInventory } from "../api/inventory";
import { queryOptions } from "@tanstack/react-query";

export function loadInventoryQuery(workspaceId) {
    return queryOptions({
        queryKey: ['inventoryData', workspaceId],
        queryFn: () => fetchInventory(workspaceId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        retry: true, // Retry on failure
    });
}

export function LoadExpiredInventoryQuery(workspaceId) {
    return queryOptions({
        queryKey: ['expiredInventory', workspaceId],
        queryFn: () => fetchExpiredInventory(workspaceId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        retry: false,
    });
}

export function loadExpiringInventoryQuery(workspaceId) {
    return queryOptions({
        queryKey: ['expiringInventory', workspaceId],
        queryFn: () => fetchExpiringInventory(workspaceId),
        staleTime: 1000 * 60 * 60, // 1 hour
        cacheTime: 1000 * 60 * 60 * 24, //
        refetchOnWindowFocus: false,
    });
}