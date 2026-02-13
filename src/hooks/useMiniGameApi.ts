import { authorizedApiClient } from "../utils/apiHelpers";
import { useState } from "react";

export interface MiniGameType {
	value: string;
	label: string;
	description: string;
}

export interface MiniGame {
	id: number;
	name: string;
	type: string;
	difficulty: string;
	config: any;
	estimated_time: number;
	description: string;
	start_time?: string;
	attempt_id?: number;
}

export interface MiniGameAttempt {
	attempt_id: number;
	config: any;
	start_time: string;
}

export interface MiniGameResult {
	success: boolean;
	score: number;
	time_spent: number;
	message: string;
	attemptsLeft?: number;
}

export const useMiniGameApi = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getMiniGames = async (): Promise<MiniGameType[] | null> => {
		setLoading(true);
		setError(null);
		try {
			const response =
				await authorizedApiClient.get<MiniGameType[]>("/mini-game");
			return response.data;
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to load mini games");
			return null;
		} finally {
			setLoading(false);
		}
	};

	const generateMiniGame = async (
		type: string,
		difficulty: string = "medium",
		attemptId?: number,
		riddleId?: number,
	): Promise<MiniGame | null> => {
		setLoading(true);
		setError(null);
		try {
			const response = await authorizedApiClient.post<MiniGame>(
				"/mini-game/generate",
				{ type, difficulty, attempt_id: attemptId, riddle_id: riddleId },
			);
			return response.data;
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to generate mini game");
			return null;
		} finally {
			setLoading(false);
		}
	};

	const submitMiniGame = async (
		attemptId: number,
		solution: any,
	): Promise<MiniGameResult | null> => {
		setLoading(true);
		setError(null);
		try {
			const response = await authorizedApiClient.post<MiniGameResult>(
				`/mini-game/attempt/${attemptId}/submit`,
				{ solution },
			);
			return response.data;
		} catch (err: any) {
			setError(
				err.response?.data?.message || "Failed to submit mini game solution",
			);
			return null;
		} finally {
			setLoading(false);
		}
	};

	return {
		loading,
		error,
		getMiniGames,
		generateMiniGame,
		submitMiniGame,
	};
};
