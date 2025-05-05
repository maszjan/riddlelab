import axios from "axios";
import { useSelector } from "react-redux";
import { selectToken } from "../store/slices/userSlice";

const baseURL = import.meta.env.VITE_API_URL;
const apiBaseURL = `${baseURL}/api/v1`;

const apiClient = axios.create({
	baseURL: apiBaseURL,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

const useAuthorizedApiClient = () => {
	const token = useSelector(selectToken);

	const authorizedApiClient = axios.create({
		baseURL: apiBaseURL,
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

	authorizedApiClient.interceptors.response.use(
		(response) => response,
		(error) => {
			if (error.response && error.response.status === 401) {
				console.error("Unauthorized access, redirecting to login");
				window.location.href = "/login";
			}
			return Promise.reject(error);
		},
	);

	return authorizedApiClient;
};

export { apiClient, useAuthorizedApiClient };
