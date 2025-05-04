import React, { useEffect, useState } from "react";
import { parseCSV, parseExcel } from "../utils/fileParser";
import { Box, Typography, Button, styled } from "@mui/material";
import ErrorDisplay from "./ErrorDisplay";
import uploadCloud from './../assets/upload-to-cloud.svg'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const DragAndDropCSV = ({ handleNewData, setFileName }) => {
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // On drop
  const handleFileUpload = () => {
    // e.preventDefault();
    // e.stopPropagation();


    // const file = e.dataTransfer.files[0];
    if (selectedFile) {
      console.log(selectedFile.type)
      console.log(selectedFile.name)

      if (selectedFile) {
        // csv fiels
        if (selectedFile.type === "text/csv") {
          setFileName(selectedFile.name);
          parseCSV(selectedFile, handleNewData, setError);
        } else if (
          //xlsl file
          selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          selectedFile.type === "application/vnd.ms-excel"
        ) {
          setFileName(selectedFile.name);
          // Handle Excel file types
          parseExcel(selectedFile, handleNewData, setError);
        } else {
          setError("Please drop a valid CSV or Excel file");
        }
      }
    }
  };

  useEffect(() => {
    handleFileUpload()
  }, [selectedFile])

  const handleDragUpload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    console.log(file);

    setSelectedFile(file);

    handleFileUpload();
  }

  const handleButtonUpload = (e) => {
    const file = e.target.files[0];
    console.log(file);

    setSelectedFile(file);
    handleFileUpload();
  }

  // On drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <Box
        onDrop={handleDragUpload}
        onDragOver={handleDragOver}
        display={'flex'}
        flexDirection={'column'}
        sx={{
          // textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '300px',
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
            component="label"
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
            <VisuallyHiddenInput
              type="file"
              onChange={handleButtonUpload}
            />
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
