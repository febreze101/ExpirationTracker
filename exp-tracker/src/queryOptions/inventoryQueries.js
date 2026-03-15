import { fetchExpiredInventory, fetchInventory, fetchExpiringInventory } from "../api/inventory";
import { queryOptions } from "@tanstack/react-query";

export function LoadExpiredInventoryQuery() {
    return queryOptions({
        queryKey: ['expiredInventory'],
        queryFn: fetchExpiredInventory,
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        retry: false,
    });
}

export function loadExpiringInventoryQuery() {
    return queryOptions({
        queryKey: ['expiringInventory'],
        queryFn: fetchExpiringInventory,
        staleTime: 1000 * 60 * 60, // 1 hour
        cacheTime: 1000 * 60 * 60 * 24, //
        refetchOnWindowFocus: false,
    });
}

export function loadInventoryQuery() {
    return queryOptions({
        queryKey: ['inventoryData'],
        queryFn: fetchInventory,
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        retry: true, // Retry on failure
    });
}