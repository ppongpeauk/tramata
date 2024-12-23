import { View } from "react-native";
import { MaterialCommunityIcons } from "@/components/VectorIcons";
import { MaterialCommunityIcons as NativeMaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";

export default function OutageUnitSymbol({
	unitType,
}: {
	unitType: "ESCALATOR" | "ELEVATOR";
}) {
	const iconName: keyof typeof NativeMaterialCommunityIcons.glyphMap =
		useMemo(() => {
			switch (unitType) {
				case "ESCALATOR":
					return "escalator";
				case "ELEVATOR":
					return "elevator";
				default:
					return "question-circle" as any;
			}
		}, [unitType]);
	return (
		<View className={`w-8 h-8 flex items-center justify-center`}>
			<MaterialCommunityIcons
				name={iconName}
				size={24}
				className="text-text"
			/>
		</View>
	);
}
