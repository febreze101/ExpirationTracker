import React, { useState } from "react"
import { Box, Fade, Modal, Typography, useTheme } from "@mui/material"
import CustomWideButton from "../CustomButtons/CustomWideButton";
import DeleteConfirmDiag from "../PopUps/DeleteConfirmDiag";
import RestoreConfirmDiag from "../PopUps/restoreConfirmDiag";

export default function UpdatedExpiredItemCard({ title, onRestore, onDelete }) {

    const theme = useTheme();

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [showRestoreConfirmation, setShowRestoreConfirmation] = useState(false)

    const handleDeleteCancel = () => {
        setShowDeleteConfirmation(false);
    }

    const handleRestoreCancel = () => {
        setShowRestoreConfirmation(false);
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
                        onClick={() => setShowRestoreConfirmation(true)}
                    >
                        Restore Item
                    </CustomWideButton>
                    <CustomWideButton
                        sx={{ mb: 1, width: "100%" }}
                        bgcolor={theme.palette.red.main}
                        onClick={() => setShowDeleteConfirmation(true)}
                    >
                        delete item
                    </CustomWideButton>
                </Box>
            </Box>

            {/* Modal */}
            <Modal
                open={showRestoreConfirmation}
            >
                <Fade in={showRestoreConfirmation} timeout={500}>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100vh"
                    >
                        <RestoreConfirmDiag title={title} handleCancel={handleRestoreCancel} onRestore={onRestore} />
                    </Box>
                </Fade>

            </Modal>
            <Modal
                open={showDeleteConfirmation}
            >
                <Fade in={showDeleteConfirmation} timeout={500}>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100vh"
                    >
                        <DeleteConfirmDiag title={title} handleCancel={handleDeleteCancel} onDelete={onDelete} />
                    </Box>
                </Fade>

            </Modal>
        </>
    )

}