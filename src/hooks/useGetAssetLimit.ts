import { useState, useEffect } from "react";
import { useAuthorizedApiClient } from "../utils/apiHelpers";
import { AssetData } from "../interfaces";

const useGetAssetLimit = () => {
	const [assetsLimit, setAssetsLimit] = useState<AssetData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);
	const [hasFetched, setHasFetched] = useState<boolean>(false);
	const authorizedClient = useAuthorizedApiClient();

	useEffect(() => {
		const fetchAssetLimit = async () => {
			if (hasFetched) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError(null);

				const response = await authorizedClient.get("/user/asset/limit");
				setAssetsLimit(response.data);
				setHasFetched(true);
			} catch (err) {
				setError(
					err instanceof Error ? err : new Error("Unknown error occurred"),
				);
			} finally {
				setLoading(false);
			}
		};

		fetchAssetLimit();
	}, [authorizedClient, hasFetched]);

	const refetch = () => {
		setHasFetched(false);
	};

	return { assetsLimit, loading, error, hasFetched, refetch };
};

export default useGetAssetLimit;
