import React, { useState } from "react";
import { FaUser, FaLock, FaPalette } from "react-icons/fa";
import ProfileSettings from "../components/organisms/Settings/ProfileSettings";
import PrivacySettings from "../components/organisms/Settings/PrivacySettings";
import AppearanceSettings from "../components/organisms/Settings/AppearanceSettings";

const SettingsPage: React.FC = () => {
	const [activeSection, setActiveSection] = useState<
		"profile" | "privacy" | "appearance"
	>("profile");

	const menuItems = [
		{ id: "profile", label: "Profil", icon: FaUser },
		{ id: "privacy", label: "Prywatność", icon: FaLock },
		{ id: "appearance", label: "Wygląd", icon: FaPalette },
	];

	return (
		<div className='min-h-screen bg-gradient-to-br from-dark via-slate-800 to-dark'>
			<div className='py-16 px-4 md:px-6'>
				<div className='max-w-6xl mx-auto'>
					<h1 className='text-4xl font-bold text-light mb-2'>Ustawienia</h1>
					<p className='text-gray-400'>
						Zarządzaj swoim kontem i preferencjami
					</p>
				</div>
			</div>

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
											onClick={() =>
												setActiveSection(item.id as typeof activeSection)
											}
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
							{activeSection === "profile" && <ProfileSettings />}
							{activeSection === "privacy" && <PrivacySettings />}
							{activeSection === "appearance" && <AppearanceSettings />}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsPage;
