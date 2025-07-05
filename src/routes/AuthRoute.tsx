import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/userSlice";

interface AuthRouteProps {
	children: React.ReactNode;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
	const user = useSelector(selectUser);

	if (user) {
		return <Navigate to='/play' replace />;
	}

	return <>{children}</>;
};

export default AuthRoute;
