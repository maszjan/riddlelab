import { useState, useEffect } from "react";
import { useAuthorizedApiClient } from "../utils/apiHelpers";
import { AssetsResponse } from "../interfaces";

const useGetMyAssets = () => {
	const [assets, setAssets] = useState<AssetsResponse | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);
	const [hasFetched, setHasFetched] = useState<boolean>(false);
	const authorizedClient = useAuthorizedApiClient();

	useEffect(() => {
		if (hasFetched) return;

		const fetchAssets = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await authorizedClient.get("/asset/my");
				setAssets(response.data);
				setHasFetched(true);
			} catch (err) {
				setError(
					err instanceof Error ? err : new Error("Unknown error occurred"),
				);
			} finally {
				setLoading(false);
			}
		};

		fetchAssets();
	}, [authorizedClient, hasFetched]);

	const refetch = () => {
		setHasFetched(false);
	};

	return { assets, loading, error, refetch, hasFetched };
};

export default useGetMyAssets;
