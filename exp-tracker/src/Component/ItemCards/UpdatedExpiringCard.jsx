import React, { useState, useCallback, useEffect } from "react";
import { Box, Typography, Button, useTheme, Stack, Modal, Fade } from "@mui/material";
import CustomWideButton from "../CustomButtons/CustomWideButton";
import ButtonDatePicker from "../PickerWithButtonField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ExpirationDetails from "../PopUps/ExpirationDetails";

export default function UpdatedExpiringCard({
    title,
    expirationDates,
    numDatesSet,
    daysUntilNextExpiration,
    onDateChange,
    onExpired,
    onDetailRequest,
    itemDetails
}) {
    const theme = useTheme();

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [buttonText, setButtonText] = useState("Set Expiration");
    const [showDetails, setShowDetails] = useState(false);

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

    const handleShowDetails = useCallback(() => {
        console.log(`Item details: ${itemDetails}`)
        onDetailRequest()
        setShowDetails(prev => !prev);
    }, [])

    const handleCancel = () => {
        setShowDetails(false)
    }


    return (
        <>
            <Box
                width={320}
                height={244}
                bgcolor={"#F1EAE3"}
                borderRadius={1}
                boxShadow={1}

            >
                {/* Title section */}
                <Box height={57} textAlign="center" alignContent={"center"}>
                    <Typography
                        variant="h3"
                        fontSize={"1.2rem"}
                        color="black"
                        noWrap={true}
                        sx={{ mx: 3 }}
                    >
                        <span className="scroll-text">{title}</span>
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
                            onClick={handleShowDetails}
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
                                    Expiring in {daysUntilNextExpiration} days
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
                                    {numDatesSet} dates set
                                </Typography>
                            </Box>
                        </Box>

                    </Stack>

                </Box>

                {/* Bottom section */}
            </Box>

            {/* Modal */}
            <Modal
                open={showDetails}
            >
                <Fade in={showDetails} timeout={500}>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100vh"
                    >

                        <ExpirationDetails title={title} handleCancel={handleCancel} itemDetails={itemDetails} expirationDates={expirationDates} />
                    </Box>
                </Fade>
            </Modal>
        </>
    );
}
