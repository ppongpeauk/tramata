import { View } from "react-native";

import { ActivityIndicator } from "react-native";

export function Spinner() {
	return (
		<View className="flex-1 items-center justify-center">
			<ActivityIndicator size="large" color="#000" />
		</View>
	);
}
