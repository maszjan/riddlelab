import React from "react";
import { FaGamepad, FaUsers } from "react-icons/fa";
import { MdCreate } from "react-icons/md";

const HowToPlaySection: React.FC = () => {
	return (
		<div className='py-12 md:py-16 px-4 md:px-6 bg-gray-700'>
			<div className='max-w-6xl mx-auto'>
				<h2 className='text-2xl md:text-3xl font-bold text-light mb-3 md:mb-4 text-center'>
					Jak zacząć?
				</h2>
				<p className='text-light/80 text-base md:text-lg mb-6 md:mb-8 text-center'>
					RiddleLAB to miejsce, gdzie możesz tworzyć i odkrywać wirtualne escape
					roomy. Oto jak zacząć swoją przygodę:
				</p>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8'>
					<div className='text-center'>
						<div className='w-12 h-12 md:w-16 md:h-16 bg-mainMint rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center'>
							<FaGamepad className='text-lg md:text-2xl text-dark' />
						</div>
						<h3 className='text-lg md:text-xl font-bold text-light mb-2'>
							1. Wybierz mapę
						</h3>
						<p className='text-light/80 text-sm md:text-base'>
							Przeglądaj pokoje stworzone przez społeczność. Każdy ma swoją
							unikalną historię.
						</p>
					</div>

					<div className='text-center'>
						<div className='w-12 h-12 md:w-16 md:h-16 bg-mainMint rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center'>
							<MdCreate className='text-lg md:text-2xl text-dark' />
						</div>
						<h3 className='text-lg md:text-xl font-bold text-light mb-2'>
							2. Stwórz własną mapę
						</h3>
						<p className='text-light/80 text-sm md:text-base'>
							Masz pomysł na pokój? Użyj kreatora i podziel się swoją wizją z
							innymi.
						</p>
					</div>

					<div className='text-center'>
						<div className='w-12 h-12 md:w-16 md:h-16 bg-mainMint rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center'>
							<FaUsers className='text-lg md:text-2xl text-dark' />
						</div>
						<h3 className='text-lg md:text-xl font-bold text-light mb-2'>
							3. Buduj społeczność
						</h3>
						<p className='text-light/80 text-sm md:text-base'>
							Oceniaj pokoje innych, zdobywaj fanów i buduj swoją reputację w
							świecie RiddleLab.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HowToPlaySection;
