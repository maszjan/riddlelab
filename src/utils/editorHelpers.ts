export const isBorderClosed = (grid: Record<string, boolean>): boolean => {
	if (!grid || Object.keys(grid).length === 0) {
		return false;
	}

	let minRow = Infinity,
		maxRow = -Infinity;
	let minCol = Infinity,
		maxCol = -Infinity;

	Object.keys(grid).forEach((key) => {
		const [row, col] = key.split("-").map(Number);
		minRow = Math.min(minRow, row);
		maxRow = Math.max(maxRow, row);
		minCol = Math.min(minCol, col);
		maxCol = Math.max(maxCol, col);
	});

	const rows = maxRow - minRow + 3;
	const cols = maxCol - minCol + 3;
	const fullGrid: boolean[][] = Array(rows)
		.fill(0)
		.map(() => Array(cols).fill(false));

	Object.keys(grid).forEach((key) => {
		const [row, col] = key.split("-").map(Number);
		fullGrid[row - minRow + 1][col - minCol + 1] = true;
	});

	console.log(
		`isBorderClosed: Created full grid representation with dimensions ${rows}x${cols}`,
	);

	const visited: boolean[][] = Array(rows)
		.fill(0)
		.map(() => Array(cols).fill(false));

	const directions = [
		[0, 1],
		[1, 0],
		[0, -1],
		[-1, 0],
	];

	const queue: [number, number][] = [[0, 0]];
	visited[0][0] = true;

	while (queue.length > 0) {
		const [r, c] = queue.shift()!;

		for (const [dr, dc] of directions) {
			const nr = r + dr;
			const nc = c + dc;

			if (
				nr >= 0 &&
				nr < rows &&
				nc >= 0 &&
				nc < cols &&
				!visited[nr][nc] &&
				!fullGrid[nr][nc]
			) {
				visited[nr][nc] = true;
				queue.push([nr, nc]);
			}
		}
	}

	let enclosedCells = 0;

	for (let r = 1; r < rows - 1; r++) {
		for (let c = 1; c < cols - 1; c++) {
			if (!fullGrid[r][c] && !visited[r][c]) {
				enclosedCells++;
			}
		}
	}

	let hasBorderStructure = false;

	if (enclosedCells === 0) {
		let borderCellCount = 0;
		let interiorCellCount = 0;

		for (let r = 1; r < rows - 1; r++) {
			for (let c = 1; c < cols - 1; c++) {
				if (fullGrid[r][c]) {
					let neighborCount = 0;
					for (const [dr, dc] of directions) {
						if (fullGrid[r + dr][c + dc]) {
							neighborCount++;
						}
					}

					if (neighborCount < 4) {
						borderCellCount++;
					} else {
						interiorCellCount++;
					}
				}
			}
		}

		hasBorderStructure = borderCellCount > 0 && interiorCellCount > 0;
	}

	const hasBorderClosed = enclosedCells > 0 || hasBorderStructure;

	return hasBorderClosed;
};

export const isGridFilled = (grid: Record<string, boolean>): boolean => {
	console.log("isGridFilled: Starting check");

	if (!grid || Object.keys(grid).length === 0) {
		console.log("isGridFilled: Grid is empty or undefined.");
		return false;
	}

	// If the border isn't closed, the grid can't be filled
	if (!isBorderClosed(grid)) {
		console.log("isGridFilled: Border is not closed, grid cannot be filled.");
		return false;
	}

	// Find the boundaries of the grid
	let minRow = Infinity,
		maxRow = -Infinity;
	let minCol = Infinity,
		maxCol = -Infinity;

	Object.keys(grid).forEach((key) => {
		const [row, col] = key.split("-").map(Number);
		minRow = Math.min(minRow, row);
		maxRow = Math.max(maxRow, row);
		minCol = Math.min(minCol, col);
		maxCol = Math.max(maxCol, col);
	});

	// Create a full grid representation with padding
	const rows = maxRow - minRow + 3; // Add padding
	const cols = maxCol - minCol + 3; // Add padding
	const fullGrid: boolean[][] = Array(rows)
		.fill(0)
		.map(() => Array(cols).fill(false));

	// Fill in the active cells (with offset for padding)
	Object.keys(grid).forEach((key) => {
		const [row, col] = key.split("-").map(Number);
		fullGrid[row - minRow + 1][col - minCol + 1] = true;
	});

	// Create a visited grid for flood fill
	const visited: boolean[][] = Array(rows)
		.fill(0)
		.map(() => Array(cols).fill(false));

	// Directions for adjacent cells
	const directions = [
		[0, 1],
		[1, 0],
		[0, -1],
		[-1, 0],
	];

	// Start flood fill from outside the grid
	const queue: [number, number][] = [[0, 0]];
	visited[0][0] = true;

	// Perform BFS flood fill from the outside
	while (queue.length > 0) {
		const [r, c] = queue.shift()!;

		for (const [dr, dc] of directions) {
			const nr = r + dr;
			const nc = c + dc;

			if (
				nr >= 0 &&
				nr < rows &&
				nc >= 0 &&
				nc < cols &&
				!visited[nr][nc] &&
				!fullGrid[nr][nc]
			) {
				visited[nr][nc] = true;
				queue.push([nr, nc]);
			}
		}
	}

	// Check if all cells within the border are either active or unreachable from outside
	for (let r = 1; r < rows - 1; r++) {
		for (let c = 1; c < cols - 1; c++) {
			// If a cell is not active and not visited (from outside), it's an unfilled cell inside the border
			if (!fullGrid[r][c] && !visited[r][c]) {
				console.log(
					`isGridFilled: Found unfilled cell at (${r + minRow - 1},${
						c + minCol - 1
					})`,
				);
				return false;
			}
		}
	}

	console.log("isGridFilled: All cells within the border are filled.");
	return true;
};

