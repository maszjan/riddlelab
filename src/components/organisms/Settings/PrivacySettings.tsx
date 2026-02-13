import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useUpdatePassword } from "../../../hooks/useUpdatePassword";

const PrivacySettings: React.FC = () => {
	const { updatePassword, loading } = useUpdatePassword();
	const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
	const [showNewPassword, setShowNewPassword] = React.useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

	const formik = useFormik({
		initialValues: {
			current_password: "",
			password: "",
			password_confirmation: "",
		},
		validationSchema: Yup.object({
			current_password: Yup.string().required("Obecne hasło jest wymagane"),
			password: Yup.string()
				.required("Nowe hasło jest wymagane")
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
		}),
		onSubmit: async (values, { setStatus, resetForm }) => {
			const result = await updatePassword(values);

			setStatus({
				type: result.success ? "success" : "error",
				message: result.message,
			});

			// ← ZMIENIONE: Delay przed resetem tylko przy sukcesie
			if (result.success) {
				setTimeout(() => {
					resetForm();
					setStatus(null); // Opcjonalnie: wyczyść status po resecie
				}, 2000); // 2 sekundy na przeczytanie komunikatu
			}
		},
	});

	return (
		<div>
			<h2 className='text-2xl font-bold text-light mb-6'>Zmiana Hasła</h2>
			<form onSubmit={formik.handleSubmit} className='space-y-6'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-2'>
						Obecne hasło
					</label>
					<div className='relative'>
						<input
							type={showCurrentPassword ? "text" : "password"}
							name='current_password'
							value={formik.values.current_password}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							className={`w-full px-4 py-3 pr-12 bg-gray-700 border rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-mainMint ${
								formik.touched.current_password &&
								formik.errors.current_password
									? "border-red-500"
									: "border-gray-600"
							}`}
						/>
						<button
							type='button'
							onClick={() => setShowCurrentPassword(!showCurrentPassword)}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300'>
							{showCurrentPassword ? (
								<HiEyeOff size={20} />
							) : (
								<HiEye size={20} />
							)}
						</button>
					</div>
					{formik.touched.current_password &&
						formik.errors.current_password && (
							<p className='text-red-400 text-sm mt-1'>
								{formik.errors.current_password}
							</p>
						)}
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-2'>
						Nowe hasło
					</label>
					<div className='relative'>
						<input
							type={showNewPassword ? "text" : "password"}
							name='password'
							value={formik.values.password}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							className={`w-full px-4 py-3 pr-12 bg-gray-700 border rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-mainMint ${
								formik.touched.password && formik.errors.password
									? "border-red-500"
									: "border-gray-600"
							}`}
						/>
						<button
							type='button'
							onClick={() => setShowNewPassword(!showNewPassword)}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300'>
							{showNewPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
						</button>
					</div>
					{formik.touched.password && formik.errors.password && (
						<p className='text-red-400 text-sm mt-1'>
							{formik.errors.password}
						</p>
					)}
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-2'>
						Potwierdź nowe hasło
					</label>
					<div className='relative'>
						<input
							type={showConfirmPassword ? "text" : "password"}
							name='password_confirmation'
							value={formik.values.password_confirmation}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							className={`w-full px-4 py-3 pr-12 bg-gray-700 border rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-mainMint ${
								formik.touched.password_confirmation &&
								formik.errors.password_confirmation
									? "border-red-500"
									: "border-gray-600"
							}`}
						/>
						<button
							type='button'
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300'>
							{showConfirmPassword ? (
								<HiEyeOff size={20} />
							) : (
								<HiEye size={20} />
							)}
						</button>
					</div>
					{formik.touched.password_confirmation &&
						formik.errors.password_confirmation && (
							<p className='text-red-400 text-sm mt-1'>
								{formik.errors.password_confirmation}
							</p>
						)}
				</div>

				{formik.status && (
					<div
						className={`p-4 rounded-lg ${
							formik.status.type === "success"
								? "bg-green-600 text-white"
								: "bg-red-600 text-white"
						}`}>
						{formik.status.message}
					</div>
				)}

				<button
					type='submit'
					disabled={loading || !formik.isValid}
					className='px-6 py-3 bg-mainMint text-dark font-semibold rounded-lg hover:bg-mainMint/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
					{loading ? "Zmiana hasła..." : "Zmień Hasło"}
				</button>
			</form>
		</div>
	);
};

export default PrivacySettings;
