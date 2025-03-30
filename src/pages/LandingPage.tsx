import React from "react";
import Button from "../components/atoms/Button";

const LandingPage: React.FC = () => {
	return (
		<div className='flex flex-col space-y-12 h-screen justify-center items-center'>
			<h1 className='text-4xl font-bold text-mainMint text-center'>
				Aplikacja w trakcie budowy...
			</h1>
			<Button to='editor' text='Przejdź do edytora' />
		</div>
	);
};

export default LandingPage;
