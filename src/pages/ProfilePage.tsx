import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/userSlice";
import { FaTrophy, FaGamepad } from "react-icons/fa";
import AvatarPreview from "../components/molecules/AvatarPreview";

const ProfilePage: React.FC = () => {
	const user = useSelector(selectUser);
	const [activeTab, setActiveTab] = useState<"achievements" | "history">(
		"achievements",
	);

	const renderAvatar = () => {
		if (user?.avatar_url) {
			return (
				<img
					src={user.avatar_url}
					alt='Avatar'
					className='w-full h-full object-cover'
				/>
			);
		} else if (user?.player_configuration) {
			let avatarConfig;
			try {
				if (typeof user.player_configuration === "string") {
					avatarConfig = JSON.parse(user.player_configuration).avatar;
				} else {
					avatarConfig = user.player_configuration.avatar;
				}

				return <AvatarPreview colors={avatarConfig} size='large' />;
			} catch (e) {
				console.error("Błąd parsowania konfiguracji awatara:", e);
				return (
					<div className='w-full h-full bg-mainMint rounded-full flex items-center justify-center text-dark font-bold text-4xl'>
						{user?.name?.charAt(0) || "U"}
					</div>
				);
			}
		} else {
			return (
				<div className='w-full h-full bg-mainMint rounded-full flex items-center justify-center text-dark font-bold text-4xl'>
					{user?.name?.charAt(0) || "U"}
				</div>
			);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-dark via-slate-800 to-dark'>
			{/* Header */}
			<div className='py-16 px-4 md:px-6'>
				<div className='max-w-4xl mx-auto text-center'>
					{/* Profile Picture */}
					<div className='w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-mainMint bg-gray-800 flex items-center justify-center'>
						{renderAvatar()}
					</div>

					{/* User Info */}
					<h1 className='text-3xl sm:text-4xl font-bold text-light mb-2'>
						{user?.name || "User"}
					</h1>
					<p className='text-gray-400 mb-2 text-base sm:text-lg'>
						{user?.email}
					</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className='max-w-6xl mx-auto px-4 md:px-6 pb-16'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12'>
					<div className='bg-gray-800 rounded-lg p-4 md:p-6 text-center border border-gray-600'>
						<div className='text-2xl md:text-3xl font-bold text-gray-500 mb-2'>
							-
						</div>
						<div className='text-gray-400 text-sm md:text-base'>
							Ukończone Pokoje
						</div>
					</div>
					<div className='bg-gray-800 rounded-lg p-4 md:p-6 text-center border border-gray-600'>
						<div className='text-2xl md:text-3xl font-bold text-gray-500 mb-2'>
							-
						</div>
						<div className='text-gray-400 text-sm md:text-base'>
							Łączny Wynik
						</div>
					</div>
					<div className='bg-gray-800 rounded-lg p-4 md:p-6 text-center border border-gray-600'>
						<div className='text-2xl md:text-3xl font-bold text-gray-500 mb-2'>
							-
						</div>
						<div className='text-gray-400 text-sm md:text-base'>
							Średnia Ocena
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className='bg-gray-800 rounded-lg border border-gray-600 overflow-hidden'>
					<div className='flex border-b border-gray-600'>
						<button
							onClick={() => setActiveTab("achievements")}
							className={`flex-1 px-4 md:px-6 py-3 md:py-4 font-medium transition-colors text-sm md:text-base ${
								activeTab === "achievements"
									? "bg-gray-700 text-mainMint border-b-2 border-mainMint"
									: "text-gray-400 hover:text-light"
							}`}>
							Osiągnięcia
						</button>
						<button
							onClick={() => setActiveTab("history")}
							className={`flex-1 px-4 md:px-6 py-3 md:py-4 font-medium transition-colors text-sm md:text-base ${
								activeTab === "history"
									? "bg-gray-700 text-mainMint border-b-2 border-mainMint"
									: "text-gray-400 hover:text-light"
							}`}>
							Historia Gier
						</button>
					</div>

					<div className='p-4 md:p-6'>
						{activeTab === "achievements" && (
							<div className='text-center py-12'>
								<FaTrophy className='text-6xl text-gray-600 mx-auto mb-4' />
								<h3 className='text-xl font-bold text-gray-400 mb-2'>
									Brak osiągnięć
								</h3>
								<p className='text-gray-500'>
									Osiągnięcia będą dostępne wkrótce
								</p>
							</div>
						)}

						{activeTab === "history" && (
							<div className='text-center py-12'>
								<FaGamepad className='text-6xl text-gray-600 mx-auto mb-4' />
								<h3 className='text-xl font-bold text-gray-400 mb-2'>
									Brak historii gier
								</h3>
								<p className='text-gray-500'>
									Historia gier będzie dostępna wkrótce
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
