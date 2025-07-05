import React from "react";
import { FaEdit, FaPuzzlePiece, FaUsers } from "react-icons/fa";

const EditorShowcaseSection: React.FC = () => {
	return (
		<div className='py-12 md:py-16 px-4 md:px-6 bg-gradient-to-r from-slate-900 to-dark'>
			<div className='max-w-6xl mx-auto'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center'>
					<div className='order-2 lg:order-1'>
						<h2 className='text-2xl md:text-3xl font-bold text-light mb-4 md:mb-6'>
							Edytor map
						</h2>
						<p className='text-light/80 text-base md:text-lg mb-6 md:mb-8'>
							Edytor pozwala każdemu stworzyć wyjątkowy escape room. Wybierz,
							rysuj, dostosuj - to naprawdę takie proste.
						</p>
						<div className='space-y-3 md:space-y-4'>
							<div className='flex items-center gap-3'>
								<div className='w-6 h-6 md:w-8 md:h-8 bg-mainMint rounded-full flex items-center justify-center flex-shrink-0'>
									<FaEdit className='text-dark text-xs md:text-sm' />
								</div>
								<span className='text-light text-sm md:text-base'>
									Prosty edytor - bez skomplikowanych instrukcji
								</span>
							</div>
							<div className='flex items-center gap-3'>
								<div className='w-6 h-6 md:w-8 md:h-8 bg-mainMint rounded-full flex items-center justify-center flex-shrink-0'>
									<FaPuzzlePiece className='text-dark text-xs md:text-sm' />
								</div>
								<span className='text-light text-sm md:text-base'>
									Gotowe publiczne tekstury i możliwość dodawania własnych
								</span>
							</div>
							<div className='flex items-center gap-3'>
								<div className='w-6 h-6 md:w-8 md:h-8 bg-mainMint rounded-full flex items-center justify-center flex-shrink-0'>
									<FaUsers className='text-dark text-xs md:text-sm' />
								</div>
								<span className='text-light text-sm md:text-base'>
									Udostępnij i zbieraj opinie od innych
								</span>
							</div>
						</div>
					</div>
					<div className='order-1 lg:order-2 bg-slate-800 rounded-lg p-6 md:p-10 shadow-lg'>
						<div className='h-48 md:h-64 bg-dark rounded-lg flex items-center justify-center'>
							<img
								src='/editor-2.png'
								alt='Kreator pokojów RiddleLab'
								className='rounded-lg object-fit w-full h-full'
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditorShowcaseSection;
