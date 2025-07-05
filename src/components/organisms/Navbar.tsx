import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";
import {
	FaBars,
	FaTimes,
	FaUser,
	FaCog,
	FaSignOutAlt,
	FaGamepad,
	FaTrophy,
	FaEdit,
	FaFolder,
	FaSignInAlt,
	FaUserPlus,
} from "react-icons/fa";
import MiniProfile from "./User/MiniProfile";
import useLogout from "../../hooks/useLogout";

const Navbar: React.FC = () => {
	const user = useSelector(selectUser);
	const logout = useLogout();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	const handleMobileLogout = () => {
		closeMobileMenu();
		logout();
	};

	return (
		<nav className='w-full bg-dark shadow-lg border-b border-gray-600'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3 flex justify-between items-center'>
				{/* Logo */}
				<div className='flex items-center'>
					<Link
						to='/'
						className='flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200'
						onClick={closeMobileMenu}>
						<img
							src='/riddlelab-logo.png'
							alt='RiddleLab Logo'
							className='h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 object-contain'
						/>
						<span className='text-base sm:text-lg md:text-xl lg:text-xl font-bold text-light tracking-wide'>
							RIDDLELAB
						</span>
					</Link>
				</div>

				{/* Desktop Navigation Links */}
				<div className='hidden md:flex items-center space-x-2 lg:space-x-4 xl:space-x-6'>
					{user ? (
						<>
							<Link
								className='flex items-center px-3 lg:px-4 py-2 text-sm lg:text-base font-medium rounded-lg text-light hover:bg-gray-700 transition-colors duration-200'
								to='/'>
								<FaGamepad className='mr-1.5 lg:mr-2 text-xs lg:text-sm' />
								Graj
							</Link>
							<Link
								className='flex items-center px-3 lg:px-4 py-2 text-sm lg:text-base font-medium rounded-lg text-light hover:bg-gray-700 transition-colors duration-200'
								to='/leaderboard'>
								<FaTrophy className='mr-1.5 lg:mr-2 text-xs lg:text-sm' />
								Ranking
							</Link>
							<Link
								className='flex items-center px-3 lg:px-4 py-2 text-sm lg:text-base font-medium rounded-lg text-light hover:bg-gray-700 transition-colors duration-200'
								to='/editor'>
								<FaEdit className='mr-1.5 lg:mr-2 text-xs lg:text-sm' />
								Twórz
							</Link>
							<Link
								className='flex items-center px-3 lg:px-4 py-2 text-sm lg:text-base font-medium rounded-lg text-light hover:bg-gray-700 transition-colors duration-200'
								to='/my-assets'>
								<FaFolder className='mr-1.5 lg:mr-2 text-xs lg:text-sm' />
								Assety
							</Link>
							<div className='ml-2 lg:ml-4'>
								<MiniProfile user={user} />
							</div>
						</>
					) : (
						<>
							<Link to='/login'>
								<button className='flex items-center px-3 lg:px-4 py-2 text-sm lg:text-base font-medium rounded-lg text-light border border-gray-600 hover:bg-gray-700 transition-all duration-200'>
									<FaSignInAlt className='mr-1.5 lg:mr-2 text-xs lg:text-sm' />
									Zaloguj się
								</button>
							</Link>
							<Link to='/register'>
								<button className='flex items-center px-3 lg:px-4 py-2 text-sm lg:text-base font-medium rounded-lg bg-mainMint text-dark hover:bg-mainMint/90 transition-all duration-200 shadow-sm'>
									<FaUserPlus className='mr-1.5 lg:mr-2 text-xs lg:text-sm' />
									Rejestracja
								</button>
							</Link>
						</>
					)}
				</div>

				{/* Mobile Menu Button */}
				<div className='md:hidden flex items-center space-x-3'>
					{/* Show MiniProfile on mobile when logged in */}
					{user && (
						<div className='flex items-center'>
							<MiniProfile user={user} />
						</div>
					)}
					<button
						onClick={toggleMobileMenu}
						className='text-light hover:text-mainMint transition-colors duration-200 p-2'
						aria-label='Toggle mobile menu'>
						{isMobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{isMobileMenuOpen && (
				<div className='md:hidden bg-dark border-t border-gray-600'>
					<div className='px-4 sm:px-6 py-3 space-y-2'>
						{user ? (
							<>
								{/* Navigation Links */}
								<Link
									className='flex items-center px-4 py-3 font-medium rounded-lg text-light hover:bg-gray-700 transition-colors duration-200'
									to='/escape-rooms'
									onClick={closeMobileMenu}>
									<FaGamepad className='mr-3 text-sm' />
									Graj
								</Link>
								<Link
									className='flex items-center px-4 py-3 font-medium rounded-lg text-light hover:bg-gray-700 transition-colors duration-200'
									to='/leaderboard'
									onClick={closeMobileMenu}>
									<FaTrophy className='mr-3 text-sm' />
									Ranking
								</Link>
								<Link
									className='flex items-center px-4 py-3 font-medium rounded-lg text-light hover:bg-gray-700 transition-colors duration-200'
									to='/editor'
									onClick={closeMobileMenu}>
									<FaEdit className='mr-3 text-sm' />
									Twórz
								</Link>
								<Link
									className='flex items-center px-4 py-3 font-medium rounded-lg text-light hover:bg-gray-700 transition-colors duration-200'
									to='/my-assets'
									onClick={closeMobileMenu}>
									<FaFolder className='mr-3 text-sm' />
									Assety
								</Link>

								{/* Divider */}
								<hr className='border-gray-600 my-3' />

								{/* Profile Menu Options */}
								<Link
									className='flex items-center px-4 py-3 font-medium rounded-lg text-light hover:bg-gray-700 transition-colors duration-200'
									to='/profile'
									onClick={closeMobileMenu}>
									<FaUser className='mr-3 text-sm' />
									Mój profil
								</Link>
								<Link
									className='flex items-center px-4 py-3 font-medium rounded-lg text-light hover:bg-gray-700 transition-colors duration-200'
									to='/settings'
									onClick={closeMobileMenu}>
									<FaCog className='mr-3 text-sm' />
									Ustawienia
								</Link>
								<button
									onClick={handleMobileLogout}
									className='flex items-center w-full px-4 py-3 font-medium rounded-lg text-light hover:bg-gray-700 transition-colors duration-200'>
									<FaSignOutAlt className='mr-3 text-sm' />
									Wyloguj się
								</button>
							</>
						) : (
							<>
								{/* Mobile Auth Buttons for Non-Logged In Users */}
								<Link to='/login' onClick={closeMobileMenu}>
									<button className='flex items-center justify-center w-full px-4 py-3 font-medium rounded-lg text-light border border-gray-600 hover:bg-gray-700 transition-all duration-200 mb-2'>
										<FaSignInAlt className='mr-2 text-sm' />
										Zaloguj się
									</button>
								</Link>
								<Link to='/register' onClick={closeMobileMenu}>
									<button className='flex items-center justify-center w-full px-4 py-3 font-medium rounded-lg bg-mainMint text-dark hover:bg-mainMint/90 transition-all duration-200 shadow-sm'>
										<FaUserPlus className='mr-2 text-sm' />
										Rejestracja
									</button>
								</Link>
							</>
						)}
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
