import React from 'react'
import { Box, Button, Stack, TextField, Typography, useTheme, styled } from '@mui/material'
import CustomWideButton from '../CustomButtons/CustomWideButton'
import AddRoundedIcon from '@mui/icons-material/AddRounded';

const GreenSquareButton = styled(Button)(({ bgcolor }) => ({
    backgroundColor: bgcolor || 'green',
    color: 'green',
}))


export default function OnboardingNotificationSetup() {

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
                        Notification Setup
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
                                2/3
                            </Typography>
                            <Typography

                                variant="h3"
                                fontSize={"1.5rem"}
                                color={theme.palette.black.main}

                            >
                                Set Up Alert Recipients
                            </Typography>
                            <Typography
                                color={theme.palette.black.main}
                            >
                                Add {<span style={{ fontWeight: 'bold' }}>email(s)</span>} to receive {<span style={{ fontWeight: 'bold' }}>timely spoilage alerts</span>}.
                            </Typography>

                            {/* text field and tip */}
                            <Box
                                pt={'48px'}
                            // sx={{ border: "1px solid #D9D9D9" }}
                            >
                                <Typography
                                    fontSize={'12px'}
                                    color={theme.palette.black.main}
                                    textAlign={'right'}
                                >
                                    Add {<span style={{ fontWeight: 'bold' }}>multiple recipients</span>} for each department’s notifications
                                </Typography>
                                <Stack
                                    direction={"row"}
                                    gap={"12px"}
                                >
                                    <TextField
                                        fullWidth
                                        width={"100%"}
                                        label={"Email"}
                                        placeholder="e.g. Campstore, Bakery, or Warehouse A"
                                        variant="outlined"
                                    />
                                    <GreenSquareButton
                                        variant='contained'
                                        bgcolor={theme.palette.forest.main}
                                    // theme={theme}
                                    >
                                        <AddRoundedIcon
                                            sx={{ color: theme.palette.washiPaper.main }}
                                            fontSize='large'
                                        />
                                    </GreenSquareButton>
                                </Stack>
                                <Typography
                                    color={theme.palette.black.main}
                                    textAlign={'center'}
                                >
                                    Alerts help managers prioritize stock rotation and markdown decisions.
                                </Typography>
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