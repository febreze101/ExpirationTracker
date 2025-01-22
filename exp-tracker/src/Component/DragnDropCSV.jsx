import React, { useState } from "react";
import { parseCSV, parseExcel } from "../utils/fileParser";
import { Box, Typography, Button } from "@mui/material";
import ErrorDisplay from "./ErrorDisplay";

const DragAndDropCSV = ({ setInventoryData, setFileName }) => {
  const [error, setError] = useState(null);

  // On drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];

    if (file) {
      // csv fiels
      if (file.type === "text/csv") {
        setFileName(file.name);
        parseCSV(file, setInventoryData, setError);
      } else if (
        //xlsl file
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {
        setFileName(file.name);
        // Handle Excel file types
        parseExcel(file, setInventoryData, setError);
      } else {
        setError("Please drop a valid CSV or Excel file");
      }
    }
  };

  // On drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: "2px dashed #aaa",
          padding: "20px",
          textAlign: "center",
          width: "300px",
          margin: "20px auto",
          borderRadius: "8px",
        }}
      >
        <h3>Drag and Drop Your Inventory Here</h3>
        <ErrorDisplay
          error={error}
          style={{
            color: "red",
            marginTop: "10px",
          }}
        />
      </Box>
    </>
  );
};

export default DragAndDropCSV;
