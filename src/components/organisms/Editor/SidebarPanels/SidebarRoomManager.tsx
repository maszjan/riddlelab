import { FiPlusCircle } from "react-icons/fi";

interface SidebarRoomManagerPanelProps {
	currentEscapeRoom: any;
	currentRoomId: string;
	dispatch: any;
	setCurrentRoom: any;
	handleRemoveRoom: (roomId: string) => void;
	handleAddRoom: () => void;
}

const SidebarRoomManagerPanel: React.FC<SidebarRoomManagerPanelProps> = ({
	currentEscapeRoom,
	currentRoomId,
	dispatch,
	setCurrentRoom,
	handleRemoveRoom,
	handleAddRoom,
}) => (
	<div className='flex flex-col space-y-6'>
		<div>
			<h4 className='text-md font-bold text-white mb-4'>Zarządzaj pokojami</h4>
			<div className='mb-4'>
				<ul className='mb-2 max-h-40 overflow-y-auto'>
					{currentEscapeRoom?.rooms?.map((room: any, index: number) => (
						<li
							key={room.id}
							className='flex justify-between items-center mb-1 p-2 bg-gray-700 rounded'>
							<button
								onClick={() => dispatch(setCurrentRoom(room.id))}
								className={`text-sm ${
									room.id === currentRoomId
										? "text-mainMint font-bold"
										: "text-gray-300"
								}`}>
								#{index + 1}
							</button>
							<button
								onClick={() => handleRemoveRoom(room.id)}
								className='text-red-500 text-2xl hover:text-red-400'
								disabled={(currentEscapeRoom?.rooms?.length || 0) <= 1}>
								X
							</button>
						</li>
					))}
				</ul>
				{(currentEscapeRoom?.rooms?.length || 0) < 3 && (
					<button
						onClick={handleAddRoom}
						className='w-full bg-mainMint text-gray-700 py-2 rounded font-semibold flex items-center justify-center'>
						<FiPlusCircle className='mr-2' /> Dodaj pokój
					</button>
				)}
			</div>
		</div>
	</div>
);

export default SidebarRoomManagerPanel;
