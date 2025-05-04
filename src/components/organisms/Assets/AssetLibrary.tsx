import React, { useState } from "react";
import useGetMyAssets from "../../../hooks/useGetMyAssets";
import AssetCard from "../../atoms/AssetCard";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const assetTypeNames = {
	door: "Drzwi",
	floor: "Podłogi",
	prop: "Przedmioty",
	riddle: "Zagadki",
};

const AssetLibrary: React.FC = () => {
	const { assets, loading, error, hasFetched } = useGetMyAssets();
	const [expandedTypes, setExpandedTypes] = useState({
		door: true,
		floor: true,
		prop: true,
		riddle: true,
	});

	const toggleType = (type) => {
		setExpandedTypes((prev) => ({
			...prev,
			[type]: !prev[type],
		}));
	};

	if (loading && !hasFetched) {
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

	return (
		<div className='asset-library'>
			{Object.entries(assets).map(([type, typeAssets]) => (
				<div key={type} className='asset-category mb-8'>
					<div
						className='flex justify-between items-center cursor-pointer'
						onClick={() => toggleType(type)}>
						<h2 className='text-2xl font-bold capitalize mb-4 text-mainMint'>
							{assetTypeNames[type] || type}
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
										<AssetCard key={asset.id} asset={asset} />
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
