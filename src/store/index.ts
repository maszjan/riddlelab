import userReducer from "./slices/userSlice";
import editorReducer from "./slices/editorSlice";
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";

const rootReducer = combineReducers({
	user: userReducer,
	editor: editorReducer,
});

const persistConfig = {
	key: "root",
	storage,
	whitelist: ["user", "editor"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
	devTools: import.meta.env.VITE_ENV === "development",
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export { store, persistor };
