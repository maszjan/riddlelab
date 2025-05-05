import React, { useState } from "react";
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

	return (
		<div className='container mx-auto p-6'>
			<UserAssetLimit
				assetsLimit={assetsLimit}
				loading={limitsLoading}
				error={limitsError}
				onOpenModal={handleOpenModal}
			/>

			<AssetLibrary
				assets={assets}
				loading={assetsLoading}
				error={assetsError}
			/>

			<CreateAssetModal isOpen={isModalOpen} onClose={handleCloseModal} />
		</div>
	);
};

export default MyAssetsPage;
