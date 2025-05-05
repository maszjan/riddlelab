import React, { useState } from "react";
import { useAuthorizedApiClient } from "../../../utils/apiHelpers";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createPortal } from "react-dom";

interface CreateAssetModalProps {
	isOpen: boolean;
	onClose: (assetAdded?: boolean) => void;
}

const CreateAssetModal: React.FC<CreateAssetModalProps> = ({
	isOpen,
	onClose,
}) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const authorizedClient = useAuthorizedApiClient();

	const formik = useFormik({
		initialValues: {
			name: "",
			type: "door",
			image: null as File | null,
			has_collider: false,
		},
		validationSchema: Yup.object({
			name: Yup.string().required("Nazwa jest wymagana"),
			type: Yup.string()
				.required("Typ jest wymagany")
				.oneOf(["door", "floor", "prop", "riddle"]),
			image: Yup.mixed().required("Obraz jest wymagany"),
			has_collider: Yup.boolean().when("type", {
				is: "prop",
				then: () => Yup.boolean(),
				otherwise: () => Yup.boolean().strip(),
			}),
		}),
		onSubmit: async (values, { resetForm, setErrors }) => {
			try {
				setIsSubmitting(true);

				const formData = new FormData();
				formData.append("name", values.name);
				formData.append("type", values.type);
				if (values.image) {
					formData.append("image", values.image);
				}

				if (values.type === "prop") {
					formData.append("has_collider", values.has_collider.toString());
				}

				await authorizedClient.post("/asset", formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});

				resetForm();
				onClose(true);
			} catch (error) {
				if (error.response && error.response.data) {
					setErrors({ name: error.response.data.message });
				} else {
					setErrors({ name: "Wystąpił błąd podczas dodawania zasobu" });
				}
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	if (!isOpen) return null;

	return createPortal(
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-gray-800 rounded-lg p-6 w-full max-w-md'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-xl font-bold text-mainMint'>Dodaj nowy zasób</h2>
					<button
						onClick={() => onClose(false)} // Przekazujemy false, gdy zamykamy bez dodawania
						className='text-gray-400 hover:text-white'>
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
							className='w-full p-2 rounded-md bg-gray-700 text-white border-gray-600'
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
							className='w-full p-2 rounded-md bg-gray-700 text-white border-gray-600'>
							<option value='door'>Drzwi</option>
							<option value='floor'>Podłoga</option>
							<option value='prop'>Rekwizyt</option>
							<option value='riddle'>Zagadka</option>
						</select>
					</div>

					<div className='mb-4'>
						<label
							htmlFor='image'
							className='block text-sm font-medium text-mainMint mb-1'>
							Obraz (64x64px)
						</label>
						<input
							id='image'
							name='image'
							type='file'
							accept='image/png,image/jpeg,image/jpg'
							onChange={(event) => {
								if (event.currentTarget.files && event.currentTarget.files[0]) {
									formik.setFieldValue("image", event.currentTarget.files[0]);
								}
							}}
							className='w-full p-2 rounded-md bg-gray-700 text-white border-gray-600'
						/>
						{formik.touched.image && formik.errors.image ? (
							<div className='text-red-500 text-sm mt-1'>
								{formik.errors.image}
							</div>
						) : null}
						<p className='text-gray-400 text-xs mt-1'>
							Obraz musi mieć wymiary 64x64 pikseli
						</p>
					</div>

					{formik.values.type === "prop" && (
						<div className='mb-4 flex items-center'>
							<input
								id='has_collider'
								name='has_collider'
								type='checkbox'
								onChange={formik.handleChange}
								checked={formik.values.has_collider}
								className='mr-2'
							/>
							<label htmlFor='has_collider' className='text-sm text-gray-300'>
								Posiada kolizję
							</label>
						</div>
					)}

					<div className='flex justify-end space-x-3'>
						<button
							type='button'
							onClick={() => onClose(false)}
							className='px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700'>
							Anuluj
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className='px-4 py-2 bg-mainMint text-gray-800 rounded-md hover:bg-gray-700 hover:text-mainMint transition-colors duration-200'>
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
