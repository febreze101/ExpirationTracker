import {
  Modal,
  Backdrop,
  Fade,
  Box,
  Typography,
  TextField,
  Stack,
  Button,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";

export default function NewItemForm({ open, handleClose, onAddItem }) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      itemName: "",
      expirationDate: dayjs(),
    },
  });

  const onSubmit = (data) => {
    onAddItem(data.itemName, data.expirationDate);
    handleClose();
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "gray",
            padding: 20,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "30%",
            border: "1px solid black",
            borderRadius: 24,
          }}
        >
          <Typography id="transition-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack direction="column" spacing={2}>
              <TextField
                {...register("itemName", { required: "Item name is required" })}
                label="Item Name"
                error={!!errors.itemName}
                helperText={errors.itemName?.message}
              />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="expirationDate"
                  control={control}
                  rules={{ required: "Expiration date is required" }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Expiration Date"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!errors.expirationDate}
                          helperText={errors.expirationDate?.message}
                        />
                      )}
                    />
                  )}
                />
              </LocalizationProvider>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ width: "50%", alignSelf: "center" }}
              >
                Add Item
              </Button>
            </Stack>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
}
