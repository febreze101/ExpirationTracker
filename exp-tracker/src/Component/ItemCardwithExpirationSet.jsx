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

export default function ItemCardwithExpirationSet({
  title,
  expirationDate,
  category,
  quantity,
  onDateChange,
  onExpired,
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [buttonText, setButtonText] = useState("Edit Expiration");

  const handleDateChange = (newDate) => {
    if (newDate && newDate.isValid()) {
      onDateChange(newDate.toDate());
    }
  };

  const handleShowDatePicker = () => {
    if (!showDatePicker) {
      setButtonText("Done");
    } else {
      setButtonText("Edit Expiration");
    }
    setShowDatePicker(!showDatePicker);
  };

  return (
    <>
      <Card
        style={{
          minWidth: 300,
          maxWidth: 570,
          display: "flex",
          flexDirection: "column",
          padding: "10px 5px",
        }}
      >
        <CardContent>
          <Typography variant="h5" component="div">
            {title}
          </Typography>
          <Typography
            gutterBottom
            sx={{ color: "text.secondary", fontSize: 14 }}
          >
            Expiring on:
            {expirationDate
              ? dayjs(expirationDate).format("MM/DD/YYYY")
              : " No date selected"}
          </Typography>
          <Typography
            gutterBottom
            sx={{ color: "text.secondary", fontSize: 14 }}
          >
            Category: {category} {categoryEmojis[category] || ""}
          </Typography>
          <Typography
            gutterBottom
            sx={{ color: "text.secondary", fontSize: 14 }}
          >
            Count: {quantity != null ? quantity : "unknown quantity"}
          </Typography>

          <Box style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <Button variant="contained" onClick={handleShowDatePicker}>
              {buttonText}
            </Button>
            <Button variant="outlined" color="error" onClick={onExpired}>
              Expired
            </Button>

            {showDatePicker ? (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Select Expiration Date"
                  value={expirationDate ? dayjs(expirationDate) : null}
                  onChange={handleDateChange}
                />
              </LocalizationProvider>
            ) : null}
          </Box>

          {/* Add Datepicker */}
        </CardContent>
      </Card>
    </>
  );
}
