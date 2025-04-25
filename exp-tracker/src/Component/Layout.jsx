import React, { useState, useCallback } from "react"
import { createTheme, ThemeProvider, Box, Typography, Modal, Fade } from "@mui/material"

import { Outlet, NavLink } from "react-router"

import CircleButton from "./CustomButtons/CircleButton"
import AddIcon from '@mui/icons-material/Add';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import UpdatedNewItemForm from "./PopUps/UpdatedNewItemForm";

const theme = createTheme({
    typography: {
        fontFamily: [
            'adobe-garamond-pro',
            'ff-meta-headline-web-pro',
        ].join(','),
        h1: {
            fontSize: '3.5rem',
            fontFamily: ['adobe-garamond-pro', 'serif'].join(',')
        },
        h2: {
            fontSize: '2.25rem',
            fontFamily: ['adobe-garamond-pro', 'serif'].join(',')
        },
        h3: {
            fontSize: '1rem',
            fontFamily: ['adobe-garamond-pro', 'serif'].join(',')
        },
        body1: {
            fontSize: '1rem',
            fontFamily: ['ff-meta-headline-web-pro', 'sans-serif'].join(',')
        },
        body2: {
            fontSize: '1rem',
            fontFamily: ['ff-meta-headline-web-pro', 'sans-serif'].join(','),
            color: 'rgba(128, 128, 128, 0.5)'
        },
    },
    palette: {
        black: {
            main: '#171717'
        },
        forest: {
            main: '#063B27'
        },
        washiPaper: {
            main: '#F1EAE3'
        },
        red: {
            main: '#91383A'
        },
        Tan: {
            main: '#907C64'
        },
        grey: {
            main: '#444444'
        }
    }
})

export default function Layout(props) {
    const [showAddItemForm, setShowAddItemForm] = useState(false);

    const handleShowAddItemForm = useCallback(() => {
        setShowAddItemForm(prev => !prev);
    }, []);

    function handleCancelNewItem() {
        console.log("Closing modal...");
        setShowAddItemForm(false);
    }

    return (
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
                            to="/new-items"
                            style={({ isActive }) => ({
                                color: theme.palette.washiPaper.main,
                                fontWeight: isActive ? 'bold' : 'normal',
                                textDecoration: isActive ? 'underline' : 'none'
                            })}
                        >
                            <Typography color={theme.palette.washiPaper.main} variant="body1">New Items</Typography>
                        </NavLink>
                        <NavLink
                            to="/expiring-items"
                            style={({ isActive }) => ({
                                color: theme.palette.washiPaper.main,
                                fontWeight: isActive ? 'bold' : 'normal',
                                textDecoration: isActive ? 'underline' : 'none'
                            })}
                        >
                            <Typography variant="body1">Expiring Items</Typography>
                        </NavLink>
                        <NavLink
                            to="/expired-items"
                            style={({ isActive }) => ({
                                color: theme.palette.washiPaper.main,
                                fontWeight: isActive ? 'bold' : 'normal',
                                textDecoration: isActive ? 'underline' : 'none'
                            })}
                        >
                            <Typography variant="body1">Expired Items</Typography>
                        </NavLink>
                        <CircleButton color={'forest'} onClick={handleShowAddItemForm} icon={<AddIcon />} />
                        <CircleButton color={'washiPaper'} onClick={() => console.log('notification opened')} icon={<NotificationsOutlinedIcon color="black" />} />
                    </Box>
                </Box>

                {/* Main Content Area */}
                <Box flexGrow={1}>
                    <Outlet />
                </Box>
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
    )


}