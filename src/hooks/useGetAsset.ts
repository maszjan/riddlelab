import { useState, useEffect } from "react";
import { useAuthorizedApiClient } from "../utils/apiHelpers";
import { AssetResponse } from "../interfaces/assetInterfaces";

const useGetAsset = (id: number | null) => {
	const [asset, setAsset] = useState<AssetResponse | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);
	const [hasFetched, setHasFetched] = useState<boolean>(false);
	const authorizedClient = useAuthorizedApiClient();

	useEffect(() => {
		// Resetuj stan hasFetched gdy zmienia się id
		if (id !== null) {
			setHasFetched(false);
		}
	}, [id]);

	useEffect(() => {
		const fetchAsset = async () => {
			if (!id || hasFetched) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError(null);

				const response = await authorizedClient.get(`/asset/${id}`);
				setAsset(response.data);
				setHasFetched(true);
			} catch (err) {
				setError(
					err instanceof Error ? err : new Error("Unknown error occurred"),
				);
			} finally {
				setLoading(false);
			}
		};

		fetchAsset();
	}, [id, authorizedClient, hasFetched]);

	const refetch = () => {
		setHasFetched(false);
	};

	return { asset, loading, error, hasFetched, refetch };
};

export default useGetAsset;
