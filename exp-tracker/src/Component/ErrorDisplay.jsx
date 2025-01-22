import React from "react";
import { Box } from "@mui/material";

export default function ErrorDisplay({ error }) {
  return error ? (
    <Box styles={{ color: "red", marginTop: 10 }}>{error}</Box>
  ) : null;
}
