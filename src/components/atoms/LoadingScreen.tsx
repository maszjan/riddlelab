import React from "react";
import "./LoadingScreen.css"; // import stylów

const LoadingScreen: React.FC<{ text?: string }> = ({
	text = "Ładowanie...",
}) => (
	<div className='custom-loading-screen'>
		<div className='custom-loading-logo-wrapper'>
			{/* Podmień poniżej na własne logo SVG lub <img src="..." /> */}
			<svg
				className='custom-loading-logo'
				width='64'
				height='64'
				viewBox='0 0 64 64'
				fill='none'>
				<circle
					cx='32'
					cy='32'
					r='28'
					stroke='#00FFC2'
					strokeWidth='6'
					opacity='0.3'
				/>
				<circle
					className='custom-loading-spinner'
					cx='32'
					cy='32'
					r='28'
					stroke='#00FFC2'
					strokeWidth='6'
					strokeDasharray='44 100'
					strokeLinecap='round'
				/>
				<text
					x='32'
					y='38'
					textAnchor='middle'
					fontSize='18'
					fill='#00FFC2'
					fontWeight='bold'>
					RL
				</text>
			</svg>
		</div>
		<p className='custom-loading-text'>{text}</p>
	</div>
);

export default LoadingScreen;
