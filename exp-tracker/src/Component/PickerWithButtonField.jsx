import * as React from "react";

import Button from "@mui/material/Button";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { IconButton } from "@mui/material";

function ButtonField(props) {
  const {
    setOpen,
    label,
    id,
    disabled,
    InputProps: { ref } = {},
    inputProps: { "aria-label": ariaLabel } = {},
  } = props;

  return (
    <Button
      variant="outlined"
      id={id}
      disabled={disabled}
      ref={ref}
      aria-label={ariaLabel}
      onClick={() => setOpen?.((prev) => !prev)}
    >
      <IconButton>
        <CalendarMonthIcon />
      </IconButton>
      {label ? `Current date: ${label}` : "Pick a date"}
    </Button>
  );
}

export default function ButtonDatePicker(props) {
  const [open, setOpen] = React.useState(false);

  return (
    <DatePicker
      slots={{ ...props.slots, field: ButtonField }}
      slotProps={{ ...props.slotProps, field: { setOpen } }}
      {...props}
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    />
  );
}

function PickerWithButtonField() {
  const [value, setValue] = React.useState(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ButtonDatePicker
        label={value == null ? null : value.format("MM/DD/YYYY")}
        value={value}
        onChange={(newValue) => setValue(newValue)}
      />
    </LocalizationProvider>
  );
}
