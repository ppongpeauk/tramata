import { View } from "react-native";
import { MaterialCommunityIcons } from "@/components/VectorIcons";

export default function OutageUnitSymbol({
	unitType,
}: {
	unitType: "ESCALATOR" | "ELEVATOR";
}) {
	return (
		<View className={`w-8 h-8 flex items-center justify-center`}>
			{unitType === "ESCALATOR" ? (
				<MaterialCommunityIcons
					name="escalator"
					size={24}
					className="text-text"
				/>
			) : (
				<MaterialCommunityIcons
					name="elevator"
					size={24}
					className="text-text"
				/>
			)}
		</View>
	);
}
