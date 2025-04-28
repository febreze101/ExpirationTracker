import React from 'react'
import { Box, Stack, Typography, useTheme } from '@mui/material'
import CustomWideButton from '../CustomButtons/CustomWideButton'

export default function OnboardingDone() {

    const theme = useTheme()

    return (
        <>
            <Box
                width={527}
                height={196}
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
                        py={1.5}
                    >
                        You're All Set!
                    </Typography>

                    {/* White box containing buttons */}
                    <Box
                        bgcolor="white"
                        minHeight={438}
                        sx={{ px: "24px", borderRadius: '0 0 3px 3px' }}
                        textAlign="center"
                        display={"flex"}
                        flexDirection={"column"}
                        justifyContent={"space-between"}
                    >
                        <Stack
                            display={"flex"}
                            fkexDirection={"column"}
                            // flexGrow={1}
                            alignItems={"center"}
                            gap={"12px"}
                        >
                            <Typography
                                sx={{ pt: '24px' }}
                                variant="h3"
                                fontSize={"1.5rem"}
                                color={theme.palette.black.main}

                            >
                                Your Spoilage tracker is ready
                            </Typography>
                            <Typography
                                color={theme.palette.black.main}
                            >
                                Import your inventory and {<span style={{ fontWeight: 'bold' }}>start reducing waste immediately:</span>}
                            </Typography>
                            <Typography
                                fullWidth
                                component="ol"
                                sx={{ pl: 3 }}
                                textAlign={"left"}
                                color={theme.palette.black.main}
                            >
                                <li>Upload your existing inventory file {<span style={{ fontWeight: 'bold' }}>(.xlsx or .csv)</span>} using drag-and-drop or the file selector</li>
                                <li>Add expiration dates to items on the {<span style={{ fontWeight: 'bold' }}>‘New Items’</span>}  section</li>
                                <li>Begin receiving alerts based on your selected notification preferences</li>
                            </Typography>
                        </Stack>
                        <CustomWideButton
                            sx={{ mb: '24px', width: "100%", }}
                            bgcolor={theme.palette.forest.main}
                            onClick={() => onAdd(title)}
                        >
                            Go to Dashboard
                        </CustomWideButton>

                    </Box>
                </Box>

            </Box>
        </>
    )
}