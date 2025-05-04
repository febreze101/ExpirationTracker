import React from 'react'
import { Box, Stack, TextField, Typography, useTheme } from '@mui/material'
import CustomWideButton from '../CustomButtons/CustomWideButton'
import { useForm } from 'react-hook-form'

export default function OnboardingStart({
    handleNext,
    formData,
    setData
}) {

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: {
            workspace_name: formData?.workspace_name || ""
        }
    })

    const onSubmit = (data) => {
        setData((prev) => ({ ...prev, workspace_name: data.workspace_name }));
        handleNext();
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
                            Let's Get Started
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
                                    1/3
                                </Typography>
                                <Typography

                                    variant="h3"
                                    fontSize={"1.5rem"}
                                    color={theme.palette.black.main}

                                >
                                    Let's Get Started
                                </Typography>
                                <Typography
                                    color={theme.palette.black.main}
                                >
                                    Create your first {<span style={{ fontWeight: 'bold' }}>workspace</span>} to organize your inventory effectively.
                                </Typography>

                                {/* text field and tip */}
                                <Box
                                    pt={'48px'}
                                // sx={{ border: "1px solid #D9D9D9" }}
                                >
                                    <TextField
                                        {...register(
                                            "workspace_name",
                                            {
                                                required: 'workspace name is required',
                                            }
                                        )}
                                        fullWidth
                                        label={"Workspace Name"}
                                        placeholder="e.g. Campstore, Bakery, or Warehouse A"
                                        variant="outlined"
                                        error={!!errors.workspace_name}
                                        helperText={errors.workspace_name?.message}
                                        style={{ marginBottom: "10px" }}
                                    />
                                    <Typography
                                        color={theme.palette.black.main}
                                        textAlign={'center'}
                                    >
                                        Example:  {<span style={{ fontWeight: 'bold' }}>Campstore</span>}, {<span style={{ fontWeight: 'bold' }}>Bakery</span>}, or, {<span style={{ fontWeight: 'bold' }}>Warehouse A</span>}.
                                    </Typography>
                                </Box>
                            </Stack>
                            <CustomWideButton
                                sx={{ mb: '24px', width: "100%", }}
                                bgcolor={theme.palette.forest.main}
                                onClick={handleSubmit(onSubmit)}
                            >
                                Continue Setup
                            </CustomWideButton>

                        </Box>
                    </Box >

                </Box >
            </Box>
        </>
    )
}