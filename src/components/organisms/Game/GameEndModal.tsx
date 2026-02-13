import React from "react";
import {
	Trophy,
	Skull,
	LogOut,
	Clock,
	Lightbulb,
	Star,
	RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GameEndModalProps {
	isOpen: boolean;
	status: "won" | "lost" | "abandoned";
	finalScore: number;
	timeSpent: number;
	hintsUsed: number;
	escapeRoomName: string;
}

export const GameEndModal: React.FC<GameEndModalProps> = ({
	isOpen,
	status,
	finalScore,
	timeSpent,
	hintsUsed,
	escapeRoomName,
}) => {
	const navigate = useNavigate();

	if (!isOpen) return null;

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const getStatusConfig = () => {
		switch (status) {
			case "won":
				return {
					title: "Gratulacje!",
					message: "Ukończyłeś escape room!",
					icon: <Trophy size={80} className='text-yellow-400' />,
					bgColor: "from-green-900/30 to-emerald-900/30",
					borderColor: "border-green-500",
					buttonColor: "bg-green-600 hover:bg-green-700",
				};
			case "lost":
				return {
					title: "Koniec gry",
					message: "Wykorzystałeś wszystkie próby",
					icon: <Skull size={80} className='text-red-400' />,
					bgColor: "from-red-900/30 to-rose-900/30",
					borderColor: "border-red-500",
					buttonColor: "bg-red-600 hover:bg-red-700",
				};
			case "abandoned":
				return {
					title: "Gra przerwana",
					message: "Opuściłeś grę przed ukończeniem",
					icon: <LogOut size={80} className='text-gray-400' />,
					bgColor: "from-gray-900/30 to-slate-900/30",
					borderColor: "border-gray-500",
					buttonColor: "bg-gray-600 hover:bg-gray-700",
				};
		}
	};

	const config = getStatusConfig();

	return (
		<div className='fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-4'>
			<div
				className={`bg-gradient-to-br ${config.bgColor} rounded-2xl max-w-2xl w-full border-2 ${config.borderColor} shadow-2xl`}>
				{/* Header */}
				<div className='text-center p-8 border-b border-gray-700'>
					<div className='mb-6 flex justify-center'>{config.icon}</div>
					<h1 className='text-4xl font-bold text-white mb-3'>{config.title}</h1>
					<p className='text-xl text-gray-300'>{config.message}</p>
					<p className='text-lg text-gray-400 mt-2'>{escapeRoomName}</p>
				</div>

				{/* Stats */}
				<div className='p-8 space-y-6'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						{/* Score */}
						<div className='bg-gray-800/50 rounded-lg p-6 border border-gray-700 text-center'>
							<div className='flex justify-center mb-3'>
								<Star size={32} className='text-mainMint' />
							</div>
							<div className='text-3xl font-bold text-white mb-1'>
								{finalScore}
							</div>
							<div className='text-sm text-gray-400'>Punktów</div>
						</div>

						{/* Time */}
						<div className='bg-gray-800/50 rounded-lg p-6 border border-gray-700 text-center'>
							<div className='flex justify-center mb-3'>
								<Clock size={32} className='text-blue-400' />
							</div>
							<div className='text-3xl font-bold text-white mb-1'>
								{formatTime(timeSpent)}
							</div>
							<div className='text-sm text-gray-400'>Czas</div>
						</div>

						{/* Hints */}
						<div className='bg-gray-800/50 rounded-lg p-6 border border-gray-700 text-center'>
							<div className='flex justify-center mb-3'>
								<Lightbulb size={32} className='text-orange-400' />
							</div>
							<div className='text-3xl font-bold text-white mb-1'>
								{hintsUsed}
							</div>
							<div className='text-sm text-gray-400'>Podpowiedzi</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className='flex gap-4 mt-8'>
						<button
							onClick={() => navigate("/play")}
							className={`flex-1 ${config.buttonColor} text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2`}>
							<LogOut size={24} />
							Wróć do Pokoi
						</button>
						<button
							onClick={() => window.location.reload()}
							className='flex-1 bg-mainMint hover:bg-mainMint/80 text-gray-900 font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2'>
							<RotateCcw size={24} />
							Zagraj ponownie
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
