import React from "react";
import { Link } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import { MdCreate } from "react-icons/md";

const HeroSection: React.FC = () => {
	return (
		<div className='relative min-h-screen flex items-center justify-center px-4'>
			{/* Background Image */}
			<div className='absolute inset-0'>
				<img
					src='/rl-app-1.png'
					alt='RiddleLab Escape Room'
					className='w-full h-full object-cover'
				/>
				<div className='absolute inset-0 bg-black/60'></div>
			</div>

			{/* Hero Content */}
			<div className='relative z-10 text-center max-w-4xl mx-auto px-4'>
				<div className='mb-4 md:mb-6'>
					<span className='text-mainMint text-lg md:text-xl font-semibold tracking-wider'>
						RIDDLELAB
					</span>
				</div>
				<h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-light mb-4 md:mb-6'>
					Wirtualne Escape Roomy
				</h1>
				<p className='text-lg sm:text-xl md:text-2xl text-light/90 mb-6 md:mb-8 max-w-3xl mx-auto'>
					Twórz własne pokoje zagadek lub rozwiązuj te stworzone przez innych
					graczy. Każda mapa to nowe wyzwanie czekające na odkrycie.
				</p>
				<div className='flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md sm:max-w-none mx-auto'>
					<Link to='/register' className='w-full sm:w-auto'>
						<button className='w-full sm:w-auto px-6 md:px-8 py-3 bg-mainMint text-dark font-semibold rounded-lg hover:bg-mainMint/90 transition-colors duration-200 flex items-center justify-center gap-2'>
							<FaPlay className='text-sm' />
							Zacznij grać
						</button>
					</Link>
					<Link to='/register' className='w-full sm:w-auto'>
						<button className='w-full sm:w-auto px-6 md:px-8 py-3 border-2 border-mainMint text-mainMint font-semibold rounded-lg hover:bg-mainMint hover:text-dark transition-colors duration-200 flex items-center justify-center gap-2'>
							<MdCreate className='text-sm' />
							Buduj pokoje
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default HeroSection;
