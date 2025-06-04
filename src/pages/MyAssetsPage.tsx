import { useState } from "react";
import AssetLibrary from "../components/organisms/Assets/AssetLibrary";
import UserAssetLimit from "../components/molecules/UserAssetLimit";
import CreateAssetModal from "../components/organisms/Assets/CreateAssetModal";
import useGetMyAssets from "../hooks/useGetMyAssets";
import useGetAssetLimit from "../hooks/useGetAssetLimit";

const MyAssetsPage = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const {
		assets,
		loading: assetsLoading,
		error: assetsError,
		refetch: refetchAssets,
	} = useGetMyAssets();
	const {
		assetsLimit,
		loading: limitsLoading,
		error: limitsError,
		refetch: refetchAssetLimit,
	} = useGetAssetLimit();

	const handleOpenModal = () => {
		setIsModalOpen(true);
	};

	const handleCloseModal = (assetAdded = false) => {
		setIsModalOpen(false);
		if (assetAdded) {
			refetchAssets();
			refetchAssetLimit();
		}
	};

	const handleAssetDeleted = () => {
		refetchAssets();
		refetchAssetLimit();
	};

	// Convert AssetData to the expected format
	const convertedAssetsLimit = assetsLimit
		? {
				used: assetsLimit.asset_count,
				total: assetsLimit.asset_limit,
				asset_count: assetsLimit.asset_count,
				asset_limit: assetsLimit.asset_limit,
		  }
		: null;

	// Convert Error to string
	const errorMessage = limitsError ? limitsError.message : null;

	return (
		<div className='container mx-auto p-6'>
			<UserAssetLimit
				assetsLimit={convertedAssetsLimit}
				loading={limitsLoading}
				error={errorMessage}
				onOpenModal={handleOpenModal}
			/>

			<AssetLibrary
				assets={assets}
				loading={assetsLoading}
				error={assetsError}
				refetchAssets={handleAssetDeleted}
			/>

			<CreateAssetModal isOpen={isModalOpen} onClose={handleCloseModal} />
		</div>
	);
};

export default MyAssetsPage;
