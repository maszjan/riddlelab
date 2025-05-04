import React from "react";

const Footer: React.FC = () => {
	return (
		<footer className='w-full bg-gray-900 text-white font-bold py-4'>
			<div className='container mx-auto px-4 flex flex-col sm:flex-row justify-center items-center'>
				<div className='text-sm'>© 2025 RiddleLab</div>
			</div>
		</footer>
	);
};

export default Footer;
