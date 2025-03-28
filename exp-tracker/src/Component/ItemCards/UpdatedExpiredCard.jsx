import React from "react"
import { Box, Typography, useTheme } from "@mui/material"
import CustomWideButton from "../CustomButtons/CustomWideButton";

export default function UpdatedExpiredItemCard() {

    const theme = useTheme();

    return (
        <>
            <Box
                width={354}
                height={204}
                bgcolor={'black'}
                borderRadius={1}
                boxShadow={1}
                border={'1px solid white'}
            >
                {/* Title section */}
                <Box height={57} textAlign="center" alignContent={"center"}>
                    <Typography
                        variant="h3"
                        fontSize={"1.5rem"}
                        color={theme.palette.washiPaper.main}
                        noWrap={true}
                        sx={{ mx: 3 }}
                    >
                        Jacobsen Salt Co. Pure Sea Salt
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