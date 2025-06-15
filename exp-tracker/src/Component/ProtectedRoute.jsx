import { Navigate } from "react-router-dom";
import React from "react";

export default function ProtectedRoute({ session, children }) {

    if (!session) {
        return <Navigate to="/auth" replace />;
    }

    return children;
}