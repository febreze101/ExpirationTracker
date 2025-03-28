import React from "react"
import { Typography, Box, useTheme } from "@mui/material"
import CustomWideButton from '../CustomButtons/CustomWideButton';

export default function UpdatedConfirmDiag() {

    const theme = useTheme();

    return (
        <>
            <Box
                width={517}
                height={196}
                bgcolor={theme.palette.red.main}
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
                        Confirm Delete Item
                    </Typography>
                </Box>

                {/* White box containing buttons */}
                <Box
                    bgcolor="white"
                    height={135}
                    sx={{ px: "24px", borderRadius: '0 0 3px 3px' }}
                >
                    <Typography variant="body1" color="black" sx={{ py: '24px' }}>
                        Are you sure you want to stop tracking for Yuzu Fruit Spread?
                    </Typography>
                    <Box display={"flex"} justifyContent={"space-between"} gap={"12px"}>
                        <CustomWideButton
                            sx={{ mb: 1, width: "100%" }}
                            bgcolor={theme.palette.black.main}
                        >
                            cancel
                        </CustomWideButton>
                        <CustomWideButton
                            sx={{ mb: 1, width: "100%" }}
                            bgcolor={theme.palette.red.main}
                        >
                            delete
                        </CustomWideButton>
                    </Box>
                </Box>
            </Box>
        </>
    )
}