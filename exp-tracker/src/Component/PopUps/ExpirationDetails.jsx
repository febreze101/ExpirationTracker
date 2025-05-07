import React, { useEffect, useState } from "react"
import { Box, TextField, Typography, Stack, useTheme, Chip } from "@mui/material"
import CustomWideButton from "../CustomButtons/CustomWideButton"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import ButtonDatePicker from "../PickerWithButtonField";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { setDate } from "date-fns";
import { useAlert } from "../../context/AlertContext";

export default function ExpirationDetails({ title, expirationDates = [], handleCancel, onDateChange, }) {
    const theme = useTheme();
    const [pickerDate, setPickerDate] = useState(dayjs());

    const { showAlert } = useAlert();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const [originalDates] = useState(() => expirationDates.map(date => formatDate(date)));
    const [newDates, setNewDates] = useState([]);


    const handleDateChange = (newDate) => {
        if (newDate && newDate.isValid()) {
            const formattedDate = newDate.format('MM/DD/YYYY')

            if (![...originalDates, ...newDates].includes(formattedDate)) {
                setNewDates([...newDates, formattedDate]);
            }
        }
    };

    useEffect(() => {
        console.log(newDates)
    }, [newDates])

    const handleAddDates = () => {
        onDateChange(newDates);
    }

    return (
        <>
            <Box
                width={517}
                minHeight={200}
                bgcolor={"#F1EAE3"}
                borderRadius={1}

            >
                {/* Title section */}
                <Box height={79} textAlign="center" alignContent={"center"}>
                    <Typography
                        variant="h3"
                        fontSize={"1.5rem"}
                        color={theme.palette.red.main}
                        noWrap={true}
                        sx={{ mx: 3 }}
                    >
                        Expiration Details
                    </Typography>
                    <Typography
                        variant="h3"
                        fontSize={"1.2rem"}
                        color="black"
                        noWrap={true}
                        sx={{ mx: 3 }}
                    >
                        {title || 'Jacobsen Salt Co. Pure Sea Salt'}
                    </Typography>
                </Box>

                {/* White box containing buttons */}
                <Box
                    bgcolor="white"
                    minHeight={200}
                    sx={{ px: "24px", borderRadius: '0 0 3px 3px', pt: '18px', boxSizing: 'border-box' }}
                    justifyContent={'center'}
                    paddingBottom={1}
                >
                    {/* border={'1px solid red'} */}
                    <Typography
                        variant="h3"
                        fontSize={"1.2rem"}
                        color="black"
                        noWrap={true}
                        // sx={{}}
                        textAlign={'center'}
                    >
                        Dates Currently Set
                    </Typography>
                    <Box
                        // border={'1px solid red'}
                        width={'100%'}
                        display={'flex'}
                        justifyContent={'center'}
                        flexWrap={'wrap'}
                        gap={1}
                        padding={'8px'}
                        sx={{
                            boxSizing: 'border-box'
                        }}
                    >
                        {[...originalDates, ...newDates].length > 0 ? (
                            [...originalDates, ...newDates].map((date, index) => {
                                const isOriginal = originalDates.includes(date);
                                return (
                                    <Chip
                                        key={index}
                                        label={date}
                                        onDelete={
                                            isOriginal
                                                ? undefined
                                                : () => {
                                                    setNewDates(newDates.filter(d => d !== date));
                                                }
                                        }
                                        sx={{
                                            height: 32,
                                            backgroundColor: theme.palette.grey.main,
                                            color: 'white',
                                            borderRadius: '4px',
                                            paddingX: 1.5,
                                            '& .MuiChip-deleteIcon': {
                                                color: 'white',
                                                '&:hover': {
                                                    color: 'red'
                                                }
                                            },
                                        }}
                                    />
                                );
                            })
                        ) : (
                            <Typography color="black">Pick a date to start tracking!</Typography>
                        )}
                    </Box>
                    <Stack gap={'16px'} pt={1.5}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <ButtonDatePicker
                                value={pickerDate}
                                onChange={(newDate) => {
                                    setPickerDate(newDate);
                                    handleDateChange(newDate)
                                }} />
                        </LocalizationProvider>
                        <Box display={"flex"} justifyContent={"space-between"} gap={"12px"}>
                            <CustomWideButton
                                sx={{ mb: 1, width: "100%" }}
                                bgcolor={theme.palette.black.main}
                                onClick={handleCancel}
                            >
                                cancel
                            </CustomWideButton>
                            <CustomWideButton
                                sx={{ mb: 1, width: "100%" }}
                                bgcolor={theme.palette.forest.main}
                                onClick={handleAddDates}
                            >
                                add new dates
                            </CustomWideButton>
                        </Box>
                    </Stack>
                </Box>
            </Box>
        </>
    )
}