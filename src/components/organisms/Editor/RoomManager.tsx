import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { setCurrentRoom } from "../../../store/slices/editorSlice";

const RoomManager: React.FC = () => {
	const dispatch = useDispatch();
	const { currentEscapeRoomId, currentRoomId } = useSelector(
		(state: RootState) => state.editor,
	);

	const currentEscapeRoom = useSelector((state: RootState) =>
		state.editor.escapeRooms.find((er) => er.id === currentEscapeRoomId),
	);

	const rooms = currentEscapeRoom?.rooms || [];

	return (
		<div className='p-4'>
			<h3 className='text-lg font-bold text-white mb-4'>Room Manager</h3>

			{rooms.map((room) => (
				<button
					key={room.id}
					onClick={() => dispatch(setCurrentRoom(room.id))}
					className={`block w-full p-3 mb-2 rounded text-left ${
						currentRoomId === room.id
							? "bg-blue-600 text-white"
							: "bg-gray-700 text-gray-300 hover:bg-gray-600"
					}`}>
					{room.name || `Room ${room.id}`}
				</button>
			))}
		</div>
	);
};

export default RoomManager;
