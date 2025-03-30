import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "./layouts/RootLayout";

import Error404Page from "./pages/Error404Page";
import LandingPage from "./pages/LandingPage";
import EditorPage from "./pages/EditorPage";

function App() {
	const router = createBrowserRouter([
		{
			path: "/",
			element: <RootLayout />,
			errorElement: <Error404Page />,
			children: [
				{ index: true, element: <LandingPage /> },
				{ path: "editor", element: <EditorPage /> },
			],
		},
	]);

	return (
		<>
			<RouterProvider router={router} />
		</>
	);
}

export default App;
