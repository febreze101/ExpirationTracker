import { useState, useEffect } from "react";
import Box from "@mui/material/Box";

import "./App.css";
import DragAndDropCSV from "./Component/DragnDropCSV";
import ItemCard from "./Component/ItemCard";
import ExpiredItemCard from "./Component/ExpiredItemCard";
import ItemCardwithExpirationSet from "./Component/ItemCardwithExpirationSet";
import dayjs from "dayjs";
import {
  Button,
  Typography,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  createTheme,
  ThemeProvider,
} from "@mui/material";


import { BrowserRouter, Routes, Route, NavLink } from 'react-router';

import NewItemForm from "./Component/NewItemForm";

import ItemsAccordion from "./Component/ItemsAccordion";
import DashboardPage from "./Component/Pages/DashbaordPage";
import NewItemsPage from "./Component/Pages/NewItemsPage";
import ExpiringItemsPage from "./Component/Pages/ExpiringItemsPage";
import ExpiredItemsPage from "./Component/Pages/ExpiredItemsPage";
import Layout from "./Component/Layout";
import UpdatedExpiringCard from "./Component/ItemCards/UpdatedExpiringCard";
import UpdatedExpiredItemCard from "./Component/ItemCards/UpdatedExpiredCard";
import UpdatedNewItemForm from "./Component/PopUps/UpdatedNewItemForm";
import UpdatedConfirmDiag from "./Component/PopUps/UpdatedConfirmDiag";
import UpdatedNewItemCard from "./Component/ItemCards/UpdatedNewItemCard";
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
  }
})

function App() {
  const [inventoryData, setInventoryData] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [itemsWithExpiration, setItemsWithExpiration] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [itemsWithoutExpiration, setItemsWithoutExpiration] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [isExpired, setIsExpired] = useState(false);
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  const [expanded, setExpanded] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("error");

  const handleChange = (panel) => (event, newExpanded) => {
    // console.log("panel", panel);
    // console.log("newExpanded", newExpanded);
    setExpanded(!newExpanded);
  };

  const handleExpired = async (item) => {
    try {
      setIsExpired(true);
      if (isExpired) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dateString = today.toISOString();

        console.log("Expiring item:", item, "with date:", dateString);

        // update the expiration date in the database
        await dbOps.updateExpirationDate(item["Item Name"], dateString);

        await dbOps.moveExpiredItems();

        // Reload inventory data
        await loadInventoryData();
        await getExpiredItems();
      }
    } catch (error) {
      console.error("Error updating expiration date: ", error);

      // revert the isExpired state
      setIsExpired(!isExpired);
    }
  };

  const handleShowAddItemForm = () => {
    setShowAddItemForm(!showAddItemForm);
  };

  // Add handleAlertClose function
  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertOpen(false);
  };

  // move expired items to expired_inventory table
  const moveExpiredItems = async () => {
    try {
      await loadInventoryData();
    } catch (error) {
      console.error("Error moving expired items: ", error);
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

  const loadInventoryData = async () => {
    try {
      const allItems = await dbOps.getAllItems();
      setInventoryData(allItems);

      // seperate items with and without expiration dates
      const withExpiration = allItems.filter((item) => {
        return item["Expiration Date"];
      });
      const withoutExpiration = allItems.filter(
        (item) => !item["Expiration Date"]
      );

      setItemsWithExpiration(withExpiration);
      setItemsWithoutExpiration(withoutExpiration);
    } catch (error) {
      console.error("Error loading inventory: ", error);
    }
  };

  const handleLoad = async () => {
    await loadInventoryData();
  };

  // handle new data from csv
  // Todo: check the data for dupes first before adding to the table
  const handleNewData = async (data) => {
    try {
      await dbOps.addItems(data);
      await loadInventoryData();
      setFileName(fileName);
    } catch (error) {
      console.error("Error adding items: ", error);
    }
  };

  const handleExpirationDateChange = async (itemName, expirationDate) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // check if the expiration date is in the past
      const dateToCheck = new Date(expirationDate);
      if (dateToCheck <= today) {
        setAlertMessage("Expiration date cannot be in the past");
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }

      // Format date for SQLite
      const formattedDate = dateToCheck
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      console.log("Sending to DB:", { itemName, formattedDate });

      // update the expiration date in the database
      await dbOps.updateExpirationDate(itemName, formattedDate);

      // reload the inventory data
      await loadInventoryData();
      await getExpiredItems();
    } catch (error) {
      console.error("Error updating expiration date: ", error);
    }
  };

  const handleAddItem = async (itemName, expirationDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(expirationDate);

    if (dateToCheck <= today) {
      setAlertMessage("Expiration date cannot be in the past");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }
    const formattedDate = expirationDate
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    console.log("Adding item:", itemName, formattedDate);
    try {
      await dbOps.updateExpirationDate(itemName, formattedDate);
      await loadInventoryData();
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  const handleOnReset = () => {
    setInventoryData([]);
    setFileName(null);
    setItemsWithExpiration([]);
  };

  const handleRestore = async (item) => {
    try {
      console.log("Restoring item:", item);
      await dbOps.restoreExpiredItem(item["item_name"]);
      await loadInventoryData();
      await getExpiredItems();
    } catch (error) {
      console.error("Error restoring expired item: ", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>

      {/* <Stack gap={2}>
        <UpdatedExpiringCard
          title="Jacobsen Salt Co. Pure Sea Salt"
          expirationDate={dayjs().add(7, 'day')}  // Default to 7 days from today
          onDateChange={(date) => console.log("New expiration date:", date)}
          onExpired={() => console.log("Item marked as expired")}
        />

        <UpdatedExpiredItemCard />

        <UpdatedNewItemForm />

        <UpdatedConfirmDiag />

        <UpdatedNewItemCard />
      </Stack> */}

      {/* Router */}
      <Routes>
        <Route
          element={
            <Layout
              handleShowAddItemForm={handleShowAddItemForm}
            />
          }
        >
          <Route path="/" element={<DashboardPage handNewDate={handleNewData} setFileName={setFileName} />} />
          <Route
            path="/dashboard"
            element={
              <DashboardPage />
            }
          />
          <Route
            path="/new-items"
            element={
              <NewItemsPage
                expanded={expanded}
                // handleChange={handleChange}
                items={itemsWithoutExpiration}
                handleExpirationDateChange={handleExpirationDateChange}
                handleExpired={handleExpired}
              />
            }
          />
          <Route
            path="/expiring-items"
            element={
              <ExpiringItemsPage
                expanded={expanded}
                // handleChange={handleChange}
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
                handleExpirationDateChange={handleExpirationDateChange}
                handleRestore={handleRestore}
              />
            }
          />
        </Route>

      </Routes>

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
