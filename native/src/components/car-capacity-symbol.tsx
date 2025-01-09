import { View } from "react-native";
import { Text } from "@/components/ui/Text";

export default function CarCapacitySymbol({
	capacity,
	size = "md",
}: {
	capacity: number | string;
	size?: "sm" | "md";
}) {
	return (
		<View
			className={`w-${size === "sm" ? 6 : 8} h-${
				size === "sm" ? 6 : 8
			} flex items-center justify-center rounded-full bg-transparent border-2 border-border`}
		>
			<Text
				className="text-text"
				weight="bold"
				size={size === "sm" ? "xxs" : "sm"}
			>
				{capacity}
			</Text>
		</View>
	);
}
