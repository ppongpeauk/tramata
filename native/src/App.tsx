import { Assets as NavigationAssets } from "@react-navigation/elements";
import { Asset } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import * as React from "react";
import { useEffect } from "react";
import { Navigation } from "./navigation";
import "./global.css";
import { useColorScheme } from "nativewind";
import { useFonts } from "expo-font";
import { customFontsToLoad } from "@/theme/typography";
import { navigationThemes, themes } from "./theme";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from "react-native-reanimated";
import { TrainWebsocketProvider } from "./contexts/websocket";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { registerForPushNotificationsAsync } from "./services/notifications";
import { LocationProvider } from "./contexts/location";
import { NearbyTrainProvider } from "./contexts/trains-nearby";

configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false,
});

Asset.loadAsync([
	...NavigationAssets,
	require("./assets/newspaper.png"),
	require("./assets/bell.png"),
]);

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export function App() {
	const [fontsLoaded] = useFonts(customFontsToLoad);
	const { colorScheme } = useColorScheme();

	useEffect(() => {
		const getToken = async () => {
			const token = await registerForPushNotificationsAsync();
			console.log("Push notification token:", token);
		};

		getToken();
	}, []);

	if (!fontsLoaded) {
		return null;
	}

	return (
		<QueryClientProvider client={queryClient}>
			<LocationProvider>
				<NearbyTrainProvider>
					<TrainWebsocketProvider>
						<GestureHandlerRootView style={{ flex: 1 }}>
							<View
								style={[
									themes["default"][colorScheme ?? "light"],
									{ flex: 1 },
								]}
							>
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
						</GestureHandlerRootView>
					</TrainWebsocketProvider>
				</NearbyTrainProvider>
			</LocationProvider>
		</QueryClientProvider>
	);
}
