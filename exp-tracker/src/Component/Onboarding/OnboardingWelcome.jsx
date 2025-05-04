import React from 'react'
import { Box, Stack, Typography, useTheme } from '@mui/material'
import CustomWideButton from '../CustomButtons/CustomWideButton'

export default function OnboardingWelcome({ handleNext }) {

    const theme = useTheme()

    return (
        <>
            <Box
                height={499}
            >

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
                            py={'16px'}
                        >
                            Welcome
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
                                flexDirection={"column"}
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
                                    Welcome to Spoilage Tracker!
                                </Typography>
                                <Typography
                                    color={theme.palette.black.main}
                                >
                                    Ready to reduce waste and boost margins? Let's get started!
                                </Typography>
                                <Typography
                                    color={theme.palette.black.main}
                                >
                                    Set up your store's inventory in just a few quick steps.
                                </Typography>
                                <Typography
                                    color={theme.palette.black.main}
                                >
                                    Click {<span>Next</span>} to begin.
                                </Typography>
                            </Stack>
                            <CustomWideButton
                                sx={{ mb: '24px', width: "100%", }}
                                bgcolor={theme.palette.forest.main}
                                onClick={handleNext}
                            >
                                Begin
                            </CustomWideButton>

                        </Box>
                    </Box>

                </Box>
            </Box>
        </>
    )
}