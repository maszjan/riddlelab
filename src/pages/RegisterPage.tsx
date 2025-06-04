import React from "react";
import RegisterForm from "../components/organisms/Auth/RegisterForm";

const RegisterPage: React.FC = () => {
	return (
		<div className='flex flex-col justify-center items-center'>
			<div className='w-full max-w-xl mt-12 p-6 mb-24 '>
				<RegisterForm />
			</div>
		</div>
	);
};

export default RegisterPage;
