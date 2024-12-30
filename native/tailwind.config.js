/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	// NOTE: Update this to include the paths to all of your component files.
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		fontSize: {
			// '2xl': '1.375rem',
			// '3xl': '1.875rem',
			// '4xl': '2.25rem',
			"3xl": "2rem",
			"2xl": "1.75rem",
			xl: "1.5rem",
			lg: "1.25rem",
			md: "1.125rem",
			sm: "0.875rem",
			xs: "0.75rem",
			xxs: "0.625rem",
		},
		extend: {
			colors: {
				primary: "var(--color-primary)",
				secondary: "var(--color-secondary)",
				background: "var(--color-background)",
				surface: "var(--color-surface)",
				text: {
					DEFAULT: "var(--color-text)",
					secondary: "var(--color-text-secondary)",
				},
				border: "var(--color-border)",
				success: "var(--color-success)",
				warning: "var(--color-warning)",
				error: "var(--color-error)",
				info: "var(--color-info)",
			},
			fontFamily: {
				pthin: ["custom-thin", "sans-serif"],
				pextralight: ["custom-light", "sans-serif"],
				plight: ["custom-light", "sans-serif"],
				pregular: ["custom-regular", "sans-serif"],
				pmedium: ["custom-medium", "sans-serif"],
				psemibold: ["custom-semibold", "sans-serif"],
				pbold: ["custom-bold", "sans-serif"],
				pextrabold: ["custom-extrabold", "sans-serif"],
			},
		},
	},
	plugins: [],
};
