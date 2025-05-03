import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser, clearToken } from "../store/slices/userSlice";
import { useAuthorizedApiClient } from "../utils/apiHelpers";

const useLogout = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const authorizedClient = useAuthorizedApiClient();

	const logout = async () => {
		try {
			await authorizedClient.post("/auth/logout");
		} catch (error) {
			console.error("Błąd podczas wylogowywania:", error);
		} finally {
			dispatch(clearUser());
			dispatch(clearToken());
			navigate("/login");
		}
	};

	return logout;
};

export default useLogout;
