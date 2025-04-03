import React, { useCallback, useState } from "react";
import { Box, Typography, Button, useTheme, Stack, Modal, Fade } from "@mui/material";
import CustomWideButton from "../CustomButtons/CustomWideButton";
import ButtonDatePicker from "../PickerWithButtonField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import UpdatedNewItemForm from "../PopUps/UpdatedNewItemForm";
import ExpirationDetails from "../PopUps/ExpirationDetails";


export default function UpdatedNewItemCard(
    { title,
        expirationDates,
        onDateChange,
        onExpired }
) {
    const theme = useTheme();

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [buttonText, setButtonText] = useState("Set Expiration");
    const [showDetails, setShowDetails] = useState(false);

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
                        {title}
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
                            bgcolor={'transparent'}
                            textColor={'black'}
                            variant={'outlined'}
                            onClick={handleShowDetails}
                        >
                            set expiration date
                        </CustomWideButton>

                        <CustomWideButton
                            sx={{ width: "100%" }}
                            bgcolor={theme.palette.red.main}
                            onClick={onExpired}
                        >
                            Set as expired
                        </CustomWideButton>
                        <Box display={"flex"} justifyContent={"space-between"}>
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
                                    No date set
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>

                </Box>

                {/* Bottom section */}
            </Box>
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
                        <ExpirationDetails title={title} handleCancel={handleCancel} expirationDates={expirationDates} onDateChange={onDateChange} />
                    </Box>
                </Fade>
            </Modal>
        </>
    );
}
