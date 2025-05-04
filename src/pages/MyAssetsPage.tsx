import React from "react";
import AssetLibrary from "../components/organisms/Assets/AssetLibrary";

const MyAssetsPage: React.FC = () => {
	return (
		<div className='container mx-auto p-6'>
			<h1 className='text-3xl font-bold mb-6 text-mainMint'>Moje zasoby</h1>
			<AssetLibrary />
		</div>
	);
};

export default MyAssetsPage;
