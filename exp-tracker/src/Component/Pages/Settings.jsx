import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUser } from '../UserProvider';

export default function Settings() {
    const [workspaceName, setWorkspaceName] = useState("");
    const { createNewWorkspace } = useUser();

    const handleCreateWorkspace = async () => {
        // Logic to create a new workspace
        console.log("Creating new workspace...");
        await createNewWorkspace(workspaceName);
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant='h1'>Settings Page</Typography>
            <Typography variant='body' sx={{ marginBottom: 2 }}>
                This is where you can manage your settings.
            </Typography>

            <Input type="text" placeholder="Workspace Name" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} />

            <button type="submit" onClick={handleCreateWorkspace}>Create Workspace</button>
            {/* Add your settings components here */}
        </Box>
    );
}