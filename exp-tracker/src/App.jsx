import React, { useState, useEffect, useCallback } from "react";
import { ThemeProvider } from "@mui/material";
import { theme } from "./utils/theme";
import { Routes, Route, Navigate, BrowserRouter as Router } from 'react-router-dom';
import DashboardPage from "./Component/Pages/DashbaordPage";
import NewItemsPage from "./Component/Pages/NewItemsPage";
import ExpiringItemsPage from "./Component/Pages/ExpiringItemsPage";
import ExpiredItemsPage from "./Component/Pages/ExpiredItemsPage";
import { useAlert } from "./context/AlertContext";
import Settings from "./Component/Pages/Settings";
import supabase from "./utils/supabaseClient";
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import LandingPage from "./Component/Pages/LandingPage";
import useInventory from "./hooks/useInventory";
import { getNotificationEmails } from "./api/notifications";
import { UserProvider, useUser } from "./Component/UserProvider";
import ProtectedRoute from "./Component/ProtectedRoute";

function App() {
  const [fileName, setFileName] = useState(null);
  const [itemsWithExpiration, setItemsWithExpiration] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [emails, setEmails] = useState([]);

  const { showAlert } = useAlert();
  const { user, workspace, hasWorkspace, loading, joinWorkspace } = useUser();

  const {
    inventoryQuery,
    expiringInventoryQuery,
    expiredInventoryQuery,
    addInventoryMutation,
    updateInventoryMutation,
    deleteInventoryMutation
  } = useInventory(user);

  useEffect(() => {
    if (inventoryQuery.data) {
      console.log("Inventory data loaded:", inventoryQuery.data);
    }
  }, [inventoryQuery.data]);

  useEffect(() => {
    if (expiredInventoryQuery.data) {
      console.log("Expired inventory data loaded:", expiredInventoryQuery.data);
      setExpiredItems(expiredInventoryQuery.data);
    }
  }, [expiredInventoryQuery.data]);

  const fetchEmails = useCallback(async () => {
    if (!user) return;
    const result = await getNotificationEmails();
    setEmails(result || []);
  }, [user]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleNewData = async (data) => {
    try {
      const result = await addInventoryMutation.mutateAsync(data);
      if (result) {
        inventoryQuery.refetch();
        setFileName(fileName);
        showAlert("File successfully imported!", 'success');
      } else {
        showAlert("Failed to import inventory. Try again!", 'error');
      }
    } catch (error) {
      console.error("Error adding items: ", error);
      showAlert("Failed to import file.", 'error');
    }
  };

  const handleExpirationDateChange = async (itemName, expirationDates) => {
    if (!expirationDates || expirationDates.length < 1) {
      console.error('No dates were selected.');
      return;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const formattedDates = expirationDates.map(dateStr => {
        const dateToCheck = new Date(dateStr);
        if (dateToCheck <= today) {
          showAlert("Expiration date cannot be in the past", 'error');
          throw new Error('Invalid date: ' + dateStr);
        }
        return dateToCheck.toISOString().slice(0, 19).replace("T", " ");
      });

      await updateInventoryMutation.mutateAsync({ itemName, expirationDates: formattedDates });
      showAlert(`Successfully added new expiration dates for ${itemName}!`, 'success');
      inventoryQuery.refetch();
      expiredInventoryQuery.refetch();
    } catch (error) {
      console.error("Error updating expiration date: ", error);
      showAlert("Failed to add new dates. Try again!", 'error');
    }
  };

  const handleAddItem = async (itemName) => {
    await addInventoryMutation.mutateAsync([{ 'Item Name': itemName }]);
    inventoryQuery.refetch();
  };

  const handleRestore = async (item) => {
    try {
      const result = await updateInventoryMutation.mutateAsync({ ...item, expired: false });
      if (result) {
        inventoryQuery.refetch();
        expiredInventoryQuery.refetch();
        showAlert(`Successfully restored ${item.item_name}!`, 'success');
      } else {
        showAlert(`Failed to restore ${item.item_name}!`, 'error');
      }
    } catch (error) {
      console.error("Error restoring expired item: ", error);
      showAlert(`An error occurred while trying to restore ${item.item_name}!`, 'error');
    }
  };

  const handleOnDeleteItem = async (item) => {
    try {
      await deleteInventoryMutation.mutateAsync(item.id);
      expiredInventoryQuery.refetch();
      showAlert(`Successfully deleted ${item.item_name} from the expired inventory!`, 'success');
    } catch (error) {
      console.error("Error deleting item: ", item);
      showAlert(`Failed to delete ${item.item_name}. Try again!`, 'error');
    }
  };

  return (
    <Routes>
      <Route path="/" element={
        !user
          ? <LandingPage />
          : <Navigate to="/dashboard" replace />
      } />
      <Route path="/auth" element={
        !user
           ? <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
           : <Navigate to="/dashboard" replace />
      } />
      <Route element={<ProtectedRoute handleAddItem={handleAddItem} />}>
        <Route path="dashboard" element={<DashboardPage handleNewData={handleNewData} setFileName={setFileName} />} />
        <Route path="new-items" element={<NewItemsPage items={newItems} handleExpirationDateChange={handleExpirationDateChange} />} />
        <Route path="expiring-items" element={<ExpiringItemsPage items={itemsWithExpiration} handleExpirationDateChange={handleExpirationDateChange} />} />
        <Route path="expired-items" element={<ExpiredItemsPage items={expiredItems} handleRestore={handleRestore} handleOnDeleteItem={handleOnDeleteItem} />} />
        <Route path="settings" element={<Settings fetchEmails={fetchEmails} emails={emails} />} />
      </Route>
    </Routes>
  );
}

export default App;