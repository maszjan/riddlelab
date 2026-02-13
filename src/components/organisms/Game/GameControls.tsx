import { useEffect, useCallback } from "react";

interface GameControlsProps {
	onPause: () => void;
	onInteract: () => void;
	isPaused: boolean;
	riddleModalOpen: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
	onPause,
	onInteract,
	isPaused,
	riddleModalOpen,
}) => {
	const handleKeyPress = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onPause();
				return;
			}

			if (!isPaused && !riddleModalOpen) {
				if (e.key === "e" || e.key === "E") {
					e.preventDefault();
					e.stopPropagation();
					onInteract();
				}
			} else {
				console.log("Interaction blocked - paused or modal open");
			}
		},
		[onPause, onInteract, isPaused, riddleModalOpen],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyPress, { capture: true });

		return () => {
			window.removeEventListener("keydown", handleKeyPress, { capture: true });
		};
	}, [handleKeyPress]);

	return null;
};
