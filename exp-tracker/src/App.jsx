import React, { useState, useEffect, useCallback } from "react";
import {
  createTheme,
  ThemeProvider,
} from "@mui/material";

import { theme } from "./utils/theme";
import { Routes, Route, Navigate, BrowserRouter as Router } from 'react-router-dom';
import DashboardPage from "./Component/Pages/DashbaordPage";
import NewItemsPage from "./Component/Pages/NewItemsPage";
import ExpiringItemsPage from "./Component/Pages/ExpiringItemsPage";
import ExpiredItemsPage from "./Component/Pages/ExpiredItemsPage";
import Layout from "./Component/Layout";
import { useAlert } from "./context/AlertContext";
import { importDbFromZip } from "./utils/importDbFromZip";
import Settings from "./Component/Pages/Settings";
import { supabase } from "./utils/supabaseClient";
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import LandingPage from "./Component/Pages/LandingPage";
import useInventory from "./hooks/useInventory";

// Access the exposed IPC functions
const dbOps = window?.electron?.dbOps;
if (!dbOps) {
  console.error("Electron IPC not available");
}


function App() {
  const [_, setInventoryData] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [itemsWithExpiration, setItemsWithExpiration] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(localStorage.getItem('hasCompletedOnboarding') !== "true");
  const MemoizedLayout = React.memo(Layout);
  const [emails, setEmails] = useState([]);

  const { showAlert } = useAlert();

  const [session, setSession] = useState(null);

  const {
    inventoryQuery,
    expiringInventoryQuery,
    expiredInventoryQuery,
    addInventoryMutation,
    updateInventoryMutation,
    deleteInventoryMutation
  } = useInventory();

  useEffect(() => {
    if (inventoryQuery.data) {
      // setInventoryData(inventoryData);
      console.log("Inventory data loaded:", inventoryQuery.data);
    }

  }, [inventoryQuery]);


  useEffect(() => {
    if (expiredInventoryQuery.data) {
      console.log("Expired inventory data loaded:", expiredInventoryQuery.data);
      setExpiredItems(expiredInventoryQuery.data);
    }
  }, [expiredInventoryQuery])

  useEffect(() => {
    const checkSession = async () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        console.log("Current session:", session);
        // if (session) {
        //   // User is logged in, load inventory data
        //   loadInventoryData();
        // } else {
        //   // User is not logged in, redirect to login page
        //   window.location.href = '/login';
        // }
      })

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        console.log("Auth state changed:", event, session);
      })

      return () => subscription.unsubscribe();
    }

    checkSession();

  }, [])


  useEffect(() => {
    // console.log('showOnboarding', showOnboarding)
    const determineOnboardingStatus = async () => {

      const firstLaunch = await dbOps.isFirstLaunch();
      if (firstLaunch) {
        setShowOnboarding(true);
        return;
      }

      const onboardingCompleted = await dbOps.isOnboardingComplete();
      console.log("onboardingCompleted", onboardingCompleted);

      setShowOnboarding(!onboardingCompleted);

      localStorage.setItem('hasCompletedOnboarding', 'true')
    }

    determineOnboardingStatus();
  }, [])


  const handleExpired = async (item) => {
    console.log('expiring item: ', item)
    try {

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dateString = today.toISOString();

      console.log("Expiring item:", item, "with date:", dateString);

      const ret = await dbOps.setAsExpired(item);

      console.log(`Expired result: ${ret}`)

      // Reload inventory data
      await loadInventoryData();
      await getExpiredItems();


      // const expired = await dbOps.moveExpiredItems(item);
      // if (expired.length > 0) {
      //   dbOps.deleteItem(item);
      // }
    } catch (error) {
      console.error("Error updating expiration date: ", error);

    }
  };

  // move expired items to expired_inventory table
  const moveExpiredItems = async () => {
    try {
      const expired = await dbOps.moveExpiredItems();

      if (expired.length > 0) {
        const message = `${expired.length} item(s) moved to expired inventory.`

        showAlert(message, 'success')
      }

      await loadInventoryData();
      await getExpiredItems();
    } catch (error) {
      console.error("Error moving expired items:", error);
      const message = "An error occurred while moving expired items.";

      showAlert(message, 'error')
    }
  };

  const getExpiredItems = async () => {
    const expiredItems = await dbOps.getExpiredItems();
    console.log("expiredItems", expiredItems);
    setExpiredItems(expiredItems);
  };

  const fetchEmails = useCallback(async () => {
    if (!dbOps) return [];
    const result = await dbOps.getNotificationEmails();
    console.log("Fetched emails in App.jsx: ", result);

    setEmails(result || []);
    return result || [];
  }, [setEmails])

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails])

  useEffect(() => {
    moveExpiredItems();
    getExpiredItems();
  }, []);

  const loadInventoryData = useCallback(async () => {
    try {
      const allItems = await dbOps.getAllItems();
      setInventoryData(allItems);

      // seperate items with and without expiration dates
      const withExpiration = allItems.filter((item) => {
        return item["date_set"] === 1;
      });
      const withoutExpiration = allItems.filter((item) => {
        return item["date_set"] === 0
      });

      setItemsWithExpiration(withExpiration);
      setNewItems(withoutExpiration);

    } catch (error) {
      console.error("Error loading inventory: ", error);
    }
  }, []);

  const getExpirationDetails = async (item) => {
    const details = await dbOps.getExpirationDetails(item)

    return details
  }

  // handle new data from csv
  const handleNewData = async (data) => {
    try {
      const result = await dbOps.addItems(data);
      if (result) {
        await loadInventoryData();
        setFileName(fileName);

        const message = `File successfully imported!`
        showAlert(message, 'success')
      } else {
        const message = `Failed to import inventory. Try again!`
        showAlert(message, 'error')
      }
    } catch (error) {
      console.error("Error adding items: ", error);
      const message = `Failed to import file.`
      showAlert(message, 'error')
    }
  };

  const handleExpirationDateChange = async (itemName, expirationDates) => {
    if (!expirationDates || expirationDates.length < 1) {
      console.error('No dates were selected.')
      return
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // check if the expiration date is in the past
      const formattedDates = expirationDates.map(dateStr => {
        const dateToCheck = new Date(dateStr);
        if (dateToCheck <= today) {
          // show alert
          const message = "Expiration date cannot be in the past";
          showAlert(message, 'error')

          throw new Error('Invalid date: ' + dateStr)
        }

        return dateToCheck.toISOString().slice(0, 19).replace("T", " ");
      });

      // update the expiration date in the database
      await dbOps.updateExpirationDate(itemName, formattedDates);

      const message = `Successfully added new expiration dates for ${itemName}!`
      showAlert(message, 'success')

      // reload the inventory data
      await loadInventoryData();
      await getExpiredItems();
    } catch (error) {
      console.error("Error updating expiration date: ", error);
      const message = `Failed to add new dates. Try again!`
      showAlert(message, 'error')
    }
  };

  const handleAddItem = async (itemName) => {
    dbOps.addItem(itemName);

    await loadInventoryData();
  };

  const exportInventory = async () => {
    console.log("Exporting inventory...");
    dbOps.exportInventory()
  }

  const importInventory = async () => {
    console.log("Importing inventory...");

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.zip'
    input.style.display = 'none'

    input.onchange = async (event) => {
      const file = event.target.files[0]

      if (!file) return;

      try {
        await importDbFromZip(
          file,
          async (tableName, data) => {
            await dbOps.handleTableData(tableName, data);
          },
          (errMsg) => showAlert(errMsg, "error")
        );

        showAlert("Database imported successfully!", "success")
        await loadInventoryData();
        await getExpiredItems();
      } catch (error) {
        showAlert("Failed to import database.", "error");
        console.error(error);
      }
    }

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
    // dbOps.exportInventory()
  }

  const handleAddUser = async (user) => {
    try {
      dbOps.addUser(user);
    } catch (error) {
      console.error('Error adding user: ', error);
    }
  }

  const handleRestore = async (item) => {
    try {
      console.log("Restoring item:", item);
      const result = await dbOps.restoreExpiredItem(item["item_name"]);
      if (result) {
        await loadInventoryData();
        await getExpiredItems();

        const message = `Successfully restored ${item.item_name}!`
        showAlert(message, 'success')
      } else {
        const message = `Failed to restore ${item.item_name}!`
        showAlert(message, 'error')
      }
    } catch (error) {
      console.error("Error restoring expired item: ", error);

      const message = `An error occured while trying to restore ${item.item_name}!`
      showAlert(message, 'error')
    }
  };

  const handleOnDeleteItem = async (item) => {
    try {
      const result = await dbOps.deleteItem(item);
      console.log("finished deleting Item: ", item);

      // reload expired items
      await getExpiredItems();

      const message = `Successfully deleted ${item.item_name} from the expired inventory!`
      showAlert(message, 'success')

    } catch (error) {
      console.error("Error deleting item: ", item);
      const message = `Failed to delete ${item.item_name}. Try again!`
      showAlert(message, 'error')
    }
  }

  return (
    <>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            {/* public routes */}
            <Route path="/landing" element={<LandingPage />} />

            {/* auth route */}
            <Route path="/auth" element={
              !session
                ? <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
                : (<Navigate to="/dashboard" replace />)
            } />


            {/* protected routes */}
            {/* nested routes */}
            <Route
              path="/"
              element={
                <MemoizedLayout handleAddItem={handleAddItem} exportInventory={exportInventory} importInventory={importInventory} />
              }
            >
              {/* <Route path="/" element={<DashboardPage handleNewData={handleNewData} setFileName={setFileName} />} /> */}
              <Route
                index
                path="dashboard"
                element={
                  <DashboardPage handleNewData={handleNewData} setFileName={setFileName} />
                }
              />
              <Route
                path="new-items"
                element={
                  <NewItemsPage
                    items={newItems}
                    handleExpirationDateChange={handleExpirationDateChange}
                    handleExpired={handleExpired}
                  />
                }
              />
              <Route
                path="expiring-items"
                element={
                  <ExpiringItemsPage
                    getExpirationDetails={getExpirationDetails}
                    items={itemsWithExpiration}
                    handleExpirationDateChange={handleExpirationDateChange}
                    handleExpired={handleExpired}
                  />
                }
              />
              <Route
                path="expired-items"
                element={
                  <ExpiredItemsPage
                    items={expiredItems}
                    handleRestore={handleRestore}
                    handleOnDeleteItem={handleOnDeleteItem}
                  />
                }
              />
              <Route
                path="settings"
                element={
                  <Settings
                    fetchEmails={fetchEmails}
                    dbOps={dbOps}
                    emails={emails}
                  />
                }
              />
            </Route>
          </Routes>

          {/* onboarding routes */}
        </Router>
      </ThemeProvider>

    </>
  );
}

export default App;