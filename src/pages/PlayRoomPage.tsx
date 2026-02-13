import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { FaKeyboard, FaTrophy } from "react-icons/fa";
import { GameManager } from "../components/organisms/Game/GameManager";
import { useGetRoomLeaderboard } from "../hooks/useGetRoomLeaderboard";
import { useGetSoundtrack } from "../hooks/useGetSoundtrack";
import { BackgroundAudio } from "../components/atoms/BackgroundAudio";
import emptyThumbnail from "/empty-thumbnail.png";

const PlayRoomPage: React.FC = () => {
	const { name } = useParams<{ name: string }>();
	const location = useLocation();

	const escapeRoomId = location.state?.escapeRoomId;
	const escapeRoomName = location.state?.escapeRoomName || name;
	const description = location.state?.description || "Brak opisu";
	const thumbnailUrl = location.state?.thumbnailUrl;

	const {
		data: leaderboard,
		loading,
		error,
	} = useGetRoomLeaderboard(escapeRoomId || 1, "allTime");

	const { soundtrackUrl } = useGetSoundtrack(escapeRoomId);

	return (
		<div className='min-h-screen bg-gradient-to-br from-dark via-slate-800 to-dark'>
			<div className='max-w-[1920px] mx-auto px-6 py-4'>
				<div className='w-full max-w-[1400px] mx-auto'>
					<div className='mb-6 flex justify-between rounded-lg overflow-hidden'>
						<div className='flex justify-start items-start'>
							<div className='w-[200px] min-h-[100px] flex-shrink-0'>
								{thumbnailUrl ? (
									<img
										src={`${import.meta.env.VITE_API_URL}${thumbnailUrl}`}
										alt={escapeRoomName}
										className='w-full h-full object-cover'
									/>
								) : (
									<img
										src={emptyThumbnail}
										alt={escapeRoomName}
										className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
									/>
								)}
							</div>

							<div className='flex-1 p-6 flex flex-col justify-center'>
								<h1 className='text-3xl md:text-4xl font-bold text-white mb-3'>
									{escapeRoomName}
								</h1>
								<p className='text-gray-400 text-lg leading-relaxed'>
									{description}
								</p>
							</div>
						</div>
						<div className='flex justify-end items-end mb-6'>
							<BackgroundAudio soundtrackUrl={soundtrackUrl} volume={0.3} />
						</div>
					</div>

					<div
						className='relative w-full bg-black rounded-lg overflow-hidden shadow-2xl mb-6'
						style={{ aspectRatio: "16/9" }}>
						<GameManager
							key={escapeRoomId || 1}
							escapeRoomId={escapeRoomId || 1}
						/>
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						<div className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
							<div className='flex items-center gap-2 mb-4'>
								<FaKeyboard className='text-mainMint' size={24} />
								<h3 className='text-white font-bold text-xl'>Sterowanie</h3>
							</div>
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<span className='text-gray-400'>Ruch</span>
									<div className='flex gap-1'>
										<kbd className='px-3 py-2 bg-gray-700 rounded text-white font-mono'>
											W
										</kbd>
										<kbd className='px-3 py-2 bg-gray-700 rounded text-white font-mono'>
											A
										</kbd>
										<kbd className='px-3 py-2 bg-gray-700 rounded text-white font-mono'>
											S
										</kbd>
										<kbd className='px-3 py-2 bg-gray-700 rounded text-white font-mono'>
											D
										</kbd>
									</div>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-gray-400'>Interakcja</span>
									<kbd className='px-4 py-2 bg-gray-700 rounded text-white font-mono'>
										E
									</kbd>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-gray-400'>Pauza</span>
									<kbd className='px-4 py-2 bg-gray-700 rounded text-white font-mono'>
										ESC
									</kbd>
								</div>
							</div>
						</div>

						{/* Ranking Section */}
						<div className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
							<div className='flex items-center gap-2 mb-4'>
								<FaTrophy className='text-yellow-400' size={24} />
								<h3 className='text-white font-bold text-xl'>Ranking</h3>
							</div>
							<div className='space-y-2'>
								{loading && (
									<div className='text-gray-400'>Ładowanie rankingu...</div>
								)}
								{error && <div className='text-red-500'>{error}</div>}
								{!loading && leaderboard.length === 0 && (
									<div className='text-gray-400'>
										Brak wyników dla tego pokoju.
									</div>
								)}
								{leaderboard.map((entry) => (
									<div
										key={entry.user.id}
										className='flex items-center justify-between p-3 bg-gray-700 rounded'>
										<div className='flex items-center gap-3'>
											<span className='text-yellow-400 font-bold text-lg'>
												{entry.position}
											</span>
											<span className='text-white'>{entry.user.name}</span>
										</div>
										<span className='text-mainMint font-bold'>
											{entry.total_score} pkt
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PlayRoomPage;
