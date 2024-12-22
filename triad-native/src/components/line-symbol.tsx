import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import { lines } from "@/constants/lines";

export default function LineSymbol({ line }: { line: (typeof lines)[number] }) {
	return (
		<View
			className={`w-8 h-8 flex items-center justify-center rounded-full ${line.color} border-2 ${line.borderColor}`}
		>
			<Text className="text-white text-xs" weight="bold">
				{line.abbr}
			</Text>
		</View>
	);
}
