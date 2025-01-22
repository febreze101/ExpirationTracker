import { useState, useEffect } from "react";
import Box from "@mui/material/Box";

import "./App.css";
import DragAndDropCSV from "./Component/DragnDropCSV";
import ItemCard from "./Component/ItemCard";
import { Button, Typography } from "@mui/material";

function App() {
  const [inventoryData, setInventoryData] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [itemsWithExpiration, setItemsWithExpiration] = useState([]);
  const [_, setExpirationDate] = useState(null);

  useEffect(() => {
    const filteredItems = inventoryData.filter((item) => item.expirationDate);
    setItemsWithExpiration(filteredItems);
    resetDate();
    console.log("date reset");
  }, [inventoryData]);

  // handle updating expiration date for an item
  const handExpirationDateChange = (index, newDate) => {
    const updatedData = [...inventoryData];

    updatedData[index] = {
      ...updatedData[index],
      expirationDate: newDate,
    };

    setInventoryData(updatedData);

    setExpirationDate(null);
  };

  const handleOnReset = () => {
    setInventoryData([]);
    setFileName(null);
    setItemsWithExpiration([]);
  };

  const resetDate = () => {
    setExpirationDate(null); // Reset to null or any default value
  };

  // filter items without expirations dates
  const itemsWithoutExpiration = inventoryData.filter(
    (item) => !item.expirationDate
  );

  return (
    <>
      <Typography variant="h3">Expiration Tracker</Typography>
      <Box style={{ minWidth: "500px" }}>
        {/* Pass the state update function as a prop to DragAndDropCSV */}
        <DragAndDropCSV
          setInventoryData={setInventoryData}
          setFileName={setFileName}
        />
        {inventoryData.length > 0 && (
          <Button variant="outlined" onClick={handleOnReset}>
            Reset
          </Button>
        )}
        {/* <Button variant="outlined" onClick={handleProcessData}>
          Process Data
        </Button> */}
        {/* <Button variant="outlined" onClick={handleShowUpdatedList}>
          show list
        </Button> */}
        <Typography>
          {fileName ? <p>File Name: {fileName}</p> : null}
        </Typography>

        {/* Display the parsed data as ItemCards */}
        {itemsWithoutExpiration.length > 0 && (
          <Box
            display="flex"
            flexWrap="wrap"
            style={{ justifyContent: "center", alignItems: "center" }}
            gap={2}
          >
            {itemsWithoutExpiration.map((item, index) => (
              <ItemCard
                key={index}
                title={item["Item Name"] || "Unknown Item"} // Adjust based on your CSV column names
                expirationDate={item["Expiration Date"] || null} // Same here
                category={item["Category"] || "Unknown Category"}
                quantity={item["Quantity"]}
                onDateChange={(newDate) =>
                  handExpirationDateChange(index, newDate)
                }
              />
            ))}
          </Box>
        )}

        {itemsWithExpiration.length > 0 && (
          <Box mt={4}>
            <Typography variant="h5">Items with Expiration Dates:</Typography>
            <Box
              display="flex"
              flexWrap="wrap"
              style={{ justifyContent: "center", alignItems: "center" }}
              gap={2}
            >
              {itemsWithExpiration.map((item, index) => (
                <ItemCard
                  key={index}
                  title={item["Item Name"] || "Unknown Item"}
                  expirationDate={item["expirationDate"] || null}
                  category={item["Category"] || "Unknown Category"}
                  quantity={item["Quantity"]}
                  onDateChange={() => {}}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}

export default App;
