/* eslint-disable @typescript-eslint/no-explicit-any */
export const RIDDLE_TYPES = {
	KNOWLEDGE: "wiedza",
	MATHEMATICS: "matematyka",
	LANGUAGE: "język",
	CIPHER_CAESAR: "szyfr_cezara",
	CIPHER_VIGENERE: "szyfr_vigenere",
	CIPHER_MORSE: "kod_morsea",
	CIPHER_BINARY: "kod_binarny",
	CIPHER_ATBASH: "szyfr_atbash",
	CIPHER_SUBSTITUTION: "szyfr_podstawieniowy",
	PUZZLE: "układanka",
};

export function solveMathRiddle(expression: string): string {
	try {
		const sanitized_expression = expression.replace(/[^0-9+\-*/().%\s]/g, "");
		// Use Function constructor to evaluate the expression safely
		return Function(
			`'use strict'; return (${sanitized_expression})`,
		)().toString();
	} catch (e) {
		return `Error: ${e instanceof Error ? e.message : String(e)}`;
	}
}

export function caesarCipher(
	text: string,
	shift: number,
	decrypt: boolean = false,
): string {
	shift = decrypt ? (26 - shift) % 26 : shift % 26;
	return text
		.split("")
		.map((char) => {
			if (char.match(/[a-z]/i)) {
				const code = char.charCodeAt(0);
				const base = code >= 65 && code <= 90 ? 65 : 97;
				return String.fromCharCode(((code - base + shift) % 26) + base);
			}
			return char;
		})
		.join("");
}

export function vigenereCipher(
	text: string,
	key: string,
	decrypt: boolean = false,
): string {
	key = key.toUpperCase().replace(/[^A-Z]/g, "");
	let result = "";
	let keyIndex = 0;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if (char.match(/[a-z]/i)) {
			const isUpperCase = char === char.toUpperCase();
			const charCode = char.toUpperCase().charCodeAt(0) - 65;
			const keyChar = key[keyIndex % key.length];
			const keyShift = keyChar.charCodeAt(0) - 65;

			let newCharCode;
			if (decrypt) {
				newCharCode = (charCode - keyShift + 26) % 26;
			} else {
				newCharCode = (charCode + keyShift) % 26;
			}

			const newChar = String.fromCharCode(newCharCode + 65);
			result += isUpperCase ? newChar : newChar.toLowerCase();
			keyIndex++;
		} else {
			result += char;
		}
	}

	return result;
}

export function morseCode(text: string, to_morse: boolean = true): string {
	const morse_dict: { [key: string]: string } = {
		A: ".-",
		B: "-...",
		C: "-.-.",
		D: "-..",
		E: ".",
		F: "..-.",
		G: "--.",
		H: "....",
		I: "..",
		J: ".---",
		K: "-.-",
		L: ".-..",
		M: "--",
		N: "-.",
		O: "---",
		P: ".--.",
		Q: "--.-",
		R: ".-.",
		S: "...",
		T: "-",
		U: "..-",
		V: "...-",
		W: ".--",
		X: "-..-",
		Y: "-.--",
		Z: "--..",
		"0": "-----",
		"1": ".----",
		"2": "..---",
		"3": "...--",
		"4": "....-",
		"5": ".....",
		"6": "-....",
		"7": "--...",
		"8": "---..",
		"9": "----.",
		".": ".-.-.-",
		",": "--..--",
		"?": "..--..",
		"'": ".----.",
		"!": "-.-.--",
		"/": "-..-.",
		"(": "-.--.",
		")": "-.--.-",
		"&": ".-...",
		":": "---...",
		";": "-.-.-.",
		"=": "-...-",
		"+": ".-.-.",
		"-": "-....-",
		_: "..--.-",
		'"': ".-..-.",
		$: "...-..-",
		"@": ".--.-.",
	};

	const reverse_morse_dict: { [key: string]: string } = {};
	Object.keys(morse_dict).forEach((key) => {
		reverse_morse_dict[morse_dict[key]] = key;
	});

	if (to_morse) {
		return text
			.toUpperCase()
			.split("")
			.map((char) => (char === " " ? "/" : morse_dict[char] || char))
			.join(" ");
	} else {
		return text
			.split(" ")
			.map((code) => (code === "/" ? " " : reverse_morse_dict[code] || code))
			.join("");
	}
}

export function binaryCode(text: string, to_binary: boolean = true): string {
	if (to_binary) {
		return text
			.split("")
			.map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
			.join(" ");
	} else {
		try {
			return text
				.split(" ")
				.map((binary) => String.fromCharCode(parseInt(binary, 2)))
				.join("");
		} catch (e: any) {
			console.error(e);
			return "Invalid binary input";
		}
	}
}

export function atbashCipher(input: string): string {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const reversed = alphabet.split("").reverse().join("");
	return input
		.toUpperCase()
		.split("")
		.map((char) =>
			alphabet.includes(char) ? reversed[alphabet.indexOf(char)] : char,
		)
		.join("");
}

export function substitutionCipher(
	text: string,
	key: string,
	decrypt: boolean = false,
): string {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	key = key.toUpperCase();

	if (key.length !== 26) {
		return "Error: Key must contain all 26 letters of the alphabet";
	}

	return text
		.split("")
		.map((char) => {
			if (char.match(/[a-z]/i)) {
				const isUpperCase = char === char.toUpperCase();
				const plainChar = char.toUpperCase();
				let resultChar;

				if (decrypt) {
					const index = key.indexOf(plainChar);
					resultChar = index !== -1 ? alphabet[index] : plainChar;
				} else {
					const index = alphabet.indexOf(plainChar);
					resultChar = index !== -1 ? key[index] : plainChar;
				}

				return isUpperCase ? resultChar : resultChar.toLowerCase();
			}
			return char;
		})
		.join("");
}
