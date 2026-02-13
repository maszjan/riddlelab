import { useState } from "react";
import { useAuthorizedApiClient } from "../utils/apiHelpers";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";

interface UpdateProfileData {
	name: string;
	email: string;
}

export const useUpdateProfile = () => {
	const authorizedClient = useAuthorizedApiClient();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const updateProfile = async (data: UpdateProfileData) => {
		try {
			setLoading(true);
			setError(null);
			setSuccess(null);

			const response = await authorizedClient.put("/user/profile", data);

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
		updateProfile,
		loading,
		error,
		success,
	};
};
