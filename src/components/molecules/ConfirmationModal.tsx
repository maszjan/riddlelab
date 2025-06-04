import { ConfirmationModalProps } from "../../interfaces";

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	subMessage,
	confirmText = "Confirm",
	cancelText = "Cancel",
	confirmButtonClass = "bg-red-500 hover:bg-red-600",
}) => {
	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4'>
				<h2 className='text-xl font-bold text-white mb-4'>{title}</h2>
				<p className='text-gray-300 mb-2'>{message}</p>
				{subMessage && (
					<p className='text-gray-400 text-sm mb-4'>{subMessage}</p>
				)}

				<div className='flex justify-end space-x-3'>
					<button
						onClick={onClose}
						className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700'>
						{cancelText}
					</button>
					<button
						onClick={onConfirm}
						className={`px-4 py-2 text-white rounded ${confirmButtonClass}`}>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationModal;
