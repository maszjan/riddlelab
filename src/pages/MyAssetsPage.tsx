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
		<div className='min-h-screen bg-gradient-to-br from-dark via-slate-800 to-dark'>
			{/* Header with Background */}
			<div className='relative py-16 px-4 md:px-6'>
				<div className='absolute inset-0'>
					<img
						src='/assets.png'
						alt='Assets Background'
						className='w-full h-full object-cover opacity-20'
					/>
				</div>
				<div className='relative z-10 max-w-7xl mx-auto'>
					<div className='text-center'>
						<h1 className='text-3xl md:text-4xl font-bold mb-2 text-light'>
							Moje Assety
						</h1>
						<p className='text-gray-400'>
							Zarządzaj swoimi assetami i twórz nowe
						</p>
					</div>
				</div>
			</div>

			{/* Content Section - No Background */}
			<div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-16'>
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
		</div>
	);
};

export default MyAssetsPage;
