import { useState, useEffect } from "react";
import Box from "@mui/material/Box";

import "./App.css";
import DragAndDropCSV from "./Component/DragnDropCSV";
import ItemCard from "./Component/ItemCard";
import { Button, Typography, Chip } from "@mui/material";

// Access the exposed IPC functions
const dbOps = window?.electron?.dbOps;
if (!dbOps) {
  console.error("Electron IPC not available");
}

const categories = [
  "Dairy",
  "Snacks",
  "Meat",
  "Beverages",
  "Bakery",
  "Frozen",
  "Produce",
];

function App() {
  const [inventoryData, setInventoryData] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [itemsWithExpiration, setItemsWithExpiration] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [itemsWithoutExpiration, setItemsWithoutExpiration] = useState([]);

  // move expired items to expired_inventory table
  const moveExpiredItems = async () => {
    try {
      await dbOps.moveExpiredItems();
      await loadInventoryData();
    } catch (error) {
      console.error("Error moving expired items: ", error);
    }
  };

  useEffect(() => {
    moveExpiredItems();
  }, []);

  const loadInventoryData = async () => {
    try {
      const allItems = await dbOps.getAllItems();
      setInventoryData(allItems);

      // seperate items with and without expiration dates
      const withExpiration = allItems.filter((item) => {
        console.log(item["Expiration Date"]);
        return item["Expiration Date"];
      });
      const withoutExpiration = allItems.filter(
        (item) => !item["Expiration Date"]
      );

      console.log("withExpiration", withExpiration);
      console.log("withoutExpiration", withoutExpiration);

      setItemsWithExpiration(withExpiration);
      setItemsWithoutExpiration(withoutExpiration);
    } catch (error) {
      console.error("Error loading inventory: ", error);
    }
  };

  useEffect(() => {
    if (itemsWithExpiration.length > 0) {
      itemsWithExpiration.forEach((item) => {
        dbOps.updateExpirationDate(
          item["Item Name"],
          item["Category"],
          item["Expiration Date"]
        );
      });
    }
  });

  const handleLoad = async () => {
    await loadInventoryData();
  };

  const handleChipClick = (category) => {
    setSelectedCategories((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(category)) {
        newSelected.delete(category);
      } else {
        newSelected.add(category);
      }
      return newSelected;
    });
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

  const handleExpirationDateChange = async (
    itemName,
    itemCategory,
    newDate
  ) => {
    try {
      // update the expiration date in the database
      await dbOps.updateExpirationDate(itemName, itemCategory, newDate);

      // reload the inventory data
      await loadInventoryData();
    } catch (error) {
      console.error("Error updating expiration date: ", error);
    }
  };

  const handleOnReset = () => {
    setInventoryData([]);
    setFileName(null);
    setItemsWithExpiration([]);
  };

  return (
    <>
      <Typography variant="h3">Expiration Tracker</Typography>
      <Box style={{ minWidth: "500px" }}>
        {/* Pass the state update function as a prop to DragAndDropCSV */}
        <DragAndDropCSV
          setInventoryData={handleNewData}
          setFileName={setFileName}
        />
        <Button variant="outlined" onClick={handleLoad}>
          Load inventory
        </Button>
        {inventoryData.length > 0 && (
          <Button variant="outlined" onClick={handleOnReset}>
            Reset
          </Button>
        )}
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

        {/* chips/tags */}
        <Box>
          {categories.map((category, index) => (
            <Chip
              key={index}
              label={category}
              onClick={() => handleChipClick(category)}
              style={{
                margin: 5,
                backgroundColor: selectedCategories.has(category)
                  ? "#1976d2"
                  : "#464a68",
                color: "white",
              }}
            />
          ))}
        </Box>

        {/* Display the parsed data as ItemCards */}
        <Box
          style={{
            // border: "2px solid white",
            borderRadius: "8px",
            padding: "5px",
            margin: "0 auto",
          }}
        >
          {inventoryData.length == 0 ? (
            <p>It's empty in here, add or import inventory to get started!</p>
          ) : (
            itemsWithoutExpiration.length > 0 && (
              <Box
                display="flex"
                flexWrap="wrap"
                style={{ justifyContent: "center", alignItems: "center" }}
                gap={2}
              >
                {getFilteredItems(itemsWithoutExpiration).map((item) => (
                  <ItemCard
                    key={`${item["Item Name"]}-${item["Category"]}`}
                    title={item["Item Name"] || "Unknown Item"} // Adjust based on your CSV column names
                    expirationDate={item["Expiration Date"] || null} // Same here
                    category={item["Category"] || "Unknown Category"}
                    quantity={item["Quantity"]}
                    onDateChange={(newDate) =>
                      handleExpirationDateChange(
                        item["Item Name"],
                        item["Category"],
                        newDate
                      )
                    }
                  />
                ))}
              </Box>
            )
          )}

          {itemsWithExpiration.length > 0 && (
            <Box mt={4}>
              <Typography variant="h5">Items with Expiration Dates:</Typography>
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
                {getFilteredItems(itemsWithExpiration).map((item, index) => (
                  <ItemCard
                    key={`${item["Item Name"]}-${item["Category"]}`}
                    title={item["Item Name"] || "Unknown Item"}
                    expirationDate={item["Expiration Date"] || null}
                    category={item["Category"] || "Unknown Category"}
                    quantity={item["Quantity"]}
                    onDateChange={(newDate) =>
                      handleExpirationDateChange(
                        item["Item Name"],
                        item["Category"],
                        newDate
                      )
                    }
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

export default App;
