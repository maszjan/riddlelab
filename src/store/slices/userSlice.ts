import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import {
	UserState,
	SetUserPayload,
	SetTokenPayload,
	User,
} from "../../interfaces";

const saveToCookies = (
	key: string,
	value: string,
	expirationMinutes: number,
) => {
	Cookies.set(key, value, { expires: expirationMinutes / 1440 });
};

const removeFromCookies = (key: string) => {
	Cookies.remove(key);
};

const getFromCookies = (key: string): string | null => {
	return Cookies.get(key) || null;
};

// Fix the JSON.parse null issue
const getUserFromCookie = (): User | null => {
	const userStr = getFromCookies("user");
	return userStr ? JSON.parse(userStr) : null;
};

const initialState: UserState = {
	user: getUserFromCookie(),
	token: getFromCookies("token"),
	// Add the missing required properties
	isAuthenticated: false,
	loading: false,
	error: null,
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<SetUserPayload>) => {
			state.user = action.payload as User; // Type assertion to fix the error
			saveToCookies("user", JSON.stringify(action.payload), 30);
		},
		clearUser: (state) => {
			state.user = null;
			removeFromCookies("user");
		},
		setToken: (state, action: PayloadAction<SetTokenPayload>) => {
			state.token = action.payload.accessToken;
			saveToCookies(
				"token",
				action.payload.accessToken,
				action.payload.expiresIn / 60,
			);
		},
		clearToken: (state) => {
			state.token = null;
			removeFromCookies("token");
		},
	},
});

export const { setUser, clearUser, setToken, clearToken } = userSlice.actions;
export const selectUser = (state: { user: UserState }) => state.user.user;
export const selectToken = (state: { user: UserState }) => state.user.token;
export default userSlice.reducer;
