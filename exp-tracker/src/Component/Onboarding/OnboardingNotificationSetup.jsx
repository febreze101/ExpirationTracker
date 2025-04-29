import React from 'react'
import { Box, Button, Stack, TextField, Typography, useTheme, styled } from '@mui/material'
import CustomWideButton from '../CustomButtons/CustomWideButton'
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useForm, useFieldArray } from 'react-hook-form';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

const GreenSquareButton = styled(Button)(({ bgcolor }) => ({
    backgroundColor: bgcolor || 'green',
    color: 'green',
    height: '54px',
    top: 0,
    bottom: 0
}))


export default function OnboardingNotificationSetup({
    handleBack,
    handleNext,
    formData,
    setData
}) {

    const {
        control,
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: {
            workspace_emails: [{ value: "" }]
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "workspace_emails"
    })

    const onSubmit = (data) => {
        setData((prev) => ({ ...prev, workspace_emails: data.workspace_emails }))
        handleNext()
    }

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
                                    <Stack gap={'12px'}>

                                        {fields.map((field, index) => (
                                            <Stack key={field.id} direction="row" gap="12px" alignItems="center">
                                                <TextField
                                                    fullWidth
                                                    label="Email"
                                                    placeholder="e.g. example@company.com"
                                                    variant="outlined"
                                                    {...register(`workspace_emails.${index}.value`,
                                                        {
                                                            required: 'At least one email is required',
                                                            pattern: {
                                                                value: /\S+@\S+\.\S+/,
                                                                message: "Entered value does not match email format"
                                                            }
                                                        }
                                                    )}
                                                    error={!!errors.workspace_emails?.[index]?.value}
                                                    helperText={errors.workspace_emails?.[index]?.value?.message}
                                                />
                                                {index === 0 ? (
                                                    // FIRST input --> "+" button
                                                    <GreenSquareButton
                                                        // height={'100%'}
                                                        variant='contained'
                                                        bgcolor={theme.palette.forest.main}
                                                        onClick={() => append({ value: "" })}
                                                    >
                                                        <AddRoundedIcon
                                                            sx={{ color: theme.palette.washiPaper.main }}
                                                            fontSize='large'
                                                        />
                                                    </GreenSquareButton>
                                                ) : (
                                                    // SUBSEQUENT inputs --> "🗑️" button
                                                    <GreenSquareButton
                                                        variant='contained'
                                                        bgcolor={theme.palette.red.main}
                                                        onClick={() => remove(index)}
                                                    >
                                                        <RemoveRoundedIcon
                                                            sx={{ color: theme.palette.washiPaper.main }}
                                                            fontSize='large'
                                                        />
                                                    </GreenSquareButton>
                                                )}
                                            </Stack>
                                        ))}
                                    </Stack>

                                    <Typography
                                        color={theme.palette.black.main}
                                        textAlign={'center'}
                                        pt={2}
                                    >
                                        Alerts help managers prioritize stock rotation and markdown decisions.
                                    </Typography>
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