import React from "react";
import FloatingToolbar from "./Editor/FloatingToolbar";
import RightSidebar from "./Editor/RightSidebar";
import MainCanvasWrapper from "./Editor/MainCanvasWrapper";

interface EditorProps {
	mode?: "create" | "edit";
	onSaveSuccess?: () => void;
}

const Editor: React.FC<EditorProps> = ({
	mode = "create",
	onSaveSuccess,
}) => {
	return (
		<div className='flex h-screen mx- bg-gray-900 text-white relative'>
			<div className='absolute top-0 left-0 w-auto z-50'>
				<FloatingToolbar />
			</div>

			<div className='flex-grow bg-gray-800 relative overflow-hidden flex items-center justify-center pl-8'>
				<div className='relative'>
					<MainCanvasWrapper />
				</div>
			</div>

			<div className='w-72 bg-gray-800 border-gray-600 z-50'>
				<RightSidebar
					mode={mode}
					onSaveSuccess={onSaveSuccess}
				/>
			</div>
		</div>
	);
};

export default Editor;
