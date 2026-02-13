/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetMyEscapeRooms } from "../hooks/useGetMyEscapeRooms";
import { setCurrentEscapeRoom, clearEditor } from "../store/slices/editorSlice";
import { RootState } from "../store";
import Editor from "../components/organisms/Editor";
import EscapeRoomCard from "../components/atoms/EscapeRoomCard";
import ConfirmationModal from "../components/molecules/ConfirmationModal";
import Pagination from "../components/atoms/Pagination";
import {
	IoAdd,
	IoRefresh,
	IoAlert,
	IoImage,
	IoArrowBack,
} from "react-icons/io5";
import { useAuthorizedApiClient } from "../utils/apiHelpers";

interface EditorMode {
	type: "view" | "create" | "edit";
	escapeRoomId?: number;
}

interface ConfirmationState {
	isOpen: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
}

const EditorPage: React.FC = () => {
	const [mode, setMode] = useState<EditorMode>({ type: "view" });
	const [escapeRooms, setEscapeRooms] = useState<any[]>([]);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [confirmationModal, setConfirmationModal] = useState<ConfirmationState>(
		{
			isOpen: false,
			title: "",
			message: "",
			onConfirm: () => {},
		},
	);

	const dispatch = useDispatch();
	const authorizedApi = useAuthorizedApiClient();

	const currentEscapeRoom = useSelector((state: RootState) =>
		state.editor.escapeRooms.find(
			(er) => er.id === state.editor.currentEscapeRoomId,
		),
	);

	const [page, setPage] = useState(1);
	const {
		escapeRooms: fetchedEscapeRooms,
		pagination,
		loading,
		error,
		refetch,
	} = useGetMyEscapeRooms(page, 8);

	useEffect(() => {
		if (fetchedEscapeRooms) {
			setEscapeRooms(fetchedEscapeRooms);
		}
	}, [fetchedEscapeRooms]);

	useEffect(() => {
		if (mode.type !== "view" && currentEscapeRoom) {
			setHasUnsavedChanges(true);
		}
	}, [currentEscapeRoom, mode.type]);

	useEffect(() => {
		if (mode.type === "create") {
			const timer = setTimeout(() => {
				setHasUnsavedChanges(true);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [mode.type]);

	const handleCreateNewEscapeRoom = () => {
		if (hasUnsavedChanges) {
			setConfirmationModal({
				isOpen: true,
				title: "Niezapisane zmiany",
				message:
					"Masz niezapisane zmiany. Czy na pewno chcesz utworzyć nowy escape room?",
				onConfirm: () => {
					dispatch(clearEditor());
					setMode({ type: "create" });
					setHasUnsavedChanges(false);
					setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
				},
			});
		} else {
			dispatch(clearEditor());
			setMode({ type: "create" });
			setHasUnsavedChanges(false);
		}
	};

	const handleBackToList = () => {
		if (hasUnsavedChanges) {
			setConfirmationModal({
				isOpen: true,
				title: "Niezapisane zmiany",
				message:
					"Masz niezapisane zmiany. Czy na pewno chcesz wrócić do listy?",
				onConfirm: () => {
					setMode({ type: "view" });
					setHasUnsavedChanges(false);
					dispatch(clearEditor());
					setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
				},
			});
		} else {
			setMode({ type: "view" });
			setHasUnsavedChanges(false);
			dispatch(clearEditor());
		}
	};

	const handleDeleteSuccess = async (escapeRoomId: number) => {
		try {
			await authorizedApi.delete(`/escape-room/${escapeRoomId}`);
			setEscapeRooms((prev) => prev.filter((room) => room.id !== escapeRoomId));
		} catch (error) {
			console.error("Error deleting escape room:", error);
			throw error;
		}
	};

	const handleEditEscapeRoom = async (escapeRoomId: number) => {
		if (hasUnsavedChanges) {
			setConfirmationModal({
				isOpen: true,
				title: "Niezapisane zmiany",
				message:
					"Masz niezapisane zmiany. Czy na pewno chcesz edytować inny escape room?",
				onConfirm: async () => {
					setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
					await loadEscapeRoomForEdit(escapeRoomId);
				},
			});
		} else {
			await loadEscapeRoomForEdit(escapeRoomId);
		}
	};

	const loadEscapeRoomForEdit = async (escapeRoomId: number) => {
		try {
			const escapeRoomData = escapeRooms.find((er) => er.id === escapeRoomId);

			if (!escapeRoomData) {
				console.error("Escape room not found");
				return;
			}

			dispatch(clearEditor());

			const getFullUrl = (path: string | null): string | null => {
				if (!path) return null;
				if (path.startsWith("http")) return path;

				if (path.startsWith("/storage/")) {
					return `${import.meta.env.VITE_API_URL}${path}`;
				} else if (path.startsWith("textures/")) {
					return `${import.meta.env.VITE_API_URL}/storage/${path}`;
				} else if (path.startsWith("/")) {
					return `${import.meta.env.VITE_API_URL}${path}`;
				} else {
					return `${import.meta.env.VITE_API_URL}/storage/${path}`;
				}
			};

			const transformedRooms = (escapeRoomData.rooms || []).map((room: any) => {
				const transformedGrid: Record<string, boolean> = {};
				if (room.grid && typeof room.grid === "object") {
					Object.keys(room.grid).forEach((key) => {
						transformedGrid[key] =
							room.grid[key] === "1" ||
							room.grid[key] === 1 ||
							room.grid[key] === true;
					});
				}

				const transformedWalls: Record<string, string> = {};
				if (room.walls && typeof room.walls === "object") {
					Object.keys(room.walls).forEach((key) => {
						if (key !== "wallColor") {
							transformedWalls[key] = room.walls[key];
						}
					});
				}

				return {
					id: room.id.toString() || `room-${Date.now()}`,
					escapeRoomId: `escape-room-${escapeRoomId}`,
					grid: transformedGrid,
					walls: transformedWalls,
					floorColor: room.floorColor || room.floor_color || "#ffffff",
					wallColor: room.wallColor || room.wall_color || "#888888",
					wallThickness: room.wallThickness || room.wall_thickness || 20,
					floorTexture: getFullUrl(room.floorTexture || room.floor_texture),
					floorTextureAssetId:
						room.floorTextureAssetId || room.floor_texture_id || null,
					door: room.door || null,
					doorTexture: getFullUrl(room.doorTexture || room.door_texture),
					doorTextureAssetId:
						room.doorTextureAssetId || room.door_texture_asset_id || null,
					startingPoint:
						room.startingPoint ||
						(room.starting_point_row !== undefined &&
						room.starting_point_col !== undefined
							? {
									row: room.starting_point_row,
									col: room.starting_point_col,
								}
							: null),

					riddles: (room.riddles || []).map((riddle: any) => ({
						...riddle,
						texture: getFullUrl(riddle.texture),
					})),

					props: (room.props || []).map((prop: any) => ({
						...prop,
						imageUrl: getFullUrl(prop.imageUrl || prop.image_url),
					})),

					floorAccepted: room.floorAccepted || room.floor_accepted || false,
				};
			});

			const escapeRoom = {
				id: `escape-room-${escapeRoomId}`,
				name: escapeRoomData.name,
				description: escapeRoomData.description,
				thumbnail: escapeRoomData.thumbnail_url || null,
				metadata: {
					name: escapeRoomData.name,
					description: escapeRoomData.description,
					thumbnail: getFullUrl(escapeRoomData.thumbnail_url),
					soundtrack: getFullUrl(escapeRoomData.soundtrack_url),
				},
				rooms: transformedRooms,
			};

			dispatch(setCurrentEscapeRoom(escapeRoom));
			setMode({ type: "edit", escapeRoomId });
			setHasUnsavedChanges(false);
		} catch (error) {
			console.error("Error loading escape room:", error);
		}
	};

	const handlePlayEscapeRoom = (escapeRoomId: number) => {
		console.log("Playing escape room:", escapeRoomId);
	};

	const handleSaveSuccess = () => {
		setHasUnsavedChanges(false);
		if (mode.type === "edit") {
			refetch();
		}
	};



	if (mode.type === "create" || mode.type === "edit") {
		return (
			<div className='relative'>
				{/* Back button overlay */}
				<div className='absolute top-2 left-7 z-50'>
					<button
						onClick={handleBackToList}
						className='flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors border border-gray-600'>
						<IoArrowBack size={20} />
					</button>
				</div>

				{/* Unsaved changes indicator */}
				{hasUnsavedChanges && (
					<div className='fixed top-4 right-4 z-50'>
						<div className='bg-yellow-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm border border-yellow-500'>
							Niezapisane zmiany
						</div>
					</div>
				)}

				<Editor
					mode={mode.type}
					onSaveSuccess={handleSaveSuccess}
				/>

				{/* Confirmation Modal */}
				<ConfirmationModal
					isOpen={confirmationModal.isOpen}
					onClose={() =>
						setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
					}
					onConfirm={confirmationModal.onConfirm}
					title={confirmationModal.title}
					message={confirmationModal.message}
					confirmText='Tak, kontynuuj'
					cancelText='Anuluj'
					confirmButtonClass='bg-yellow-600 hover:bg-yellow-700'
				/>
			</div>
		);
	}

	// Show list view
	return (
		<div className='min-h-screen bg-gradient-to-br from-dark via-slate-800 to-dark'>
			{/* Header with Background */}
			<div className='relative py-16 px-4 md:px-6'>
				<div className='absolute inset-0'>
					<img
						src='/create.png'
						alt='Editor Background'
						className='w-full h-full object-cover opacity-20'
					/>
				</div>
				<div className='relative z-10 max-w-6xl mx-auto'>
					<div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4'>
						<div>
							<h1 className='text-3xl md:text-4xl font-bold mb-2 text-light text-center'>
								Moje Escape Roomy
							</h1>
							<p className='text-gray-400'>
								Wybierz escape room do edycji lub utwórz nowy
							</p>
						</div>
						<div className='flex gap-3'>
							<button
								onClick={refetch}
								disabled={loading}
								className='flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50'>
								<IoRefresh className={loading ? "animate-spin" : ""} />
								Odśwież
							</button>
							<button
								onClick={handleCreateNewEscapeRoom}
								className='flex items-center gap-2 bg-mainMint hover:bg-mainMint/80 text-gray-900 px-6 py-2 rounded-lg font-semibold transition-colors'>
								<IoAdd size={20} />
								Utwórz nowy
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Content Section */}
			<div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-16 mt-12'>
				{/* Loading State */}
				{loading && (
					<div className='flex items-center justify-center py-12'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-mainMint'></div>
						<span className='ml-3 text-gray-400'>
							Ładowanie escape roomów...
						</span>
					</div>
				)}
				{/* Error State */}
				{error && (
					<div className='bg-red-600/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6 flex items-center'>
						<IoAlert className='mr-3' size={20} />
						<div>
							<div className='font-semibold'>Błąd</div>
							<div className='text-sm'>{error}</div>
						</div>
						<button
							onClick={refetch}
							className='ml-auto bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-sm transition-colors'>
							Spróbuj ponownie
						</button>
					</div>
				)}
				{/* Empty State */}
				{!loading && !error && escapeRooms.length === 0 && (
					<div className='text-center py-12'>
						<div className='bg-gray-700/80 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
							<IoImage size={32} className='text-gray-400' />
						</div>
						<h3 className='text-xl font-semibold mb-2 text-light'>
							Brak escape roomów
						</h3>
						<p className='text-gray-400 mb-6'>
							Nie masz jeszcze żadnych escape roomów. Utwórz swój pierwszy!
						</p>
						<button
							onClick={handleCreateNewEscapeRoom}
							className='bg-mainMint hover:bg-mainMint/80 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors'>
							Utwórz pierwszy escape room
						</button>
					</div>
				)}
				{/* Escape Rooms Grid */}
				{!loading && !error && escapeRooms.length > 0 && (
					<>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
							{escapeRooms.map((escapeRoom) => (
								<EscapeRoomCard
									key={escapeRoom.id}
									escapeRoom={escapeRoom}
									mode='editor'
									onEdit={handleEditEscapeRoom}
									onDelete={handleDeleteSuccess}
									onPlay={handlePlayEscapeRoom}
									showEditButton={true}
									showPlayButton={true}
									showDeleteButton={true}
									showMetaInfo={true}
									className='bg-gray-800/90 backdrop-blur-sm border border-gray-600 hover:shadow-xl hover:border-mainMint transition-all duration-200'
								/>
							))}
						</div>
						<Pagination
							currentPage={pagination.currentPage}
							lastPage={pagination.lastPage}
							onPageChange={setPage}
							total={pagination.total}
						/>
					</>
				)}
			</div>

			{/* Confirmation Modal */}
			<ConfirmationModal
				isOpen={confirmationModal.isOpen}
				onClose={() =>
					setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
				}
				onConfirm={confirmationModal.onConfirm}
				title={confirmationModal.title}
				message={confirmationModal.message}
				confirmText='Tak, kontynuuj'
				cancelText='Anuluj'
				confirmButtonClass='bg-yellow-600 hover:bg-yellow-700'
			/>
		</div>
	);
};

export default EditorPage;
