/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { RiddleFormState, RiddleType } from "../../../interfaces";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { v4 as uuidv4 } from "uuid";
import {
	addProp,
	removeProp,
	setSelectedProp,
	clearRoom,
	updateMetadata,
	updateWalls,
	updateWallThickness,
	acceptFloor,
	setFloorAndTexture,
	setDoorTexture,
	updateDoorTransformation,
	setCurrentRoom,
	addRoom,
	removeRoom,
} from "../../../store/slices/editorSlice";
import { isGridFilled, isBorderClosed } from "../../../utils/editorHelpers";
import useGetAsset from "../../../hooks/useGetAsset";
import SaveEscapeRoomModal from "../EscapeRooms/SaveEscapeRoomModal";
import AssetPickerModal from "./AssetPickerModal";

import SidebarFloorPanel from "./SidebarPanels/SidebarFloorPanel";
import SidebarDoorPanel from "./SidebarPanels/SidebarDoorPanel";
import SidebarRiddlePanel from "./SidebarPanels/SidebarRiddlePanel";
import SidebarPropsPanel from "./SidebarPanels/SidebarPropsPanel";
import SidebarMetadataPanel from "./SidebarPanels/SidebarMetadataPanel";
import SidebarRoomManagerPanel from "./SidebarPanels/SidebarRoomManager";
import SidebarClearRoomPanel from "./SidebarPanels/SidebarClearRoomPanel";

