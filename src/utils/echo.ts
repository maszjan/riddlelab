import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
	interface Window {
		Pusher: any;
	}
}

window.Pusher = Pusher;

const echo = new Echo({
	broadcaster: "pusher",
	key: import.meta.env.VITE_PUSHER_APP_KEY,
	cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
	forceTLS: true,
	authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
	auth: {
		headers: {
			Authorization: `Bearer ${localStorage.getItem("token")}`,
			Accept: "application/json",
		},
	},
});

export default echo;
