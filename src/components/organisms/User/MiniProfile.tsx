import React, { useState, useRef, useEffect, CSSProperties } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import useLogout from "../../../hooks/useLogout";
import { User } from "../../../interfaces";
import AvatarPreview from "../../molecules/AvatarPreview";

interface MiniProfileProps {
	user: User;
}

const MiniProfile: React.FC<MiniProfileProps> = ({ user }) => {
	const logout = useLogout();
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: Event) => {
			// Changed from MouseEvent to Event
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setMenuOpen(false);
			}
		};

		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setMenuOpen(false);
			}
		};

		if (menuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("touchstart", handleClickOutside);
			document.addEventListener("keydown", handleEscapeKey);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [menuOpen]);

	// Improved scroll lock that prevents layout shift
	useEffect(() => {
		const isMobile = window.innerWidth < 768;

		if (menuOpen && isMobile) {
			// Get current scroll position
			const scrollY = window.scrollY;

			// Apply styles to prevent scroll and layout shift
			document.body.style.position = "fixed";
			document.body.style.top = `-${scrollY}px`;
			document.body.style.width = "100%";
			document.body.style.overflow = "hidden";

			return () => {
				// Restore scroll position and remove fixed positioning
				document.body.style.position = "";
				document.body.style.top = "";
				document.body.style.width = "";
				document.body.style.overflow = "";
				window.scrollTo(0, scrollY);
			};
		}
	}, [menuOpen]);

	const renderAvatar = () => {
		if (user.avatar_url) {
			return (
				<img
					src={user.avatar_url}
					alt='Avatar'
					className='w-full h-full object-cover'
				/>
			);
		} else if (user.player_configuration) {
			let avatarConfig;
			try {
				if (typeof user.player_configuration === "string") {
					avatarConfig = JSON.parse(user.player_configuration).avatar;
				} else {
					avatarConfig = user.player_configuration.avatar;
				}

				return <AvatarPreview colors={avatarConfig} size='small' />;
			} catch (e) {
				console.error("Błąd parsowania konfiguracji awatara:", e);
				return (
					<span className='text-xs sm:text-sm font-bold'>
						{user.name?.charAt(0)}
					</span>
				);
			}
		} else {
			return (
				<span className='text-xs sm:text-sm font-bold'>
					{user.name?.charAt(0)}
				</span>
			);
		}
	};

	const getMenuPosition = (): CSSProperties => {
		if (!buttonRef.current) return {};

		const rect = buttonRef.current.getBoundingClientRect();
		const isMobile = window.innerWidth < 768;

		if (isMobile) {
			return {
				position: "fixed" as const,
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)",
				zIndex: 9999,
			};
		}

		// Desktop positioning with better calculations
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceAbove = rect.top;
		const menuHeight = 180; // More accurate menu height

		// Determine if menu should appear above or below
		const shouldAppearAbove =
			spaceBelow < menuHeight && spaceAbove > menuHeight;

		return {
			position: "fixed" as const,
			top: shouldAppearAbove ? rect.top - menuHeight - 8 : rect.bottom + 8,
			right: Math.max(8, window.innerWidth - rect.right), // Ensure it doesn't go off-screen
			zIndex: 1000,
		};
	};

	const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

	return (
		<div className='relative'>
			<div
				ref={buttonRef}
				className='flex items-center space-x-1 sm:space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-200 p-1 rounded-lg'
				onClick={() => setMenuOpen(!menuOpen)}
				role='button'
				aria-expanded={menuOpen}
				aria-haspopup='true'
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						setMenuOpen(!menuOpen);
					}
				}}>
				<div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0'>
					{renderAvatar()}
				</div>
				<span className='hidden sm:block text-mainMint font-bold text-sm lg:text-base truncate max-w-24 lg:max-w-none'>
					{user.name}
				</span>
			</div>

			{menuOpen &&
				createPortal(
					<>
						{/* Mobile backdrop */}
						{isMobile && (
							<div
								className='fixed inset-0 bg-black bg-opacity-50 z-40'
								onClick={() => setMenuOpen(false)}
							/>
						)}

						<div
							ref={menuRef}
							className={`
                                bg-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-600
                                ${
																	isMobile
																		? "w-72 max-w-[90vw]"
																		: "w-48 sm:w-52"
																}
                            `}
							style={getMenuPosition()}
							role='menu'
							aria-orientation='vertical'>
							{/* Mobile header */}
							{isMobile && (
								<div className='px-4 py-3 border-b border-gray-600'>
									<div className='flex items-center space-x-3'>
										<div className='w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center'>
											{renderAvatar()}
										</div>
										<div>
											<p className='text-white font-medium text-base'>
												{user.name}
											</p>
											<p className='text-gray-400 text-sm truncate'>
												{user.email}
											</p>
										</div>
									</div>
								</div>
							)}

							<div className={isMobile ? "py-2" : "py-1"}>
								<Link
									to='/profile'
									className={`
                                        flex items-center px-4 text-white hover:text-mainMint hover:bg-gray-700 transition-colors duration-200
                                        ${
																					isMobile
																						? "py-3 text-base"
																						: "py-2 text-sm"
																				}
                                    `}
									onClick={() => setMenuOpen(false)}
									role='menuitem'>
									<FaUser
										className={`${
											isMobile ? "mr-3 text-base" : "mr-2 text-sm"
										}`}
									/>
									Mój profil
								</Link>

								<hr className='border-gray-700 my-1' />

								<Link
									to='/settings'
									className={`
                                        flex items-center px-4 text-white hover:text-mainMint hover:bg-gray-700 transition-colors duration-200
                                        ${
																					isMobile
																						? "py-3 text-base"
																						: "py-2 text-sm"
																				}
                                    `}
									onClick={() => setMenuOpen(false)}
									role='menuitem'>
									<FaCog
										className={`${
											isMobile ? "mr-3 text-base" : "mr-2 text-sm"
										}`}
									/>
									Ustawienia
								</Link>

								<hr className='border-gray-700 my-1' />

								<button
									onClick={() => {
										setMenuOpen(false);
										logout();
									}}
									className={`
                                        flex items-center w-full text-left px-4 text-white hover:text-mainMint hover:bg-gray-700 transition-colors duration-200
                                        ${
																					isMobile
																						? "py-3 text-base"
																						: "py-2 text-sm"
																				}
                                    `}
									role='menuitem'>
									<FaSignOutAlt
										className={`${
											isMobile ? "mr-3 text-base" : "mr-2 text-sm"
										}`}
									/>
									Wyloguj się
								</button>
							</div>
						</div>
					</>,
					document.body,
				)}
		</div>
	);
};

export default MiniProfile;