export const fillGrid = (
	grid: Record<string, boolean>,
): Record<string, boolean> => {
	if (!grid || Object.keys(grid).length === 0) {
		return {};
	}

	if (!isBorderClosed(grid)) {
		return { ...grid };
	}

	const newGrid = { ...grid };

	let minRow = Infinity,
		maxRow = -Infinity;
	let minCol = Infinity,
		maxCol = -Infinity;

	Object.keys(grid).forEach((key) => {
		const [row, col] = key.split("-").map(Number);
		minRow = Math.min(minRow, row);
		maxRow = Math.max(maxRow, row);
		minCol = Math.min(minCol, col);
		maxCol = Math.max(maxCol, col);
	});

	for (let r = minRow; r <= maxRow; r++) {
		for (let c = minCol; c <= maxCol; c++) {
			const key = `${r}-${c}`;
			if (!newGrid[key]) {
				newGrid[key] = true;
				console.log(`fillGrid: Filled cell at (${r},${c})`);
			}
		}
	}

	return newGrid;
};


export const isDoorValid = (
	grid: Record<string, boolean>,
	door: { row: number; col: number } | null,
): boolean => {
	if (!door || !grid) return false;

	const key = `${door.row}-${door.col}`;

	// Check if the door is placed on an active grid cell
	const isOnGrid = Boolean(grid[key]);

	console.log(
		`isDoorValid: Door at (${door.row},${door.col}) is ${
			isOnGrid ? "valid" : "invalid"
		}`,
	);

	return isOnGrid;
};


export const isStartingPointValid = (
	grid: Record<string, boolean>,
	startingPoint: { row: number; col: number } | null,
): boolean => {
	if (!startingPoint || !grid) return false;

	const key = `${startingPoint.row}-${startingPoint.col}`;

	// Check if the starting point is placed on an active grid cell
	const isOnGrid = Boolean(grid[key]);

	console.log(
		`isStartingPointValid: Starting point at (${startingPoint.row},${
			startingPoint.col
		}) is ${isOnGrid ? "valid" : "invalid"}`,
	);

	return isOnGrid;
};

export const areRoomElementsValid = (room: {
	grid: Record<string, boolean>;
	door: { row: number; col: number } | null;
	startingPoint: { row: number; col: number } | null;
}): boolean => {
	if (!room || !room.grid) return false;

	const isDoorPlacementValid = !room.door || isDoorValid(room.grid, room.door);
	const isStartPointValid =
		!room.startingPoint || isStartingPointValid(room.grid, room.startingPoint);

	const isValid = isDoorPlacementValid && isStartPointValid;

	console.log(
		`areRoomElementsValid: Room elements validation result: ${isValid}`,
	);

	return isValid;
};

export const suggestValidPosition = (
	grid: Record<string, boolean>,
): { row: number; col: number } | null => {
	if (!grid || Object.keys(grid).length === 0) return null;

	// Find the first valid grid cell
	for (const key of Object.keys(grid)) {
		if (grid[key]) {
			const [row, col] = key.split("-").map(Number);
			console.log(`suggestValidPosition: Suggested position (${row},${col})`);
			return { row, col };
		}
	}

	console.log("suggestValidPosition: No valid position found");
	return null;
};


