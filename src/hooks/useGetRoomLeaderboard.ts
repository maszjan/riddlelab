import { useState, useEffect } from "react";
import { useAuthorizedApiClient } from "../utils/apiHelpers";
import type {
	LeaderboardEntry,
	LeaderboardResponse,
} from "./useGetLeaderboard";

export const useGetRoomLeaderboard = (
	escapeRoomId: number,
	filter: "daily" | "weekly" | "allTime" = "allTime",
	searchTerm: string = "",
) => {
	const apiClient = useAuthorizedApiClient();

	const [data, setData] = useState<LeaderboardEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [page, setPage] = useState(1);
	const [lastPage, setLastPage] = useState(1);
	const [total, setTotal] = useState(0);

	useEffect(() => {
		if (!escapeRoomId) return;
		const fetchLeaderboard = async () => {
			try {
				setLoading(true);
				const res = await apiClient.get<LeaderboardResponse>(
					`/leaderboard/room/${escapeRoomId}`,
					{ params: { filter, search: searchTerm, page } },
				);
				setData(res.data.data);
				setLastPage(res.data.last_page);
				setTotal(res.data.total);
				setError(null);
			} catch {
				setError("Błąd podczas pobierania rankingu");
			} finally {
				setLoading(false);
			}
		};

		fetchLeaderboard();
	}, [escapeRoomId, filter, searchTerm, page]);

	return { data, loading, error, page, lastPage, total, setPage };
};
