/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { IoPlay, IoCreate, IoTime, IoTrash } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import emptyThumbnail from "/empty-thumbnail.png";

interface EscapeRoomCardProps {
	escapeRoom: {
		id: number;
		name: string;
		description: string;
		thumbnail_url?: string;
		updated_at: string;
		rooms?: any[];
		user_id?: number;
	};
	mode?: "editor" | "player";
	onEdit?: (id: number) => void;
	onPlay?: (id: number, name: string) => void;
	onDelete?: (id: number) => void;
	showEditButton?: boolean;
	showPlayButton?: boolean;
	showDeleteButton?: boolean;
	showMetaInfo?: boolean;
	className?: string;
}

const EscapeRoomCard: React.FC<EscapeRoomCardProps> = ({
	escapeRoom,
	mode = "player",
	onEdit,
	onPlay,
	onDelete,
	showEditButton = mode === "editor",
	showPlayButton = true,
	showDeleteButton = false,
	showMetaInfo = true,
	className = "",
}) => {
	const [isDeleting, setIsDeleting] = useState(false);
	const navigate = useNavigate();

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("pl-PL", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleCardClick = () => {
		if (mode === "player" && !showEditButton) {
			handlePlay();
		}
	};

	const handlePlay = (e?: React.MouseEvent) => {
		if (e) e.stopPropagation();

		const roomNameSlug = escapeRoom.name.toLowerCase().replace(/\s+/g, "-");
		navigate(`/play/${roomNameSlug}`, {
			state: {
				escapeRoomId: escapeRoom.id,
				escapeRoomName: escapeRoom.name,
				description: escapeRoom.description,
				thumbnailUrl: escapeRoom.thumbnail_url,
			},
		});

		if (onPlay) {
			onPlay(escapeRoom.id, escapeRoom.name);
		}
	};

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();

		const confirmed = window.confirm(
			`Czy na pewno chcesz usunąć escape room "${escapeRoom.name}"? Ta akcja jest nieodwracalna.`,
		);

		if (!confirmed) return;

		setIsDeleting(true);
		try {
			if (onDelete) {
				await onDelete(escapeRoom.id);
			}
		} catch (error) {
			console.error("Error deleting escape room:", error);
			alert("Wystąpił błąd podczas usuwania escape room.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div
			className={`bg-gray-700 rounded-lg hover:bg-gray-650 transition-all duration-300 group cursor-pointer flex flex-col h-full ${className} ${
				isDeleting ? "opacity-50 pointer-events-none" : ""
			}`}
			onClick={
				mode === "player" && !showEditButton ? handleCardClick : undefined
			}>
			{/* Thumbnail */}
			<div className='h-32 bg-gray-600 relative flex-shrink-0 rounded-t-lg overflow-hidden'>
				{escapeRoom.thumbnail_url ? (
					<img
						src={`${import.meta.env.VITE_API_URL}${escapeRoom.thumbnail_url}`}
						alt={escapeRoom.name}
						className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
					/>
				) : (
					<img
						src={emptyThumbnail}
						alt={escapeRoom.name}
						className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
					/>
				)}

				{/* Play button overlay */}
				{showEditButton && showPlayButton && (
					<div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100'>
						<button
							onClick={handlePlay}
							className='bg-mainMint hover:bg-mainMint/80 text-gray-900 p-3 rounded-full transform scale-75 group-hover:scale-100 transition-transform duration-300'>
							<IoPlay size={24} />
						</button>
					</div>
				)}

				{/* Delete button */}
				{showDeleteButton && onDelete && (
					<div className='absolute top-2 right-2'>
						<button
							onClick={handleDelete}
							disabled={isDeleting}
							className='bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100'
							title='Usuń escape room'>
							<IoTrash size={16} />
						</button>
					</div>
				)}
			</div>

			{/* Content - flex-grow to push buttons to bottom */}
			<div className='p-3 md:p-4 flex flex-col flex-grow'>
				<h3
					className='font-semibold text-base md:text-lg mb-2 truncate text-light'
					title={escapeRoom.name}>
					{escapeRoom.name}
				</h3>
				<p
					className='text-gray-400 text-xs md:text-sm mb-3 line-clamp-2 leading-relaxed flex-grow'
					title={escapeRoom.description}>
					{escapeRoom.description}
				</p>

				{/* Meta info */}
				{showMetaInfo && (
					<div className='flex items-center justify-between text-xs text-gray-500 mb-4'>
						<div className='flex items-center'>
							<IoTime className='mr-1' />
							<span className='hidden sm:inline'>
								{formatDate(escapeRoom.updated_at)}
							</span>
							<span className='sm:hidden'>
								{new Date(escapeRoom.updated_at).toLocaleDateString("pl-PL")}
							</span>
						</div>
						{escapeRoom.rooms && (
							<div>
								{escapeRoom.rooms.length}{" "}
								{escapeRoom.rooms.length === 1 ? "pokój" : "pokoi"}
							</div>
						)}
					</div>
				)}

				{/* Action buttons - always at bottom */}
				{(showEditButton || showPlayButton) && (
					<div className='flex gap-2 mt-auto'>
						{showEditButton && onEdit && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									onEdit(escapeRoom.id);
								}}
								className={`${
									showPlayButton ? "flex-1" : "w-full"
								} bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-1`}>
								<IoCreate size={14} />
								<span className='hidden sm:inline'>Edytuj</span>
								<span className='sm:hidden'>Edit</span>
							</button>
						)}
						{showPlayButton && (
							<button
								onClick={handlePlay}
								className={`${
									showEditButton ? "flex-1" : "w-full"
								} bg-mainMint hover:bg-mainMint/80 text-gray-900 px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-1`}>
								<IoPlay size={14} />
								<span className='hidden sm:inline'>Zagraj</span>
								<span className='sm:hidden'>Play</span>
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default EscapeRoomCard;
