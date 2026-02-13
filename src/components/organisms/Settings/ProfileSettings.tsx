import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/userSlice";
import { useUpdateProfile } from "../../../hooks/useUpdateProfile";

const ProfileSettings: React.FC = () => {
	const user = useSelector(selectUser);
	const { updateProfile, loading } = useUpdateProfile();

	const formik = useFormik({
		initialValues: {
			name: user?.name || "",
			email: user?.email || "",
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
			name: Yup.string()
				.required("Nazwa użytkownika jest wymagana")
				.max(255, "Nazwa może zawierać maksymalnie 255 znaków"),
			email: Yup.string()
				.email("Nieprawidłowy adres email")
				.required("Email jest wymagany")
				.max(255, "Email może zawierać maksymalnie 255 znaków"),
		}),
		onSubmit: async (values, { setStatus }) => {
			const result = await updateProfile(values);
			setStatus({
				type: result.success ? "success" : "error",
				message: result.message,
			});
		},
	});

	return (
		<div>
			<h2 className='text-2xl font-bold text-light mb-6'>Ustawienia Profilu</h2>
			<form onSubmit={formik.handleSubmit} className='space-y-6'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-2'>
						Nazwa użytkownika ({formik.values.name.length}/255)
					</label>
					<input
						type='text'
						name='name'
						value={formik.values.name}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-mainMint ${
							formik.touched.name && formik.errors.name
								? "border-red-500"
								: "border-gray-600"
						}`}
					/>
					{formik.touched.name && formik.errors.name && (
						<p className='text-red-400 text-sm mt-1'>{formik.errors.name}</p>
					)}
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-2'>
						Email
					</label>
					<input
						type='email'
						name='email'
						value={formik.values.email}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-mainMint ${
							formik.touched.email && formik.errors.email
								? "border-red-500"
								: "border-gray-600"
						}`}
					/>
					{formik.touched.email && formik.errors.email && (
						<p className='text-red-400 text-sm mt-1'>{formik.errors.email}</p>
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
					{loading ? "Zapisywanie..." : "Zapisz Zmiany"}
				</button>
			</form>
		</div>
	);
};

export default ProfileSettings;
