import React, { useState, useCallback } from "react"
import { Box, TextField, Typography, Stack, useTheme, Modal, Fade } from "@mui/material"
import CustomWideButton from "../CustomButtons/CustomWideButton"
import { LocalizationProvider } from "@mui/x-date-pickers";
import ButtonDatePicker from "../PickerWithButtonField";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AddItemConfirmDiag from "./AddItemConfirmDiag";

export default function UpdatedNewItemForm({ handleCancelNewItem, handleAddItem }) {
    const theme = useTheme();

    const [itemName, setItemName] = useState('');

    const [showAddItemConfirm, setShowAddItemConfirm] = useState(false);

    const handleShowAddItemConfirm = useCallback(() => {
        setShowAddItemConfirm(prev => !prev);
    }, []);

    const handleCancel = () => {
        setShowAddItemConfirm(false);
    }

    const handleNewItem = (itemName) => {
        if (itemName.length > 0) {
            console.log(itemName);
            handleAddItem(itemName)
        }


        // setItemName(itemName)
    }

    return (
        <>
            <Box
                width={517}
                minHeight={196}
                bgcolor={theme.palette.forest.main}
                borderRadius={1}
                boxShadow={1}
            >
                {/* Title section */}
                <Box height={61} textAlign="center" alignContent={"center"}>
                    <Typography
                        variant="h3"
                        fontSize={"1.5rem"}
                        color={theme.palette.washiPaper.main}
                        noWrap={true}
                        sx={{ mx: 3 }}
                    >
                        Add New Item
                    </Typography>
                </Box>

                {/* White box containing buttons */}
                <Box
                    bgcolor="white"
                    minHeight={135}
                    sx={{ px: "24px", borderRadius: '0 0 3px 3px' }}
                >
                    <Stack gap={'16px'}>
                        <TextField
                            sx={{
                                width: '100%', '& .MuiInputBase-root': {
                                    height: '46px', // Adjust height here
                                }, mt: '24px'
                            }}
                            label={'Item Name'}
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                        />
                        <Box display={"flex"} justifyContent={"space-between"} gap={"12px"}>
                            <CustomWideButton
                                sx={{ mb: 1, width: "100%" }}
                                bgcolor={theme.palette.black.main}
                                onClick={handleCancelNewItem}
                            >
                                cancel
                            </CustomWideButton>
                            <CustomWideButton
                                sx={{ mb: '24px', width: "100%" }}
                                bgcolor={theme.palette.forest.main}
                                onClick={() => { itemName.length > 0 && setShowAddItemConfirm(true) }}
                            >
                                add item
                            </CustomWideButton>
                        </Box>
                    </Stack>
                </Box >
            </Box >

            <Modal open={showAddItemConfirm} onClose={handleCancel}>
                <Fade in={showAddItemConfirm} timeout={300}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            outline: 'none',
                        }}
                    >

                        <AddItemConfirmDiag title={itemName} handleCancel={handleCancel} onAdd={handleNewItem} />
                    </Box>
                </Fade>

            </Modal>
        </>
    )
}