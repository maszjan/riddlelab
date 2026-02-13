import React, { useState, useEffect } from "react";
import {
	IoClose,
	IoBulb,
	IoSend,
	IoCheckmarkCircle,
	IoAlertCircle,
} from "react-icons/io5";
import PatternMemory from "./MiniGames/PatternMemory";
import { useMiniGameApi } from "../../../hooks/useMiniGameApi";
import type { MiniGame, MiniGameAttempt } from "../../../hooks/useMiniGameApi";

interface RiddleModalProps {
	riddle: {
		id: number;
		name: string;
		question: string;
		type: string;
		points: number;
		max_attempts?: number;
		hints?: Array<{ id: number; hint_text: string }>;
		hint_used?: boolean;
		solved?: boolean;
	};
	attemptId?: number;
	isOpen: boolean;
	onSubmit: (answer: string) => void;
	onClose: () => void;
	onHint: () => void;
	feedback: {
		type: "success" | "error" | "hint";
		message: string;
		pointsEarned?: number;
		attemptsLeft?: number;
	} | null;
}

function translateRiddleMessage(msg: string): string {
	const lower = msg.toLowerCase();
	if (lower.includes("incorrect answer") || lower.includes("incorrect")) {
		return "Błędna odpowiedź. Spróbuj ponownie!";
	}
	if (lower.includes("max attempts")) {
		return "Wykorzystano maksymalną liczbę prób!";
	}
	if (lower.includes("already solved")) {
		return "Ta zagadka została już rozwiązana!";
	}
	return msg;
}

function translateRiddleType(type: string): string {
	const typeMap: Record<string, string> = {
		knowledge: "Wiedza",
		math: "Matematyka",
		language: "Język",
		cypher: "Szyfr",
		puzzleGame: "Układanka",
	};
	return typeMap[type] || type;
}

