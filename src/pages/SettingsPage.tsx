/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/userSlice";
import { FaUser, FaBell, FaLock, FaPalette, FaGlobe } from "react-icons/fa";

const SettingsPage: React.FC = () => {
	const user = useSelector(selectUser);
	const [activeSection, setActiveSection] = useState<
		"profile" | "notifications" | "privacy" | "appearance" | "language"
	>("profile");

	const menuItems = [
		{ id: "profile", label: "Profil", icon: FaUser },
		{ id: "notifications", label: "Powiadomienia", icon: FaBell },
		{ id: "privacy", label: "Prywatność", icon: FaLock },
		{ id: "appearance", label: "Wygląd", icon: FaPalette },
		{ id: "language", label: "Język", icon: FaGlobe },
	];

	return (
		<div className='min-h-screen bg-gradient-to-br from-dark via-slate-800 to-dark'>
			{/* Header */}
			<div className='py-16 px-4 md:px-6'>
				<div className='max-w-6xl mx-auto'>
					<h1 className='text-4xl font-bold text-light mb-2'>Ustawienia</h1>
					<p className='text-gray-400'>
						Zarządzaj swoim kontem i preferencjami
					</p>
				</div>
			</div>

			{/* Content */}
			<div className='max-w-6xl mx-auto px-4 md:px-6 pb-16'>
				<div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
					{/* Sidebar */}
					<div className='lg:col-span-1'>
						<div className='bg-gray-800 rounded-lg border border-gray-600 p-4'>
							<nav className='space-y-2'>
								{menuItems.map((item) => {
									const Icon = item.icon;
									return (
										<button
											key={item.id}
											onClick={() => setActiveSection(item.id as any)}
											className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
												activeSection === item.id
													? "bg-mainMint text-dark"
													: "text-gray-400 hover:text-light hover:bg-gray-700"
											}`}>
											<Icon className='text-sm' />
											{item.label}
										</button>
									);
								})}
							</nav>
						</div>
					</div>

					{/* Main Content */}
					<div className='lg:col-span-3'>
						<div className='bg-gray-800 rounded-lg border border-gray-600 p-6'>
							{activeSection === "profile" && (
								<div>
									<h2 className='text-2xl font-bold text-light mb-6'>
										Ustawienia Profilu
									</h2>
									<div className='space-y-6'>
										<div>
											<label className='block text-sm font-medium text-gray-300 mb-2'>
												Nazwa użytkownika
											</label>
											<input
												type='text'
												defaultValue={user?.name || ""}
												className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-mainMint'
											/>
										</div>
										<div>
											<label className='block text-sm font-medium text-gray-300 mb-2'>
												Email
											</label>
											<input
												type='email'
												defaultValue={user?.email || ""}
												className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-mainMint'
											/>
										</div>
										<div>
											<label className='block text-sm font-medium text-gray-300 mb-2'>
												Bio
											</label>
											<textarea
												rows={4}
												placeholder='Opowiedz coś o sobie...'
												className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-mainMint'
											/>
										</div>
										<button className='px-6 py-3 bg-mainMint text-dark font-semibold rounded-lg hover:bg-mainMint/90 transition-colors'>
											Zapisz Zmiany
										</button>
									</div>
								</div>
							)}

							{activeSection === "notifications" && (
								<div>
									<h2 className='text-2xl font-bold text-light mb-6'>
										Powiadomienia
									</h2>
									<div className='space-y-4'>
										<div className='flex items-center justify-between py-3'>
											<div>
												<h3 className='text-light font-medium'>
													Powiadomienia email
												</h3>
												<p className='text-gray-400 text-sm'>
													Otrzymuj powiadomienia na email
												</p>
											</div>
											<input
												type='checkbox'
												className='w-5 h-5'
												defaultChecked
											/>
										</div>
										<div className='flex items-center justify-between py-3'>
											<div>
												<h3 className='text-light font-medium'>
													Nowe escape roomy
												</h3>
												<p className='text-gray-400 text-sm'>
													Powiadom o nowych pokojach
												</p>
											</div>
											<input
												type='checkbox'
												className='w-5 h-5'
												defaultChecked
											/>
										</div>
									</div>
								</div>
							)}

							{/* Add other sections as needed */}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsPage;
