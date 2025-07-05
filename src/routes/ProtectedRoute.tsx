import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/userSlice";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const user = useSelector(selectUser);
	const location = useLocation();

	if (!user) {
		// Redirect to login with the current location they were trying to access
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
