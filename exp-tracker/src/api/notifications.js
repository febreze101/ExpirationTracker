import supabase from "../utils/supabaseClient";

async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        console.error("Error getting user:", error);
        return null;
    }
    return data.user;
}

async function getWorkspaceId() {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('workspace_users')
        .select('workspace_id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error("Error getting workspace ID:", error);
        return null;
    }
    return data?.workspace_id || null;
}

export async function getNotificationEmails() {
    const workspaceId = await getWorkspaceId();
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

export async function addNotificationEmail(email) {
    const workspaceId = await getWorkspaceId();
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

export async function updateNotificationEmail(id, newEmail) {
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

export async function deleteNotificationEmail(id) {
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
