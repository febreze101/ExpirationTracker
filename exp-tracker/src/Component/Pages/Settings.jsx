import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    TextField,
    Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import { addNotificationEmail, deleteNotificationEmail, updateNotificationEmail } from "../../api/notifications";



export default function Settings({ fetchEmails, emails }) {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedEmail, setEditedEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");


    useEffect(() => {
        console.log("Settings component mounted or updated. Current emails:", emails);
    }, [emails]);

    // Delete email
    const handleDelete = async (id) => {
        await deleteNotificationEmail(id);
        await fetchEmails();
    };

    // Start editing
    const handleEdit = (index, email) => {
        setEditingIndex(index);
        setEditedEmail(email);
    };

    // Cancel editing
    const handleCancel = () => {
        setEditingIndex(null);
        setEditedEmail("");
    };

    // Save updated email
    const handleSave = async (id) => {
        await updateNotificationEmail(id, editedEmail);
        setEditingIndex(null);
        setEditedEmail("");
        await fetchEmails()
    };

    const handleAddEmail = async () => {
        if (!newEmail.trim()) return;
        try {
            await addNotificationEmail(newEmail);
            setNewEmail("");
            await fetchEmails();
        } catch (error) {
            console.error("Error adding email:", error);
        }
    }

    return (
        <Box 
            maxWidth={'100%'} 
            mx="auto" 
            mt={4} 
            p={2}
            // border={'1px solid white'}
        >
            <Typography variant="h2" gutterBottom>
                Notification Emails
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
                <TextField
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="Add new email"
                    size="small"
                    variant="standard"
                    sx={{ width: 250, input: { color: "white" }, mr: 1 }}
                />
                <IconButton
                    aria-label="add"
                    onClick={handleAddEmail}
                    sx={{ color: "white", border: "1px solid white" }}
                >
                    <AddIcon />
                </IconButton>
            </Box>
            <List>
                {emails && emails.length > 0 ? (
                    emails.map((emailObj, idx) => (
                    <React.Fragment key={emailObj.id}>
                        <ListItem
                            alignItems="center"
                            disablePadding
                            secondaryAction={
                                editingIndex === idx ? (
                                    <>
                                        <IconButton
                                            edge="end"
                                            aria-label="save"
                                            onClick={() => handleSave(emailObj.id)}
                                            sx={{ color: "white" }} // ensure visible on dark bg
                                        >
                                            <SaveIcon />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            aria-label="cancel"
                                            onClick={handleCancel}
                                            sx={{ color: "white" }}
                                        >
                                            <CancelIcon />
                                        </IconButton>
                                    </>
                                ) : (
                                    <>
                                        <IconButton
                                            edge="end"
                                            aria-label="edit"
                                            onClick={() => handleEdit(idx, emailObj.email)}
                                            sx={{ color: "white" }}
                                        >
                                            <EditIcon />
.                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleDelete(emailObj.id)}
                                            sx={{ color: "white" }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                )
                            }
                        >
                            {editingIndex === idx ? (
                                <TextField
                                    value={editedEmail}
                                    onChange={(e) => setEditedEmail(e.target.value)}
                                    size="small"
                                    variant="standard"
                                    sx={{ width: 250, input: { color: "white" } }}
                                />
                            ) : (
                                <ListItemText primary={emailObj.email} primaryTypographyProps={{ color: "white" }} />
                            )}
                        </ListItem>
                        <Divider sx={{ borderColor: "white" }} />
                    </React.Fragment>
                ))
                ) : (
                    <Typography sx={{ color: "white", px: 2, py: 1 }}>No emails</Typography>
                )}
            </List>
        </Box>
    );
}

