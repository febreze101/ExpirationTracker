import React, { useState } from "react";
import { parseCSV, parseExcel } from "../utils/fileParser";
import { Box, Typography, Button } from "@mui/material";
import ErrorDisplay from "./ErrorDisplay";
import uploadCloud from './../assets/upload-to-cloud.svg'

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
        display={'flex'}
        flexDirection={'column'}
        sx={{
          // textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '300px',
          margin: '20px auto',
          borderRadius: '8px',
          border: 2,
          borderStyle: 'dashed',
          borderColor: 'washiPaper',
          borderDasharray: '12 12',
          borderDashoffset: 0,
        }}
      >
        <img src={uploadCloud} />
        <Box display={'flex'}>
          <Typography variant="body1">Drag & drop your inventory here to start tracking or </Typography>
          <Button
            variant="text"
            sx={{
              p: 0,
              minWidth: 'auto',
              textTransform: 'none',
              color: 'inherit',
              '&hover': {
                backgroundColor: 'transparent',
              }
            }}
          >
            <Typography
              variant="body1"
              sx={{
                textDecoration: 'underline',
                color: 'inherit',
                ml: 0.5
              }}
            >
              Choose file
            </Typography>
          </Button>
        </Box>
        <Typography variant="body2">
          Supported formats: XLS, CSV, XLSX
        </Typography>
        <Typography variant="body2">
          Max file size: 10MB
        </Typography>
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
