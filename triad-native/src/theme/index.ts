import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { vars } from 'nativewind';

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './timing';

export const rawThemes = {
	default: {
		primary: '#ffffff',
		secondary: '#f0f0f0',
		tertiary: '#e5e5e5',
		background: '#fafafa',
		surface: '#ffffff',
		text: '#000000',
		textSecondary: '#929292',
		border: '#e5e5e5',
		accent: '#3b82f6',
		success: '#22c55e',
		warning: '#eab308',
		error: '#ef4444',
		info: '#3b82f6',
	},
	dark: {
		primary: '#000000',
		secondary: '#171717',
		tertiary: '#262626',
		background: '#0a0a0a',
		surface: '#262626',
		text: '#ffffff',
		textSecondary: '#747474',
		border: '#202020',
		accent: '#60a5fa',
		success: '#4ade80',
		warning: '#facc15',
		error: '#f87171',
		info: '#60a5fa',
	},
};

export const themes = {
	default: {
		light: vars({
			'--color-primary': rawThemes.default.primary,
			'--color-secondary': rawThemes.default.secondary,
			'--color-tertiary': rawThemes.default.tertiary,
			'--color-background': rawThemes.default.background,
			'--color-surface': rawThemes.default.surface,
			'--color-text': rawThemes.default.text,
			'--color-text-secondary': rawThemes.default.textSecondary,
			'--color-border': rawThemes.default.border,
			'--color-accent': rawThemes.default.accent,
			'--color-success': rawThemes.default.success,
			'--color-warning': rawThemes.default.warning,
			'--color-error': rawThemes.default.error,
			'--color-info': rawThemes.default.info,
		}),
		dark: vars({
			'--color-primary': rawThemes.dark.primary,
			'--color-secondary': rawThemes.dark.secondary,
			'--color-tertiary': rawThemes.dark.tertiary,
			'--color-background': rawThemes.dark.background,
			'--color-surface': rawThemes.dark.surface,
			'--color-text': rawThemes.dark.text,
			'--color-text-secondary': rawThemes.dark.textSecondary,
			'--color-border': rawThemes.dark.border,
			'--color-accent': rawThemes.dark.accent,
			'--color-success': rawThemes.dark.success,
			'--color-warning': rawThemes.dark.warning,
			'--color-error': rawThemes.dark.error,
			'--color-info': rawThemes.dark.info,
		}),
	},
};

// Use NativeWind vars for colors
export const navigationThemes = {
	default: {
		...DefaultTheme,
		dark: false,
		fonts: {
			regular: {
				fontFamily: 'custom-regular',
				fontWeight: 'normal',
			},
			medium: {
				fontFamily: 'custom-medium',
				fontWeight: 'normal',
			},
			bold: {
				fontFamily: 'custom-bold',
				fontWeight: 'normal',
			},
			heavy: {
				fontFamily: 'custom-extrabold',
				fontWeight: 'normal',
			},
		},
		colors: {
			primary: rawThemes.default.text,
			background: rawThemes.default.background,
			card: rawThemes.default.primary,
			text: rawThemes.default.text,
			border: rawThemes.default.border,
			notification: rawThemes.default.tertiary,
		},
	},
	dark: {
		...DarkTheme,
		dark: true,
		fonts: {
			regular: {
				fontFamily: 'custom-regular',
				fontWeight: 'normal',
			},
			medium: {
				fontFamily: 'custom-medium',
				fontWeight: 'normal',
			},
			bold: {
				fontFamily: 'custom-bold',
				fontWeight: 'normal',
			},
			heavy: {
				fontFamily: 'custom-extrabold',
				fontWeight: 'normal',
			},
		},
		colors: {
			primary: rawThemes.dark.text,
			background: rawThemes.dark.background,
			card: rawThemes.dark.background,
			text: rawThemes.dark.text,
			border: rawThemes.dark.border,
			notification: rawThemes.dark.tertiary,
		},
	},
} satisfies Record<'default' | 'dark', Theme>;
