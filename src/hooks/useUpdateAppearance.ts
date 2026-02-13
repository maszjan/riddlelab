import { useState } from "react";
import { useAuthorizedApiClient } from "../utils/apiHelpers";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";

interface AvatarColors {
	skin_color: string;
	hair_color: string;
	eye_color: string;
	outfit_color: string;
}

interface UpdateAppearanceData {
	player_configuration: {
		avatar: AvatarColors;
	};
}

export const useUpdateAppearance = () => {
	const authorizedClient = useAuthorizedApiClient();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const updateAppearance = async (data: UpdateAppearanceData) => {
		try {
			setLoading(true);
			setError(null);
			setSuccess(null);

			const response = await authorizedClient.put("/user/appearance", data);

			dispatch(setUser(response.data.user));
			setSuccess(response.data.message);

			return { success: true, message: response.data.message };
		} catch (err: any) {
			const errorMessage =
				err?.response?.data?.message || "Błąd podczas zapisywania";
			setError(errorMessage);
			return { success: false, message: errorMessage };
		} finally {
			setLoading(false);
		}
	};

	return {
		updateAppearance,
		loading,
		error,
		success,
	};
};
