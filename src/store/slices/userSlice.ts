import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { UserState, SetUserPayload, SetTokenPayload } from "./interfaces";

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

const initialState: UserState = {
	user: getFromCookies("user") ? JSON.parse(getFromCookies("user")) : null,
	token: getFromCookies("token"),
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<SetUserPayload>) => {
			state.user = action.payload;
			saveToCookies("user", JSON.stringify(action.payload), 30); // Save for 30 minutes
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
			); // Convert seconds to minutes
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
