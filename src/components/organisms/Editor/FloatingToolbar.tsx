import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { setSelectedTool } from "../../../store/slices/editorSlice";
import { GrBrush } from "react-icons/gr";
import { PiEraserDuotone } from "react-icons/pi";
import { BsDoorOpen } from "react-icons/bs";
import { LiaUserNinjaSolid } from "react-icons/lia";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { TbTrashX } from "react-icons/tb";
import { PiCouchDuotone } from "react-icons/pi";
import { GrMultiple } from "react-icons/gr";
import { MdOutlineInfo } from "react-icons/md";

const toolsBeforeAccepted = [
	{
		id: "eraseFloor",
		name: "Podłoga (Usuwaj)",
		icon: <PiEraserDuotone />,
		order: 2,
	},
];

const toolsAfterAccepted = [
	{ id: "door", name: "Drzwi", icon: <BsDoorOpen />, order: 3 },
	{
		id: "startPoint",
		name: "Punkt Startowy",
		icon: <LiaUserNinjaSolid />,
		order: 4,
	},
	{
		id: "riddle",
		name: "Zagadka",
		icon: <HiOutlineQuestionMarkCircle />,
		order: 5,
	},
	{ id: "props", name: "Przedmioty", icon: <PiCouchDuotone />, order: 6 },
];

const toolsCommon = [
	{ id: "paintFloor", name: "Podłoga (Rysuj)", icon: <GrBrush />, order: 1 },
	// Add metadata tool
	{ id: "metadata", name: "Metadane", icon: <MdOutlineInfo />, order: 7 },
	// Add room management tool
	{
		id: "roomManager",
		name: "Zarządzanie Pokojami",
		icon: <GrMultiple />,
		order: 8,
	},
	{ id: "clearRoom", name: "Wyczyść Pokój", icon: <TbTrashX />, order: 9 },
];

const FloatingToolbar = () => {
	const dispatch = useDispatch();
	const selectedTool = useSelector(
		(state: RootState) => state.editor.selectedTool,
	);

	const currentRoom = useSelector((state: RootState) => {
		const escapeRooms = state.editor.escapeRooms || [];
		const currentEscapeRoomId = state.editor.currentEscapeRoomId;

		const escapeRoom = escapeRooms.find((er) => er.id === currentEscapeRoomId);

		return escapeRoom?.rooms?.find(
			(room) => room.id === state.editor.currentRoomId,
		);
	});

	const isFloorAccepted = currentRoom?.floorAccepted || false;

	const toolsToShow = [
		...toolsCommon,
		...(isFloorAccepted ? toolsAfterAccepted : toolsBeforeAccepted),
	].sort((a, b) => a.order - b.order);

	return (
		<div className='absolute top-12 left-4 h-full p-4 flex flex-col space-y-4 z-50 shadow-lg'>
			{toolsToShow.map((tool) => (
				<div
					key={tool.id}
					onClick={() => dispatch(setSelectedTool(tool.id))}
					className={`p-3 rounded-lg cursor-pointer flex items-center justify-center ${
						selectedTool === tool.id
							? "bg-mainMint text-white"
							: "bg-gray-700 text-gray-300"
					}`}
					title={tool.name}>
					<span
						className={`text-2xl ${
							selectedTool === tool.id ? "text-gray-700" : ""
						}`}>
						{tool.icon}
					</span>
				</div>
			))}
		</div>
	);
};

export default FloatingToolbar;
