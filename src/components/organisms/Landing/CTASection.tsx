import React from "react";
import { Link } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import { MdCreate } from "react-icons/md";

const CTASection: React.FC = () => {
	return (
		<div className='py-12 md:py-16 px-4 md:px-6 text-center bg-gray-800'>
			<h2 className='text-2xl md:text-4xl font-bold text-light mb-3 md:mb-4'>
				Dołącz do RiddleLab już dziś
			</h2>
			<p className='text-light/80 mb-6 md:mb-8 text-base md:text-lg'>
				Tysiące graczy już tworzy i odkrywa niesamowite pokoje zagadek
			</p>
			<div className='flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md sm:max-w-none mx-auto'>
				<Link to='/register' className='w-full sm:w-auto'>
					<button className='w-full sm:w-auto px-6 md:px-8 py-3 bg-mainMint text-dark font-semibold rounded-lg hover:bg-mainMint/90 transition-colors duration-200 flex items-center justify-center gap-2'>
						<FaPlay className='text-sm' />
						Rozpocznij przygodę
					</button>
				</Link>
				<Link to='/register' className='w-full sm:w-auto'>
					<button className='w-full sm:w-auto px-6 md:px-8 py-3 border-2 border-mainMint text-mainMint font-semibold rounded-lg hover:bg-mainMint hover:text-dark transition-colors duration-200 flex items-center justify-center gap-2'>
						<MdCreate className='text-sm' />
						Stwórz własny pokój
					</button>
				</Link>
			</div>

			{/* Development Notice */}
			<div className='mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-600'>
				<p className='text-gray-400 text-sm md:text-base'>
					RiddleLab jest obecnie w fazie rozwoju - funkcje gry będą dostępne
					wkrótce!
				</p>
			</div>
		</div>
	);
};

export default CTASection;
