import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "./store/slices/userSlice";

import RootLayout from "./layouts/RootLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthRoute from "./routes/AuthRoute";

import Error404Page from "./pages/Error404Page";
import LandingPage from "./pages/LandingPage";
import EditorPage from "./pages/EditorPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyAssetsPage from "./pages/MyAssetsPage";
import EscapeRoomsPage from "./pages/EscapeRoomsPage";
import PlayRoomPage from "./pages/PlayRoomPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

function App() {
	const user = useSelector(selectUser);

	const router = createBrowserRouter([
		{
			path: "/",
			element: <RootLayout />,
			errorElement: <Error404Page />,
			children: [
				// Public routes
				{
					index: true,
					element: user ? <EscapeRoomsPage /> : <LandingPage />,
				},
				{ path: "leaderboard", element: <LeaderboardPage /> },

				// Auth routes
				{
					path: "login",
					element: (
						<AuthRoute>
							<LoginPage />
						</AuthRoute>
					),
				},
				{
					path: "register",
					element: (
						<AuthRoute>
							<RegisterPage />
						</AuthRoute>
					),
				},
				// Protected routes
				{
					path: "editor",
					element: (
						<ProtectedRoute>
							<EditorPage />
						</ProtectedRoute>
					),
				},
				{
					path: "my-assets",
					element: (
						<ProtectedRoute>
							<MyAssetsPage />
						</ProtectedRoute>
					),
				},
				{
					path: "play",
					element: (
						<ProtectedRoute>
							<EscapeRoomsPage />
						</ProtectedRoute>
					),
				},
				{
					path: "play/:name",
					element: (
						<ProtectedRoute>
							<PlayRoomPage />
						</ProtectedRoute>
					),
				},
				{
					path: "profile",
					element: (
						<ProtectedRoute>
							<ProfilePage />
						</ProtectedRoute>
					),
				},
				{
					path: "settings",
					element: (
						<ProtectedRoute>
							<SettingsPage />
						</ProtectedRoute>
					),
				},
			],
		},
	]);

	return <RouterProvider router={router} />;
}

export default App;
