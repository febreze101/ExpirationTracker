import React, { useState, useCallback } from "react"
import { ThemeProvider, Box, Typography, Modal, Fade } from "@mui/material"

import { Outlet, NavLink } from "react-router"

import CircleButton from "./CustomButtons/CircleButton"
import AddIcon from '@mui/icons-material/Add';
import IosShareIcon from '@mui/icons-material/IosShare';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UpdatedNewItemForm from "./PopUps/UpdatedNewItemForm";
import OnboardingForm from "./Onboarding/OnboardingForm";
import { useUser } from "./UserProvider";

import { theme } from "../utils/theme";

export default function Layout(props) {
    const [showAddItemForm, setShowAddItemForm] = useState(false);

    const {
        user,
        workspace,
        loading,
        createNewWorkspace,
        joinWorkspace,
    } = useUser();

    const handleShowAddItemForm = useCallback(() => {
        setShowAddItemForm(prev => !prev);
    }, []);

    function handleCancelNewItem() {
        console.log("Closing modal...");
        setShowAddItemForm(false);
    }

    return (
        <>
            {props.showOnboarding && (
                <OnboardingForm
                    createNewWorkspace={createNewWorkspace}
                    joinWorkspace={joinWorkspace}
                    showOnboarding={props.showOnboarding}
                    setShowOnboarding={props.setShowOnboarding}
                    handleAddUser={props.handleAddUser}
                />
            )}
            <ThemeProvider theme={theme}>
                <Box display={'flex'} flexDirection={'column'} height={'98vh'} p={2} sx={{ boxSizing: 'border-box', overflow: 'hidden' }}>
                    <Box display={"flex"} flexDirection={'row'} flexGrow={0} alignItems={'center'} justifyContent={'space-between'} mb={2} >
                        {/* header */}
                        <Typography variant="h1" color={theme.palette.washiPaper.main} >Campfield Spoilage Tracker</Typography>

                        {/* links */}
                        <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={2}>
                            <NavLink
                                to="/dashboard"
                                style={({ isActive }) => ({
                                    color: theme.palette.washiPaper.main,
                                    fontWeight: isActive ? 'bold' : 'normal',
                                    textDecoration: isActive ? 'underline' : 'none'
                                })}
                            >
                                <Typography color={theme.palette.washiPaper.main} variant="body1">Dashboard</Typography>
                            </NavLink>

                            <NavLink
                                to="/settings"
                                style={({ isActive }) => ({
                                    color: theme.palette.washiPaper.main,
                                    fontWeight: isActive ? 'bold' : 'normal',
                                    textDecoration: isActive ? 'underline' : 'none'
                                })}
                            >
                                <Typography variant="body1">Settings</Typography>
                            </NavLink>

                            <CircleButton color={'forest'} onClick={handleShowAddItemForm} icon={<AddIcon />} />
                            <CircleButton color={'washiPaper'} onClick={props.exportInventory} icon={<IosShareIcon color="black" />} />
                            <CircleButton color={'washiPaper'} onClick={props.importInventory} icon={<FileDownloadIcon color="black" />} />
                            {/* links */}
                        </Box>
                    </Box>

                    {/* Main Content Area */}
                    <Box flexGrow={1}>
                        <Outlet />
                    </Box>
                    {/* </Box> */}
                </Box>

                <Modal
                    open={showAddItemForm}
                    onClose={handleCancelNewItem}
                    keepMounted
                >
                    <Fade in={showAddItemForm} timeout={500}>
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100vh"
                        >
                            <UpdatedNewItemForm handleCancelNewItem={handleCancelNewItem} handleAddItem={props.handleAddItem} />

                        </Box>

                    </Fade>
                </Modal>
            </ThemeProvider>
        </>
    )


}