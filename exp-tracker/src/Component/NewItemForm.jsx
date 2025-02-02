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

export default function NewItemForm({ open, handleClose }) {
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
            width: "50%",
            border: "1px solid black",
            borderRadius: 24,
          }}
        >
          <Typography id="transition-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack direction="column" spacing={2}>
            <TextField label="Item Name" />
            <TextField label="Category" />
            <TextField label="Quantity" />
            <TextField label="Expiration Date" />
            <Button variant="contained" color="primary">
              Add Item
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
}
