import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { RIDDLE_TYPES, RIDDLE_TYPE_LABELS } from "../../../utils/riddleHelpers";
import { addRiddle } from "../../../store/slices/editorSlice";
import AssetPickerModal from "../Editor/AssetPickerModal";
import useGetAsset from "../../../hooks/useGetAsset";
import { MdOutlineTexture } from "react-icons/md";

const AddRiddleModal = ({ isOpen, onClose }) => {
	const dispatch = useDispatch();
	const [form, setForm] = useState({
		title: "",
		type: RIDDLE_TYPES.KNOWLEDGE,
		question: "",
		answer: "",
		hints: [],
	});
	const [newHint, setNewHint] = useState("");
	const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
	const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
	const { asset: selectedAssetDetails } = useGetAsset(selectedAssetId);

	const handleAddHint = () => {
		if (newHint.trim()) {
			setForm((f) => ({ ...f, hints: [...f.hints, newHint] }));
			setNewHint("");
		}
	};

	const handleRemoveHint = (idx: number) => {
		setForm((f) => ({
			...f,
			hints: f.hints.filter((_, i) => i !== idx),
		}));
	};

	const handleSubmit = () => {
		if (
			form.title.trim() &&
			form.question.trim() &&
			form.answer.trim() &&
			selectedAssetId &&
			selectedAssetDetails?.url
		) {
			const texturePath = new URL(selectedAssetDetails.url).pathname;
			dispatch(
				addRiddle({
					id: `riddle-${uuidv4()}`,
					position: { row: 0, col: 0 },
					type: form.type,
					title: form.title,
					question: form.question,
					answer: form.answer,
					hints: form.hints,
					options: {},
					assetId: selectedAssetId,
					texture: texturePath,
				}),
			);
			onClose();
			setForm({
				title: "",
				type: RIDDLE_TYPES.KNOWLEDGE,
				question: "",
				answer: "",
				hints: [],
			});
			setSelectedAssetId(null);
			setNewHint("");
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40'>
			<div className='bg-gray-800 rounded-lg p-6 w-96 relative'>
				<button
					className='absolute top-2 right-2 text-gray-400 hover:text-white'
					onClick={onClose}>
					✕
				</button>
				<h3 className='text-lg font-bold text-white mb-4'>Dodaj zagadkę</h3>

				<input
					type='text'
					value={form.title}
					onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
					placeholder='Tytuł zagadki'
					className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm mb-2'
				/>

				<select
					value={form.type}
					onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
					className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm mb-2'>
					{Object.entries(RIDDLE_TYPE_LABELS).map(([value, label]) => (
						<option
							key={value}
							value={value}
							disabled={value === RIDDLE_TYPES.PUZZLE_GAME}>
							{label}
						</option>
					))}
				</select>

				<div className='flex items-center justify-between mb-2'>
					<label className='text-lg mt-1 text-gray-300'>Obraz zagadki:</label>
					<button
						onClick={() => setIsAssetModalOpen(true)}
						className='flex items-center justify-center w-12 h-12 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600'>
						<MdOutlineTexture className='h-6 w-6' />
					</button>
				</div>
				{selectedAssetDetails?.url && (
					<div className='mt-2 relative mb-4'>
						<div className='relative w-24 h-24 border border-gray-600 rounded overflow-hidden'>
							<img
								src={selectedAssetDetails.url}
								alt='Riddle Asset'
								className='w-full h-full object-cover'
							/>
							<button
								onClick={() => setSelectedAssetId(null)}
								className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600'
								title='Usuń obraz'>
								X
							</button>
						</div>
					</div>
				)}

				<textarea
					value={form.question}
					onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
					placeholder='Treść zagadki'
					className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm h-20 mb-2'
				/>

				<input
					type='text'
					value={form.answer}
					onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
					placeholder='Odpowiedź'
					className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm mb-2'
				/>

				<div className='mb-2'>
					<label className='text-xs text-gray-300 block mb-1'>
						Podpowiedzi:
					</label>
					{form.hints.map((hint, idx) => (
						<div key={idx} className='flex justify-between items-center mb-1'>
							<span className='text-xs text-gray-300'>{hint}</span>
							<button
								onClick={() => handleRemoveHint(idx)}
								className='text-red-500 text-xs'>
								Usuń
							</button>
						</div>
					))}
					<div className='flex'>
						<input
							type='text'
							value={newHint}
							onChange={(e) => setNewHint(e.target.value)}
							placeholder='Nowa podpowiedź'
							className='flex-grow px-2 py-1 bg-gray-700 text-white rounded-l text-sm'
						/>
						<button
							onClick={handleAddHint}
							className='px-2 py-1 bg-mainMint text-gray-700 rounded-r'>
							Dodaj
						</button>
					</div>
				</div>

				<button
					onClick={handleSubmit}
					className='w-full py-2 bg-mainMint text-gray-700 rounded mt-2'
					disabled={
						!form.title.trim() ||
						!form.question.trim() ||
						!form.answer.trim() ||
						!selectedAssetId
					}>
					Dodaj zagadkę
				</button>
				{!selectedAssetId && (
					<p className='text-xs text-red-400 mt-1'>
						Wybierz obraz zagadki przed dodaniem!
					</p>
				)}

				<AssetPickerModal
					isOpen={isAssetModalOpen}
					onClose={() => setIsAssetModalOpen(false)}
					onSelect={(assetId) => {
						setSelectedAssetId(assetId);
						setIsAssetModalOpen(false);
					}}
					assetType='riddle'
					title='Wybierz obraz zagadki'
				/>
			</div>
		</div>
	);
};

export default AddRiddleModal;
