import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiClient } from "../../../utils/apiHelpers";
import { useDispatch } from "react-redux";
import { setUser, setToken } from "../../../store/slices/userSlice";
import { useNavigate } from "react-router-dom";

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
		onSubmit: async (values, { setSubmitting, setErrors }) => {
			try {
				const response = await apiClient.post("/auth/login", values);

				dispatch(setUser(response.data.user));
				dispatch(
					setToken({
						accessToken: response.data.token,
						expiresIn: 1800, // 30 minut
					}),
				);

				navigate("/");
			} catch (error) {
				if (error.response && error.response.data) {
					setErrors({ email: error.response.data.message });
				} else {
					setErrors({ email: "Wystąpił błąd podczas logowania" });
				}
			} finally {
				setSubmitting(false);
			}
		},
	});

	return (
		<form onSubmit={formik.handleSubmit} className='space-y-4'>
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
					className='mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm'
				/>
				{formik.touched.password && formik.errors.password ? (
					<div className='text-red-500 text-sm mt-1'>
						{formik.errors.password}
					</div>
				) : null}
			</div>

			<button
				type='submit'
				disabled={formik.isSubmitting}
				className='w-full py-2 px-4 bg-mainMint rounded-md border-mainMint hover:bg-gray-700 hover:text-mainMint hover:border-mainMint transition-all duration-200 shadow-md font-semibold'>
				{formik.isSubmitting ? "Logowanie..." : "Zaloguj się"}
			</button>
		</form>
	);
};

export default LoginForm;
