import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { lines } from "@/constants/lines";
import { useNavigation } from "@react-navigation/native";

export default function LineSymbol({
	code,
	size = "md",
	pressable = false,
}: {
	code: string;
	size?: "md" | "lg";
	pressable?: boolean;
}) {
	const navigation = useNavigation();
	const sizeClass = size === "md" ? "w-8 h-8" : "w-12 h-12";
	const line = lines.find((line) => line.abbr === code);

	if (!line) {
		return null;
	}

	if (pressable) {
		return (
			<Pressable
				className={`flex items-center justify-center rounded-full ${line.color} border-2 ${line.borderColor} ${sizeClass}`}
				onPress={() => {
					navigation.navigate("Line", { code: line.abbr } as never);
				}}
			>
				<Text className="text-white" weight="bold">
					{line.abbr}
				</Text>
			</Pressable>
		);
	}

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
