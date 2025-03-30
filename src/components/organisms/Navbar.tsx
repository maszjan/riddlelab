import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
	return (
		<nav className='w-full bg-mainMint py-4 text-gray-700  shadow-md'>
			<div className='container mx-auto px-4 py-3 flex justify-between items-center'>
				{/* Logo */}
				<div className='flex items-center space-x-2'>
					{/* <img
						src='/assets/logo.png'
						alt='RiddleLab Logo'
						className='w-10 h-10'
					/> */}
					<Link to='/' className='text-xl font-bold'>
						RiddleLab
					</Link>
				</div>

				{/* Links */}
				<div className='flex items-center font-semibold space-x-6'>
					<Link
						to='/login'
						className='hover:text-mainBlue transition-colors duration-200'>
						Login
					</Link>
					<Link
						to='/register'
						className='hover:text-mainBlue transition-colors duration-200'>
						Register
					</Link>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
