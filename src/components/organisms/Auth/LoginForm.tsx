/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiClient } from "../../../utils/apiHelpers";
import { useDispatch } from "react-redux";
import { setUser, setToken } from "../../../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HiMail, HiLockClosed } from "react-icons/hi";

// Define interfaces for type safety
interface LoginResponse {
	user: any;
	token: string;
}

interface ApiErrorResponse {
	message: string;
}

const LoginForm = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const formik = useFormik({
		initialValues: {
			email: "",
			password: "",
		},
		validationSchema: Yup.object({
			email: Yup.string()
				.email("Nieprawidłowy adres email")
				.required("Email jest wymagany"),
			password: Yup.string().required("Hasło jest wymagane"),
		}),
		validateOnMount: false,
		validateOnChange: false,
		validateOnBlur: true,
		onSubmit: async (values, { setSubmitting, setErrors }) => {
			try {
				const response = await apiClient.post<LoginResponse>(
					"/auth/login",
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

				navigate("/");
			} catch (error) {
				if (axios.isAxiosError<ApiErrorResponse>(error)) {
					if (error.response?.data?.message) {
						setErrors({ email: error.response.data.message });
					} else {
						setErrors({ email: "Wystąpił błąd podczas logowania" });
					}
				} else {
					setErrors({ email: "Wystąpił błąd podczas logowania" });
				}
			} finally {
				setSubmitting(false);
			}
		},
	});

	return (
		<div className='w-full max-w-md mx-auto'>
			<form onSubmit={formik.handleSubmit} className='space-y-6'>
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
							autoComplete='current-password'
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
							placeholder='Wpisz hasło'
						/>
					</div>
					{formik.touched.password && formik.errors.password ? (
						<div className='text-red-400 text-sm mt-1'>
							{formik.errors.password}
						</div>
					) : null}
				</div>

				{/* Forgot Password Link */}
				<div className='text-right'>
					<a
						href='#'
						className='text-sm text-gray-400 hover:text-mainMint transition-colors duration-200'>
						Zapomniałeś hasła?
					</a>
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
							Logging in...
						</div>
					) : (
						"Zaloguj się"
					)}
				</button>
			</form>
		</div>
	);
};

export default LoginForm;
