import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { i18n } from './i18n';

export * from './i18n';
export * from './translate';

const LANGUAGE_KEY = 'userLanguage';
export const SYSTEM_LANGUAGE = 'system';

export const changeLanguage = async (lang: string) => {
	try {
		if (lang === SYSTEM_LANGUAGE) {
			await AsyncStorage.removeItem(LANGUAGE_KEY);
			i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'en';
		} else {
			await AsyncStorage.setItem(LANGUAGE_KEY, lang);
			i18n.locale = lang;
		}
		console.log('Language changed to:', i18n.locale);
	} catch (error) {}
};

export const getCurrentLanguage = async (): Promise => {
	try {
		const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
		if (storedLanguage) {
			return storedLanguage;
		}
		return SYSTEM_LANGUAGE;
	} catch (error) {
		return SYSTEM_LANGUAGE;
	}
};

export const initializeLanguage = async () => {
	try {
		console.log('Initializing language...');
		const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
		if (storedLanguage) {
			i18n.locale = storedLanguage;
		} else {
			const systemLanguage =
				Localization.getLocales()[0]?.languageCode ?? 'en';
			i18n.locale = systemLanguage;
			// Store the system language as the initial language
			await AsyncStorage.setItem(LANGUAGE_KEY, systemLanguage);
		}
		console.log('Language initialized to:', i18n.locale);
	} catch (error) {}
};

export const availableLanguages = [
	{ code: SYSTEM_LANGUAGE, name: 'System Language' },
	{ code: 'en', name: 'English' },
	{ code: 'fr', name: 'Français' },
	// Add more languages as needed
];
