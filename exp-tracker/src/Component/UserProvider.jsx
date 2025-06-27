// This context will be used to provide user data throughout the application
import supabase from '../utils/supabaseClient';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { customAlphabet } from 'nanoid';

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // This context will provide user and workspace data to the entire application
    // and will handle authentication state changes using Supabase.
    // It will also allow components to access and update the user and workspace state.
    // The user state will hold the current authenticated user,
    // and the workspace state will hold the current user's workspace information.
    // The useEffect hook will be used to subscribe to authentication state changes


    useEffect(() => {
        const init = async () => {
            // retrieve current session and user
            const { data } = await supabase.auth.getSession();
            const sessionUser = data?.session?.user ?? null;
            setUser(sessionUser);

            // if user is logged in, check if they have a workspace
            if (sessionUser) {
                await checkIfUserHasWorkspace(sessionUser.id);
            }

            setLoading(false);
            console.log("UserProvider initialized with user:", sessionUser);
        }

        // run the init function to set the initial user state
        init();


        // subscribe to auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const sessionUser = session?.user ?? null;
                setUser(sessionUser);
                console.log("Auth state changed:", event, sessionUser);

                // if user is logged in, check if they have a workspace
                if (sessionUser) {
                    await checkIfUserHasWorkspace(sessionUser.id);
                } else {
                    // if user is logged out, reset workspace state
                    setWorkspace(null);
                    console.log("User logged out, resetting workspace state.");
                }
            });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [])

    // generate an invite code
    const generateInviteCode = () => {
        const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);
        const code = nanoid();
        console.log("Generated invite code:", code);
        return code;
    }

    // Join an existing workspace
    const joinWorkspace = async (inviteCode) => {
        // retrieve the workspace by invite code
        const { data: workspace, error } = await supabase
            .from('workspaces')
            .select('*')
            .eq('invite_code', inviteCode)
            .single();

        setError(null); // reset error state before fetching
        console.log("Attempting to join workspace with invite code:", inviteCode);

        // handle errors
        if (error) {
            console.error("Error fetching workspace by invite code:", error.message);
            setError(error.message);
            return;
        }

        if (!workspace) {
            console.error("No workspace found with the provided invite code.");
            setError("No workspace found with the provided invite code.");
            return;
        }

        if (!user) {
            console.error("No user is logged in to join the workspace.");
            setError("No user is logged in to join the workspace.");
            return;
        }

        // insert join the workspace
        const { error: joinError } = await supabase
            .from('workspace_users')
            .insert({
                user_id: user.id,
                workspace_id: workspace.id,
                role: 'member' // default role for new members
            });

        if (joinError) {
            console.error("Error joining workspace:", joinError.message);
            setError(joinError.message);
            return;
        }

        // set the workspace state
        setWorkspace(workspace);
        console.log("User joined workspace successfully:", workspace);
    }

    // check if user is part of a workspace
    const checkIfUserHasWorkspace = async (userId) => {
        let { data: workspace, error } = await supabase
            .from('workspace_users')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.error("Error fetching workspace users:", error.message);
            setError(error.message);
            setWorkspace(null);
            return;
        }

        setWorkspace(workspace);
    }

    // This function will be used to create a new workspace for the user
    const createNewWorkspace = async (workspaceName) => {
        if (!user) {
            console.error("No user is logged in.");
            setError("No user is logged in.");
            return;
        }

        if (user && workspace) {
            console.warn("User already has a workspace.");
            setError("User already has a workspace.");
            return;
        }

        console.log("Creating new workspace:", workspaceName);

        const invite_code = generateInviteCode()


        // Insert the new workspace into the workspaces table
        const { data: newWorkspace, error: workspaceError } = await supabase
            .from('workspaces')
            .insert({
                workspace_name: workspaceName,
                onboarding_completed: false,
                invite_code
            })
            .select()
            .single();

        console.log('Insert response:', { newWorkspace, workspaceError });


        if (workspaceError) {
            console.error("Error creating workspace:", workspaceError);
            setError(workspaceError.message);
            return;
        }
        console.log("New workspace created:", newWorkspace);

        let retries = 0;
        const maxRetries = 3;
        let joinError = null;

        while (retries < maxRetries) {
            // Insert the user into the workspace_users table
            const { error } = await supabase
                .from('workspace_users')
                .insert({
                    user_id: user.id,
                    workspace_id: newWorkspace.id,
                    role: 'owner'
                });

            if (!error) {
                joinError = null;
                break;
            }

            joinError = error;
            retries++;
            console.warn(`Retrying to link user to workspace: ${workspaceName} (${retries}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 second before retrying
        }

        if (joinError) {
            console.error("Failed to link user to workspace after multiple attempts:", joinError.message);
            setError(joinError.message);
            return;
        }

        setWorkspace(newWorkspace);
        console.log("Workspace created and linked successfully:", newWorkspace);
    }

    const value = {
        user,
        workspace,
        hasWorkspace: !!workspace,
        createNewWorkspace,
        joinWorkspace,
        checkIfUserHasWorkspace,
        loading,
        error,
    }

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext);