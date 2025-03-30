import React from "react";
import { Link } from "react-router-dom";

interface ButtonProps {
	to: string;
	text: string;
}

const Button: React.FC<ButtonProps> = ({ to, text }) => {
	const baseClasses =
		"px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md border-2";
	const styleClasses =
		"bg-mainMint  border-mainMint hover:bg-gray-700 hover:text-mainMint hover:border-mainMint";

	return (
		<Link to={to} className={`${baseClasses} ${styleClasses}`}>
			{text}
		</Link>
	);
};

export default Button;
