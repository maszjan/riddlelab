import { useState, useEffect } from "react";
import { useAuthorizedApiClient } from "../utils/apiHelpers";

interface SoundtrackData {
	soundtrack_url: string | null;
}

export const useGetSoundtrack = (escapeRoomId: number | null) => {
	const [soundtrackUrl, setSoundtrackUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const authorizedClient = useAuthorizedApiClient();

	useEffect(() => {
		if (!escapeRoomId) {
			setLoading(false);
			return;
		}

		const fetchSoundtrack = async () => {
			try {
				setLoading(true);
				const response = await authorizedClient.get<SoundtrackData>(
					`/play/escape-room/${escapeRoomId}/soundtrack`,
				);
				setSoundtrackUrl(response.data.soundtrack_url);
				setError(null);
			} catch (err: any) {
				console.error("Error fetching soundtrack:", err);
				setError(err.message || "Błąd pobierania ścieżki dźwiękowej");
				setSoundtrackUrl(null);
			} finally {
				setLoading(false);
			}
		};

		fetchSoundtrack();
	}, [escapeRoomId]);

	return { soundtrackUrl, loading, error };
};
