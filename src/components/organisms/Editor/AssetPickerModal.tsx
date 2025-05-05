import React, { useState } from "react";
import { createPortal } from "react-dom";
import useGetMyAssets from "../../../hooks/useGetMyAssets";
import AssetPickerCard from "../../atoms/AssetPickerCard";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const assetTypeNames = {
	door: "Drzwi",
	floor: "Podłogi",
	prop: "Przedmioty",
	riddle: "Zagadki",
};

const AssetPickerModal = ({
	isOpen,
	onClose,
	onSelect,
	assetType = null, // If null, show all types
	title = "Wybierz zasób",
	showPublicToggle = true,
	initialShowPublic = true,
}) => {
	const { assets, loading } = useGetMyAssets();
	const [expandedTypes, setExpandedTypes] = useState({
		door: true,
		floor: true,
		prop: true,
		riddle: true,
	});
	const [showPublicAssets, setShowPublicAssets] = useState(initialShowPublic);

	const toggleType = (type) => {
		setExpandedTypes((prev) => ({
			...prev,
			[type]: !prev[type],
		}));
	};

	const togglePublicAssets = () => {
		setShowPublicAssets(!showPublicAssets);
	};

	if (!isOpen) return null;

	// Filter assets by type if specified
	const filteredAssetTypes = assetType
		? { [assetType]: assets?.[assetType] || [] }
		: assets || {};

	// Filter assets by public/private
	const finalFilteredAssets = {};
	Object.entries(filteredAssetTypes).forEach(([type, typeAssets]) => {
		finalFilteredAssets[type] = typeAssets.filter((asset) =>
			showPublicAssets ? true : !asset.is_public,
		);
	});

	return createPortal(
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-xl font-bold text-mainMint'>{title}</h2>
					<button onClick={onClose} className='text-gray-400 hover:text-white'>
						&times;
					</button>
				</div>

				{showPublicToggle && (
					<div className='flex justify-end mb-4'>
						<label className='inline-flex items-center cursor-pointer'>
							<span className='mr-3 text-sm font-medium text-gray-300'>
								Pokaż publiczne zasoby
							</span>
							<div className='relative'>
								<input
									type='checkbox'
									className='sr-only peer'
									checked={showPublicAssets}
									onChange={togglePublicAssets}
								/>
								<div className='w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mainMint'></div>
							</div>
						</label>
					</div>
				)}

				<div className='overflow-y-auto flex-grow'>
					{loading ? (
						<div className='flex justify-center items-center h-64'>
							<p className='text-xl text-gray-400'>Ładowanie zasobów...</p>
						</div>
					) : Object.keys(finalFilteredAssets).length === 0 ? (
						<div className='text-center py-8'>
							<p className='text-gray-500'>Brak dostępnych zasobów.</p>
						</div>
					) : (
						Object.entries(finalFilteredAssets).map(([type, typeAssets]) => (
							<div key={type} className='asset-category mb-8'>
								<div
									className='flex justify-between items-center cursor-pointer'
									onClick={() => toggleType(type)}>
									<h2 className='text-xl font-bold mb-4 text-mainMint'>
										{assetTypeNames[type] || type} ({typeAssets.length})
									</h2>
									<div className='text-mainMint mb-4'>
										{expandedTypes[type] ? <FaChevronUp /> : <FaChevronDown />}
									</div>
								</div>

								<div className='border-b border-gray-700 mb-4'></div>

								{expandedTypes[type] && (
									<>
										{typeAssets.length > 0 ? (
											<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
												{typeAssets.map((asset) => (
													<AssetPickerCard
														key={asset.id}
														asset={asset}
														onSelect={() => onSelect(asset.id)}
													/>
												))}
											</div>
										) : (
											<p className='text-gray-400 italic'>
												Brak zasobów typu{" "}
												{assetTypeNames[type]?.toLowerCase() || type}
											</p>
										)}
									</>
								)}
							</div>
						))
					)}
				</div>

				<div className='flex justify-end mt-4 pt-3 border-t border-gray-700'>
					<button
						onClick={onClose}
						className='px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600'>
						Anuluj
					</button>
				</div>
			</div>
		</div>,
		document.body,
	);
};

export default AssetPickerModal;
