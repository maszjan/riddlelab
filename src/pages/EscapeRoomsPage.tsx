import React, { useState } from "react";
import { FaSearch, FaGamepad, FaSpinner } from "react-icons/fa";
import { IoAlert } from "react-icons/io5";
import EscapeRoomCard from "../components/atoms/EscapeRoomCard";
import { useGetEscapeRooms } from "../hooks/useGetEscapeRooms";
import Pagination from "../components/atoms/Pagination";

const EscapeRoomsPage: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [page, setPage] = useState(1);

	const { escapeRooms, loading, error, refetch, pagination } =
		useGetEscapeRooms(page, 8);

	const filteredRooms = escapeRooms.filter(
		(room) =>
			room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			room.description.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const handlePlayRoom = (id: number) => {
		console.log("Playing room:", id);
		// Navigate to play room
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-dark via-slate-800 to-dark'>
			{/* Hero Section */}
			<div className='relative py-16 px-4 md:px-6'>
				<div className='absolute inset-0'>
					<img
						src='/play.png'
						alt='Escape Rooms Background'
						className='w-full h-full object-cover opacity-30'
					/>
				</div>
				<div className='relative z-10 max-w-4xl mx-auto text-center'>
					<h1 className='text-4xl md:text-5xl font-bold text-light mb-4'>
						Odkryj Escape Roomy
					</h1>
					<p className='text-xl text-light/90 mb-8'>
						Tysiące pokojów zagadek czeka na odkrycie
					</p>

					{/* Search Bar */}
					<div className='max-w-2xl mx-auto relative'>
						<input
							type='text'
							placeholder='Szukaj escape roomów...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='w-full px-6 py-4 pl-12 bg-gray-800 border border-gray-600 rounded-lg text-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mainMint'
						/>
						<FaSearch className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' />
					</div>
				</div>
			</div>

			{/* Filters and Content */}
			<div className='max-w-7xl mx-auto px-4 md:px-6 pb-16'>
				{/* Loading State */}
				{loading && (
					<div className='flex items-center justify-center py-12'>
						<FaSpinner className='animate-spin text-mainMint text-2xl mr-3' />
						<span className='text-gray-400'>Ładowanie escape roomów...</span>
					</div>
				)}

				{/* Error State */}
				{error && (
					<div className='bg-red-600/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6 flex items-center justify-center'>
						<IoAlert className='mr-3' size={20} />
						<span>{error}</span>
						<button
							onClick={refetch}
							className='ml-auto bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-sm transition-colors'>
							Spróbuj ponownie
						</button>
					</div>
				)}

				{/* Filter Bar */}
				{!loading && !error && (
					<div className='flex flex-col sm:flex-row justify-between items-center mb-8 mt-12 px-12'>
						<h2 className='text-2xl font-bold text-light mb-4 sm:mb-0 flex items-center gap-2'>
							<FaGamepad className='text-mainMint' />
							Wszystkie ({filteredRooms.length})
						</h2>
					</div>
				)}

				{/* Escape Rooms Grid */}
				{!loading && !error && filteredRooms.length > 0 && (
					<>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-12'>
							{filteredRooms.map((room) => (
								<EscapeRoomCard
									key={room.id}
									escapeRoom={room}
									mode='player'
									showEditButton={false}
									showPlayButton={true}
									showDeleteButton={false}
									showMetaInfo={false}
									onPlay={handlePlayRoom}
									className='bg-gray-800 border border-gray-600 hover:shadow-xl hover:border-mainMint'
								/>
							))}
						</div>
						{/* 4. Pagination */}
						<Pagination
							currentPage={pagination.currentPage}
							lastPage={pagination.lastPage}
							onPageChange={setPage}
							total={pagination.total}
						/>
					</>
				)}

				{/* Empty State */}
				{!loading &&
					!error &&
					filteredRooms.length === 0 &&
					escapeRooms.length > 0 && (
						<div className='text-center py-16'>
							<FaGamepad className='text-6xl text-gray-600 mx-auto mb-4' />
							<h3 className='text-xl font-bold text-gray-400 mb-2'>
								Nie znaleziono pokojów
							</h3>
							<p className='text-gray-500'>
								Spróbuj zmienić kryteria wyszukiwania
							</p>
						</div>
					)}

				{/* No rooms at all */}
				{!loading && !error && escapeRooms.length === 0 && (
					<div className='text-center py-16'>
						<FaGamepad className='text-6xl text-gray-600 mx-auto mb-4' />
						<h3 className='text-xl font-bold text-gray-400 mb-2'>
							Brak dostępnych escape roomów
						</h3>
						<p className='text-gray-500'>
							Sprawdź ponownie później lub utwórz własny pokój
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default EscapeRoomsPage;
