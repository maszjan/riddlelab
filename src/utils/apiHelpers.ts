import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { store } from "../store";
import { clearUser, clearToken } from "../store/slices/userSlice";

const baseApiClient: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL + "/api/v1",
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

const baseAuthorizedApiClient: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL + "/api/v1",
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

// Request interceptor - TYLKO Z REDUXA
baseAuthorizedApiClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const state = store.getState();
		const token = state.user.token; // Token z Redux

		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor - dispatch Redux actions
baseAuthorizedApiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			store.dispatch(clearUser());
			store.dispatch(clearToken());
			window.location.href = "/login";
		}
		return Promise.reject(error);
	},
);

// Response interceptor dla public client
baseApiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		return Promise.reject(error);
	},
);

export const apiClient = baseApiClient;
export const authorizedApiClient = baseAuthorizedApiClient;

export const useApiClient = () => {
	return baseApiClient;
};

export const useAuthorizedApiClient = () => {
	return baseAuthorizedApiClient;
};
