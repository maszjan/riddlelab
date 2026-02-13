import { useState } from "react";
import { useAuthorizedApiClient } from "../utils/apiHelpers";

interface UpdatePasswordData {
	current_password: string;
	password: string;
	password_confirmation: string;
}

export const useUpdatePassword = () => {
	const authorizedClient = useAuthorizedApiClient();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const updatePassword = async (data: UpdatePasswordData) => {
		try {
			setLoading(true);
			setError(null);
			setSuccess(null);

			const response = await authorizedClient.put("/user/password", data);

			setSuccess(response.data.message);

			return { success: true, message: response.data.message };
		} catch (err: any) {
			const errorMessage =
				err?.response?.data?.message || "Błąd podczas zmiany hasła";
			setError(errorMessage);
			return { success: false, message: errorMessage };
		} finally {
			setLoading(false);
		}
	};

	return {
		updatePassword,
		loading,
		error,
		success,
	};
};
