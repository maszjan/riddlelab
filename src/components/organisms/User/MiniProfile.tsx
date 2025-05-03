import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import useLogout from "../../../hooks/useLogout";
import { User } from "../../interfaces";
import AvatarPreview from "../../molecules/AvatarPreview";

interface MiniProfileProps {
	user: User;
}

const MiniProfile: React.FC<MiniProfileProps> = ({ user }) => {
	const logout = useLogout();
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

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
					<span className='text-sm font-bold'>{user.name?.charAt(0)}</span>
				);
			}
		} else {
			return <span className='text-sm font-bold'>{user.name?.charAt(0)}</span>;
		}
	};

	return (
		<div className='relative' ref={menuRef}>
			<div
				className='flex items-center space-x-2 cursor-pointer'
				onClick={() => setMenuOpen(!menuOpen)}>
				<div className='w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center'>
					{renderAvatar()}
				</div>
				<span className='hidden md:block'>{user.name}</span>
			</div>

			{/* Menu rozwijane */}
			{menuOpen && (
				<div className='absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10'>
					<Link
						to='/profile'
						className='block px-4 py-2 text-sm text-white hover:text-mainMint'
						onClick={() => setMenuOpen(false)}>
						Mój profil
					</Link>
					<hr />
					<Link
						to='/settings'
						className='block px-4 py-2 text-sm text-white hover:text-mainMint'
						onClick={() => setMenuOpen(false)}>
						Ustawienia
					</Link>
					<hr />
					<button
						onClick={() => {
							setMenuOpen(false);
							logout();
						}}
						className='block w-full text-left px-4 py-2 text-sm text-white hover:text-mainMint'>
						Wyloguj się
					</button>
				</div>
			)}
		</div>
	);
};

export default MiniProfile;
