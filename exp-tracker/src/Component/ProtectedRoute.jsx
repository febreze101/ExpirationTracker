import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from './UserProvider';
import Layout from './Layout';

const ProtectedRoute = ({ handleAddItem }) => {
    const { user, loading } = useUser();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return (
        <Layout handleAddItem={handleAddItem}>
            <Outlet />
        </Layout>
    );
};

export default ProtectedRoute;
