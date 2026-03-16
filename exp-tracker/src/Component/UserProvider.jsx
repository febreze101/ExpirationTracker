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


    // check if user is part of a workspace
    const checkAndSetUserWorkspace = async (userId) => {
        try {
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
        } catch (err) {
            console.error("Error occurred while verifying workspace:", err);
            setError(err.message);
            setWorkspace(null);
        }
    };

    useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error("Error getting session:", error);
                if (mounted) setLoading(false);
                return;
            }
            if (mounted) {
                setUser(session?.user ?? null);
                setLoading(false);
                console.log("UserProvider initialized with user:", session?.user?.email);
            }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (mounted) {
                    setUser(session?.user ?? null);
                    if (event === 'SIGNED_OUT') {
                        setWorkspace(null);
                    }
                    console.log("Auth state changed:", event, session?.user?.email);
                }
            }
        );

        return () => {
            mounted = false;
            authListener?.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        // Only fetch workspace if we have a user and we haven't fetched it yet
        // or if it changed
        if (user) {
            checkAndSetUserWorkspace(user.id);
        } else if (!loading) {
            setWorkspace(null);
        }
    }, [user, loading]);

    useEffect(() => {
        console.log("Workspace ID in UserProvider:", workspace?.workspace_id);
    }, [workspace]);

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

    const value = {
        user,
        workspace,
        hasWorkspace: !!workspace,
        joinWorkspace,
        checkIfUserHasWorkspace: checkAndSetUserWorkspace,
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