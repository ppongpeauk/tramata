import { View } from "react-native";
import { Text } from "@/components/ui/Text";

export default function CarCapacitySymbol({
	capacity,
}: {
	capacity: number | string;
}) {
	return (
		<View
			className={`w-8 h-8 flex items-center justify-center rounded-full bg-transparent border-2 border-border`}
		>
			<Text className="text-text" weight="bold" size="xs">
				{capacity}
			</Text>
		</View>
	);
}
