import React, { useState } from "react"
import { Box, Fade, Modal, Typography, useTheme } from "@mui/material"
import CustomWideButton from "../CustomButtons/CustomWideButton";
import UpdatedConfirmDiag from "../PopUps/UpdatedConfirmDiag";

export default function UpdatedExpiredItemCard({ title, onRestore, onDelete }) {

    const theme = useTheme();

    const [showConfirmation, setShowConfirmation] = useState(false)

    const handleCancel = () => {
        setShowConfirmation(false);
    }

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
                        onClick={() => setShowConfirmation(true)}
                    >
                        delete item
                    </CustomWideButton>
                </Box>
            </Box>

            {/* Modal */}
            <Modal
                open={showConfirmation}
            >
                <Fade in={showConfirmation} timeout={500}>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100vh"
                    >
                        <UpdatedConfirmDiag title={title} handleCancel={handleCancel} onDelete={onDelete} />
                    </Box>
                </Fade>

            </Modal>
        </>
    )

}