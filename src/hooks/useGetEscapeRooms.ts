/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { apiClient } from "../utils/apiHelpers";

interface EscapeRoomListItem {
	id: number;
	name: string;
	description: string;
	thumbnail_url?: string;
	soundtrack_url?: string;
	created_at: string;
	updated_at: string;
	rooms_count?: number;
	rooms?: any[];
	user_id?: number;
	user?: any;
}

interface UseGetEscapeRoomsReturn {
	escapeRooms: EscapeRoomListItem[];
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

export const useGetEscapeRooms = (): UseGetEscapeRoomsReturn => {
	const [escapeRooms, setEscapeRooms] = useState<EscapeRoomListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchEscapeRooms = async () => {
		try {
			setLoading(true);
			setError(null);

			// Using apiClient instead of authorizedClient for public access
			const response = await apiClient.get("/escape-room");

			// Extract the data from the paginated response
			const responseData = response.data;
			const escapeRoomsData = responseData?.data || [];

			setEscapeRooms(escapeRoomsData);
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
