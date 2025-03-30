import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { setCurrentRoom } from "../../store/slices/editorSlice";

const RoomManager = () => {
	const dispatch = useDispatch();
	const rooms = useSelector((state: RootState) => state.editor.rooms);
	const currentRoomId = useSelector(
		(state: RootState) => state.editor.currentRoomId,
	);

	return (
		<div className='w-64 bg-gray-100 p-4 border-r border-gray-300 h-full'>
			<h2 className='text-lg font-bold mb-4'>Rooms</h2>
			<ul className='space-y-2'>
				{rooms.map((room) => (
					<li
						key={room.id}
						onClick={() => dispatch(setCurrentRoom(room.id))}
						className={`p-2 rounded-lg cursor-pointer ${
							currentRoomId === room.id ? "bg-mainMint text-dark" : "bg-white"
						}`}>
						{room.name}
					</li>
				))}
			</ul>
		</div>
	);
};

export default RoomManager;
