import React from "react";
import { Circle, Rect, Shape } from "react-konva";

interface AvatarColors {
	skin_color: string;
	hair_color: string;
	eye_color: string;
	outfit_color: string;
}

interface AvatarKonvaElementsProps {
	colors: AvatarColors;
	x: number;
	y: number;
	gridSize: number;
}

const AvatarKonvaElements: React.FC<AvatarKonvaElementsProps> = ({
	colors,
	x,
	y,
	gridSize,
}) => {
	const scale = gridSize / 80;
	const centerX = x + gridSize / 2;
	const centerY = y + gridSize / 2;

	const headRadius = 18 * scale;
	const eyeRadius = 4 * scale;
	const pupilRadius = 2 * scale;

	return (
		<React.Fragment>
			<Circle
				x={centerX}
				y={centerY - 6 * scale}
				radius={headRadius}
				fill={colors.skin_color}
			/>

			<Rect
				x={centerX - headRadius}
				y={centerY - 6 * scale - headRadius}
				width={headRadius * 2}
				height={15 * scale}
				fill={colors.hair_color}
				cornerRadius={[8 * scale, 8 * scale, 0, 0]}
			/>

			<Circle
				x={centerX - 6 * scale}
				y={centerY - 6 * scale}
				radius={eyeRadius}
				fill='white'
			/>
			<Circle
				x={centerX + 6 * scale}
				y={centerY - 6 * scale}
				radius={eyeRadius}
				fill='white'
			/>

			<Circle
				x={centerX - 6 * scale}
				y={centerY - 6 * scale}
				radius={pupilRadius}
				fill={colors.eye_color}
			/>
			<Circle
				x={centerX + 6 * scale}
				y={centerY - 6 * scale}
				radius={pupilRadius}
				fill={colors.eye_color}
			/>

			<Shape
				sceneFunc={(context) => {
					context.beginPath();
					context.moveTo(centerX - 8 * scale, centerY + 4 * scale);
					context.quadraticCurveTo(
						centerX,
						centerY + 10 * scale,
						centerX + 8 * scale,
						centerY + 4 * scale,
					);
					context.stroke();
				}}
				stroke='#d63031'
				strokeWidth={1.5 * scale}
			/>

			<Rect
				x={centerX - 10 * scale}
				y={centerY + 10 * scale}
				width={20 * scale}
				height={15 * scale}
				fill={colors.outfit_color}
				cornerRadius={[0, 0, 4 * scale, 4 * scale]}
			/>
		</React.Fragment>
	);
};

export default AvatarKonvaElements;
