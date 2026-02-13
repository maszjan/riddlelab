import React from "react";
import { useGetGameHistory } from "../../hooks/useGetGameHistory";
import Pagination from "../atoms/Pagination";
import {
	FaGamepad,
	FaClock,
	FaLightbulb,
	FaCalendarAlt,
	FaTrophy,
} from "react-icons/fa";
import emptyThumbnail from "/empty-thumbnail.png";

const GameHistory: React.FC = () => {
	const {
		data: attempts,
		loading,
		error,
		page,
		lastPage,
		total,
		setPage,
	} = useGetGameHistory();

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes}:${secs.toString().padStart(2, "0")}`;
	};

	const getStatusLabel = (status: string): string => {
		const statusMap: Record<string, string> = {
			active: "W trakcie",
			completed: "Ukończono",
			abandoned: "Porzucono",
			paused: "Wznowione",
			failed: "Przegrana",
		};
		return statusMap[status.toLowerCase()] || status;
	};

	const getStatusColor = (status: string): string => {
		const colorMap: Record<string, string> = {
			active: "text-yellow-400",
			completed: "text-green-400",
			abandoned: "text-red-400",
			paused: "text-orange-400",
			failed: "text-red-500",
		};
		return colorMap[status.toLowerCase()] || "text-gray-400";
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	if (loading) return <p>Ładowanie historii gier...</p>;
	if (error) return <p className='text-red-500 text-center mt-8'>{error}</p>;

	if (!attempts || attempts.length === 0) {
		return (
			<div className='text-center py-12'>
				<FaGamepad className='text-6xl text-gray-600 mx-auto mb-4' />
				<h3 className='text-xl font-bold text-gray-400 mb-2'>
					Brak historii gier
				</h3>
				<p className='text-gray-500'>Historia gier będzie dostępna wkrótce</p>
			</div>
		);
	}

	return (
		<div>
			<div className='space-y-6'>
				{attempts.map((attempt: any) => {
					const roomName = attempt.escape_room?.name || "Escape Room";
					const description = attempt.escape_room?.description || "";
					const thumb = attempt.escape_room?.thumbnail_url || null;

					return (
						<div
							key={attempt.attempt_id}
							className='bg-slate-600 p-5 rounded-lg border border-gray-700 shadow-sm'>
							<div className='flex gap-6 items-start'>
								<div className='w-64 h-40 rounded-lg overflow-hidden border border-gray-700 flex-shrink-0 bg-gray-900 flex items-center justify-center shadow-lg'>
									{thumb ? (
										<img
											src={thumb}
											alt={roomName}
											className='w-full h-full object-cover'
											loading='lazy'
										/>
									) : (
										<img
											src={emptyThumbnail}
											alt={roomName}
											className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
										/>
									)}
								</div>

								<div className='flex-1'>
									<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
										<h4 className='text-lg md:text-xl font-semibold text-mainMint'>
											{roomName}
										</h4>
										<p
											className={`mt-1 md:mt-0 text-sm font-semibold ${getStatusColor(
												attempt.status,
											)}`}>
											{getStatusLabel(attempt.status)}
										</p>
									</div>

									{description && (
										<p className='text-gray-400 text-sm md:text-base mb-3 line-clamp-2'>
											{description}
										</p>
									)}

									<div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300 text-sm md:text-sm'>
										<p className='flex items-center gap-2'>
											<FaCalendarAlt className='text-gray-400' />
											<span className='text-gray-200'>Data:</span>
											<span className='font-medium text-gray-200'>
												{new Date(attempt.start_time).toLocaleString()}
											</span>
										</p>
										<p className='flex items-center gap-2'>
											<FaClock className='text-gray-400' />
											<span className='text-gray-200'>Czas gry:</span>
											<span className='font-medium'>
												{formatTime(attempt.time_spent)}
											</span>
										</p>
										<p className='flex items-center gap-2'>
											<FaLightbulb className='text-gray-400' />
											<span className='text-gray-200'>Podpowiedzi:</span>
											<span className='font-medium'>{attempt.hints_used}</span>
										</p>
										<p className='flex items-center gap-2'>
											<FaTrophy className='text-mainMint' />
											<span className='text-gray-200'>Wynik:</span>
											<span className='font-bold text-mainMint'>
												{attempt.score}
											</span>
										</p>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<Pagination
				currentPage={page}
				lastPage={lastPage}
				total={total}
				onPageChange={handlePageChange}
			/>
		</div>
	);
};

export default GameHistory;
