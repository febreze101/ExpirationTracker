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
import { set } from "date-fns";


export default function Settings({ fetchEmails }) {
    const [emails, setEmails] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedEmail, setEditedEmail] = useState("");


    useEffect(() => {
        setEmails(fetchEmails())
    }, [setEmails]);

    // Delete email
    const handleDelete = async (email) => {
        if (!dbOps) return;
        await dbOps.deleteNotificationEmail(email);
        fetchEmails();
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
    const handleSave = async (oldEmail) => {
        if (!dbOps) return;
        await dbOps.updateNotificationEmail(oldEmail, editedEmail);
        setEditingIndex(null);
        setEditedEmail("");
        fetchEmails();
    };

    return (
        <Box maxWidth={500} mx="auto" mt={4}>
            <Typography variant="h2" gutterBottom>
                Notification Emails
            </Typography>
            <List>
                {emails.map((email, idx) => (
                    <React.Fragment key={email}>
                        <ListItem
                            secondaryAction={
                                editingIndex === idx ? (
                                    <>
                                        <IconButton
                                            edge="end"
                                            aria-label="save"
                                            onClick={() => handleSave(email)}
                                        >
                                            <SaveIcon />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            aria-label="cancel"
                                            onClick={handleCancel}
                                        >
                                            <CancelIcon />
                                        </IconButton>
                                    </>
                                ) : (
                                    <>
                                        <IconButton
                                            edge="end"
                                            aria-label="edit"
                                            onClick={() => handleEdit(idx, email)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleDelete(email)}
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
                                    sx={{ width: 250 }}
                                />
                            ) : (
                                <ListItemText primary={email} />
                            )}
                        </ListItem>
                        <Divider />
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
}

