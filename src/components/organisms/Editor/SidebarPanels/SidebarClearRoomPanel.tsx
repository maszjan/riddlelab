import React from "react";

interface SidebarClearRoomPanelProps {
	handleClearRoom: () => void;
}

const SidebarClearRoomPanel: React.FC<SidebarClearRoomPanelProps> = ({
	handleClearRoom,
}) => (
	<div>
		<h4 className='text-md font-bold text-white mb-4'>Wyczyść Pokój</h4>
		<p className='text-sm text-gray-300 mb-2'>
			Usuń wszystkie elementy z pokoju.
		</p>
		<button
			onClick={handleClearRoom}
			className='w-24 bg-red-500 text-white py-2 rounded'>
			Wyczyść
		</button>
	</div>
);

export default SidebarClearRoomPanel;
