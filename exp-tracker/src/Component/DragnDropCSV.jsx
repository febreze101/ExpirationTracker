import React, { useEffect, useState, useRef } from "react";
import { parseCSV, uploadToServer } from "../utils/fileParser";
import { Box, Typography, Button, styled } from "@mui/material";
import ErrorDisplay from "./ErrorDisplay";
import uploadCloud from './../assets/upload-to-cloud.svg'
import { useAlert } from "../context/AlertContext.jsx";

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
  const selectedFile = useRef(null);
  const { showAlert } = useAlert();

  // On drop
  const handleFileUpload = async () => {

    console.log('handle file upload called');
    
    if (selectedFile && selectedFile.current) {
        
        // csv files 
        console.log("Selected file:", selectedFile.current);

        if (selectedFile.current.type === "text/csv") {
          setFileName(selectedFile.current.name);
          
          // parse the CSV file and clean the data 
          const cleanedData = await parseCSV(selectedFile.current, setError);
          
          // upload the cleaned data to the server
          console.log("Cleaned Data:", cleanedData);
          console.log("About to upload to server...");
          await uploadToServer(cleanedData)
        } else {
          setError("Please drop a valid CSV.");
          const message = 'Please drop a valid CSV.';
          showAlert(message, 'error');
      }
    }
  };

  const handleDragOpen = (e) => {
    console.log('File dropped:', e.dataTransfer.files);
    try {
      e.preventDefault();
      e.stopPropagation();

      // If no files are dropped, show an error message
      if (e.dataTransfer.files.length === 0) {
        const message = 'No file dropped. Please drop a valid CSV.';
        setError(message);
        showAlert(message, 'error');
      }
      selectedFile.current = e.dataTransfer.files[0];;
      handleFileUpload();

    } catch (error) {
      const message = 'Error uploading file.'
      console.error('Error uplodaing the file.', error)
      showAlert(message, 'error');
    }
  }

  const handleDiagOpen = (e) => {
    try {
      const file = e.target.files[0];
      
      if (!file) {
        const message = 'No file selected. Please choose a valid CSV.';
        setError(message);
        showAlert(message, 'error');
        return;
      }

      selectedFile.current = file;
      handleFileUpload();

    } catch (error) {
      const message = 'Error uploading file.'
      console.error('Error uplodaing the file.', error)
      showAlert(message, 'error');
    }
  }

  // On drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <Box
        onDrop={handleDragOpen}
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
              onChange={handleDiagOpen}
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
