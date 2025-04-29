import React, { useState } from 'react'
import { Box, Button, Stack, TextField, Typography, useTheme, styled, Checkbox, FormControlLabel, Radio, RadioGroup, FormHelperText, FormControl } from '@mui/material'
import CustomWideButton from '../CustomButtons/CustomWideButton'
import { useForm } from 'react-hook-form';

export default function OnboardingNotificationFrequency({
    handleBack,
    handleNext,
    formData,
    setData
}) {
    const theme = useTheme()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm({
        defaultValues: {
            frequency: formData?.frequency || 'daily'
        }
    })

    const onSubmit = (data) => {
        setData((prev) => ({ ...prev, frequency: data.frequency }))
        handleNext()
    }

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
                                flexDirection={"column"}
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
                                <Box pt={'48px'}>
                                    <Stack gap={"12px"} >
                                        <FormControl component='fieldset' error={!!errors.frequency} >
                                            <RadioGroup
                                                name='frequency'
                                                defaultValue={formData?.frequency || 'daily'}
                                                onChange={(e) => setValue('frequency', e.target.value)}
                                            >
                                                <FormControlLabel
                                                    control={
                                                        <Radio
                                                            {...register('frequency', { required: 'Please select a frequency' })}
                                                            sx={{
                                                                color: theme.palette.forest.main,
                                                                '&.Mui-checked': {
                                                                    color: theme.palette.forest.main,
                                                                }
                                                            }}
                                                        />}
                                                    value="daily"
                                                    label={
                                                        <Typography
                                                            color={theme.palette.black.main}>
                                                            {<span style={{ fontWeight: 'bold' }}>Daily</span>}: Comprehensive inventory alerts showing items expiring today and within the next 30 days {<span style={{ fontWeight: 'bold' }}>(Recommended)</span>}
                                                        </Typography>
                                                    }

                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Radio
                                                            {...register('frequency', { required: 'Please select a frequency' })}
                                                            sx={{
                                                                color: theme.palette.forest.main,
                                                                '&.Mui-checked': {
                                                                    color: theme.palette.forest.main,
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    value="weekly"
                                                    label={
                                                        <Typography
                                                            color={theme.palette.black.main}>
                                                            {<span style={{ fontWeight: 'bold' }}>A week before</span>}: Weekly alerts highlighting items approaching expiration in the next 7 days
                                                        </Typography>
                                                    }
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Radio
                                                            {...register('frequency', { required: 'Please select a frequency' })}
                                                            sx={{
                                                                color: theme.palette.forest.main,
                                                                '&.Mui-checked': {
                                                                    color: theme.palette.forest.main,
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    value="bi-weekly"
                                                    label={
                                                        <Typography
                                                            color={theme.palette.black.main}>
                                                            {<span style={{ fontWeight: 'bold' }}>Two weeks before</span>}: Advanced notice for items that will expire within 14 days
                                                        </Typography>
                                                    }
                                                />
                                            </RadioGroup>
                                            {errors.frequency && (
                                                <FormHelperText>{errors.frequency.message}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </Stack>
                                </Box>
                            </Stack>


                            <Stack direction={'row'} gap={"12px"}>
                                <CustomWideButton
                                    sx={{ mb: '24px', width: "100%", }}
                                    bgcolor={theme.palette.grey.main}
                                    onClick={handleBack}
                                >
                                    Back
                                </CustomWideButton>
                                <CustomWideButton
                                    sx={{ mb: '24px', width: "100%", }}
                                    bgcolor={theme.palette.forest.main}
                                    onClick={handleSubmit(onSubmit)}
                                >
                                    Continue Setup
                                </CustomWideButton>

                            </Stack>

                        </Box>
                    </Box >

                </Box >
            </Box>
        </>
    )
}