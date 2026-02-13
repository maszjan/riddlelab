import { useState, useEffect } from "react";
import { useAuthorizedApiClient } from "../utils/apiHelpers";

export interface LeaderboardEntry {
	position: number;
	user: {
		id: number;
		name: string;
		player_configuration?: any;
	};
	total_score: number;
	total_completed: number;
	total_hints: number;
	best_time: number;
}

export interface LeaderboardResponse {
	data: LeaderboardEntry[];
	current_page: number;
	last_page: number;
	total: number;
}

export const useGetLeaderboard = (
	filter: "daily" | "weekly" | "allTime",
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
		const fetchLeaderboard = async () => {
			try {
				setLoading(true);
				const res = await apiClient.get<LeaderboardResponse>("/leaderboard", {
					params: { filter, search: searchTerm, page },
				});
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
	}, [filter, searchTerm, page]);

	return { data, loading, error, page, lastPage, total, setPage };
};
