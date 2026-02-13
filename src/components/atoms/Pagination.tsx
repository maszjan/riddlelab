import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
	currentPage: number;
	lastPage: number;
	onPageChange: (page: number) => void;
	total?: number;
}

const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	lastPage,
	onPageChange,
	total,
}) => {
	if (lastPage <= 1) return null;

	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxVisible = 5;

		if (lastPage <= maxVisible) {
			for (let i = 1; i <= lastPage; i++) {
				pages.push(i);
			}
		} else {
			pages.push(1);

			if (currentPage > 3) {
				pages.push("...");
			}

			const start = Math.max(2, currentPage - 1);
			const end = Math.min(lastPage - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < lastPage - 2) {
				pages.push("...");
			}

			pages.push(lastPage);
		}

		return pages;
	};

	return (
		<div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
			{total !== undefined && (
				<div className='text-sm text-gray-400'>
					Łącznie: <span className='font-semibold text-gray-300'>{total}</span>{" "}
					wyników
				</div>
			)}

			<div className='flex items-center gap-2'>
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className='px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2'>
					<FaChevronLeft size={12} />
					<span className='hidden sm:inline'>Poprzednia</span>
				</button>

				<div className='flex gap-1'>
					{getPageNumbers().map((page, index) => {
						if (page === "...") {
							return (
								<span
									key={`ellipsis-${index}`}
									className='px-3 py-2 text-gray-400'>
									...
								</span>
							);
						}

						return (
							<button
								key={page}
								onClick={() => onPageChange(page as number)}
								className={`px-3 py-2 rounded-lg transition-colors ${
									currentPage === page
										? "bg-mainMint text-dark font-semibold"
										: "bg-gray-700 text-gray-300 hover:bg-gray-600"
								}`}>
								{page}
							</button>
						);
					})}
				</div>

				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === lastPage}
					className='px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2'>
					<span className='hidden sm:inline'>Następna</span>
					<FaChevronRight size={12} />
				</button>
			</div>
		</div>
	);
};

export default Pagination;
