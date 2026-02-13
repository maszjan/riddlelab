import { authorizedApiClient } from "../utils/apiHelpers";
import { useState, useCallback } from "react";

interface Attempt {
	id: number;
	current_room_id: number;
	score: number;
	time_spent: number;
	hints_used: number;
	status: string;
}

interface GameData {
	attempt: Attempt;
	escapeRoom: {
		id: number;
		name: string;
		description: string;
		thumbnail_url: string;
		soundtrack_url: string;
	};
	rooms: Array<any>;
	playerConfig: any;
}

interface SolveRiddleRequest {
	riddle_id: number;
	answer: string;
}

interface SolveRiddleResponse {
	success: boolean;
	message: string;
	points_earned?: number;
	score?: number;
	attempts_left?: number;
}

interface HintResponse {
	hint: string;
	hints_used: number;
	message?: string;
}

interface NextRoomResponse {
	message: string;
	current_room_id: number;
}

export const useGameApi = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const startAttempt = async (
		escapeRoomId: number,
	): Promise<GameData | null> => {
		setLoading(true);
		setError(null);
		try {
			const response = await authorizedApiClient.post<GameData>(
				`/play/escape-room/${escapeRoomId}/start`,
			);
			return response.data;
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to start game");
			return null;
		} finally {
			setLoading(false);
		}
	};

	const solveRiddle = async (
		attemptId: number,
		data: SolveRiddleRequest,
	): Promise<SolveRiddleResponse | null> => {
		setLoading(true);
		setError(null);
		try {
			const response = await authorizedApiClient.post<SolveRiddleResponse>(
				`/play/attempt/${attemptId}/riddle/solve`,
				data,
			);
			return response.data;
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to solve riddle");
			return err.response?.data || null;
		} finally {
			setLoading(false);
		}
	};

	const useHint = async (
		attemptId: number,
		riddleId: number,
	): Promise<HintResponse | null> => {
		setLoading(true);
		setError(null);
		try {
			const response = await authorizedApiClient.post<HintResponse>(
				`/play/attempt/${attemptId}/riddle/${riddleId}/hint`,
			);
			return response.data;
		} catch (err: any) {
			const errorMessage = err.response?.data?.message || "Failed to get hint";
			setError(errorMessage);
			return { hint: "", hints_used: 0, message: errorMessage };
		} finally {
			setLoading(false);
		}
	};

	const nextRoom = async (
		attemptId: number,
	): Promise<NextRoomResponse | null> => {
		setLoading(true);
		setError(null);
		try {
			const response = await authorizedApiClient.post<NextRoomResponse>(
				`/play/attempt/${attemptId}/next-room`,
			);
			return response.data;
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to move to next room");
			return null;
		} finally {
			setLoading(false);
		}
	};

	const updateTime = async (
		attemptId: number,
		timeSpent: number,
	): Promise<boolean> => {
		try {
			await authorizedApiClient.post(`/play/attempt/${attemptId}/time`, {
				time_spent: timeSpent,
			});
			return true;
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to update time");
			return false;
		}
	};

	const pauseAttempt = async (attemptId: number): Promise<boolean> => {
		setLoading(true);
		setError(null);
		try {
			await authorizedApiClient.post(`/play/attempt/${attemptId}/pause`);
			return true;
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to pause game");
			return false;
		} finally {
			setLoading(false);
		}
	};

	const resumeAttempt = async (attemptId: number): Promise<boolean> => {
		setLoading(true);
		setError(null);
		try {
			await authorizedApiClient.post(`/play/attempt/${attemptId}/resume`);
			return true;
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to resume game");
			return false;
		} finally {
			setLoading(false);
		}
	};

	const abandonAttempt = async (attemptId: number): Promise<boolean> => {
		try {
			await authorizedApiClient.post(`/play/attempt/${attemptId}/abandon`);
			return true;
		} catch (err: any) {
			console.error("Failed to abandon game:", err);
			return false;
		}
	};

	const failAttempt = async (attemptId: number): Promise<boolean> => {
		try {
			await authorizedApiClient.post(`/play/attempt/${attemptId}/fail`);
			return true;
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to fail game");
			return false;
		}
	};

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		loading,
		error,
		clearError,
		startAttempt,
		solveRiddle,
		useHint,
		nextRoom,
		updateTime,
		pauseAttempt,
		resumeAttempt,
		abandonAttempt,
		failAttempt,
	};
};
