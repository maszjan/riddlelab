import React from "react";
import { ConfirmationModalProps } from "../../interfaces";
import { createPortal } from "react-dom";

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	subMessage,
	confirmText = "Potwierdź",
	cancelText = "Anuluj",
	confirmButtonClass = "bg-red-500 hover:bg-red-600",
}) => {
	if (!isOpen) return null;

	return createPortal(
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-gray-800 rounded-lg p-6 w-full max-w-md'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-xl font-bold text-mainMint'>{title}</h2>
					<button onClick={onClose} className='text-gray-400 hover:text-white'>
						&times;
					</button>
				</div>

				<div className='mb-6'>
					<p className='text-gray-300'>{message}</p>
					{subMessage && (
						<p className='text-gray-400 text-sm mt-2'>{subMessage}</p>
					)}
				</div>

				<div className='flex justify-end space-x-3'>
					<button
						type='button'
						onClick={onClose}
						className='px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700'>
						{cancelText}
					</button>
					<button
						type='button'
						onClick={onConfirm}
						className={`px-4 py-2 text-white rounded-md transition-colors duration-200 ${confirmButtonClass}`}>
						{confirmText}
					</button>
				</div>
			</div>
		</div>,
		document.body,
	);
};

export default ConfirmationModal;
