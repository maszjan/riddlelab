import { useState, useEffect } from "react";
import { useAuthorizedApiClient } from "../utils/apiHelpers";

export interface UserStats {
	completed_rooms: number;
	total_score: number;
	average_score: number;
}

export const useGetUserStats = () => {
	const apiClient = useAuthorizedApiClient();
	const [stats, setStats] = useState<UserStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setLoading(true);
				const res = await apiClient.get<UserStats>("/user/stats");
				setStats(res.data);
				setError(null);
			} catch {
				setError("Błąd podczas pobierania statystyk");
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, []);

	return { stats, loading, error };
};
