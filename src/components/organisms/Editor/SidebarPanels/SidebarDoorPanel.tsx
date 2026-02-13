import { MdOutlineTexture } from "react-icons/md";

interface SidebarDoorPanelProps {
	currentRoom: any;
	selectedAssetDetails: any;
	currentAssetType: string;
	handleApplyDoorTexture: () => void;
	setCurrentAssetType: (type: string) => void;
	setIsAssetModalOpen: (open: boolean) => void;
	setSelectedAssetId: (id: number | null) => void;
	dispatch: any;
	updateDoorTransformation: any;
}

const SidebarDoorPanel: React.FC<SidebarDoorPanelProps> = ({
	currentRoom,
	selectedAssetDetails,
	currentAssetType,
	handleApplyDoorTexture,
	setCurrentAssetType,
	setIsAssetModalOpen,
	setSelectedAssetId,
	dispatch,
	updateDoorTransformation,
}) => (
	<div className='mx-2'>
		<h4 className='text-md font-bold text-white mb-4'>Opcje drzwi</h4>
		<p className='text-sm text-gray-300 mb-2'>
			Wybierz teksturę drzwi, a następnie kliknij na siatkę, aby je umieścić.
		</p>
		<div className='flex flex-col space-y-4'>
			<div className='flex items-center justify-between'>
				<label className='text-lg mt-1 text-gray-300'>Tekstura:</label>
				<div className='relative'>
					<button
						onClick={() => {
							setCurrentAssetType("door");
							setIsAssetModalOpen(true);
						}}
						className='flex items-center justify-center w-12 h-12 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600'>
						<MdOutlineTexture className='h-6 w-6' />
					</button>
				</div>
			</div>
			{selectedAssetDetails?.url && currentAssetType === "door" && (
				<div className='mt-2 relative'>
					<div className='relative w-24 h-24 border border-gray-600 rounded overflow-hidden'>
						<div
							className='absolute inset-0'
							style={{
								backgroundImage: `url(${selectedAssetDetails.url})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}></div>
						<button
							onClick={() => {
								setSelectedAssetId(null);
								dispatch(
									updateDoorTransformation({
										texture: null,
										doorTextureAssetId: null,
									}),
								);
							}}
							className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600'
							title='Usuń teksturę'>
							X
						</button>
					</div>
				</div>
			)}
			{currentRoom?.door &&
				selectedAssetDetails?.url &&
				currentAssetType === "door" && (
					<div className='mt-4'>
						<h5 className='text-sm font-bold text-white mb-2'>Transformacje</h5>
						<div className='mb-2'>
							<label className='text-sm text-gray-300 block mb-1'>
								Rotacja drzwi:
							</label>
							<div className='flex items-center'>
								<input
									type='range'
									min={0}
									max={360}
									value={currentRoom.door.rotation || 0}
									onChange={(e) =>
										dispatch(
											updateDoorTransformation({
												rotation: parseInt(e.target.value),
											}),
										)
									}
									className='w-24 accent-mainMint mr-2'
								/>
								<input
									type='number'
									min={0}
									max={360}
									value={currentRoom.door.rotation || 0}
									onChange={(e) =>
										dispatch(
											updateDoorTransformation({
												rotation: parseInt(e.target.value) || 0,
											}),
										)
									}
									className='w-16 bg-gray-700 text-white rounded px-2 py-1 text-sm'
								/>
								<span className='text-xs text-gray-300 ml-2'>°</span>
							</div>
						</div>
					</div>
				)}
			{selectedAssetDetails?.url && currentAssetType === "door" && (
				<button
					onClick={handleApplyDoorTexture}
					className='w-24 bg-mainMint font-semibold text-gray-700 py-2 rounded mt-4'>
					Użyj
				</button>
			)}
		</div>
	</div>
);

export default SidebarDoorPanel;
