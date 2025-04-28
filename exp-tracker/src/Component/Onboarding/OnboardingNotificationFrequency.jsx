import React from 'react'
import { Box, Button, Stack, TextField, Typography, useTheme, styled, Checkbox, FormControlLabel } from '@mui/material'
import CustomWideButton from '../CustomButtons/CustomWideButton'
import AddRoundedIcon from '@mui/icons-material/AddRounded';


const GreenSquareButton = styled(Button)(({ bgcolor }) => ({
    backgroundColor: bgcolor || 'green',
    color: 'green',
}))


export default function OnboardingNotificationFrequency() {

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
                        Notification Frequency
                    </Typography>

                    {/* White box containing text and buttons */}
                    <Box
                        bgcolor="white"
                        minHeight={438}
                        sx={{ px: "24px", borderRadius: '0 0 3px 3px' }}
                        textAlign="left"
                        display={"flex"}
                        flexDirection={"column"}
                        justifyContent={"space-between"}
                    >
                        <Stack
                            display={"flex"}
                            fkexDirection={"column"}
                            // flexGrow={1}
                            // alignItems={"center"}
                            // sx={{ border: "1px solid #D9D9D9" }}
                            gap={"2px"}
                        >
                            <Typography
                                color={theme.palette.grey.main}
                                sx={{ pt: '24px' }}
                            >
                                3/3
                            </Typography>
                            <Typography

                                variant="h3"
                                fontSize={"1.5rem"}
                                color={theme.palette.black.main}

                            >
                                Set Department Alert Frequency
                            </Typography>
                            <Typography
                                color={theme.palette.black.main}
                            >
                                Customize alerts to help your team proactively manage inventory and reduce waste.
                            </Typography>

                            {/* text field and tip */}
                            <Box
                                pt={'48px'}
                            // sx={{ border: "1px solid #D9D9D9" }}
                            >

                                <Stack
                                    gap={"12px"}
                                >
                                    <FormControlLabel
                                        control={<Checkbox />}
                                        label={
                                            <Typography
                                                color={theme.palette.black.main}>
                                                {<span style={{ fontWeight: 'bold' }}>Daily</span>}: Comprehensive inventory alerts showing items expiring today and within the next 30 days {<span style={{ fontWeight: 'bold' }}>(Recommended)</span>}
                                            </Typography>
                                        }
                                    />
                                    <FormControlLabel
                                        control={<Checkbox />}
                                        label={
                                            <Typography
                                                color={theme.palette.black.main}>
                                                {<span style={{ fontWeight: 'bold' }}>A week before</span>}: Weekly alerts highlighting items approaching expiration in the next 7 days
                                            </Typography>
                                        }
                                    />
                                    <FormControlLabel
                                        control={<Checkbox />}
                                        label={
                                            <Typography
                                                color={theme.palette.black.main}>
                                                {<span style={{ fontWeight: 'bold' }}>Two weeks before</span>}: Advanced notice for items that will expire within 14 days
                                            </Typography>
                                        }
                                    />

                                </Stack>

                            </Box>
                        </Stack>


                        <Stack direction={'row'} gap={"12px"}>
                            <CustomWideButton
                                sx={{ mb: '24px', width: "100%", }}
                                bgcolor={theme.palette.grey.main}
                                onClick={() => onAdd(title)}
                            >
                                Back
                            </CustomWideButton>
                            <CustomWideButton
                                sx={{ mb: '24px', width: "100%", }}
                                bgcolor={theme.palette.forest.main}
                                onClick={() => onAdd(title)}
                            >
                                Continue Setup
                            </CustomWideButton>

                        </Stack>

                    </Box>
                </Box >

            </Box >
        </>
    )
}