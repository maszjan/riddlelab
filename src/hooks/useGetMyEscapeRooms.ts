/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAuthorizedApiClient } from "../utils/apiHelpers";

interface EscapeRoomListItem {
	id: number;
	name: string;
	description: string;
	thumbnail_url?: string;
	soundtrack_url?: string;
	created_at: string;
	updated_at: string;
	rooms_count?: number;
	rooms?: any[]; // Since the API returns rooms with the escape room
}

interface UseGetMyEscapeRoomsReturn {
	escapeRooms: EscapeRoomListItem[];
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

export const useGetMyEscapeRooms = (): UseGetMyEscapeRoomsReturn => {
	const [escapeRooms, setEscapeRooms] = useState<EscapeRoomListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const authorizedClient = useAuthorizedApiClient();

	const fetchEscapeRooms = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await authorizedClient.get("/escape-room/my/rooms");
			setEscapeRooms(response.data || []);
		} catch (err: any) {
			console.error("Error fetching escape rooms:", err);
			setError(
				err?.response?.data?.message || "Błąd podczas pobierania escape roomów",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchEscapeRooms();
	}, []);

	return {
		escapeRooms,
		loading,
		error,
		refetch: fetchEscapeRooms,
	};
};
