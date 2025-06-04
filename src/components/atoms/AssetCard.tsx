import { useState } from "react";
import useGetAsset from "../../hooks/useGetAsset";
import { FaTrash } from "react-icons/fa";
import { useAuthorizedApiClient } from "../../utils/apiHelpers";
import ConfirmationModal from "../molecules/ConfirmationModal";

// Define types for the component props
interface Asset {
	id: number;
	name: string;
	is_public: boolean;
}

interface AssetCardProps {
	asset: Asset;
	onDelete?: (assetId: number) => void;
}

const AssetCard = ({ asset, onDelete }: AssetCardProps) => {
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const { asset: assetDetails, loading } = useGetAsset(asset.id);
	const authorizedClient = useAuthorizedApiClient();

	const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		setShowDeleteModal(true);
	};

	const handleConfirmDelete = async () => {
		try {
			await authorizedClient.delete(`/asset/${asset.id}`);
			setShowDeleteModal(false);
			if (onDelete) {
				onDelete(asset.id);
			}
		} catch (error) {
			console.error("Błąd podczas usuwania zasobu:", error);
			alert("Wystąpił błąd podczas usuwania zasobu.");
		}
	};

	return (
		<>
			<div className='bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 relative'>
				{!asset.is_public && (
					<button
						onClick={handleDeleteClick}
						className='absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full z-10 transition-colors duration-200'
						title='Usuń zasób'>
						<FaTrash size={14} />
					</button>
				)}

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
						{asset.is_public ? "Asset publiczny" : "Mój asset"}
					</p>
				</div>
			</div>

			<ConfirmationModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleConfirmDelete}
				title='Potwierdź'
				message={`Czy na pewno chcesz usunąć zasób "${asset.name}"?`}
				subMessage='Tej operacji nie można cofnąć.'
				confirmText='Usuń'
				cancelText='Anuluj'
				confirmButtonClass='bg-red-500 hover:bg-red-600'
			/>
		</>
	);
};

export default AssetCard;
