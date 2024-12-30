// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here
import { Platform } from 'react-native';

export const customFontsToLoad = {
	'custom-extrabold': require('../assets/fonts/HubotSans/HubotSans-ExtraBold.ttf'),
	'custom-bold': require('../assets/fonts/HubotSans/HubotSans-Bold.ttf'),
	'custom-semibold': require('../assets/fonts/HubotSans/HubotSans-SemiBold.ttf'),
	'custom-medium': require('../assets/fonts/HubotSans/HubotSans-Medium.ttf'),
	'custom-regular': require('../assets/fonts/HubotSans/HubotSans-Regular.ttf'),
	'custom-light': require('../assets/fonts/HubotSans/HubotSans-Light.ttf'),
	'custom-thin': require('../assets/fonts/HubotSans/HubotSans-ExtraLight.ttf'),
};

const fonts = {
	spaceGrotesk: {
		// Cross-platform font.
		thin: 'custom-thin',
		light: 'custom-light',
		normal: 'custom-regular',
		medium: 'custom-medium',
		semiBold: 'custom-semibold',
		bold: 'custom-bold',
		extraBold: 'custom-extrabold',
	},
	helveticaNeue: {
		// iOS only font.
		thin: 'HelveticaNeue-Thin',
		light: 'HelveticaNeue-Light',
		normal: 'Helvetica Neue',
		medium: 'HelveticaNeue-Medium',
	},
	courier: {
		// iOS only font.
		normal: 'Courier',
	},
	sansSerif: {
		// Android only font.
		thin: 'sans-serif-thin',
		light: 'sans-serif-light',
		normal: 'sans-serif',
		medium: 'sans-serif-medium',
	},
	monospace: {
		// Android only font.
		normal: 'monospace',
	},
};

export const typography = {
	/**
	 * The fonts are available to use, but prefer using the semantic name.
	 */
	fonts,
	/**
	 * The primary font. Used in most places.
	 */
	primary: fonts.spaceGrotesk,
	/**
	 * An alternate font used for perhaps titles and stuff.
	 */
	secondary: Platform.select({
		ios: fonts.helveticaNeue,
		android: fonts.sansSerif,
	}),
	/**
	 * Lets get fancy with a monospace font!
	 */
	code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),
};
