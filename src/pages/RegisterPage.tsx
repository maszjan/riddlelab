import React from "react";
import RegisterForm from "../components/organisms/Auth/RegisterForm";

const RegisterPage: React.FC = () => {
	return (
		<div className='flex flex-col h-screen justify-center items-center'>
			<div className='w-full max-w-xl p-6 '>
				<RegisterForm />
			</div>
		</div>
	);
};

export default RegisterPage;
