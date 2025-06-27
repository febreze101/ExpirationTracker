import React, { useState, useEffect, useCallback } from "react";
import {
  createTheme,
  ThemeProvider,
} from "@mui/material";

import { HashRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from "./Component/Pages/DashbaordPage";
import NewItemsPage from "./Component/Pages/NewItemsPage";
import ExpiringItemsPage from "./Component/Pages/ExpiringItemsPage";
import ExpiredItemsPage from "./Component/Pages/ExpiredItemsPage";
import Layout from "./Component/Layout";
import OnboardingForm from "./Component/Onboarding/OnboardingForm";
import { useAlert } from "./context/AlertContext";
import { importDbFromZip } from "./utils/importDbFromZip";

// Access the exposed IPC functions
const dbOps = window?.electron?.dbOps;
if (!dbOps) {
  console.error("Electron IPC not available");
}

const theme = createTheme({
  typography: {
    fontFamily: [
      'adobe-garamond-pro',
      'ff-meta-headline-web-pro',
    ].join(','),
    h1: {
      fontSize: '3.5rem',
      fontFamily: ['adobe-garamond-pro', 'serif'].join(',')
    },
    h2: {
      fontSize: '2.25rem',
      fontFamily: ['adobe-garamond-pro', 'serif'].join(',')
    },
    h3: {
      fontSize: '1rem',
      fontFamily: ['adobe-garamond-pro', 'serif'].join(',')
    },
    body1: {
      fontSize: '1rem',
      fontFamily: ['ff-meta-headline-web-pro', 'sans-serif'].join(',')
    },
    body2: {
      fontSize: '1rem',
      fontFamily: ['ff-meta-headline-web-pro', 'sans-serif'].join(','),
      color: 'rgba(128, 128, 128, 0.5)'
    },
  },
  palette: {
    black: {
      main: '#171717'
    },
    forest: {
      main: '#063B27'
    },
    washiPaper: {
      main: '#F1EAE3'
    },
    red: {
      main: '#91383A'
    },
    Tan: {
      main: '#907C64'
    },
    grey: {
      main: '#444444'
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 480,
      md: 768,
      lg: 1024,
      xl: 1440,
    }
  }
})


function App() {
  const [_, setInventoryData] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [itemsWithExpiration, setItemsWithExpiration] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(localStorage.getItem('hasCompletedOnboarding') !== "true");
  const MemoizedLayout = React.memo(Layout);

  const { showAlert } = useAlert();

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

  return (<>
    <ThemeProvider theme={theme}>
      <HashRouter>
        {showOnboarding ? (
          <OnboardingForm showOnboarding={showOnboarding} setShowOnboarding={setShowOnboarding} handleAddUser={handleAddUser} />
        ) : (
          <Routes>
            <Route
              element={
                <MemoizedLayout handleAddItem={handleAddItem} exportInventory={exportInventory} importInventory={importInventory} />
              }
            >
              <Route path="/" element={<DashboardPage handleNewData={handleNewData} setFileName={setFileName} />} />
              <Route
                path="/dashboard"
                element={
                  <DashboardPage handleNewData={handleNewData} setFileName={setFileName} />
                }
              />
              <Route
                path="/new-items"
                element={
                  <NewItemsPage
                    items={newItems}
                    handleExpirationDateChange={handleExpirationDateChange}
                    handleExpired={handleExpired}
                  />
                }
              />
              <Route
                path="/expiring-items"
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
                path="/expired-items"
                element={
                  <ExpiredItemsPage
                    items={expiredItems}
                    handleRestore={handleRestore}
                    handleOnDeleteItem={handleOnDeleteItem}
                  />
                }
              />
            </Route>
          </Routes>
        )}
      </HashRouter>
    </ThemeProvider>

  </>
  );
}

export default App;