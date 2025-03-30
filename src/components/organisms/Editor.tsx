import React from "react";
import FloatingToolbar from "./Editor/FloatingToolbar";
import RightSidebar from "./Editor/RightSidebar";
import MainCanvasWrapper from "./Editor/MainCanvasWrapper";

const Editor: React.FC = () => {
	return (
		<div className='flex h-screen w-screen bg-gray-900 text-white relative'>
			{/* Floating Toolbar */}
			<div className='absolute top-0 left-0 w-full z-50'>
				<FloatingToolbar />
			</div>

			{/* Main Canvas */}
			<div className='flex-grow bg-gray-800 relative overflow-hidden flex items-center justify-center'>
				<div className='relative'>
					<MainCanvasWrapper />
				</div>
			</div>

			{/* Right Sidebar */}
			<div className='w-64 bg-gray-700 border-l border-gray-600 z-50'>
				<RightSidebar />
			</div>
		</div>
	);
};

export default Editor;
