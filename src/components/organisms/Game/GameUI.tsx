import React from "react";
import {
	IoTrophy,
	IoTime,
	IoBulb,
	IoCloseCircle,
	IoPause,
} from "react-icons/io5";

interface GameUIProps {
	score: number;
	time: number;
	hints: number;
	currentRoomIndex: number;
	totalRooms: number;
	isPaused: boolean;
	onPause: () => void;
	onResume: () => void;
	onQuit: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
	score,
	time,
	hints,
	currentRoomIndex,
	totalRooms,
	isPaused,
	onPause,
	onResume,
	onQuit,
}) => {
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	return (
		<>
			<div className='absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 pointer-events-none'>
				<div className='max-w-7xl mx-auto flex items-center justify-between'>
					<div className='flex items-center gap-3 pointer-events-none'>
						<div className='bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700/50'>
							<p className='text-xs text-gray-400 mb-1'>Pokój</p>
							<p className='text-white font-bold text-lg'>
								{currentRoomIndex + 1} / {totalRooms}
							</p>
						</div>
					</div>

					<div className='flex items-center gap-3'>
						<div className='bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700/50 flex items-center gap-2 pointer-events-none'>
							<IoTime className='text-mainMint' size={20} />
							<span className='text-white font-mono font-bold'>
								{formatTime(time)}
							</span>
						</div>

						<div className='bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700/50 flex items-center gap-2 pointer-events-none'>
							<IoTrophy className='text-yellow-400' size={20} />
							<span className='text-white font-mono font-bold'>{score}</span>
						</div>

						<div
							className='bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700/50 flex items-center gap-2 pointer-events-none'
							title={`Podpowiedzi użyte: ${hints}. Każda podpowiedź zmniejsza twój wynik!`}>
							<IoBulb className='text-orange-400' size={20} />
							<span className='text-white font-mono font-bold'>{hints}</span>
						</div>

						<button
							onClick={onPause}
							className='bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700/50 hover:bg-gray-700/90 transition-colors flex items-center gap-2 pointer-events-auto'
							title='Pauza (ESC)'>
							<IoPause className='text-gray-300' size={20} />
						</button>
					</div>
				</div>
			</div>

			{isPaused && (
				<>
					<div className='absolute inset-0 backdrop-blur-sm bg-black/40 z-40 pointer-events-none' />

					<div className='absolute inset-0 flex items-center justify-center z-50 pointer-events-auto'>
						<div className='bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 border-2 border-gray-700 shadow-2xl'>
							<h2 className='text-3xl font-bold text-white mb-6 text-center'>
								Gra Wstrzymana
							</h2>

							<div className='bg-gray-700/50 rounded-lg p-4 mb-6'>
								<div className='grid grid-cols-3 gap-4 text-center'>
									<div>
										<div className='flex items-center justify-center gap-1 mb-1'>
											<IoTime className='text-mainMint' size={16} />
										</div>
										<p className='text-white font-mono font-bold'>
											{formatTime(time)}
										</p>
										<p className='text-xs text-gray-400'>Czas</p>
									</div>
									<div>
										<div className='flex items-center justify-center gap-1 mb-1'>
											<IoTrophy className='text-yellow-400' size={16} />
										</div>
										<p className='text-white font-mono font-bold'>{score}</p>
										<p className='text-xs text-gray-400'>Punkty</p>
									</div>
									<div>
										<div className='flex items-center justify-center gap-1 mb-1'>
											<IoBulb className='text-orange-400' size={16} />
										</div>
										<p className='text-white font-mono font-bold'>{hints}</p>
										<p className='text-xs text-gray-400'>Wskazówki</p>
									</div>
								</div>
							</div>

							<div className='space-y-3'>
								<button
									onClick={onResume}
									className='w-full bg-mainMint hover:bg-mainMint/80 text-gray-900 py-3 rounded-lg font-semibold transition-colors'>
									Wznów Grę
								</button>
								<button
									onClick={onQuit}
									className='w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2'>
									<IoCloseCircle size={20} />
									Zakończ Grę
								</button>
							</div>

							<div className='mt-6 p-3 bg-orange-900/30 border border-orange-700/50 rounded-lg'>
								<div className='flex items-start gap-2'>
									<IoBulb className='text-orange-400 mt-0.5' size={16} />
									<div>
										<p className='text-xs text-orange-300 font-medium'>
											Pamiętaj!
										</p>
										<p className='text-xs text-orange-200/80 mt-1'>
											Każda użyta podpowiedź zmniejsza twój końcowy wynik.
											Rozwiązuj zagadki samodzielnie dla lepszego rankingu!
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</>
	);
};
