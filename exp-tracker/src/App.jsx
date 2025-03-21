import { useState, useEffect } from "react";
import Box from "@mui/material/Box";

import "./App.css";
import DragAndDropCSV from "./Component/DragnDropCSV";
import ItemCard from "./Component/ItemCard";
import ExpiredItemCard from "./Component/ExpiredItemCard";
import ItemCardwithExpirationSet from "./Component/ItemCardwithExpirationSet";
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
} from "@mui/material";
import NewItemForm from "./Component/NewItemForm";

import ItemsAccordion from "./Component/ItemsAccordion";
// Access the exposed IPC functions
const dbOps = window?.electron?.dbOps;
if (!dbOps) {
  console.error("Electron IPC not available");
}

function App() {
  const [inventoryData, setInventoryData] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [itemsWithExpiration, setItemsWithExpiration] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [itemsWithoutExpiration, setItemsWithoutExpiration] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [isExpired, setIsExpired] = useState(false);
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  const [expanded, setExpanded] = useState("panel1");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("error");

  const handleChange = (panel) => (event, newExpanded) => {
    console.log("panel", panel);
    console.log("newExpanded", newExpanded);
    setExpanded(newExpanded ? panel : false);
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

  // useEffect(() => {
  //   if (itemsWithExpiration.length > 0) {
  //     itemsWithExpiration.forEach((item) => {
  //       dbOps.updateExpirationDate(item["Item Name"], item["Expiration Date"]);
  //     });
  //   }
  // });

  const handleLoad = async () => {
    await loadInventoryData();
  };

  // Update the filtered items when the selected categories change
  const getFilteredItems = (items) => {
    if (selectedCategories.size === 0) {
      return items; // show all items if no categories are selected
    }
    return items.filter((item) => selectedCategories.has(item["Category"]));
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
    <>
      {/* START HEADER SECTION */}
      <Typography variant="h3">Spoilage Tracker</Typography>
      <Box style={{ minWidth: "500px", width: "100%" }}>
        {/* Pass the state update function as a prop to DragAndDropCSV */}
        <DragAndDropCSV
          setInventoryData={handleNewData}
          setFileName={setFileName}
        />
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" onClick={handleLoad}>
            Load inventory
          </Button>
          {inventoryData.length > 0 && (
            <Button variant="outlined" onClick={handleOnReset}>
              Reset
            </Button>
          )}
          <Button variant="outlined" onClick={handleShowAddItemForm}>
            Add Item
          </Button>
          <NewItemForm
            open={showAddItemForm}
            handleClose={handleShowAddItemForm}
            onAddItem={(itemName, expirationDate) =>
              handleAddItem(itemName, expirationDate)
            }
          />
        </Stack>
        <Typography>
          {inventoryData.length > 0 ? (
            <>
              {fileName && <p>File Name: {fileName}</p>}
              <p>
                Number of items without Expiration Dates:{" "}
                {itemsWithoutExpiration.length}
              </p>
            </>
          ) : null}
        </Typography>

        {/* START UNTRACKED ITEMS SECTION */}
        <ItemsAccordion
          expanded={expanded}
          chipColor="success"
          panel="panel1"
          handleChange={handleChange}
          title="Untracked Items"
          searchLabel="Search Untracked Items"
          items={itemsWithoutExpiration}
          ItemComponent={ItemCard}
          handleExpirationDateChange={handleExpirationDateChange}
          handleExpired={handleExpired}
        />

        {/* START EXPIRING ITEMS SECTION */}
        <ItemsAccordion
          expanded={expanded}
          chipColor="warning"
          panel="panel2"
          handleChange={handleChange}
          title="Expiring Soon"
          searchLabel="Search Items Expiring Soon"
          items={itemsWithExpiration}
          ItemComponent={ItemCardwithExpirationSet}
          handleExpirationDateChange={handleExpirationDateChange}
          handleExpired={handleExpired}
        />

        {/* START EXPIRED ITEMS SECTION */}
        <ItemsAccordion
          expanded={expanded}
          chipColor="error"
          panel="panel3"
          handleChange={handleChange}
          title="Remove Immediately"
          searchLabel="Search Expired Items"
          items={expiredItems}
          ItemComponent={ExpiredItemCard}
          handleExpirationDateChange={handleExpirationDateChange}
          handleRestore={handleRestore}
        />
      </Box>

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
    </>
  );
}

export default App;
