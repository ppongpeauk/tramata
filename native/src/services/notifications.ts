import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// configure notification behavior
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

// get permission and token
export const registerForPushNotificationsAsync = async () => {
	let token;

	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#FF231F7C",
		});
	}

	const { status: existingStatus } =
		await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== "granted") {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== "granted") {
		alert("Failed to get push token for notifications!");
		return;
	}

	token = (await Notifications.getExpoPushTokenAsync()).data;

	return token;
};
