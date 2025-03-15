import {
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const categoryEmojis = {
  Dairy: "🥛",
  Snacks: "🍿",
  Meat: "🍖",
  Beverages: "🥤",
  Bakery: "🍞",
  Frozen: "❄️",
  Produce: "🍏",
};

export default function ExpiredItemCard({ title, expirationDate, onRestore }) {
  return (
    <>
      <Card
        style={{
          minWidth: 300,
          maxWidth: 570,
          display: "flex",
          flexDirection: "column",
          padding: "5px",
        }}
      >
        <CardContent>
          <Typography variant="body1" component="div">
            {title}
          </Typography>
          <Typography
            gutterBottom
            sx={{ color: "text.secondary", fontSize: 12 }}
          >
            Expired on:
            {expirationDate
              ? dayjs(expirationDate).format("MM/DD/YYYY")
              : " No date selected"}
          </Typography>

          <Box style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <Button variant="contained" color="success" onClick={onRestore}>
              Restore Item
            </Button>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
