import supabase from "../utils/supabaseClient";

export async function getNotificationEmails(workspaceId) {
    if (!workspaceId) return [];

    const { data, error } = await supabase
        .from('notification_emails')
        .select('id, email')
        .eq('workspace_id', workspaceId);

    if (error) {
        console.error("Error fetching notification emails:", error);
        return [];
    }
    return data;
}

export async function addNotificationEmail(email, workspaceId) {
    if (!workspaceId) return null;

    const { data, error } = await supabase
        .from('notification_emails')
        .insert([{ email, workspace_id: workspaceId }])
        .select();

    if (error) {
        console.error("Error adding notification email:", error);
        return null;
    }
    return data;
}

export async function updateNotificationEmail(id, newEmail, workspaceId) {
    if (!workspaceId) return null;

    const { data, error } = await supabase
        .from('notification_emails')
        .update({ email: newEmail })
        .eq('id', id)
        .select();

    if (error) {
        console.error("Error updating notification email:", error);
        return null;
    }
    return data;
}

export async function deleteNotificationEmail(id, workspaceId) {
    if (!workspaceId) return null;

    const { data, error } = await supabase
        .from('notification_emails')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting notification email:", error);
        return null;
    }
    return data;
}
