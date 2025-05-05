import React from "react";
import useGetAsset from "../../hooks/useGetAsset";

const AssetPickerCard = ({ asset, onSelect }) => {
	const { asset: assetDetails, loading } = useGetAsset(asset.id);

	return (
		<div
			className='bg-gray-700 rounded-lg p-2 cursor-pointer hover:bg-gray-600 transition-colors'
			onClick={() => onSelect(asset.id)}>
			<div className='h-24 bg-gray-800 rounded flex items-center justify-center mb-2'>
				{loading ? (
					<p className='text-gray-400'>Ładowanie...</p>
				) : assetDetails?.url ? (
					<img
						src={assetDetails.url}
						alt={asset.name}
						className='max-h-20 max-w-full object-contain'
						onError={(e) => {
							e.currentTarget.src = "/placeholder-image.png";
						}}
					/>
				) : (
					<p className='text-gray-400'>Brak obrazu</p>
				)}
			</div>
			<p className='text-sm text-gray-300 truncate'>{asset.name}</p>
		</div>
	);
};

export default AssetPickerCard;
