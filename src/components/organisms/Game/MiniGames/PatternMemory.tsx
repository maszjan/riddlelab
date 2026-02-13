import React, { useState, useEffect } from "react";
import { useMiniGameApi } from "../../../../hooks/useMiniGameApi";

interface PatternMemoryProps {
	config: any;
	onComplete: (solution: any) => void;
	attemptId?: number;
}

const PatternMemory: React.FC<PatternMemoryProps> = ({
	config,
	onComplete,
	attemptId,
}) => {
	const { loading } = useMiniGameApi();
	const [sequence, setSequence] = useState<string[]>([]);
	const [userSequence, setUserSequence] = useState<string[]>([]);
	const [gameStarted, setGameStarted] = useState(false);
	const [isPlayingSequence, setIsPlayingSequence] = useState(false);
	const [message, setMessage] = useState("Kliknij START aby zacząć");
	const [submitted, setSubmitted] = useState(false);

	const items = config?.items || [
		"key",
		"lock",
		"flashlight",
		"lever",
		"bell",
		"pendulum",
	];
	const assets = config?.assets || {};

	useEffect(() => {
		if (config?.sequence) {
			setSequence(config.sequence);
		}
	}, [config]);

	const playSequence = async () => {
		setIsPlayingSequence(true);
		setMessage("Zapamiętaj sekwencję...");

		for (let i = 0; i < sequence.length; i++) {
			await new Promise((resolve) => setTimeout(resolve, 800));
			highlightItem(sequence[i]);
			await new Promise((resolve) => setTimeout(resolve, 400));
		}

		setIsPlayingSequence(false);
		setMessage("Twoja kolej! Powtórz sekwencję");
	};

	const highlightItem = (itemName: string) => {
		const element = document.querySelector(
			`[data-item="${itemName}"]`,
		) as HTMLElement;
		if (element) {
			element.style.transform = "scale(1.1)";
			element.style.filter = "brightness(1.5) drop-shadow(0 0 10px #3b82f6)";
			setTimeout(() => {
				element.style.transform = "scale(1)";
				element.style.filter = "brightness(1)";
			}, 400);
		}
	};

	const handleItemClick = async (itemName: string) => {
		if (isPlayingSequence || !gameStarted || submitted) return;

		highlightItem(itemName);
		const newUserSequence = [...userSequence, itemName];
		setUserSequence(newUserSequence);

		if (
			newUserSequence[newUserSequence.length - 1] !==
			sequence[newUserSequence.length - 1]
		) {
			setMessage("Błąd! Gra skończona");
			setGameStarted(false);

			if (attemptId && !submitted) {
				setSubmitted(true);
				console.log("Submitting mini-game (fail):", {
					sequence: newUserSequence,
					correct: false,
				});
				onComplete({ sequence: newUserSequence, correct: false });
			}
			return;
		}

		if (newUserSequence.length === sequence.length) {
			setMessage("Poprawna sekwencja!");
			setGameStarted(false);

			if (attemptId && !submitted) {
				setSubmitted(true);
				console.log("Submitting mini-game (success):", {
					sequence: newUserSequence,
					correct: true,
				});
				onComplete({ sequence: newUserSequence, correct: true });
			}
		}
	};

	const handleStart = () => {
		setGameStarted(true);
		setUserSequence([]);
		setSubmitted(false);
		setMessage("...");
		playSequence();
	};

	return (
		<div className='flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg'>
			<h2 className='text-2xl font-bold text-white mb-4'>Odtwórz kolejność</h2>
			<p className='text-lg text-gray-300 mb-6 h-8'>{message}</p>

			<div className='grid grid-cols-3 gap-6 mb-6 max-w-2xl'>
				{items.map((item: any) => (
					<button
						key={item}
						data-item={item}
						onClick={() => handleItemClick(item)}
						disabled={isPlayingSequence || !gameStarted || loading || submitted}
						className={`w-24 h-24 p-3 rounded-xl border-4 border-gray-700 hover:border-mainMint transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
							gameStarted ? "cursor-pointer" : "cursor-not-allowed"
						} bg-gradient-to-br from-gray-700/50 to-gray-800/50`}>
						<img
							src={assets[item] || "/assets/minigames/pattern_memory/key.png"}
							alt={item}
							className='w-full h-full object-contain filter hover:drop-shadow-lg'
						/>
					</button>
				))}
			</div>

			{/* START Button */}
			{!gameStarted && (
				<button
					onClick={handleStart}
					disabled={loading}
					className='px-10 py-4 bg-mainMint text-gray-900 font-bold rounded-xl hover:bg-mainMint/80 transition-all disabled:opacity-50 shadow-lg hover:shadow-mainMint/25'>
					{loading ? "Ładowanie..." : "START"}
				</button>
			)}

			{/* Info */}
			<div className='mt-8 flex flex-row space-x-2 text-center text-sm text-gray-400'>
				<p>Sekwencja: {sequence.length} ikon</p>
				<div>|</div>
				<p>
					Postęp: {userSequence.length}/{sequence.length}
				</p>
			</div>
		</div>
	);
};

export default PatternMemory;
