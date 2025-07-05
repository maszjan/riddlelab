import React, { useState } from "react";
import { FaSearch, FaTrophy } from "react-icons/fa";

const LeaderboardPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "allTime">(
		"allTime",
	);
	const [searchTerm, setSearchTerm] = useState("");

	return (
		<div className='min-h-screen bg-gradient-to-br from-dark via-slate-800 to-dark'>
			{/* Header */}
			<div className='relative py-16 px-4 md:px-6'>
				<div className='absolute inset-0'>
					<img
						src='/leaderboard.png'
						alt='Leaderboard Background'
						className='w-full h-full object-cover opacity-20'
					/>
				</div>
				<div className='relative z-10 max-w-4xl mx-auto text-center'>
					<h1 className='text-4xl md:text-5xl font-bold text-light mb-4'>
						Ranking
					</h1>
					<p className='text-xl text-light/90 mb-8'>
						Zobacz jak wypadasz na tle innych graczy w wyzwaniach escape room
					</p>
				</div>
			</div>

			{/* Content */}
			<div className='max-w-4xl mx-auto px-4 md:px-6 pb-16 mt-12'>
				{/* Tabs */}
				<div className='mb-8'>
					<div className='bg-gray-800 rounded-lg p-1 border border-gray-600'>
						<div className='grid grid-cols-3 gap-1'>
							<button
								onClick={() => setActiveTab("daily")}
								className={`px-4 py-2 rounded-md font-medium transition-colors text-center ${
									activeTab === "daily"
										? "bg-mainMint text-dark"
										: "text-gray-400 hover:text-light"
								}`}>
								Dzienny
							</button>
							<button
								onClick={() => setActiveTab("weekly")}
								className={`px-4 py-2 rounded-md font-medium transition-colors text-center ${
									activeTab === "weekly"
										? "bg-mainMint text-dark"
										: "text-gray-400 hover:text-light"
								}`}>
								Tygodniowy
							</button>
							<button
								onClick={() => setActiveTab("allTime")}
								className={`px-4 py-2 rounded-md font-medium transition-colors text-center ${
									activeTab === "allTime"
										? "bg-mainMint text-dark"
										: "text-gray-400 hover:text-light"
								}`}>
								Wszech Czasów
							</button>
						</div>
					</div>
				</div>

				{/* Search */}
				<div className='mb-8'>
					<div className='relative'>
						<input
							type='text'
							placeholder='Szukaj gracza...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-600 rounded-lg text-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mainMint'
						/>
						<FaSearch className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' />
					</div>
				</div>

				{/* Leaderboard */}
				<div className='bg-gray-800 rounded-lg border border-gray-600 overflow-hidden'>
					{/* Header */}
					<div className='grid grid-cols-3 gap-4 px-6 py-4 bg-gray-700 text-gray-300 font-medium'>
						<div>Pozycja</div>
						<div>Gracz</div>
						<div className='text-right'>Wynik</div>
					</div>

					{/* No Data State */}
					<div className='px-6 py-12 text-center'>
						<FaTrophy className='text-6xl text-gray-600 mx-auto mb-4' />
						<h3 className='text-xl font-bold text-gray-400 mb-2'>
							Brak danych
						</h3>
						<p className='text-gray-500'>Ranking będzie dostępny wkrótce</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LeaderboardPage;
