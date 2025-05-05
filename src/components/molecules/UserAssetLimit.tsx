import React from "react";
import { FaPlusCircle } from "react-icons/fa";

const UserAssetLimit = ({ assetsLimit, loading, error, onOpenModal }) => {
	if (loading) {
		return (
			<div className='flex justify-center py-4'>
				<p className='text-gray-400'>
					Ładowanie informacji o limitach zasobów...
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
				Wystąpił błąd podczas ładowania informacji o limitach zasobów.
			</div>
		);
	}

	if (!assetsLimit) {
		return (
			<div className='text-gray-400 py-4'>
				Brak informacji o limitach zasobów.
			</div>
		);
	}

	const isLimitExceeded =
		assetsLimit.asset_limit !== -1 &&
		assetsLimit.asset_count >= assetsLimit.asset_limit;
	const percentage =
		assetsLimit.asset_limit !== -1
			? (assetsLimit.asset_count / assetsLimit.asset_limit) * 100
			: 0;

	return (
		<div className='bg-gray-800 rounded-lg py-4 mb-6 shadow-md'>
			<div className='flex justify-between items-center mb-3'>
				<h3 className='text-xl py-4 font-bold text-mainMint'>
					Assety ({assetsLimit.asset_count})
				</h3>
				<button
					onClick={onOpenModal}
					disabled={isLimitExceeded}
					className={`px-4 py-2 flex flex-row space-x-2 items-center rounded-md ${
						isLimitExceeded
							? "bg-gray-600 text-gray-400 cursor-not-allowed"
							: "bg-mainMint text-gray-800 hover:bg-gray-700 hover:text-mainMint transition-colors duration-200"
					}`}>
					<p>Dodaj</p>
					<FaPlusCircle className='ml-2' />
				</button>
			</div>

			<div className='mb-2'>
				<div className='flex justify-between text-sm mb-1'>
					<span className='text-gray-300 mt-2 mb-4'>
						Wykorzystano: {assetsLimit.asset_count}
					</span>
					<span className='text-gray-300'>
						Limit:{" "}
						{assetsLimit.asset_limit === -1
							? "Bez limitu"
							: assetsLimit.asset_limit}
					</span>
				</div>
				{assetsLimit.asset_limit !== -1 && (
					<div className='w-full bg-gray-700 rounded-full h-2.5'>
						<div
							className={`h-2.5 rounded-full ${
								percentage > 90 ? "bg-red-500" : "bg-mainMint"
							}`}
							style={{
								width: `${Math.min(percentage, 100)}%`,
							}}></div>
					</div>
				)}
			</div>

			{isLimitExceeded && (
				<p className='text-red-400 text-sm mt-2'>
					Osiągnięto limit liczby zasobów. Usuń niektóre zasoby lub rozważ
					ulepszenie konta.
				</p>
			)}
		</div>
	);
};

export default UserAssetLimit;
