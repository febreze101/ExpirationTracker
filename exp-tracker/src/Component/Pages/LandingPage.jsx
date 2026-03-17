import { Box, Button, Stack, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {

    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/auth");
    };

    return (
        <Box maxWidth={400} alignContent={'center'}>
            <Typography variant="h1">Welcome to the Expiration Tracker</Typography>
            <Typography variant="body1">Track your expirations easily and efficiently.</Typography>
            <Stack gap={2} >
                <Button variant="contained" color="primary" onClick={handleLogin}>
                    Login
                </Button>
                <Button variant="contained" color="primary" onClick={handleLogin}>
                    Sign Up
                </Button>

            </Stack>
        </Box>
    );
}
