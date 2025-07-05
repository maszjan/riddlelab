/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetMyEscapeRooms } from "../hooks/useGetMyEscapeRooms";
import { setCurrentEscapeRoom, clearEditor } from "../store/slices/editorSlice";
import Editor from "../components/organisms/Editor";
import EscapeRoomCard from "../components/atoms/EscapeRoomCard";
import { IoAdd, IoRefresh, IoAlert, IoImage } from "react-icons/io5";
import { useAuthorizedApiClient } from "../utils/apiHelpers";

const EditorPage: React.FC = () => {
	const [escapeRoomSelected, setEscapeRoomSelected] = useState(false);
	const [escapeRooms, setEscapeRooms] = useState<any[]>([]);
	const dispatch = useDispatch();
	const authorizedApi = useAuthorizedApiClient();
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

	const handleCreateNewEscapeRoom = () => {
		// Clear the editor state for a fresh start
		dispatch(clearEditor());
		setEscapeRoomSelected(true);
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
			setEscapeRoomSelected(true);
		} catch (error) {
			console.error("Error loading escape room:", error);
		}
	};

	const handlePlayEscapeRoom = (escapeRoomId: number) => {
		// TODO: Implement play functionality
		console.log("Playing escape room:", escapeRoomId);
	};

	if (escapeRoomSelected) {
		return <Editor />;
	}

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

			{/* Content Section - No Background */}
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
		</div>
	);
};

export default EditorPage;
