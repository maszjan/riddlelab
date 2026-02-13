import { FiPlusCircle } from "react-icons/fi";
import AddRiddleModal from "../../Riddles/AddRiddleModal";
import EditRiddleModal from "../../Riddles/EditRiddleModal";

interface SidebarRiddlePanelProps {
	currentRoom: any;
	selectedRiddle: string | null;
	dispatch: any;
	resetRiddleForm: () => void;
	isAddRiddleModalOpen: boolean;
	setIsAddRiddleModalOpen: (open: boolean) => void;
	editingRiddleId: string | null;
	setEditingRiddleId: (id: string | null) => void;
	riddleForm: any;
	getDisplayUrl: (url: string | null | undefined) => string | null;
}

const SidebarRiddlePanel: React.FC<SidebarRiddlePanelProps> = ({
	currentRoom,
	selectedRiddle,
	dispatch,
	resetRiddleForm,
	isAddRiddleModalOpen,
	setIsAddRiddleModalOpen,
	editingRiddleId,
	setEditingRiddleId,
	riddleForm,
	getDisplayUrl,
}) => (
	<div>
		<h4 className='text-md font-bold text-white mb-4'>Zarządzanie zagadkami</h4>
		<button
			className='mb-4 w-full bg-mainMint text-gray-700 py-2 rounded font-semibold flex items-center justify-center'
			onClick={() => {
				resetRiddleForm();
				setIsAddRiddleModalOpen(true);
			}}>
			<FiPlusCircle className='mr-2' /> Dodaj nową zagadkę
		</button>
		{selectedRiddle && (
			<div className='mb-4 p-2 bg-yellow-600 bg-opacity-20 rounded'>
				<div className='flex justify-between items-center'>
					<span className='text-sm text-white'>
						Wybrana zagadka do przeniesienia
					</span>
					<button
						onClick={() =>
							dispatch({ type: "editor/setSelectedRiddle", payload: null })
						}
						className='text-xs text-red-400'>
						Anuluj
					</button>
				</div>
				<p className='text-xs text-gray-300 mt-1'>
					Kliknij na siatkę, aby przenieść zagadkę
				</p>
			</div>
		)}
		{currentRoom?.riddles && currentRoom.riddles.length > 0 ? (
			<div className='mb-4'>
				<h5 className='text-sm font-bold text-white mb-2'>
					Istniejące zagadki ({currentRoom.riddles.length}/5)
				</h5>
				<div className='grid grid-cols-2 gap-3'>
					{currentRoom.riddles.map((riddle: any) => {
						let imgUrl = null;
						if (riddle.texture) {
							if (riddle.texture.startsWith("http")) {
								imgUrl = riddle.texture;
							} else {
								imgUrl = `http://localhost:8000${riddle.texture}`;
							}
						} else if (riddle.assetId) {
							imgUrl = getDisplayUrl(riddle.assetId.toString());
						}
						const isSelected = selectedRiddle === riddle.id;
						return (
							<div
								key={riddle.id}
								className={`relative flex flex-col items-center justify-between rounded-lg shadow-md border-2 ${
									isSelected ? "border-mainMint" : "border-gray-700"
								} bg-gray-700 overflow-hidden cursor-pointer group`}
								style={{ width: 110, height: 110 }}
								onClick={() =>
									dispatch({
										type: "editor/setSelectedRiddle",
										payload: riddle.id,
									})
								}>
								<div className='w-full h-14 bg-gray-900 flex items-center justify-center'>
									{imgUrl ? (
										<img
											src={imgUrl}
											alt={riddle.title || "Zagadka"}
											className='w-full h-full object-cover'
											style={{ minHeight: 56, maxHeight: 56 }}
											onError={(e) => {
												e.currentTarget.style.display = "none";
												const fallback =
													e.currentTarget.parentElement?.querySelector(
														".fallback-icon",
													);
												if (fallback) {
													(fallback as HTMLElement).style.display = "flex";
												}
											}}
										/>
									) : null}
									<div
										className='fallback-icon w-full h-full flex items-center justify-center text-gray-400 text-2xl'
										style={{ display: imgUrl ? "none" : "flex" }}>
										?
									</div>
								</div>
								<div className='w-full px-2 py-1 bg-gray-800 text-center truncate text-xs font-bold text-white'>
									{riddle.title || `Zagadka #${riddle.id.slice(-4)}`}
								</div>
								<div className='absolute top-1 right-1 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition'>
									<button
										onClick={(e) => {
											e.stopPropagation();
											setEditingRiddleId(riddle.id);
										}}
										className='bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 flex items-center'
										title='Edytuj zagadkę'>
										Edytuj
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											dispatch({
												type: "editor/setSelectedRiddle",
												payload: riddle.id,
											});
										}}
										className='bg-mainMint text-gray-900 text-xs px-2 py-1 rounded hover:bg-mainMint/80'>
										Przenieś
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											dispatch({
												type: "editor/removeRiddle",
												payload: { riddleId: riddle.id },
											});
										}}
										className='bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700'>
										Usuń
									</button>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		) : (
			<p className='text-sm text-gray-300 mb-4'>
				Brak zagadek. Dodaj pierwszą!
			</p>
		)}
		<AddRiddleModal
			isOpen={isAddRiddleModalOpen}
			onClose={() => {
				setIsAddRiddleModalOpen(false);
				resetRiddleForm();
			}}
		/>
		{editingRiddleId && (
			<EditRiddleModal
				isOpen={true}
				onClose={() => setEditingRiddleId(null)}
				riddle={currentRoom?.riddles?.find(
					(r: any) => r.id === editingRiddleId,
				)}
			/>
		)}
		{riddleForm.id && (
			<div className='mb-4'>
				<button
					onClick={resetRiddleForm}
					className='text-xs text-gray-400 hover:text-white'>
					Wyczyść formularz
				</button>
			</div>
		)}
	</div>
);

export default SidebarRiddlePanel;
