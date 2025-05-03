import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiClient } from "../../../utils/apiHelpers";
import { useDispatch } from "react-redux";
import { setUser, setToken } from "../../../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import AvatarPreview from "../../molecules/AvatarPreview";

const RegisterForm = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const formik = useFormik({
		initialValues: {
			name: "",
			email: "",
			password: "",
			password_confirmation: "",
			player_configuration: {
				avatar: {
					skin_color: "#f5d0c5",
					hair_color: "#2a1b0a",
					eye_color: "#3d6e67",
					outfit_color: "#4287f5",
				},
			},
		},
		validationSchema: Yup.object({
			name: Yup.string()
				.required("Nazwa użytkownika jest wymagana")
				.max(255, "Nazwa użytkownika może zawierać maksymalnie 255 znaków"),
			email: Yup.string()
				.email("Nieprawidłowy adres email")
				.required("Email jest wymagany")
				.max(255, "Email może zawierać maksymalnie 255 znaków"),
			password: Yup.string()
				.required("Hasło jest wymagane")
				.min(8, "Hasło musi zawierać co najmniej 8 znaków")
				.matches(/[A-Z]/, "Hasło musi zawierać co najmniej jedną dużą literę")
				.matches(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
				.matches(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
				.matches(
					/[^A-Za-z0-9]/,
					"Hasło musi zawierać co najmniej jeden znak specjalny",
				),
			password_confirmation: Yup.string()
				.oneOf([Yup.ref("password"), null], "Hasła muszą być identyczne")
				.required("Potwierdzenie hasła jest wymagane"),
			player_configuration: Yup.object({
				avatar: Yup.object({
					skin_color: Yup.string()
						.required("Kolor skóry jest wymagany")
						.matches(/^#([A-Fa-f0-9]{6})$/, "Kolor musi być w formacie HEX"),
					hair_color: Yup.string()
						.required("Kolor włosów jest wymagany")
						.matches(/^#([A-Fa-f0-9]{6})$/, "Kolor musi być w formacie HEX"),
					eye_color: Yup.string()
						.required("Kolor oczu jest wymagany")
						.matches(/^#([A-Fa-f0-9]{6})$/, "Kolor musi być w formacie HEX"),
					outfit_color: Yup.string()
						.required("Kolor stroju jest wymagany")
						.matches(/^#([A-Fa-f0-9]{6})$/, "Kolor musi być w formacie HEX"),
				}),
			}),
		}),
		onSubmit: async (values, { setSubmitting, setErrors }) => {
			try {
				const response = await apiClient.post("/auth/register", values);

				dispatch(setUser(response.data.user));
				dispatch(
					setToken({
						accessToken: response.data.token,
						expiresIn: 1800, // 30 minut
					}),
				);

				navigate("/dashboard");
			} catch (error) {
				if (error.response && error.response.data) {
					setErrors({ email: error.response.data.message });
				} else {
					setErrors({ email: "Wystąpił błąd podczas rejestracji" });
				}
			} finally {
				setSubmitting(false);
			}
		},
	});

	const handleColorChange = (field, value) => {
		formik.setFieldValue(`player_configuration.avatar.${field}`, value);
	};

	return (
		<form onSubmit={formik.handleSubmit} className='space-y-4'>
			<div>
				<label
					htmlFor='name'
					className='block text-sm text-mainMint font-medium'>
					Nazwa użytkownika
				</label>
				<input
					id='name'
					name='name'
					type='text'
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					value={formik.values.name}
					className='mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm'
				/>
				{formik.touched.name && formik.errors.name ? (
					<div className='text-red-500 text-sm mt-1'>{formik.errors.name}</div>
				) : null}
			</div>

			<div>
				<label
					htmlFor='email'
					className='block text-sm text-mainMint font-medium'>
					Email
				</label>
				<input
					id='email'
					name='email'
					type='email'
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					value={formik.values.email}
					className='mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm'
				/>
				{formik.touched.email && formik.errors.email ? (
					<div className='text-red-500 text-sm mt-1'>{formik.errors.email}</div>
				) : null}
			</div>

			<div>
				<label
					htmlFor='password'
					className='block text-sm text-mainMint font-medium'>
					Hasło
				</label>
				<input
					id='password'
					name='password'
					type='password'
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					value={formik.values.password}
					className='mt-1 p-2 block w-full rounded-md  border-gray-300 shadow-sm'
				/>
				{formik.touched.password && formik.errors.password ? (
					<div className='text-red-500 text-sm mt-1'>
						{formik.errors.password}
					</div>
				) : null}
			</div>

			<div>
				<label
					htmlFor='password_confirmation'
					className='block text-sm text-mainMint font-medium'>
					Potwierdź hasło
				</label>
				<input
					id='password_confirmation'
					name='password_confirmation'
					type='password'
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					value={formik.values.password_confirmation}
					className='mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm'
				/>
				{formik.touched.password_confirmation &&
				formik.errors.password_confirmation ? (
					<div className='text-red-500 text-sm mt-1'>
						{formik.errors.password_confirmation}
					</div>
				) : null}
			</div>

			<div className='py-4 rounded-md'>
				<h3 className='text-lg font-medium mb-4 text-mainMint'>
					Konfiguracja avatara
				</h3>

				<div className='flex flex-col md:flex-row gap-6'>
					{/* Wybór kolorów po lewej */}
					<div className='md:w-1/2 space-y-4'>
						<div className='flex flex-col space-y-2'>
							<div className='flex items-center justify-between'>
								<label className='text-white font-medium'>Kolor skóry:</label>
								<input
									type='color'
									value={formik.values.player_configuration.avatar.skin_color}
									onChange={(e) =>
										handleColorChange("skin_color", e.target.value)
									}
									className='w-12 h-6 border-none rounded'
								/>
							</div>
						</div>

						<div className='flex flex-col space-y-2'>
							<div className='flex items-center justify-between'>
								<label className='text-white font-medium'>Kolor włosów:</label>
								<input
									type='color'
									value={formik.values.player_configuration.avatar.hair_color}
									onChange={(e) =>
										handleColorChange("hair_color", e.target.value)
									}
									className='w-12 h-6 border-none rounded'
								/>
							</div>
						</div>

						<div className='flex flex-col space-y-2'>
							<div className='flex items-center justify-between'>
								<label className='text-white font-medium'>Kolor oczu:</label>
								<input
									type='color'
									value={formik.values.player_configuration.avatar.eye_color}
									onChange={(e) =>
										handleColorChange("eye_color", e.target.value)
									}
									className='w-12 h-6 border-none rounded'
								/>
							</div>
						</div>

						<div className='flex flex-col space-y-2'>
							<div className='flex items-center justify-between'>
								<label className='text-white font-medium'>Kolor stroju:</label>
								<input
									type='color'
									value={formik.values.player_configuration.avatar.outfit_color}
									onChange={(e) =>
										handleColorChange("outfit_color", e.target.value)
									}
									className='w-12 h-6 border-none rounded'
								/>
							</div>
						</div>
					</div>

					{/* Podgląd awatara po prawej */}
					<div className='md:w-1/2 flex justify-center items-center'>
						<div className='border rounded-md p-4'>
							<h4 className='font-medium mb-2  text-white text-center'>
								Podgląd
							</h4>
							<AvatarPreview
								colors={formik.values.player_configuration.avatar}
							/>
						</div>
					</div>
				</div>
			</div>

			<button
				type='submit'
				disabled={formik.isSubmitting}
				className='w-full py-2 px-4 bg-mainMint rounded-md border-mainMint hover:bg-gray-700 hover:text-mainMint hover:border-mainMint transition-all duration-200 shadow-md  font-semibold'>
				{formik.isSubmitting ? "Rejestracja..." : "Zarejestruj się"}
			</button>
		</form>
	);
};

export default RegisterForm;
