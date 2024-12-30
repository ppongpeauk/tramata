import { View } from "react-native";
import { Text } from "@/components/ui/Text";
export default function LineAlerts() {
	return (
		<View className="flex-1 items-center justify-center">
			<Text className="text-text text-center" size="md" weight="semiBold">
				No alerts for this line.
			</Text>
		</View>
	);
}
