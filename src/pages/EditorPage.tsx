/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetMyEscapeRooms } from "../hooks/useGetMyEscapeRooms";
import { setCurrentEscapeRoom, clearEditor } from "../store/slices/editorSlice";
import { RootState } from "../store";
import Editor from "../components/organisms/Editor";
import EscapeRoomCard from "../components/atoms/EscapeRoomCard";
import ConfirmationModal from "../components/molecules/ConfirmationModal";
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

	// Get current editor state to detect changes
	const currentEscapeRoom = useSelector((state: RootState) =>
		state.editor.escapeRooms.find(
			(er) => er.id === state.editor.currentEscapeRoomId,
		),
	);

	const {
		escapeRooms: fetchedEscapeRooms,
		loading,
		error,
		refetch,
	} = useGetMyEscapeRooms();

	useEffect(() => {
		if (fetchedEscapeRooms) {
			setEscapeRooms(fetchedEscapeRooms);
		}
	}, [fetchedEscapeRooms]);

	// Track changes to detect unsaved modifications
	useEffect(() => {
		if (mode.type !== "view" && currentEscapeRoom) {
			setHasUnsavedChanges(true);
		}
	}, [currentEscapeRoom, mode.type]);

	// Set unsaved changes when entering create mode
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
			console.log(`Escape room ${escapeRoomId} deleted successfully`);
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

			// Clear editor state first
			dispatch(clearEditor());

			// Helper function to construct full URL
			const getFullUrl = (path: string | null): string | null => {
				if (!path) return null;
				if (path.startsWith("http")) return path;

				// Handle paths that already start with /storage/
				if (path.startsWith("/storage/")) {
					return `${import.meta.env.VITE_API_URL}${path}`;
				}
				// Handle relative paths from textures/ - add /storage/ prefix
				else if (path.startsWith("textures/")) {
					return `${import.meta.env.VITE_API_URL}/storage/${path}`;
				}
				// Handle other paths that start with /
				else if (path.startsWith("/")) {
					return `${import.meta.env.VITE_API_URL}${path}`;
				}
				// Handle any other relative paths
				else {
					return `${import.meta.env.VITE_API_URL}/storage/${path}`;
				}
			};

			// Transform the API room data to match editor format
			const transformedRooms = (escapeRoomData.rooms || []).map((room: any) => {
				// Convert grid values from strings to booleans
				const transformedGrid: Record<string, boolean> = {};
				if (room.grid && typeof room.grid === "object") {
					Object.keys(room.grid).forEach((key) => {
						// Convert string '1' to boolean true, anything else to false
						transformedGrid[key] =
							room.grid[key] === "1" ||
							room.grid[key] === 1 ||
							room.grid[key] === true;
					});
				}

				// Transform walls data - exclude wallColor property that shouldn't be in grid coordinates
				const transformedWalls: Record<string, string> = {};
				if (room.walls && typeof room.walls === "object") {
					Object.keys(room.walls).forEach((key) => {
						if (key !== "wallColor") {
							// Skip the wallColor property
							transformedWalls[key] = room.walls[key];
						}
					});
				}

				return {
					id: room.id.toString() || `room-${Date.now()}`,
					escapeRoomId: `escape-room-${escapeRoomId}`,
					// Use transformed grid with boolean values
					grid: transformedGrid,
					// Use transformed walls
					walls: transformedWalls,
					// Floor color - use the camelCase version or fallback to snake_case
					floorColor: room.floorColor || room.floor_color || "#ffffff",
					// Wall color - use the camelCase version or fallback to snake_case
					wallColor: room.wallColor || room.wall_color || "#888888",
					// Wall thickness - use the camelCase version or fallback to snake_case
					wallThickness: room.wallThickness || room.wall_thickness || 20,
					// Floor texture - construct full URL if relative path
					floorTexture: getFullUrl(room.floorTexture || room.floor_texture),
					// Floor texture asset ID
					floorTextureAssetId:
						room.floorTextureAssetId || room.floor_texture_id || null,
					// Door - it's already an object in your data
					door: room.door || null,
					// Door texture - construct full URL if relative path
					doorTexture: getFullUrl(room.doorTexture || room.door_texture),
					doorTextureAssetId:
						room.doorTextureAssetId || room.door_texture_asset_id || null,
					// Starting point - it's already an object in your data
					startingPoint:
						room.startingPoint ||
						(room.starting_point_row !== undefined &&
						room.starting_point_col !== undefined
							? {
									row: room.starting_point_row,
									col: room.starting_point_col,
							  }
							: null),
					// Riddles - transform texture URLs
					riddles: (room.riddles || []).map((riddle: any) => ({
						...riddle,
						texture: getFullUrl(riddle.texture),
					})),
					// Props - transform image URLs
					props: (room.props || []).map((prop: any) => ({
						...prop,
						imageUrl: getFullUrl(prop.imageUrl || prop.image_url),
					})),

					// Floor accepted
					floorAccepted: room.floorAccepted || room.floor_accepted || false,
				};
			});

			// Create the escape room structure for the editor
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

			console.log("Loading escape room into editor:", escapeRoom);

			// Set the current escape room in the editor
			dispatch(setCurrentEscapeRoom(escapeRoom));
			setMode({ type: "edit", escapeRoomId });
			setHasUnsavedChanges(false);
		} catch (error) {
			console.error("Error loading escape room:", error);
		}
	};

	const handlePlayEscapeRoom = (escapeRoomId: number) => {
		// TODO: Implement play functionality
		console.log("Playing escape room:", escapeRoomId);
	};

	const handleSaveSuccess = () => {
		setHasUnsavedChanges(false);
		// Optionally refresh the list if we're editing
		if (mode.type === "edit") {
			refetch();
		}
	};

	const handleSaveAndExit = () => {
		// This would be called from the Editor component when save is successful
		handleSaveSuccess();
		setMode({ type: "view" });
	};

	// Show editor when in create or edit mode
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
					onSaveAndExit={handleSaveAndExit}
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
