import React, { useState } from "react";
import { Box, Typography, Button, useTheme, Stack } from "@mui/material";
import CustomWideButton from "../CustomButtons/CustomWideButton";
import ButtonDatePicker from "../PickerWithButtonField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function UpdatedExpiringCard(
    title,
    expirationDate,
    onDateChange,
    onExpired,
) {
    const theme = useTheme();

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [buttonText, setButtonText] = useState("Set Expiration");

    const handleDateChange = (newDate) => {
        if (newDate && newDate.isValid()) {
            const date = newDate.toDate();
            onDateChange(date);
        }
    };

    const handleShowDatePicker = () => {
        console.log('handle date show picker')
        if (!showDatePicker) {
            setButtonText("Done");
        } else {
            setButtonText("Edit Expiration");
        }
        setShowDatePicker(!showDatePicker);
    };

    return (
        <Box
            width={354}
            height={244}
            bgcolor={"#F1EAE3"}
            borderRadius={1}
            boxShadow={1}
        >
            {/* Title section */}
            <Box height={57} textAlign="center" alignContent={"center"}>
                <Typography
                    variant="h3"
                    fontSize={"1.5rem"}
                    color="black"
                    noWrap={true}
                    sx={{ mx: 3 }}
                >
                    Jacobsen Salt Co. Pure Sea Salt
                </Typography>
            </Box>

            {/* White box containing buttons */}
            <Box
                bgcolor="white"
                height={187}
                sx={{ px: "24px", borderRadius: '0 0 3px 3px' }}
            >
                <Stack gap={'12px'}>
                    <CustomWideButton
                        sx={{ mt: "24px", width: "100%" }}
                        onClick={handleShowDatePicker}
                    >
                        Edit expiration
                    </CustomWideButton>

                    <CustomWideButton
                        sx={{ width: "100%" }}
                        bgcolor={theme.palette.red.main}
                        onClick={onExpired}
                    >
                        Set as expired
                    </CustomWideButton>
                    <Box display={"flex"} justifyContent={"space-between"} gap={"12px"}>
                        <Box
                            bgcolor={theme.palette.grey.main}
                            textAlign={"center"}
                            alignContent={"center"}
                            width={"100%"}
                            height={25}
                            sx={{
                                borderRadius: "4px",
                            }}
                        >
                            <Typography variant="body1" fontSize={".75rem"}>
                                Expiring in 16 days
                            </Typography>
                        </Box>
                        <Box
                            bgcolor={theme.palette.grey.main}
                            textAlign={"center"}
                            alignContent={"center"}
                            width={"100%"}
                            height={25}
                            sx={{
                                borderRadius: "4px",
                            }}
                        >
                            <Typography variant="body1" fontSize={".75rem"}>
                                3 dates set
                            </Typography>
                        </Box>
                    </Box>

                </Stack>

            </Box>

            {/* Bottom section */}
        </Box>
    );
}
