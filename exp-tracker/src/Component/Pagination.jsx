import React from "react";
import { Button, Box, Typography } from "@mui/material";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      mt={2}
      gap={1}
    >
      <Button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      <Typography>
        {" "}
        Page {currentPage} of {totalPages}
      </Typography>
      <Button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </Box>
  );
}
