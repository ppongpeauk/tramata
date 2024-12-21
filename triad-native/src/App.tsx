import { Assets as NavigationAssets } from "@react-navigation/elements";
import { Asset } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import * as React from "react";
import { Navigation } from "./navigation";
import "./global.css";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { useFonts } from "expo-font";
import { customFontsToLoad } from "@/theme/typography";
import { navigationThemes, themes } from "./theme";
import { View } from "react-native";

Asset.loadAsync([
	...NavigationAssets,
	require("./assets/newspaper.png"),
	require("./assets/bell.png"),
]);

SplashScreen.preventAutoHideAsync();

export function App() {
	const [fontsLoaded] = useFonts(customFontsToLoad);
	const { colorScheme } = useColorScheme();

	if (!fontsLoaded) {
		return null;
	}
	return (
		<View style={[themes["default"][colorScheme ?? "light"], { flex: 1 }]}>
			<Navigation
				linking={{
					enabled: "auto",
					prefixes: [
						// Change the scheme to match your app's scheme defined in app.json
						"helloworld://",
					],
				}}
				onReady={() => {
					SplashScreen.hideAsync();
				}}
				theme={
					colorScheme === "dark"
						? navigationThemes.dark
						: navigationThemes.default
				}
			/>
		</View>
	);
}
