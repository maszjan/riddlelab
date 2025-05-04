import React from "react";
import useGetAsset from "../../hooks/useGetAsset";

const AssetCard = ({ asset }) => {
	const { asset: assetDetails, loading } = useGetAsset(asset.id);

	return (
		<div className='bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300'>
			<div className='h-40 bg-gray-700 flex items-center justify-center overflow-hidden'>
				{loading ? (
					<p className='text-gray-400'>Ładowanie...</p>
				) : assetDetails?.url ? (
					<img
						src={assetDetails?.url}
						alt={asset.name}
						className='object-cover w-16 h-16'
						onError={(e) => {
							e.currentTarget.src = "/placeholder-image.png";
						}}
					/>
				) : (
					<p className='text-gray-400'>Brak obrazu</p>
				)}
			</div>
			<div className='p-4'>
				<h3 className='text-lg font-semibold text-white'>{asset.name}</h3>
				<p className='text-sm text-gray-400'>
					{asset.is_public ? "Zasób publiczny" : "Mój zasób"}
				</p>
			</div>
		</div>
	);
};

export default AssetCard;
