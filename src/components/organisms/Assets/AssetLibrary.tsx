import React, { useState } from "react";
import AssetCard from "../../atoms/AssetCard";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const assetTypeNames = {
	door: "Drzwi",
	floor: "Podłogi",
	prop: "Przedmioty",
	riddle: "Zagadki",
};

const AssetLibrary = ({ assets, loading, error, refetchAssets }) => {
	const [expandedTypes, setExpandedTypes] = useState({
		door: true,
		floor: true,
		prop: true,
		riddle: true,
	});
	const [showPublicAssets, setShowPublicAssets] = useState(true);

	const toggleType = (type) => {
		setExpandedTypes((prev) => ({
			...prev,
			[type]: !prev[type],
		}));
	};

	const togglePublicAssets = () => {
		setShowPublicAssets(!showPublicAssets);
	};

	const handleAssetDelete = () => {
		
		if (refetchAssets) {
			refetchAssets();
		}
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center h-64'>
				<p className='text-xl text-gray-400'>Ładowanie zasobów...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
				<p>Wystąpił błąd podczas ładowania zasobów.</p>
			</div>
		);
	}

	if (!assets) {
		return (
			<div className='text-center py-8'>
				<p className='text-gray-500'>Brak dostępnych zasobów.</p>
			</div>
		);
	}

	const filteredAssets = {};
	Object.entries(assets).forEach(([type, typeAssets]) => {
		filteredAssets[type] = typeAssets.filter((asset) =>
			showPublicAssets ? true : !asset.is_public,
		);
	});

	return (
		<div className='asset-library'>
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

			{Object.entries(filteredAssets).map(([type, typeAssets]) => (
				<div key={type} className='asset-category mb-8'>
					<div
						className='flex justify-between items-center cursor-pointer'
						onClick={() => toggleType(type)}>
						<h2 className='text-2xl font-bold capitalize mb-4 text-mainMint'>
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
								<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-all duration-300'>
									{typeAssets.map((asset) => (
										<AssetCard
											key={asset.id}
											asset={asset}
											onDelete={handleAssetDelete}
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
			))}
		</div>
	);
};

export default AssetLibrary;
