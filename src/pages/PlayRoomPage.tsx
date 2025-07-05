import React from "react";
import { Link } from "react-router-dom";

const PlayRoomPage: React.FC = () => {
	return (
		<div className='flex flex-col h-screen justify-center items-center'>
			<p className='text-white'>leaderboard</p>
			<Link to='/' className='text-mainMint hover:underline '>
				Wróć na stronę główną
			</Link>
		</div>
	);
};

export default PlayRoomPage;
