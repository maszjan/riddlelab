import React from "react";
import { Stage, Layer, Circle, Rect, Shape } from "react-konva";

interface AvatarColors {
	skin_color: string;
	hair_color: string;
	eye_color: string;
	outfit_color: string;
}

interface AvatarPreviewProps {
	colors: AvatarColors;
	size?: "small" | "large";
}

const AvatarPreview: React.FC<AvatarPreviewProps> = ({
	colors,
	size = "large",
}) => {
	// Wymiary w zależności od rozmiaru
	const dimensions =
		size === "small"
			? { width: 40, height: 40, scale: 0.4 }
			: { width: 150, height: 200, scale: 1 };

	const centerX = dimensions.width / 2;
	const headY = size === "small" ? dimensions.height / 2 : 60;

	return (
		<Stage width={dimensions.width} height={dimensions.height}>
			<Layer>
				{/* Skóra (głowa) */}
				<Circle
					x={centerX}
					y={headY}
					radius={50 * dimensions.scale}
					fill={colors.skin_color}
				/>

				{/* Włosy - zaokrąglone */}
				<Rect
					x={centerX - 50 * dimensions.scale}
					y={headY - 50 * dimensions.scale}
					width={100 * dimensions.scale}
					height={40 * dimensions.scale}
					fill={colors.hair_color}
					cornerRadius={[20 * dimensions.scale, 20 * dimensions.scale, 0, 0]}
				/>

				{/* Białka oczu */}
				<Circle
					x={centerX - 15 * dimensions.scale}
					y={headY}
					radius={8 * dimensions.scale}
					fill='white'
				/>
				<Circle
					x={centerX + 15 * dimensions.scale}
					y={headY}
					radius={8 * dimensions.scale}
					fill='white'
				/>

				{/* Kolorowe części oczu */}
				<Circle
					x={centerX - 15 * dimensions.scale}
					y={headY}
					radius={4 * dimensions.scale}
					fill={colors.eye_color}
				/>
				<Circle
					x={centerX + 15 * dimensions.scale}
					y={headY}
					radius={4 * dimensions.scale}
					fill={colors.eye_color}
				/>

				{/* Usta */}
				<Shape
					sceneFunc={(context) => {
						context.beginPath();
						context.moveTo(
							centerX - 20 * dimensions.scale,
							headY + 25 * dimensions.scale,
						);
						context.quadraticCurveTo(
							centerX,
							headY + 35 * dimensions.scale,
							centerX + 20 * dimensions.scale,
							headY + 25 * dimensions.scale,
						);
						context.stroke();
					}}
					stroke='#d63031'
					strokeWidth={2 * dimensions.scale}
				/>

				{/* Strój - tylko dla dużego awatara */}
				{size === "large" && (
					<Rect
						x={centerX - 50 * dimensions.scale}
						y={headY + 50 * dimensions.scale}
						width={100 * dimensions.scale}
						height={80 * dimensions.scale}
						fill={colors.outfit_color}
						cornerRadius={[0, 0, 10 * dimensions.scale, 10 * dimensions.scale]}
					/>
				)}
			</Layer>
		</Stage>
	);
};

export default AvatarPreview;
