import { Outlet } from "react-router-dom";
import Navbar from "../components/organisms/Navbar";
import Footer from "../components/organisms/Footer";

const RootLayout = () => {
	return (
		<div className='flex flex-col min-h-screen'>
			<Navbar />
			<div>
				<Outlet />
			</div>
			<Footer />
		</div>
	);
};

export default RootLayout;
