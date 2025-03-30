import { Outlet } from "react-router-dom";
import Navbar from "../components/organisms/Navbar";
import Footer from "../components/organisms/Footer";

const RootLayout = () => {
	return (
		<>
			<Navbar />
			<Outlet />
			<Footer />
		</>
	);
};

export default RootLayout;
