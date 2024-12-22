import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import { lines } from "@/constants/lines";

export default function LineSymbol({
	line,
	size = "md",
}: {
	line: (typeof lines)[number];
	size?: "md" | "lg";
}) {
	const sizeClass = size === "md" ? "w-8 h-8" : "w-12 h-12";

	return (
		<View
			className={`flex items-center justify-center rounded-full ${line.color} border-2 ${line.borderColor} ${sizeClass}`}
		>
			<Text
				className="text-white"
				weight="bold"
				size={size === "md" ? "xs" : "md"}
			>
				{line.abbr}
			</Text>
		</View>
	);
}
