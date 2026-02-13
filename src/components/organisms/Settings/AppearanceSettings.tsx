import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/userSlice";
import AvatarPreview from "../../molecules/AvatarPreview";
import { useUpdateAppearance } from "../../../hooks/useUpdateAppearance";

const AppearanceSettings: React.FC = () => {
	const user = useSelector(selectUser);
	const { updateAppearance, loading } = useUpdateAppearance();

	const getAvatarConfig = () => {
		if (!user?.player_configuration) {
			return {
				skin_color: "#f5d0c5",
				hair_color: "#2a1b0a",
				eye_color: "#3d6e67",
				outfit_color: "#4287f5",
			};
		}

		try {
			if (typeof user.player_configuration === "string") {
				return JSON.parse(user.player_configuration).avatar;
			}
			return user.player_configuration.avatar;
		} catch {
			return {
				skin_color: "#f5d0c5",
				hair_color: "#2a1b0a",
				eye_color: "#3d6e67",
				outfit_color: "#4287f5",
			};
		}
	};

	const formik = useFormik({
		initialValues: {
			player_configuration: {
				avatar: getAvatarConfig(),
			},
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
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
		onSubmit: async (values, { setStatus }) => {
			const result = await updateAppearance(values);
			setStatus({
				type: result.success ? "success" : "error",
				message: result.message,
			});
		},
	});

	const handleColorChange = (field: string, value: string) => {
		formik.setFieldValue(`player_configuration.avatar.${field}`, value);
	};

	return (
		<div>
			<h2 className='text-2xl font-bold text-light mb-6'>Wygląd Awatara</h2>
			<form onSubmit={formik.handleSubmit} className='space-y-6'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					{/* Color Controls */}
					<div className='space-y-4'>
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

						<div className='flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600'>
							<label className='text-sm font-medium text-gray-300'>
								Kolor oczu:
							</label>
							<input
								type='color'
								value={formik.values.player_configuration.avatar.eye_color}
								onChange={(e) => handleColorChange("eye_color", e.target.value)}
								className='w-12 h-8 border-2 border-gray-500 rounded-md bg-gray-600 cursor-pointer hover:border-mainMint transition-colors'
							/>
						</div>

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

export default AppearanceSettings;
