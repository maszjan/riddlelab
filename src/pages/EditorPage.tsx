import React, { useState } from "react";
import Editor from "../components/organisms/Editor";

const EditorPage: React.FC = () => {
	const [escapeRoomSelected, setEscapeRoomSelected] = useState(false);

	const handleCreateNewEscapeRoom = () => {
		setEscapeRoomSelected(true); // Simulate creating/selecting an escape room
	};

	if (!escapeRoomSelected) {
		return (
			<div className='flex flex-col items-center justify-center h-screen bg-gray-800 text-white'>
				<h1 className='text-2xl font-bold mb-4'>
					Wybierz lub utwórz escape room
				</h1>
				<button
					onClick={handleCreateNewEscapeRoom}
					className='bg-mainMint px-4 py-2 rounded text-gray-700'>
					Utwórz nowy escape room
				</button>
			</div>
		);
	}

	return <Editor />;
};

export default EditorPage;