interface RightSidebarProps {
	mode?: "create" | "edit";
	onSaveSuccess?: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
	mode = "create",
	onSaveSuccess,
}) => {
	const dispatch = useDispatch();
	const selectedTool = useSelector(
		(state: RootState) => state.editor.selectedTool,
	);
	const selectedRiddle = useSelector(
		(state: RootState) => state.editor.selectedRiddle,
	);
	const selectedProp = useSelector(
		(state: RootState) => state.editor.selectedProp,
	);
	const currentEscapeRoomId = useSelector(
		(state: RootState) => state.editor.currentEscapeRoomId,
	);
	const currentEscapeRoom = useSelector((state: RootState) =>
		state.editor.escapeRooms.find((er) => er.id === currentEscapeRoomId),
	);
	const currentRoom = useSelector((state: RootState) => {
		const escapeRoom = state.editor.escapeRooms.find(
			(er) => er.id === currentEscapeRoomId,
		);
		return escapeRoom?.rooms.find(
			(room) => room.id === state.editor.currentRoomId,
		);
	});
	const currentRoomId = useSelector(
		(state: RootState) => state.editor.currentRoomId,
	);

	const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
	const [selectedPropAssetId, setSelectedPropAssetId] = useState<number | null>(
		null,
	);
	const [selectedTexture, setSelectedTexture] = useState<string | null>(null);
	const { asset: selectedPropAssetDetails } = useGetAsset(selectedPropAssetId);
	const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
	const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
	const [currentAssetType, setCurrentAssetType] = useState<string>("floor");
	const { asset: selectedAssetDetails } = useGetAsset(selectedAssetId);
	const [wallColor, setWallColor] = useState<string>(
		currentRoom?.wallColor || "#888888",
	);
	const [wallThickness, setWallThickness] = useState<number>(
		currentRoom?.wallThickness || 6,
	);
	const [isBorderClosedState, setIsBorderClosedState] = useState(false);
	const [isGridFilledState, setIsGridFilledState] = useState(false);
	const [floorAssetId, setFloorAssetId] = useState<number | null>(
		currentRoom?.floorTextureAssetId || null,
	);
	const [doorAssetId, setDoorAssetId] = useState<number | null>(
		currentRoom?.doorTextureAssetId || null,
	);
	const [metadataName, setMetadataName] = useState<string>(
		currentEscapeRoom?.metadata?.name || "",
	);
	const [metadataDescription, setMetadataDescription] = useState<string>(
		currentEscapeRoom?.metadata?.description || "",
	);

	const [propName, setPropName] = useState<string>("");
	const [propLibrary, setPropLibrary] = useState<
		Array<{
			id: string;
			name: string;
			imageUrl: string;
		}>
	>([]);
	const [riddleForm, setRiddleForm] = useState<RiddleFormState>({
		id: null,
		title: "",
		type: "knowledge" as RiddleType,
		question: "",
		answer: "",
		hints: [],
		isEditing: false,
	});
	const [isAddRiddleModalOpen, setIsAddRiddleModalOpen] = useState(false);
	const [editingRiddleId, setEditingRiddleId] = useState<string | null>(null);

	const resetRiddleForm = () => {
		setRiddleForm({
			id: null,
			title: "",
			type: "knowledge" as RiddleType,
			question: "",
			answer: "",
			hints: [],
			isEditing: false,
		});
		setEditingRiddleId(null);
	};

	const handleClearWallColor = () => setWallColor("#888888");

	const handleRemoveProp = (propId: string) => {
		if (currentRoom) {
			dispatch(
				removeProp({
					roomId: currentRoom.id,
					propId,
				}),
			);
			dispatch(setSelectedProp(null));
		}
	};

	const handleApplyDoorTexture = () => {
		dispatch(
			setDoorTexture({
				texture: selectedAssetDetails?.url || null,
				doorTextureAssetId: selectedAssetId || null,
			}),
		);
	};

	const handleAcceptFloor = () => dispatch(acceptFloor());

	const handleWallColorChange = (color: string) => setWallColor(color);

	const handleWallThicknessChange = (thickness: number) =>
		setWallThickness(thickness);

	const handleApplyChanges = () => {
		let texturePath = null;
		if (selectedAssetDetails?.url) {
			const urlObj = new URL(selectedAssetDetails.url);
			texturePath = urlObj.pathname;
		}
		dispatch(
			setFloorAndTexture({
				color: null,
				texture: texturePath,
				textureAssetId: selectedAssetId,
			}),
		);
		dispatch(
			updateWalls({
				key: "wallColor",
				color: wallColor,
			}),
		);
		dispatch(updateWallThickness(wallThickness));
	};

	const handleAddRoom = () => {
		if (!currentEscapeRoom?.rooms) return;
		if (currentEscapeRoom.rooms.length >= 3) {
			alert("Maksymalna liczba pokoi to 3.");
			return;
		}
		const roomNumber = currentEscapeRoom.rooms.length + 1;
		const roomId = `room-${uuidv4()}`;
		dispatch(
			addRoom({
				id: roomId,
				escapeRoomId: currentEscapeRoomId,
				name: `Pokój #${roomNumber}`,
				grid: {},
				walls: {},
				floorColor: "#cccccc",
				wallColor: "#888888",
				wallThickness: 6,
				floorTexture: null,
				door: {
					row: 0,
					col: 0,
					rotation: 0,
					scaleX: 1,
					scaleY: 1,
					opacity: 1,
				},
				doorTexture: null,
				startingPoint: null,
				riddles: [],
				props: [],
				floorAccepted: false,
				floorTextureAssetId: floorAssetId,
				doorTextureAssetId: doorAssetId,
			}),
		);
		dispatch(setCurrentRoom(roomId));
	};

	const handleRemoveRoom = (roomId: string) => {
		if (
			currentEscapeRoom?.rooms?.length &&
			currentEscapeRoom.rooms.length > 1
		) {
			dispatch(removeRoom({ roomId }));
			const newCurrentRoom = currentEscapeRoom.rooms.find(
				(r) => r.id !== roomId,
			);
			if (newCurrentRoom) {
				dispatch(setCurrentRoom(newCurrentRoom.id));
			}
		} else {
			alert("Cannot remove the last room in an escape room.");
		}
	};

	useEffect(() => {
		const savedLibrary = localStorage.getItem("propLibrary");
		if (savedLibrary) {
			try {
				setPropLibrary(JSON.parse(savedLibrary));
			} catch (e) {
				console.error("Failed to load prop library:", e);
			}
		}
	}, []);

	const handleAddPropFromLibrary = (libraryProp: any) => {
		if (currentRoom) {
			dispatch(
				addProp({
					roomId: currentRoom.id,
					prop: {
						id: `prop-${uuidv4()}`,
						name: libraryProp.name,
						imageUrl: libraryProp.imageUrl,
						assetId: libraryProp.assetId || null,
						position: { row: 0, col: 0 },
						rotation: 0,
						flipHorizontal: false,
						flipVertical: false,
					},
				}),
			);
		}
	};

	const handleClearRoom = () => dispatch(clearRoom());

	useEffect(() => {
		if (currentRoom?.grid) {
			const grid = currentRoom.grid;
			const borderClosed = isBorderClosed(grid);
			const gridFilled = borderClosed && isGridFilled(grid);

			setIsBorderClosedState(borderClosed);
			setIsGridFilledState(gridFilled);
		} else {
			setIsBorderClosedState(false);
			setIsGridFilledState(false);
		}
	}, [currentRoom?.grid]);

	useEffect(() => {
		if (currentEscapeRoom?.metadata) {
			setMetadataName(currentEscapeRoom.metadata.name || "");
			setMetadataDescription(currentEscapeRoom.metadata.description || "");
		}
	}, [currentEscapeRoom]);

	useEffect(() => {
		if (currentRoom) {
			setWallColor(currentRoom.wallColor || "#888888");
			setWallThickness(currentRoom.wallThickness || 6);
			setFloorAssetId(currentRoom.floorTextureAssetId || null);
			setDoorAssetId(currentRoom.doorTextureAssetId || null);

			if (selectedTool === "paintFloor" && currentRoom.floorTextureAssetId) {
				setSelectedAssetId(currentRoom.floorTextureAssetId);
				setCurrentAssetType("floor");
			} else if (selectedTool === "door" && currentRoom.doorTextureAssetId) {
				setSelectedAssetId(currentRoom.doorTextureAssetId);
				setCurrentAssetType("door");
			}
		}
	}, [currentRoom, selectedTool]);

	const handleAddPropFromAsset = () => {
		if (selectedPropAssetDetails && propName.trim() && currentRoom) {
			const newProp = {
				id: `prop-${uuidv4()}`,
				name: propName,
				imageUrl: selectedPropAssetDetails.url,
				assetId: selectedPropAssetId,
				position: { row: 0, col: 0 },
				rotation: 0,
				flipHorizontal: false,
				flipVertical: false,
			};
			dispatch(
				addProp({
					roomId: currentRoom.id,
					prop: newProp,
				}),
			);
			setPropName("");
			setSelectedPropAssetId(null);
		}
	};

	const getDisplayUrl = (url: string | null | undefined): string | null => {
		if (!url) return null;
		if (url.startsWith("http")) {
			return url;
		}
		if (url.startsWith("/storage/")) {
			return `${import.meta.env.VITE_API_BASE_URL}${url}`;
		} else if (url.startsWith("textures/")) {
			return `${import.meta.env.VITE_API_BASE_URL}/storage/${url}`;
		} else if (url.startsWith("/")) {
			return `${import.meta.env.VITE_API_BASE_URL}/storage${url}`;
		} else {
			return `${import.meta.env.VITE_API_BASE_URL}/storage/${url}`;
		}
	};

	useEffect(() => {
		if (currentRoom) {
			setWallColor(currentRoom.wallColor || "#888888");
			setWallThickness(currentRoom.wallThickness || 6);
			setFloorAssetId(currentRoom.floorTextureAssetId || null);
			setDoorAssetId(currentRoom.doorTextureAssetId || null);

			if (selectedTool === "paintFloor" && currentRoom.floorTextureAssetId) {
				setSelectedAssetId(currentRoom.floorTextureAssetId);
				setCurrentAssetType("floor");
			} else if (selectedTool === "door" && currentRoom.doorTextureAssetId) {
				setSelectedAssetId(currentRoom.doorTextureAssetId);
				setCurrentAssetType("door");
			}

			if (currentRoom.floorTexture) {
				setSelectedTexture(getDisplayUrl(currentRoom.floorTexture));
			}
		}
	}, [currentRoom, selectedTool]);

	const renderToolOptions = () => {
		if (!currentRoom) return null;
		switch (selectedTool) {
			case "paintFloor":
				return (
					<SidebarFloorPanel
						isBorderClosedState={isBorderClosedState}
						isGridFilledState={isGridFilledState}
						currentRoom={currentRoom}
						wallColor={wallColor}
						wallThickness={wallThickness}
						selectedAssetDetails={selectedAssetDetails}
						selectedTexture={selectedTexture}
						handleAcceptFloor={handleAcceptFloor}
						handleWallColorChange={handleWallColorChange}
						handleClearWallColor={handleClearWallColor}
						handleWallThicknessChange={handleWallThicknessChange}
						handleApplyChanges={handleApplyChanges}
						setCurrentAssetType={setCurrentAssetType}
						setIsAssetModalOpen={setIsAssetModalOpen}
					/>
				);
			case "door":
				return (
					<SidebarDoorPanel
						currentRoom={currentRoom}
						selectedAssetDetails={selectedAssetDetails}
						currentAssetType={currentAssetType}
						handleApplyDoorTexture={handleApplyDoorTexture}
						setCurrentAssetType={setCurrentAssetType}
						setIsAssetModalOpen={setIsAssetModalOpen}
						setSelectedAssetId={setSelectedAssetId}
						dispatch={dispatch}
						updateDoorTransformation={updateDoorTransformation}
					/>
				);
			case "riddle":
				return (
					<SidebarRiddlePanel
						currentRoom={currentRoom}
						selectedRiddle={selectedRiddle}
						dispatch={dispatch}
						resetRiddleForm={resetRiddleForm}
						isAddRiddleModalOpen={isAddRiddleModalOpen}
						setIsAddRiddleModalOpen={setIsAddRiddleModalOpen}
						editingRiddleId={editingRiddleId}
						setEditingRiddleId={setEditingRiddleId}
						riddleForm={riddleForm}
						getDisplayUrl={getDisplayUrl}
					/>
				);
			case "props":
				return (
					<SidebarPropsPanel
						currentRoom={currentRoom}
						selectedProp={selectedProp}
						dispatch={dispatch}
						getDisplayUrl={getDisplayUrl}
						handleRemoveProp={handleRemoveProp}
						setCurrentAssetType={setCurrentAssetType}
						setIsAssetModalOpen={setIsAssetModalOpen}
						selectedPropAssetDetails={selectedPropAssetDetails}
						propName={propName}
						setPropName={setPropName}
						handleAddPropFromAsset={handleAddPropFromAsset}
						propLibrary={propLibrary}
						handleAddPropFromLibrary={handleAddPropFromLibrary}
					/>
				);
			case "metadata":
				return (
					<SidebarMetadataPanel
						metadataName={metadataName}
						setMetadataName={setMetadataName}
						metadataDescription={metadataDescription}
						setMetadataDescription={setMetadataDescription}
						dispatch={dispatch}
						updateMetadata={updateMetadata}
						setIsSaveModalOpen={setIsSaveModalOpen}
					/>
				);
			case "roomManager":
				return (
					<SidebarRoomManagerPanel
						currentEscapeRoom={currentEscapeRoom}
						currentRoomId={currentRoomId}
						dispatch={dispatch}
						setCurrentRoom={setCurrentRoom}
						handleRemoveRoom={handleRemoveRoom}
						handleAddRoom={handleAddRoom}
					/>
				);
			case "clearRoom":
				return <SidebarClearRoomPanel handleClearRoom={handleClearRoom} />;
			case "eraseFloor":
				return (
					<div>
						<h4 className='text-md font-bold text-white mb-4'>Usuwanie</h4>
						<p className='text-sm text-gray-300'>
							Kliknij na siatkę, aby usuwać podłogę.
						</p>
					</div>
				);
			case "startPoint":
				return (
					<div>
						<h4 className='text-md font-bold text-white mb-4'>
							Opcje punktu startowego
						</h4>
						<p className='text-sm text-gray-300'>
							Kliknij na siatkę, aby ustawić punkt startowy.
						</p>
					</div>
				);
			default:
				return (
					<p className='text-sm text-gray-300'>
						Wybierz narzędzie, aby zobaczyć opcje.
					</p>
				);
		}
	};

	return (
		<>
			<div className='w-64 pt-14 mx-4 bg-gray-800 p-6 border-l border-gray-600 h-full overflow-y-auto'>
				{renderToolOptions()}
			</div>
			<AssetPickerModal
				isOpen={isAssetModalOpen}
				onClose={() => setIsAssetModalOpen(false)}
				onSelect={(assetId) => {
					setSelectedAssetId(assetId);
					setIsAssetModalOpen(false);

					if (currentAssetType === "floor") {
						setSelectedTexture(selectedAssetDetails?.url || null);
					} else if (currentAssetType === "door") {
						dispatch(
							setDoorTexture({
								texture: selectedAssetDetails?.url || null,
								doorTextureAssetId: selectedAssetDetails?.id || null,
							}),
						);
					} else if (currentAssetType === "prop") {
						setSelectedPropAssetId(assetId);
					}
				}}
				assetType={currentAssetType}
				title={`Wybierz ${
					currentAssetType === "floor"
						? "teksturę podłogi"
						: currentAssetType === "door"
							? "teksturę drzwi"
							: currentAssetType === "prop"
								? "asset dla przedmiotu"
								: "zasób"
				}`}
			/>
			<SaveEscapeRoomModal
				isOpen={isSaveModalOpen}
				onClose={() => setIsSaveModalOpen(false)}
				onSuccess={() => {
					onSaveSuccess?.();
				}}
				mode={mode}
			/>
		</>
	);
};

export default RightSidebar;
