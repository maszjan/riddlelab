import { useState } from "react";
import AssetCard from "../../atoms/AssetCard";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

// Define asset types
type AssetType = "door" | "floor" | "prop" | "riddle";

// Define asset interface
interface Asset {
	id: number;
	name: string;
	is_public: boolean;
	url?: string;
	type?: string;
}

// ✅ FIX 1: Change from interface to type for mapped types
type AssetsResponse = {
	[K in AssetType]?: Asset[];
};

// Define component props interface
interface AssetLibraryProps {
	assets: AssetsResponse | null;
	loading: boolean;
	error: Error | null;
	refetchAssets?: () => void;
}

// Define expanded types state
type ExpandedTypesState = Record<AssetType, boolean>;

// ✅ FIX 2: Simplify asset type names without conflicting index signatures
const assetTypeNames: Record<AssetType, string> = {
	door: "Drzwi",
	floor: "Podłogi",
	prop: "Przedmioty",
	riddle: "Zagadki",
};

const AssetLibrary = ({
	assets,
	loading,
	error,
	refetchAssets,
}: AssetLibraryProps) => {
	const [expandedTypes, setExpandedTypes] = useState<ExpandedTypesState>({
		door: true,
		floor: true,
		prop: true,
		riddle: true,
	});
	const [showPublicAssets, setShowPublicAssets] = useState(true);

	// ✅ FIX 3: Improve type safety for toggleType function
	const toggleType = (type: AssetType) => {
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

	// ✅ FIX 4: Improve type safety for filtered assets
	const filteredAssets: Partial<Record<AssetType, Asset[]>> = {};

	// ✅ FIX 5: Type-safe iteration over assets
	(Object.entries(assets) as Array<[AssetType, Asset[] | undefined]>).forEach(
		([type, typeAssets]) => {
			if (Array.isArray(typeAssets)) {
				filteredAssets[type] = typeAssets.filter((asset: Asset) =>
					showPublicAssets ? true : !asset.is_public,
				);
			}
		},
	);

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

			{/* ✅ FIX 6: Type-safe iteration and better type guards */}
			{(Object.entries(filteredAssets) as Array<[AssetType, Asset[]]>).map(
				([type, typeAssets]) => {
					// Type guard to ensure we have a valid array
					if (!Array.isArray(typeAssets)) return null;

					return (
						<div key={type} className='asset-category mb-8'>
							<div
								className='flex justify-between items-center cursor-pointer'
								onClick={() => toggleType(type)}>
								<h2 className='text-2xl font-bold capitalize mb-4 text-mainMint'>
									{assetTypeNames[type]} ({typeAssets.length})
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
											{typeAssets.map((asset: Asset) => (
												<AssetCard
													key={asset.id}
													asset={asset}
													onDelete={handleAssetDelete}
												/>
											))}
										</div>
									) : (
										<p className='text-gray-400 italic'>
											Brak zasobów typu {assetTypeNames[type].toLowerCase()}
										</p>
									)}
								</>
							)}
						</div>
					);
				},
			)}
		</div>
	);
};

export default AssetLibrary;
