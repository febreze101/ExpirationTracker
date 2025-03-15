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
      <Typography variant="h3">SpoilSport</Typography>
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
        {/* END HEADER SECTION */}

        {/* START ITEM WITHOUT EXPIRATION SECTION */}
        <Accordion
          expanded={expanded === "panel1"}
          onChange={handleChange("panel1")}
        >
          <AccordionSummary>
            <Typography>Untracked Items</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              style={{
                // border: "2px solid white",
                borderRadius: "8px",
                padding: "5px",
                margin: "0 auto",
              }}
            >
              {inventoryData.length == 0 ? (
                <p>
                  It's empty in here, add or import inventory to get started!
                </p>
              ) : (
                itemsWithoutExpiration.length > 0 && (
                  <Box mt={4}>
                    <Typography variant="h5">Untracked Items</Typography>
                    <Box
                      display="flex"
                      flexWrap="wrap"
                      style={{ justifyContent: "center", alignItems: "center" }}
                      gap={2}
                    >
                      {getFilteredItems(itemsWithoutExpiration).map(
                        (item, index) => (
                          <ItemCard
                            key={`${item["Item Name"] || "Unknown Item"}-${
                              item["Expiration Date"] ||
                              "Unknown Expiration Date"
                            }-${index}`}
                            title={item["Item Name"] || "Unknown Item"} // Adjust based on your CSV column names
                            expirationDate={item["Expiration Date"] || null} // Same here
                            onDateChange={(newDate) =>
                              handleExpirationDateChange(
                                item["Item Name"],
                                newDate
                              )
                            }
                            onExpired={() => handleExpired(item)}
                          />
                        )
                      )}
                    </Box>
                  </Box>
                )
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* START ITEM WITH EXPIRATION SECTION */}
        <Accordion
          expanded={expanded === "panel2"}
          onChange={handleChange("panel2")}
        >
          <AccordionSummary>
            <Typography>Expiring Soon</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              style={{
                // border: "2px solid white",
                borderRadius: "8px",
                padding: "5px",
                margin: "0 auto",
              }}
            >
              {itemsWithExpiration.length > 0 && (
                <Box mt={4}>
                  <Typography variant="h5">
                    Upcoming Expiration Dates:
                  </Typography>
                  <p>
                    Number of items with Expiration Dates:{" "}
                    {itemsWithExpiration.length}
                  </p>
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    style={{ justifyContent: "center", alignItems: "center" }}
                    gap={2}
                  >
                    {getFilteredItems(itemsWithExpiration).map(
                      (item, index) => (
                        <ItemCardwithExpirationSet
                          key={`${item["Item Name"] || "Unknown Item"}-${
                            item["Expiration Date"] || "Unknown Expiration Date"
                          }-${index}`}
                          title={item["Item Name"] || "Unknown Item"}
                          expirationDate={item["Expiration Date"] || null}
                          onDateChange={(newDate) =>
                            handleExpirationDateChange(
                              item["Item Name"],
                              newDate
                            )
                          }
                          onExpired={() => handleExpired(item)}
                        />
                      )
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* START EXPIRED ITEMS SECTION */}
        <Accordion
          expanded={expanded === "panel3"}
          onChange={handleChange("panel3")}
        >
          <AccordionSummary>
            <Typography>Remove Immediately</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {expiredItems.length > 0 && (
              <Box mt={4}>
                <Typography variant="h5">Expired Items:</Typography>
                <p>Number of expired items: {expiredItems.length}</p>
                <Box
                  display="flex"
                  flexWrap="wrap"
                  style={{ justifyContent: "center", alignItems: "center" }}
                  gap={2}
                >
                  {expiredItems.map((item, index) => (
                    <ExpiredItemCard
                      key={`${item["item_name"] || "Unknown Item"}-${
                        item["expiration_date"] || "Unknown Expiration Date"
                      }-${index}`}
                      title={item["item_name"] || "Unknown Item"}
                      expirationDate={item["expiration_date"] || null}
                      onDateChange={(newDate) =>
                        handleExpirationDateChange(item["item_name"], newDate)
                      }
                      onRestore={() => handleRestore(item)}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
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
