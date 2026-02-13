import { useState } from "react";
import { useAuthorizedApiClient } from "../../../utils/apiHelpers";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createPortal } from "react-dom";
import axios from "axios";

interface CreateAssetModalProps {
	isOpen: boolean;
	onClose: (assetAdded?: boolean) => void;
}

// Define the expected error response structure
interface ApiErrorResponse {
	message: string;
}

const CreateAssetModal: React.FC<CreateAssetModalProps> = ({
	isOpen,
	onClose,
}) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const authorizedClient = useAuthorizedApiClient();

	const formik = useFormik({
		initialValues: {
			name: "",
			type: "door",
			image: null as File | null,
		},
		validationSchema: Yup.object({
			name: Yup.string().required("Nazwa jest wymagana"),
			type: Yup.string()
				.required("Typ jest wymagany")
				.oneOf(["door", "floor", "prop", "riddle"]),
			image: Yup.mixed().required("Obraz jest wymagany"),
		}),
		validateOnMount: false,
		validateOnChange: false,
		validateOnBlur: true,
		onSubmit: async (values, { resetForm, setErrors }) => {
			try {
				setIsSubmitting(true);

				const formData = new FormData();
				formData.append("name", values.name);
				formData.append("type", values.type);
				if (values.image) {
					formData.append("image", values.image);
				}

				await authorizedClient.post("/asset", formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});

				resetForm();
				setImagePreview(null);
				onClose(true);
			} catch (error) {
				// Use axios type guard to properly handle errors
				if (axios.isAxiosError<ApiErrorResponse>(error)) {
					// Now we can safely access error.response
					if (error.response?.data?.message) {
						setErrors({ name: error.response.data.message });
					} else {
						setErrors({ name: "Wystąpił błąd podczas dodawania zasobu" });
					}
				} else {
					// Handle non-axios errors
					setErrors({ name: "Wystąpił błąd podczas dodawania zasobu" });
				}
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.currentTarget.files?.[0];
		if (file) {
			formik.setFieldValue("image", file);

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleClose = () => {
		formik.resetForm();
		setImagePreview(null);
		onClose(false);
	};

	if (!isOpen) return null;

	return createPortal(
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-xl font-bold text-mainMint'>Dodaj nowy zasób</h2>
					<button
						onClick={handleClose}
						className='text-gray-400 hover:text-white text-2xl'>
						&times;
					</button>
				</div>

				<form onSubmit={formik.handleSubmit}>
					<div className='mb-4'>
						<label
							htmlFor='name'
							className='block text-sm font-medium text-mainMint mb-1'>
							Nazwa
						</label>
						<input
							id='name'
							name='name'
							type='text'
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.name}
							className='w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-mainMint focus:outline-none'
						/>
						{formik.touched.name && formik.errors.name ? (
							<div className='text-red-500 text-sm mt-1'>
								{formik.errors.name}
							</div>
						) : null}
					</div>

					<div className='mb-4'>
						<label
							htmlFor='type'
							className='block text-sm font-medium text-mainMint mb-1'>
							Typ
						</label>
						<select
							id='type'
							name='type'
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.type}
							className='w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-mainMint focus:outline-none'>
							<option value='door'>Drzwi</option>
							<option value='floor'>Podłoga</option>
							<option value='prop'>Rekwizyt</option>
							<option value='riddle'>Zagadka</option>
						</select>
					</div>

					<div className='mb-4'>
						<label className='block text-sm font-medium text-mainMint mb-2'>
							Obraz (64x64px)
						</label>

						{/* Image Upload Area */}
						<div className='relative'>
							<input
								id='image'
								name='image'
								type='file'
								accept='image/png,image/jpeg,image/jpg'
								onChange={handleImageChange}
								className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
							/>

							<div
								className={`
                                border-2 border-dashed rounded-lg p-6 text-center transition-colors
                                ${
																	imagePreview
																		? "border-mainMint bg-gray-700"
																		: "border-gray-600 bg-gray-700 hover:border-mainMint hover:bg-gray-600"
																}
                            `}>
								{imagePreview ? (
									<div className='flex flex-col items-center space-y-3'>
										<div className='w-24 h-24 rounded-lg overflow-hidden bg-gray-600'>
											<img
												src={imagePreview}
												alt='Preview'
												className='w-full h-full object-cover'
											/>
										</div>
										<div className='text-sm text-gray-300'>
											<p className='font-medium'>{formik.values.image?.name}</p>
											<p className='text-gray-400'>Kliknij aby zmienić</p>
										</div>
									</div>
								) : (
									<div className='flex flex-col items-center space-y-3'>
										{/* Image Icon */}
										<div className='w-16 h-16 rounded-lg bg-gray-600 flex items-center justify-center'>
											<svg
												className='w-8 h-8 text-gray-400'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
												/>
											</svg>
										</div>
										<div className='text-sm text-gray-300'>
											<p className='font-medium mb-1'>
												Kliknij aby dodać obraz
											</p>
											<p className='text-gray-400'>PNG, JPG, JPEG (64x64px)</p>
										</div>
									</div>
								)}
							</div>
						</div>

						{formik.touched.image && formik.errors.image ? (
							<div className='text-red-500 text-sm mt-1'>
								{formik.errors.image}
							</div>
						) : null}
					</div>

					<div className='flex justify-end space-x-3'>
						<button
							type='button'
							onClick={handleClose}
							className='px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors'>
							Anuluj
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className='px-4 py-2 bg-mainMint text-gray-800 rounded-md hover:bg-opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
							{isSubmitting ? "Zapisywanie..." : "Zapisz"}
						</button>
					</div>
				</form>
			</div>
		</div>,
		document.body,
	);
};

export default CreateAssetModal;
