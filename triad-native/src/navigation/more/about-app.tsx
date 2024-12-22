import { View } from "react-native";
import { Text } from "@/components/ui/Text";
export default function AboutApp() {
	return (
		<View className="flex-1 items-center justify-center">
			<Text className="text-text" weight="bold" size="md">
				Made with ❤️.
			</Text>
			<Text className="text-text" size="md">
				Version 1.0.0
			</Text>
		</View>
	);
}
