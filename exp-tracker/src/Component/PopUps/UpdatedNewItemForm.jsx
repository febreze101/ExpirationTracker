import React from "react"
import { Box, TextField, Typography, Stack, useTheme } from "@mui/material"
import CustomWideButton from "../CustomButtons/CustomWideButton"

export default function UpdatedNewItemForm() {
    const theme = useTheme();

    return (
        <>
            <Box
                width={517}
                height={276}
                bgcolor={"#F1EAE3"}
                borderRadius={1}
                boxShadow={1}
            >
                {/* Title section */}
                <Box height={61} textAlign="center" alignContent={"center"}>
                    <Typography
                        variant="h3"
                        fontSize={"1.5rem"}
                        color="black"
                        noWrap={true}
                        sx={{ mx: 3 }}
                    >
                        Add New Item
                    </Typography>
                </Box>

                {/* White box containing buttons */}
                <Box
                    bgcolor="white"
                    height={215}
                    sx={{ px: "24px", borderRadius: '0 0 3px 3px' }}
                >
                    <Stack gap={'16px'}>
                        <TextField sx={{
                            width: '100%', '& .MuiInputBase-root': {
                                height: '46px', // Adjust height here
                            }, mt: '24px'
                        }} label={'Item Name'} />

                        <TextField sx={{
                            width: '100%', '& .MuiInputBase-root': {
                                height: '46px', // Adjust height here
                            },
                        }} label={'Expiration Date'} />
                        <Box display={"flex"} justifyContent={"space-between"} gap={"12px"}>
                            <CustomWideButton
                                sx={{ mb: 1, width: "100%" }}
                                bgcolor={theme.palette.black.main}
                            >
                                cancel
                            </CustomWideButton>
                            <CustomWideButton
                                sx={{ mb: 1, width: "100%" }}
                                bgcolor={theme.palette.forest.main}
                            >
                                add item
                            </CustomWideButton>
                        </Box>
                    </Stack>
                </Box>
            </Box>
        </>
    )
}