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

interface PaginationInfo {
	currentPage: number;
	lastPage: number;
	perPage: number;
	total: number;
}

interface UseGetEscapeRoomsReturn {
	escapeRooms: EscapeRoomListItem[];
	pagination: PaginationInfo;
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

export const useGetEscapeRooms = (
	page: number = 1,
	perPage: number = 6,
): UseGetEscapeRoomsReturn => {
	const [escapeRooms, setEscapeRooms] = useState<EscapeRoomListItem[]>([]);
	const [pagination, setPagination] = useState<PaginationInfo>({
		currentPage: 1,
		lastPage: 1,
		perPage: 8,
		total: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchEscapeRooms = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await apiClient.get(
				`/escape-room?page=${page}&per_page=${perPage}`,
			);

			const responseData = response.data;
			const escapeRoomsData = responseData?.data || [];

			setEscapeRooms(escapeRoomsData);
			setPagination({
				currentPage: responseData.current_page || 1,
				lastPage: responseData.last_page || 1,
				perPage: responseData.per_page || 6,
				total: responseData.total || 0,
			});
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
	}, [page, perPage]);

	return {
		escapeRooms,
		pagination,
		loading,
		error,
		refetch: fetchEscapeRooms,
	};
};
