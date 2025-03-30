import React from "react";

const Footer: React.FC = () => {
	return (
		<footer className='w-full bg-gray-900 text-white font-bold py-4'>
			<div className='container mx-auto px-4 flex flex-col sm:flex-row justify-center items-center'>
				<div className='text-sm'>
					© {new Date().getFullYear()} RiddleLab. All rights reserved.
				</div>
			</div>
		</footer>
	);
};

export default Footer;
