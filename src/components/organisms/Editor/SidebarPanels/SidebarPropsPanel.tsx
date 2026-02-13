interface SidebarPropsPanelProps {
	currentRoom: any;
	selectedProp: string | null;
	dispatch: any;
	getDisplayUrl: (url: string | null | undefined) => string | null;
	handleRemoveProp: (propId: string) => void;
	setCurrentAssetType: (type: string) => void;
	setIsAssetModalOpen: (open: boolean) => void;
	selectedPropAssetDetails: any;
	propName: string;
	setPropName: (name: string) => void;
	handleAddPropFromAsset: () => void;
	propLibrary: any[];
	handleAddPropFromLibrary: (prop: any) => void;
}

const SidebarPropsPanel: React.FC<SidebarPropsPanelProps> = ({
	currentRoom,
	selectedProp,
	dispatch,
	getDisplayUrl,
	handleRemoveProp,
	setCurrentAssetType,
	setIsAssetModalOpen,
	selectedPropAssetDetails,
	propName,
	setPropName,
	handleAddPropFromAsset,
	propLibrary,
	handleAddPropFromLibrary,
}) => (
	<div>
		<h4 className='text-md font-bold text-white mb-4'>Przedmioty</h4>
		{selectedProp && (
			<div className='mb-4 p-2 bg-yellow-600 bg-opacity-20 rounded'>
				<div className='flex justify-between items-center'>
					<span className='text-sm text-white'>
						Wybrany przedmiot do przeniesienia
					</span>
					<button
						onClick={() =>
							dispatch({ type: "editor/setSelectedProp", payload: null })
						}
						className='text-xs text-red-400'>
						Anuluj
					</button>
				</div>
				<p className='text-xs text-gray-300 mt-1'>
					Kliknij na siatkę, aby przenieść przedmiot
				</p>
			</div>
		)}
		<h5 className='text-sm font-bold text-white mb-2'>Przedmioty w pokoju</h5>
		{currentRoom?.props?.length ? (
			<ul className='text-sm text-gray-300 mb-4 max-h-60 overflow-y-auto'>
				{currentRoom.props.map((prop: any) => {
					const displayUrl = getDisplayUrl(prop.imageUrl || null);
					const isSelected = selectedProp === prop.id;
					return (
						<li
							key={prop.id}
							className={`mb-3 p-3 ${
								isSelected
									? "bg-mainMint bg-opacity-20 border border-mainMint"
									: "bg-gray-700"
							} rounded`}>
							<div className='flex items-center justify-between mb-2'>
								<div className='flex items-center'>
									<div className='w-8 h-8 mr-2 bg-gray-600 rounded overflow-hidden'>
										{displayUrl && (
											<img
												src={displayUrl}
												alt={prop.name}
												className='w-full h-full object-cover'
												style={{
													transform: `
                                                        scaleX(${prop.flipHorizontal ? -1 : 1}) 
                                                        scaleY(${prop.flipVertical ? -1 : 1})
                                                        rotate(${prop.rotation || 0}deg)
                                                    `,
												}}
												onError={() => {
													console.error(
														"Failed to load prop image:",
														displayUrl,
													);
												}}
											/>
										)}
									</div>
									<span className='text-xs font-medium'>{prop.name}</span>
								</div>
								<div className='flex gap-1'>
									<button
										onClick={() =>
											dispatch({
												type: "editor/setSelectedProp",
												payload: selectedProp === prop.id ? null : prop.id,
											})
										}
										className='text-blue-400 text-xs px-2 py-1 bg-blue-900 rounded hover:bg-blue-800'>
										{selectedProp === prop.id ? "Anuluj" : "Przenieś"}
									</button>
									<button
										onClick={() => handleRemoveProp(prop.id)}
										className='text-red-400 text-xs px-2 py-1 bg-red-900 rounded hover:bg-red-800'>
										Usuń
									</button>
								</div>
							</div>
							{/* Rotation and Reflection controls - show when prop is selected */}
							{isSelected && (
								<div className='mt-2 pt-2 border-t border-gray-600'>
									{/* Rotation controls */}
									<div className='mb-3'>
										<label className='text-xs text-gray-300 block mb-1'>
											Rotacja przedmiotu:
										</label>
										<div className='flex items-center gap-2'>
											<input
												type='range'
												min={0}
												max={360}
												value={prop.rotation || 0}
												onChange={(e) =>
													dispatch({
														type: "editor/updatePropRotation",
														payload: {
															propId: prop.id,
															rotation: parseInt(e.target.value),
														},
													})
												}
												className='flex-1 accent-mainMint'
											/>
											<input
												type='number'
												min={0}
												max={360}
												value={prop.rotation || 0}
												onChange={(e) =>
													dispatch({
														type: "editor/updatePropRotation",
														payload: {
															propId: prop.id,
															rotation: parseInt(e.target.value) || 0,
														},
													})
												}
												className='w-16 bg-gray-600 text-white rounded px-2 py-1 text-xs'
											/>
											<span className='text-xs text-gray-300'>°</span>
										</div>
									</div>
									{/* Quick rotation buttons */}
									<div className='flex gap-1 mb-3'>
										{[0, 90, 180, 270].map((rotation) => (
											<button
												key={rotation}
												onClick={() =>
													dispatch({
														type: "editor/updatePropRotation",
														payload: {
															propId: prop.id,
															rotation,
														},
													})
												}
												className={`text-xs px-2 py-1 rounded transition-colors ${
													prop.rotation === rotation
														? "bg-mainMint text-gray-900"
														: "bg-gray-600 text-gray-300 hover:bg-gray-500"
												}`}>
												{rotation}°
											</button>
										))}
									</div>
									{/* Reset transformations button */}
									<button
										onClick={() => {
											dispatch({
												type: "editor/updatePropRotation",
												payload: {
													propId: prop.id,
													rotation: 0,
												},
											});
											dispatch({
												type: "editor/updatePropReflection",
												payload: {
													propId: prop.id,
													flipHorizontal: false,
													flipVertical: false,
												},
											});
										}}
										className='w-full text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'>
										Resetuj transformacje
									</button>
								</div>
							)}
						</li>
					);
				})}
			</ul>
		) : (
			<p className='text-sm text-gray-300 mb-4'>Brak przedmiotów.</p>
		)}
		<div className='mb-4'>
			<button
				onClick={() => {
					setCurrentAssetType("prop");
					setIsAssetModalOpen(true);
				}}
				className='w-full py-2 bg-mainMint text-gray-700 rounded font-semibold'>
				Wybierz
			</button>
			{selectedPropAssetDetails && (
				<div className='mt-2 p-2 bg-gray-700 rounded'>
					<div className='flex items-center mb-2'>
						<div className='w-12 h-12 mr-2 bg-gray-600 rounded overflow-hidden'>
							<img
								src={selectedPropAssetDetails.url}
								alt={selectedPropAssetDetails.name}
								className='w-full h-full object-cover'
							/>
						</div>
						<span className='text-sm text-white'>
							{selectedPropAssetDetails.name}
						</span>
					</div>
					<input
						type='text'
						placeholder='Nazwa przedmiotu'
						value={propName}
						onChange={(e) => setPropName(e.target.value)}
						className='w-full px-2 py-1 bg-gray-600 text-white rounded mb-2'
					/>
					<button
						onClick={handleAddPropFromAsset}
						disabled={!propName.trim()}
						className={`w-full py-1 rounded font-semibold ${
							propName.trim()
								? "bg-mainMint text-gray-700"
								: "bg-gray-600 text-gray-400 cursor-not-allowed"
						}`}>
						Dodaj Przedmiot
					</button>
				</div>
			)}
		</div>
		<h5 className='text-sm font-bold text-white mb-2'>
			Biblioteka przedmiotów
		</h5>
		<div className='mb-4 max-h-40 overflow-y-auto'>
			{propLibrary.length > 0 ? (
				<div className='grid grid-cols-3 gap-2'>
					{propLibrary.map((prop) => (
						<div
							key={prop.id}
							className='bg-gray-700 p-1 rounded cursor-pointer hover:bg-gray-600'
							onClick={() => handleAddPropFromLibrary(prop)}>
							<div className='w-full h-12 bg-gray-600 rounded overflow-hidden mb-1'>
								<img
									src={prop.imageUrl}
									alt={prop.name}
									className='w-full h-full object-cover'
								/>
							</div>
							<p className='text-xs text-gray-300 truncate text-center'>
								{prop.name}
							</p>
						</div>
					))}
				</div>
			) : (
				<p className='text-sm text-gray-300'>Brak zapisanych przedmiotów.</p>
			)}
		</div>
	</div>
);

export default SidebarPropsPanel;
