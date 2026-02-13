import { useState, useEffect } from "react";
import { useAuthorizedApiClient } from "../utils/apiHelpers";
import type {
	GameHistoryAttempt,
	GameHistoryResponse,
} from "../interfaces";

export const useGetGameHistory = () => {
	const apiClient = useAuthorizedApiClient();
	const [data, setData] = useState<GameHistoryAttempt[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState<number>(1);
	const [lastPage, setLastPage] = useState<number>(1);
	const [total, setTotal] = useState<number>(0);

	useEffect(() => {
		const fetchGameHistory = async () => {
			try {
				setLoading(true);

				const res = await apiClient.get<GameHistoryResponse>("/game-history", {
					params: { page },
				});

				const baseUrl = import.meta.env.VITE_API_URL as string;

				const normalized = res.data.data.map((a) => ({
					...a,
					escape_room: {
						...a.escape_room,
						thumbnail_url: a.escape_room?.thumbnail_url
							? `${baseUrl}${a.escape_room.thumbnail_url}`
							: null,
					},
				}));

				setData(normalized);
				setPage(res.data.current_page);
				setLastPage(res.data.last_page);
				setTotal(res.data.total);
				setError(null);
			} catch (e) {
				setError("Błąd podczas pobierania historii gier");
			} finally {
				setLoading(false);
			}
		};

		fetchGameHistory();
	}, [apiClient, page]);

	return { data, loading, error, page, lastPage, total, setPage };
};
