import React from "react";
import LoginForm from "../components/organisms/Auth/LoginForm";

const LoginPage: React.FC = () => {
	return (
		<div className='flex flex-col h-screen justify-center items-center'>
			<LoginForm />
		</div>
	);
};

export default LoginPage;
