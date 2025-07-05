/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { updateRiddle } from "../../../store/slices/editorSlice";
import {
	RIDDLE_TYPES,
	RIDDLE_TYPE_LABELS,
	RiddleType,
} from "../../../utils/riddleHelpers";
import AssetPickerModal from "../Editor/AssetPickerModal";
import useGetAsset from "../../../hooks/useGetAsset";
import { MdOutlineTexture } from "react-icons/md";

interface EditRiddleModalProps {
	isOpen: boolean;
	onClose: () => void;
	riddle: any;
}

interface RiddleForm {
	title: string;
	type: RiddleType;
	question: string;
	answer: string;
	hints: string[];
}

const EditRiddleModal: React.FC<EditRiddleModalProps> = ({
	onClose,
	riddle,
}) => {
	const dispatch = useDispatch();
	const currentRoom = useSelector((state: RootState) => {
		const escapeRoom = state.editor.escapeRooms.find(
			(er) => er.id === state.editor.currentEscapeRoomId,
		);
		return escapeRoom?.rooms.find(
			(room) => room.id === state.editor.currentRoomId,
		);
	});

	// Local state for form inputs
	const [form, setForm] = useState<RiddleForm>({
		title: "",
		type: RIDDLE_TYPES.KNOWLEDGE,
		question: "",
		answer: "",
		hints: [] as string[],
	});
	const [newHint, setNewHint] = useState("");
	const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
	const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
	const { asset: selectedAssetDetails } = useGetAsset(selectedAssetId);

	// Populate form when riddle changes
	useEffect(() => {
		if (riddle) {
			console.log("Loading riddle data:", riddle);

			setForm({
				title: riddle.data?.title || riddle.title || "",
				type: riddle.type || RIDDLE_TYPES.KNOWLEDGE,
				question: riddle.data?.question || riddle.question || "",
				answer: riddle.data?.answer || riddle.answer || "",
				hints: riddle.data?.hints || riddle.hints || [],
			});
			setSelectedAssetId(riddle.assetId || null);
		} else {
			// Clear form when no riddle
			setForm({
				title: "",
				type: RIDDLE_TYPES.KNOWLEDGE,
				question: "",
				answer: "",
				hints: [],
			});
			setSelectedAssetId(null);
		}
		setNewHint("");
	}, [riddle]);

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

	const handleSave = () => {
		if (
			riddle &&
			currentRoom &&
			form.title.trim() &&
			form.question.trim() &&
			form.answer.trim()
		) {
			// Create updates object with proper typing
			const updates: any = {
				type: form.type,
				data: {
					...riddle.data,
					title: form.title,
					question: form.question,
					answer: form.answer,
					hints: form.hints,
				},
				assetId: selectedAssetId,
			};

			// Update texture if asset changed
			if (selectedAssetDetails?.url) {
				updates.texture = selectedAssetDetails.url;
			} else if (riddle.texture) {
				// Keep existing texture if no new asset selected
				updates.texture = riddle.texture;
			}

			console.log("Saving riddle updates:", updates);

			dispatch(
				updateRiddle({
					riddleId: riddle.id,
					updates: updates,
				}),
			);

			onClose();
		}
	};

	return (
		<div className='fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40'>
			<div className='bg-gray-800 rounded-lg p-6 w-96 relative'>
				<button
					className='absolute top-2 right-2 text-gray-400 hover:text-white'
					onClick={onClose}>
					✕
				</button>
				<h3 className='text-lg font-bold text-white mb-4'>Edytuj zagadkę</h3>

				<input
					type='text'
					value={form.title}
					onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
					placeholder='Tytuł zagadki'
					className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm mb-2'
				/>

				<select
					value={form.type}
					onChange={(e) =>
						setForm((f) => ({ ...f, type: e.target.value as RiddleType }))
					}
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
				{(selectedAssetDetails?.url || riddle?.texture) && (
					<div className='mt-2 relative mb-4'>
						<div className='relative w-24 h-24 border border-gray-600 rounded overflow-hidden'>
							<img
								src={selectedAssetDetails?.url || riddle?.texture}
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

				<div className='flex justify-end space-x-3 mt-6'>
					<button
						onClick={onClose}
						className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700'>
						Anuluj
					</button>
					<button
						onClick={handleSave}
						disabled={
							!form.title.trim() || !form.question.trim() || !form.answer.trim()
						}
						className='px-4 py-2 bg-mainMint text-gray-900 rounded hover:bg-mainMint/80 disabled:bg-gray-600 disabled:text-gray-400'>
						Zapisz zmiany
					</button>
				</div>

				<AssetPickerModal
					isOpen={isAssetModalOpen}
					onClose={() => setIsAssetModalOpen(false)}
					onSelect={(assetId: number) => {
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

export default EditRiddleModal;
