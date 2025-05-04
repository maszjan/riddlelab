import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";
import MiniProfile from "./User/MiniProfile";

const Navbar: React.FC = () => {
	const user = useSelector(selectUser);

	return (
		<nav className='w-full bg-mainMint py-4 text-gray-700 shadow-md'>
			<div className='container mx-auto px-4 py-3 flex justify-between items-center'>
				{/* Logo */}
				<div className='flex items-center space-x-2'>
					<Link to='/' className='text-xl font-bold'>
						RiddleLab
					</Link>
				</div>

				{/* Linki nawigacyjne */}
				<div className='flex items-center font-semibold space-x-6'>
					{user ? (
						<>
							<button className='px-5 py-2 font-semibold rounded-lg text-gray-700 border-2 border-gray-700 hover:bg-gray-700 hover:text-mainMint transition-colors duration-200'>
								<Link to='/my-assets'>Assety</Link>
							</button>
							<button className='px-5 py-2 font-semibold rounded-lg text-gray-700 border-2 border-gray-700 hover:bg-gray-700 hover:text-mainMint transition-colors duration-200'>
								<Link to='/editor'>Tworzenie</Link>
							</button>

							{/* Komponent MiniProfile */}
							<MiniProfile user={user} />
						</>
					) : (
						<>
							<Link to='/login'>
								<button className='px-5 py-2 font-semibold rounded-lg text-gray-700 border-2 border-gray-700 hover:bg-gray-700 hover:text-mainMint transition-colors duration-200'>
									Zaloguj się
								</button>
							</Link>
							<Link to='/register'>
								<button className='px-5 py-2 font-semibold rounded-lg  bg-gray-700 border-2 border-gray-700 hover:bg-mainMint hover:text-gray-700 text-mainMint transition-all duration-200 shadow-md'>
									Rejestracja
								</button>
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
