import React from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { IoAlert } from "react-icons/io5";
import EscapeRoomCard from "../../atoms/EscapeRoomCard";
import { useGetEscapeRooms } from "../../../hooks/useGetEscapeRooms";

const CommunityRoomsSection: React.FC = () => {
	const { escapeRooms, loading, error } = useGetEscapeRooms();

	const displayRooms = Array.isArray(escapeRooms)
		? escapeRooms.slice(0, 3)
		: [];

	return (
		<div className='py-12 md:py-16 px-4 md:px-6 bg-slate-800'>
			<div className='max-w-7xl mx-auto'>
				<div className='text-center mb-8 md:mb-12'>
					<h2 className='text-2xl md:text-3xl font-bold text-light mb-3 md:mb-4'>
						Odkryj prace społeczności
					</h2>
				</div>

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
					</div>
				)}

				{/* Escape Rooms Grid */}
				{!loading && !error && displayRooms.length > 0 && (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
						{displayRooms.map((room) => (
							<EscapeRoomCard
								key={room.id}
								escapeRoom={room}
								mode='player'
								showEditButton={false}
								showPlayButton={false}
								showDeleteButton={false}
								showMetaInfo={false}
								className='bg-dark border border-gray-600 hover:shadow-xl'
							/>
						))}
					</div>
				)}

				{/* Empty State */}
				{!loading && !error && displayRooms.length === 0 && (
					<div className='text-center py-12'>
						<div className='text-gray-400 mb-4'>
							Brak dostępnych escape roomów w społeczności
						</div>
					</div>
				)}

				{/* Call to Action */}
				{!loading && !error && (
					<div className='text-center mt-8 md:mt-12'>
						<Link to='/register'>
							<button className='px-6 md:px-8 py-3 border-2 border-mainMint text-mainMint font-semibold rounded-lg hover:bg-mainMint hover:text-dark transition-colors duration-200 flex items-center justify-center gap-2 mx-auto'>
								<FaSearch className='text-sm' />
								Odkryj więcej
							</button>
						</Link>
					</div>
				)}
			</div>
		</div>
	);
};

export default CommunityRoomsSection;
