import React, { useEffect, useRef } from "react";
import kaplay, { type KAPLAYCtx } from "kaplay";

interface GameCanvasProps {
	onGameInstanceReady: (k: KAPLAYCtx) => void;
}

let globalKaplayInstance: KAPLAYCtx | null = null;
let globalCanvasElement: HTMLCanvasElement | null = null;

export const GameCanvas: React.FC<GameCanvasProps> = ({
	onGameInstanceReady,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const kaplayInstanceRef = useRef<KAPLAYCtx | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		if (!globalCanvasElement) {
			globalCanvasElement = document.createElement("canvas");
			globalCanvasElement.className = "w-full h-full";
			globalCanvasElement.style.imageRendering = "auto";
			containerRef.current.appendChild(globalCanvasElement);

			globalKaplayInstance = kaplay({
				canvas: globalCanvasElement,
				width: 1280,
				height: 720,
				letterbox: true,
				background: [20, 20, 30],
				global: false,
				scale: 1,
				debug: false,
				crisp: false,
			});

			kaplayInstanceRef.current = globalKaplayInstance;
		} else if (!containerRef.current.contains(globalCanvasElement)) {
			containerRef.current.appendChild(globalCanvasElement);
			kaplayInstanceRef.current = globalKaplayInstance;
		}

		return () => {
			if (globalKaplayInstance) {
				try {
					globalKaplayInstance.quit();
				} catch (e) {
					console.warn("Error quitting Kaplay:", e);
				}
				globalKaplayInstance = null;
			}

			if (globalCanvasElement && globalCanvasElement.parentNode) {
				globalCanvasElement.parentNode.removeChild(globalCanvasElement);
			}
			globalCanvasElement = null;
			kaplayInstanceRef.current = null;
		};
	}, []); 

	useEffect(() => {
		if (kaplayInstanceRef.current) {
			onGameInstanceReady(kaplayInstanceRef.current);
		}
	}, [onGameInstanceReady]);

	return <div ref={containerRef} className='w-full h-full' />;
};
