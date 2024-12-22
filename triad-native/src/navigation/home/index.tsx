import { View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "@/components/ui/Text";

export const HomeStack = createNativeStackNavigator({
	screens: {
		Home: {
			screen: Home,
			options: {
				headerTitle: "Hypermata",
				headerLargeTitle: true,
			},
		},
	},
});

export default function Home() {
	return (
		<View>
			<Text className="text-text" weight="bold">
				Home
			</Text>
		</View>
	);
}