export const RiddleModal: React.FC<RiddleModalProps> = ({
	riddle,
	attemptId,
	isOpen,
	onSubmit,
	onClose,
	onHint,
	feedback,
}) => {
	const [answer, setAnswer] = useState("");
	const [miniGame, setMiniGame] = useState<MiniGame | null>(null);
	const [miniGameAttempt, setMiniGameAttempt] =
		useState<MiniGameAttempt | null>(null);
	const [isLoadingMiniGame, setIsLoadingMiniGame] = useState(false);

	const { generateMiniGame, submitMiniGame } = useMiniGameApi();

	useEffect(() => {
		setAnswer("");

		if (riddle?.type === "puzzleGame" && isOpen) {
			setIsLoadingMiniGame(true);
			const initMiniGame = async () => {
				try {
					const game = await generateMiniGame(
						"pattern_memory",
						"medium",
						attemptId,
						riddle.id,
					);
					if (game && game.attempt_id && game.config) {
						setMiniGame(game);
						setMiniGameAttempt({
							attempt_id: game.attempt_id,
							config: game.config,
							start_time: game.start_time ?? "",
						});
					} else {
						setMiniGame(null);
						setMiniGameAttempt(null);
					}
				} catch (error) {
					console.error("❌ Error initializing mini-game:", error);
					setMiniGame(null);
					setMiniGameAttempt(null);
				} finally {
					setIsLoadingMiniGame(false);
				}
			};
			initMiniGame();
		} else {
			setMiniGame(null);
			setMiniGameAttempt(null);
		}
	}, [riddle?.id, isOpen]);

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (answer.trim()) {
			onSubmit(answer.trim());
			setAnswer("");
		}
	};

	const handleMiniGameComplete = async (solution: any) => {
		if (!miniGameAttempt) return;

		const result = await submitMiniGame(miniGameAttempt.attempt_id, solution);

		if (result) {
			if (result.success) {
				onSubmit("MINIGAME_SUCCESS");
			} else {
				onSubmit(
					JSON.stringify({
						type: "error",
						message: result.message,
						attemptsLeft: result.attemptsLeft,
					}),
				);
				if ((result.attemptsLeft ?? 0) > 0) {
					setIsLoadingMiniGame(true);
					try {
						const game = await generateMiniGame(
							"pattern_memory",
							"medium",
							attemptId,
							riddle.id,
						);
						if (game && game.attempt_id && game.config) {
							setMiniGame(game);
							setMiniGameAttempt({
								attempt_id: game.attempt_id,
								config: game.config,
								start_time: game.start_time ?? "",
							});
						} else {
							setMiniGame(null);
							setMiniGameAttempt(null);
						}
					} catch (error) {
						setMiniGame(null);
						setMiniGameAttempt(null);
					} finally {
						setIsLoadingMiniGame(false);
					}
				}
			}
		}
	};

	const hasHints = riddle.hints && riddle.hints.length > 0;
	const hintUsed = riddle.hint_used || false;
	const isPuzzleGame = riddle.type === "puzzleGame";

	return (
		<div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4'>
			<div className='bg-gray-800 rounded-xl max-w-2xl w-full mx-auto border-2 border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto'>
				{/* Header */}
				<div className='bg-gradient-to-r from-mainMint to-cyan-400 p-6 rounded-t-xl relative'>
					<button
						onClick={onClose}
						className='absolute top-4 right-4 text-gray-900 hover:text-gray-700 transition-colors'>
						<IoClose size={28} />
					</button>
					<h2 className='text-2xl font-bold text-gray-900 pr-10'>
						{riddle.name}
					</h2>
					<div className='flex items-center gap-4 mt-2'>
						<span className='bg-gray-900/20 px-3 py-1 rounded-full text-sm font-medium text-gray-900'>
							{riddle.points} pkt
						</span>
						<span className='bg-gray-900/20 px-3 py-1 rounded-full text-sm font-medium text-gray-900'>
							{translateRiddleType(riddle.type)}
						</span>
					</div>
				</div>

				{/* Content */}
				<div className='p-6 space-y-6'>
					{/* Question - tylko dla zagadek tekstowych */}
					{!isPuzzleGame && (
						<div className='bg-gray-700/50 rounded-lg p-6 border border-gray-600'>
							<p className='text-lg text-gray-200 leading-relaxed whitespace-pre-wrap'>
								{riddle.question}
							</p>
						</div>
					)}

					{/* Mini Game Loading State */}
					{isPuzzleGame && isLoadingMiniGame && (
						<div className='bg-gray-700/50 rounded-lg border border-gray-600 p-8 flex items-center justify-center'>
							<div className='flex flex-col items-center'>
								<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-mainMint mb-4'></div>
								<p className='text-gray-300'>Ładowanie mini-gry...</p>
							</div>
						</div>
					)}

					{/* Mini Game */}
					{isPuzzleGame &&
						!isLoadingMiniGame &&
						miniGame &&
						miniGameAttempt && (
							<div className='bg-gray-700/50 rounded-lg border border-gray-600 p-6'>
								<PatternMemory
									config={miniGameAttempt.config}
									attemptId={miniGameAttempt.attempt_id}
									onComplete={handleMiniGameComplete}
								/>
							</div>
						)}

					{/* Mini Game Error State */}
					{isPuzzleGame && !isLoadingMiniGame && !miniGame && (
						<div className='bg-red-900/30 border border-red-700 rounded-lg p-6'>
							<div className='flex items-start gap-3'>
								<IoAlertCircle
									size={24}
									className='text-red-400 flex-shrink-0'
								/>
								<div>
									<p className='text-red-200 font-semibold'>
										Błąd ładowania mini-gry
									</p>
									<p className='text-red-300 text-sm mt-1'>
										Nie udało się załadować gry. Spróbuj ponownie.
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Feedback */}
					{feedback && (
						<div
							className={`rounded-lg p-4 border ${
								feedback.type === "success"
									? "bg-green-900/30 border-green-700 text-green-200"
									: feedback.type === "hint"
										? "bg-orange-900/30 border-orange-700 text-orange-200"
										: "bg-red-900/30 border-red-700 text-red-200"
							}`}>
							<div className='flex items-start gap-3'>
								{feedback.type === "success" ? (
									<IoCheckmarkCircle
										size={24}
										className='flex-shrink-0 mt-0.5'
									/>
								) : feedback.type === "hint" ? (
									<IoBulb size={24} className='flex-shrink-0 mt-0.5' />
								) : (
									<IoAlertCircle size={24} className='flex-shrink-0 mt-0.5' />
								)}
								<div className='flex-1'>
									<p className='font-medium'>
										{translateRiddleMessage(feedback.message)}
									</p>
									{feedback.pointsEarned !== undefined && (
										<p className='text-sm mt-1 opacity-90'>
											+{feedback.pointsEarned} punktów!
										</p>
									)}
									{feedback.attemptsLeft !== undefined && (
										<p className='text-sm mt-1 opacity-90'>
											Pozostało prób: {feedback.attemptsLeft}
										</p>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Answer Form - tylko dla zagadek tekstowych */}
					{!isPuzzleGame &&
						!riddle.solved &&
						(!feedback ||
							translateRiddleMessage(feedback.message) !==
								"Wykorzystano maksymalną liczbę prób!") && (
							<form onSubmit={handleSubmit} className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Twoja odpowiedź:
									</label>
									<input
										type='text'
										value={answer}
										onChange={(e) => setAnswer(e.target.value)}
										className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mainMint focus:border-transparent'
										placeholder='Wpisz swoją odpowiedź...'
										autoFocus
									/>
								</div>

								{/* Action Buttons */}
								<div className='flex gap-3'>
									<button
										type='submit'
										disabled={!answer.trim()}
										className='flex-1 bg-mainMint hover:bg-mainMint/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2'>
										<IoSend size={20} />
										Wyślij odpowiedź
									</button>

									{hasHints && (
										<button
											type='button'
											onClick={onHint}
											disabled={hintUsed}
											className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
												hintUsed
													? "bg-gray-600 text-gray-400 cursor-not-allowed"
													: "bg-orange-600 hover:bg-orange-700 text-white"
											}`}
											title={
												hintUsed ? "Podpowiedź już użyta" : "Użyj podpowiedzi"
											}>
											<IoBulb size={20} />
											{hintUsed ? "Użyta" : "Podpowiedź"}
										</button>
									)}
								</div>
							</form>
						)}

					{/* Solved State */}
					{riddle.solved && (
						<div className='bg-green-900/30 border border-green-700 rounded-lg p-6 text-center'>
							<IoCheckmarkCircle
								size={48}
								className='text-green-400 mx-auto mb-3'
							/>
							<p className='text-green-200 font-semibold text-lg'>
								Zagadka rozwiązana! 🎉
							</p>
							<p className='text-green-300 text-sm mt-2'>
								Możesz zamknąć to okno i kontynuować grę.
							</p>
						</div>
					)}

					{/* Hint Warning */}
					{hasHints && !hintUsed && !isPuzzleGame && (
						<div className='bg-orange-900/20 border border-orange-700/50 rounded-lg p-4'>
							<div className='flex items-start gap-3'>
								<IoBulb
									className='text-orange-400 flex-shrink-0 mt-0.5'
									size={20}
								/>
								<div>
									<p className='text-sm text-orange-300 font-medium'>
										Pamiętaj!
									</p>
									<p className='text-xs text-orange-200/80 mt-1'>
										Możesz użyć podpowiedzi tylko raz. Każda podpowiedź
										zmniejsza twój końcowy wynik.
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
