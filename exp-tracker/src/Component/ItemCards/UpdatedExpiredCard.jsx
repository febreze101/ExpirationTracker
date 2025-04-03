import React from "react"
import { Box, Typography, useTheme } from "@mui/material"
import CustomWideButton from "../CustomButtons/CustomWideButton";

export default function UpdatedExpiredItemCard({ title, onRestore }) {

    const theme = useTheme();

    return (
        <>
            <Box
                width={320}
                height={204}
                bgcolor={theme.palette.black.main}
                borderRadius={1}
                boxShadow={1}
            >
                {/* Title section */}
                <Box height={57} textAlign="center" alignContent={"center"}>
                    <Typography
                        variant="h3"
                        fontSize={"1.2rem"}
                        color={theme.palette.washiPaper.main}
                        noWrap={true}
                        sx={{ mx: 3 }}
                    >
                        {title}
                    </Typography>
                </Box>

                {/* White box containing buttons */}
                <Box
                    bgcolor='black'
                    height={143}
                    sx={{ px: "24px", borderRadius: '0 0 3px 3px' }}
                    borderTop={'1px solid white'}
                >
                    <CustomWideButton
                        sx={{ mb: "12px", mt: "24px", width: "100%" }}
                        onClick={onRestore}
                    >
                        Restore Item
                    </CustomWideButton>
                    <CustomWideButton
                        sx={{ mb: 1, width: "100%" }}
                        bgcolor={theme.palette.red.main}
                    >
                        delete item
                    </CustomWideButton>
                </Box>
            </Box>
        </>
    )

}