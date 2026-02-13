import React, { useEffect, useRef, useState } from "react";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";

interface BackgroundAudioProps {
	soundtrackUrl: string | null;
	volume?: number;
}

export const BackgroundAudio: React.FC<BackgroundAudioProps> = ({
	soundtrackUrl,
	volume = 0.3,
}) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [currentVolume, setCurrentVolume] = useState(volume);
	const [muted, setMuted] = useState(false);

	useEffect(() => {
		if (!soundtrackUrl || !audioRef.current) return;

		const audio = audioRef.current;
		audio.volume = muted ? 0 : currentVolume;

		const playAudio = async () => {
			try {
				await audio.play();
			} catch (error) {
				console.error("Error playing soundtrack:", error);
			}
		};

		playAudio();

		return () => {
			audio.pause();
			audio.currentTime = 0;
		};
	}, [soundtrackUrl, currentVolume, muted]);

	if (!soundtrackUrl) return null;

	return (
		<div className='flex items-center gap-2  p-2 rounded'>
			<audio
				ref={audioRef}
				src={`${import.meta.env.VITE_API_URL}${soundtrackUrl}`}
				loop
				preload='auto'
			/>
			
			<input
				type='range'
				min={0}
				max={1}
				step={0.01}
				value={muted ? 0 : currentVolume}
				onChange={(e) => {
					setCurrentVolume(Number(e.target.value));
					if (muted && Number(e.target.value) > 0) setMuted(false);
				}}
				className='w-24 accent-mainMint'
			/>
			<button
				onClick={() => setMuted((m) => !m)}
				className='text-mainMint px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 flex items-center'>
				{muted ? <FaVolumeMute size={22} /> : <FaVolumeUp size={22} />}
			</button>
		</div>
	);
};
