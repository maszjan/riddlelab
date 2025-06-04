/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiClient } from "../../../utils/apiHelpers";
import { useDispatch } from "react-redux";
import { setUser, setToken } from "../../../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import AvatarPreview from "../../molecules/AvatarPreview";
import axios from "axios";
import { HiUser, HiMail, HiLockClosed, HiEye } from "react-icons/hi";

interface RegisterResponse {
	user: any;
	token: string;
}

interface ApiErrorResponse {
	message: string;
}

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
				.oneOf([Yup.ref("password")], "Hasła muszą być identyczne")
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
		validateOnMount: false,
		validateOnChange: false,
		validateOnBlur: true,
		onSubmit: async (values, { setSubmitting, setErrors }) => {
			try {
				const response = await apiClient.post<RegisterResponse>(
					"/auth/register",
					values,
				);

				dispatch(setUser(response.data.user));
				// Fix: Use 'accessToken' instead of 'token' to match store interface
				dispatch(
					setToken({
						accessToken: response.data.token,
						expiresIn: 1800, // 30 minut
					}),
				);

				navigate("/dashboard");
			} catch (error) {
				if (axios.isAxiosError<ApiErrorResponse>(error)) {
					if (error.response?.data?.message) {
						setErrors({ email: error.response.data.message });
					} else {
						setErrors({ email: "Wystąpił błąd podczas rejestracji" });
					}
				} else {
					setErrors({ email: "Wystąpił błąd podczas rejestracji" });
				}
			} finally {
				setSubmitting(false);
			}
		},
	});

	const handleColorChange = (field: string, value: string) => {
		formik.setFieldValue(`player_configuration.avatar.${field}`, value);
	};

	return (
		<div className='w-full max-w-2xl mx-auto'>
			<form onSubmit={formik.handleSubmit} className='space-y-6'>
				{/* Name Field */}
				<div>
					<label
						htmlFor='name'
						className='block text-sm font-medium text-gray-300 mb-2'>
						Nazwa użytkownika
					</label>
					<div className='relative'>
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<HiUser className='h-5 w-5 text-gray-400' />
						</div>
						<input
							id='name'
							name='name'
							type='text'
							autoComplete='username'
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.name}
							className={`
                                block w-full pl-10 pr-3 py-3 
                                bg-gray-700 border rounded-lg
                                text-white placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-mainMint focus:border-transparent
                                transition-all duration-200
                                ${
																	formik.touched.name && formik.errors.name
																		? "border-red-500"
																		: "border-gray-600 hover:border-gray-500"
																}
                            `}
							placeholder='Wybierz swoją nazwę użytkownika'
						/>
					</div>
					{formik.touched.name && formik.errors.name ? (
						<div className='text-red-400 text-sm mt-1'>
							{formik.errors.name}
						</div>
					) : null}
				</div>

				{/* Email Field */}
				<div>
					<label
						htmlFor='email'
						className='block text-sm font-medium text-gray-300 mb-2'>
						Adres email
					</label>
					<div className='relative'>
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<HiMail className='h-5 w-5 text-gray-400' />
						</div>
						<input
							id='email'
							name='email'
							type='email'
							autoComplete='email'
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.email}
							className={`
                                block w-full pl-10 pr-3 py-3 
                                bg-gray-700 border rounded-lg
                                text-white placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-mainMint focus:border-transparent
                                transition-all duration-200
                                ${
																	formik.touched.email && formik.errors.email
																		? "border-red-500"
																		: "border-gray-600 hover:border-gray-500"
																}
                            `}
							placeholder='Wpisz adres email'
						/>
					</div>
					{formik.touched.email && formik.errors.email ? (
						<div className='text-red-400 text-sm mt-1'>
							{formik.errors.email}
						</div>
					) : null}
				</div>

				{/* Password Field */}
				<div>
					<label
						htmlFor='password'
						className='block text-sm font-medium text-gray-300 mb-2'>
						Hasło
					</label>
					<div className='relative'>
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<HiLockClosed className='h-5 w-5 text-gray-400' />
						</div>
						<input
							id='password'
							name='password'
							type='password'
							autoComplete='new-password'
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.password}
							className={`
                                block w-full pl-10 pr-3 py-3 
                                bg-gray-700 border rounded-lg
                                text-white placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-mainMint focus:border-transparent
                                transition-all duration-200
                                ${
																	formik.touched.password &&
																	formik.errors.password
																		? "border-red-500"
																		: "border-gray-600 hover:border-gray-500"
																}
                            `}
							placeholder='Wybierz silne hasło'
						/>
					</div>
					{formik.touched.password && formik.errors.password ? (
						<div className='text-red-400 text-sm mt-1'>
							{formik.errors.password}
						</div>
					) : null}
				</div>

				{/* Password Confirmation Field */}
				<div>
					<label
						htmlFor='password_confirmation'
						className='block text-sm font-medium text-gray-300 mb-2'>
						Potwierdź hasło
					</label>
					<div className='relative'>
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<HiLockClosed className='h-5 w-5 text-gray-400' />
						</div>
						<input
							id='password_confirmation'
							name='password_confirmation'
							type='password'
							autoComplete='new-password'
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.password_confirmation}
							className={`
                                block w-full pl-10 pr-3 py-3 
                                bg-gray-700 border rounded-lg
                                text-white placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-mainMint focus:border-transparent
                                transition-all duration-200
                                ${
																	formik.touched.password_confirmation &&
																	formik.errors.password_confirmation
																		? "border-red-500"
																		: "border-gray-600 hover:border-gray-500"
																}
                            `}
							placeholder='Wpisz ponownie hasło'
						/>
					</div>
					{formik.touched.password_confirmation &&
					formik.errors.password_confirmation ? (
						<div className='text-red-400 text-sm mt-1'>
							{formik.errors.password_confirmation}
						</div>
					) : null}
				</div>

				{/* Avatar Configuration */}
				<div className='bg-gray-800 rounded-lg p-6 border border-gray-700'>
					<h3 className='text-lg font-bold mb-6 text-mainMint flex items-center gap-2'>
						<HiEye className='h-5 w-5' />
						Konfiguracja awatara
					</h3>

					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						{/* Color Controls */}
						<div className='space-y-4'>
							{/* Skin Color */}
							<div className='flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600'>
								<label className='text-sm font-medium text-gray-300'>
									Kolor skóry:
								</label>
								<input
									type='color'
									value={formik.values.player_configuration.avatar.skin_color}
									onChange={(e) =>
										handleColorChange("skin_color", e.target.value)
									}
									className='w-12 h-8 border-2 border-gray-500 rounded-md bg-gray-600 cursor-pointer hover:border-mainMint transition-colors'
								/>
							</div>

							{/* Hair Color */}
							<div className='flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600'>
								<label className='text-sm font-medium text-gray-300'>
									Kolor włosów:
								</label>
								<input
									type='color'
									value={formik.values.player_configuration.avatar.hair_color}
									onChange={(e) =>
										handleColorChange("hair_color", e.target.value)
									}
									className='w-12 h-8 border-2 border-gray-500 rounded-md bg-gray-600 cursor-pointer hover:border-mainMint transition-colors'
								/>
							</div>

							{/* Eye Color */}
							<div className='flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600'>
								<label className='text-sm font-medium text-gray-300'>
									Kolor oczu:
								</label>
								<input
									type='color'
									value={formik.values.player_configuration.avatar.eye_color}
									onChange={(e) =>
										handleColorChange("eye_color", e.target.value)
									}
									className='w-12 h-8 border-2 border-gray-500 rounded-md bg-gray-600 cursor-pointer hover:border-mainMint transition-colors'
								/>
							</div>

							{/* Outfit Color */}
							<div className='flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600'>
								<label className='text-sm font-medium text-gray-300'>
									Kolor stroju:
								</label>
								<input
									type='color'
									value={formik.values.player_configuration.avatar.outfit_color}
									onChange={(e) =>
										handleColorChange("outfit_color", e.target.value)
									}
									className='w-12 h-8 border-2 border-gray-500 rounded-md bg-gray-600 cursor-pointer hover:border-mainMint transition-colors'
								/>
							</div>
						</div>

						{/* Avatar Preview */}
						<div className='flex justify-center items-center'>
							<div className='border-2 border-mainMint rounded-lg p-6 bg-gray-700'>
								<h4 className='font-medium mb-4 text-gray-300 text-center'>
									Podgląd
								</h4>
								<AvatarPreview
									colors={formik.values.player_configuration.avatar}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Submit Button */}
				<button
					type='submit'
					disabled={formik.isSubmitting}
					className='
                        w-full flex justify-center py-3 px-4
                        border border-transparent rounded-lg
                        text-base font-medium text-gray-900
                        bg-mainMint hover:bg-mainMint/90
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainMint
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200
                        transform hover:scale-[1.02] active:scale-[0.98]
                    '>
					{formik.isSubmitting ? (
						<div className='flex items-center'>
							<div className='animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent mr-2'></div>
							Tworzenie konta...
						</div>
					) : (
						"Utwórz konto"
					)}
				</button>
			</form>
		</div>
	);
};

export default RegisterForm;
