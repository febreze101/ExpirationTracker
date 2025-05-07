import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";


const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('');

    const showAlert = useCallback((message, severity = 'info') => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
    }, [])

    const handleClose = (_, reason) => {
        if (reason === 'clickaway') return;
        setAlertOpen(false);
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <Snackbar
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleClose} severity={alertSeverity} sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </AlertContext.Provider>
    )
}

export const useAlert = () => useContext(AlertContext);