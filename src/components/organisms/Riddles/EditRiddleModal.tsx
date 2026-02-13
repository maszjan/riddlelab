import { useEffect, useState } from "react";
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
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";

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

const validationSchema = Yup.object().shape({
	type: Yup.string().required(),
	title: Yup.string().when("type", {
		is: (val: RiddleType) => val !== RIDDLE_TYPES.PUZZLE_GAME,
		then: (schema) => schema.required("Tytuł jest wymagany"),
		otherwise: (schema) => schema,
	}),
	question: Yup.string().when("type", {
		is: (val: RiddleType) => val !== RIDDLE_TYPES.PUZZLE_GAME,
		then: (schema) => schema.required("Treść jest wymagana"),
		otherwise: (schema) => schema,
	}),
	answer: Yup.string().when("type", {
		is: (val: RiddleType) => val !== RIDDLE_TYPES.PUZZLE_GAME,
		then: (schema) => schema.required("Odpowiedź jest wymagana"),
		otherwise: (schema) => schema,
	}),
	hints: Yup.array().of(Yup.string()),
});

const EditRiddleModal: React.FC<EditRiddleModalProps> = ({
	isOpen,
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

	const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
	const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
	const { asset: selectedAssetDetails } = useGetAsset(selectedAssetId);

	useEffect(() => {
		if (riddle) {
			setSelectedAssetId(riddle.assetId || null);
		} else {
			setSelectedAssetId(null);
		}
	}, [riddle]);

	if (!isOpen || !riddle) return null;

	const initialValues: RiddleForm = {
		title: riddle.data?.title || riddle.title || "",
		type: riddle.type || RIDDLE_TYPES.KNOWLEDGE,
		question: riddle.data?.question || riddle.question || "",
		answer: riddle.data?.answer || riddle.answer || "",
		hints: riddle.data?.hints || riddle.hints || [],
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
				<Formik
					enableReinitialize
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={(values) => {
						// LOG: submit values
						console.log(
							"SUBMIT values.type:",
							values.type,
							"PUZZLE_GAME:",
							RIDDLE_TYPES.PUZZLE_GAME,
							"isPuzzle:",
							values.type === RIDDLE_TYPES.PUZZLE_GAME,
						);
						if (!riddle || !currentRoom) return;

						const isPuzzle = values.type === RIDDLE_TYPES.PUZZLE_GAME;

						const updates: any = {
							type: values.type,
							// Top-level properties (dla MainCanvasWrapper)
							title: isPuzzle ? "Puzzle minigra" : values.title,
							question: isPuzzle ? "Rozwiąż minigrę typu puzzle" : values.question,
							answer: isPuzzle ? "puzzle" : values.answer,
							hints: isPuzzle ? [] : values.hints,
							// Nested data (dla kompatybilności)
							data: {
								...riddle.data,
								title: isPuzzle ? "Puzzle minigra" : values.title,
								question: isPuzzle
									? "Rozwiąż minigrę typu puzzle"
									: values.question,
								answer: isPuzzle ? "puzzle" : values.answer,
								hints: isPuzzle ? [] : values.hints,
							},
							assetId: selectedAssetId,
							texture: selectedAssetDetails?.url || riddle.texture || null,
						};

						dispatch(
							updateRiddle({
								riddleId: riddle.id,
								updates: updates,
							}),
						);

						onClose();
					}}>
					{({
						values,
						errors,
						touched,
						handleChange,
						setFieldValue,
						isSubmitting,
					}) => {
					
						const isPuzzle = values.type === RIDDLE_TYPES.PUZZLE_GAME;
						return (
							<Form>
								{/* Typ zagadki */}
								<Field
									as='select'
									name='type'
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
										handleChange(e);
										// LOG: type change
										console.log(
											"TYPE CHANGE",
											e.target.value,
											"PUZZLE_GAME:",
											RIDDLE_TYPES.PUZZLE_GAME,
											"isPuzzle:",
											e.target.value === RIDDLE_TYPES.PUZZLE_GAME,
										);
										// Reset asset for puzzle if switching type
										if (e.target.value === RIDDLE_TYPES.PUZZLE_GAME) {
											setFieldValue("title", "");
											setFieldValue("question", "");
											setFieldValue("answer", "");
											setFieldValue("hints", []);
											setSelectedAssetId(null);
										}
									}}
									className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm mb-2'>
									{Object.entries(RIDDLE_TYPE_LABELS).map(([value, label]) => (
										<option key={value} value={value}>
											{label}
										</option>
									))}
								</Field>

								{/* Tytuł, treść, odpowiedź - tylko jeśli nie puzzle */}
								{!isPuzzle && (
									<>
										<Field
											type='text'
											name='title'
											placeholder='Tytuł zagadki'
											className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm mb-2'
										/>
										{errors.title && touched.title && (
											<div className='text-red-400 text-xs mb-1'>
												{errors.title}
											</div>
										)}
										<Field
											as='textarea'
											name='question'
											placeholder='Treść zagadki'
											className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm h-20 mb-2'
										/>
										{errors.question && touched.question && (
											<div className='text-red-400 text-xs mb-1'>
												{errors.question}
											</div>
										)}
										<Field
											type='text'
											name='answer'
											placeholder='Odpowiedź'
											className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm mb-2'
										/>
										{errors.answer && touched.answer && (
											<div className='text-red-400 text-xs mb-1'>
												{errors.answer}
											</div>
										)}
									</>
								)}

								{/* Podpowiedzi tylko jeśli nie puzzle */}
								{!isPuzzle && (
									<div className='mb-2'>
										<label className='text-xs text-gray-300 block mb-1'>
											Podpowiedzi:
										</label>
										<FieldArray name='hints'>
											{({ push, remove }) => (
												<>
													{values.hints &&
														values.hints.length > 0 &&
														values.hints.map((hint, idx) => (
															<div
																key={idx}
																className='flex justify-between items-center mb-1'>
																<span className='text-xs text-gray-300'>
																	{hint}
																</span>
																<button
																	type='button'
																	onClick={() => remove(idx)}
																	className='text-red-500 text-xs'>
																	Usuń
																</button>
															</div>
														))}
													<div className='flex'>
														<Field
															name='newHint'
															as='input'
															placeholder='Nowa podpowiedź'
															className='flex-grow px-2 py-1 bg-gray-700 text-white rounded-l text-sm'
														/>
														<button
															type='button'
															className='px-2 py-1 bg-mainMint text-gray-700 rounded-r'
															onClick={() => {
																const newHint = (values as any).newHint;
																if (newHint && newHint.trim()) {
																	push(newHint);
																	setFieldValue("newHint", "");
																}
															}}>
															Dodaj
														</button>
													</div>
												</>
											)}
										</FieldArray>
									</div>
								)}

								{/* Info dla puzzle */}
								{isPuzzle && (
									<div className='mb-2'>
										<p className='text-gray-400 text-sm italic'>
											To będzie minigra typu puzzle. Po zapisaniu możesz ją
											skonfigurować.
										</p>
									</div>
								)}

								{/* Obraz zagadki */}
								<div className='flex items-center justify-between mb-2'>
									<label className='text-lg mt-1 text-gray-300'>
										Obraz zagadki:
									</label>
									<button
										type='button'
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
												type='button'
												onClick={() => setSelectedAssetId(null)}
												className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600'
												title='Usuń obraz'>
												X
											</button>
										</div>
									</div>
								)}

								<div className='flex justify-end space-x-3 mt-6'>
									<button
										type='button'
										onClick={onClose}
										className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700'>
										Anuluj
									</button>
									<button
										type='submit'
										disabled={
											isSubmitting ||
											(!isPuzzle &&
												(!values.title.trim() ||
													!values.question.trim() ||
													!values.answer.trim())) ||
											(isPuzzle && !selectedAssetId)
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
							</Form>
						);
					}}
				</Formik>
			</div>
		</div>
	);
};

export default EditRiddleModal;
