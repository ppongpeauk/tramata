import { TouchableOpacity, View } from "react-native";
import { lines } from "@/constants/lines";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "./VectorIcons";
import { useNavigation } from "@react-navigation/native";

export type LineData = {
	lineCode: string;
	displayName: string;
	startStationCode: string;
	endStationCode: string;
	internalDestination1: string;
	internalDestination2: string;
	stations: {
		code: string;
		name: string;
		stationTogether1: string;
		stationTogether2: string;
		lineCode1: string;
		lineCode2?: string | null;
		lineCode3?: string | null;
		lineCode4?: string | null;
		lat: number;
		lon: number;
		address: {
			street: string;
			city: string;
			state: string;
			zip: string;
		};
	}[];
	tracks: {
		seqNum: number;
		circuitId: number;
		stationCode: string | null;
		neighbors: {
			neighborType: string;
			circuitIds: number[];
		}[];
	}[];
};

export default function LineView({
	line,
	data,
}: {
	line: (typeof lines)[0];
	data: LineData;
}) {
	const navigation = useNavigation();
	const stationComponents = data?.stations.map((station, index) => {
		return (
			<View className="flex-row flex-1 items-center" key={index}>
				<TouchableOpacity
					activeOpacity={0.5}
					onPress={() => {
						navigation.navigate("StationDetails", {
							id: station.code,
							title: station.name,
							line: line,
						} as never);
					}}
				>
					<View
						className={`border-4 ${line.borderColor} bg-white dark:bg-background h-8 w-8 rounded-full`}
					/>
				</TouchableOpacity>
				<View className="absolute flex-col items-end ml-40">
					<Text
						className="text-text max-w-40"
						size="sm"
						weight="bold"
					>
						{station.name}
					</Text>
				</View>
			</View>
		);
	});

	return (
		<View className="flex flex-1 flex-row items-start px-4 w-full">
			{/* Trains (from bottom to top) */}
			<View className="flex-row items-center gap-2">
				<View className="flex-col items-center">
					<Text className="text-text" size="sm" weight="bold">
						1 min
					</Text>
					<View className="flex-row">
						<Text className="text-text" size="xs" weight="medium">
							8-car
						</Text>
					</View>
				</View>
				<View className="flex-col items-center">
					<Ionicons
						name="train-sharp"
						size={24}
						className={line.textColor}
					/>
					<Ionicons
						name="chevron-down"
						size={20}
						className={line.textColor}
					/>
				</View>
			</View>
			{/* Center Pole */}
			<View
				className={`flex items-center ${line.color} border ${line.borderColor} h-fit w-4 rounded-full mx-8 py-8 mb-32 gap-12`}
			>
				{stationComponents}
			</View>
			{/* Trains (from top to bottom) */}
			<View className="flex-row items-center gap-2">
				<View className="flex-col items-center">
					<Ionicons
						name="chevron-up"
						size={20}
						className={line.textColor}
					/>
					<Ionicons
						name="train-sharp"
						size={24}
						className={line.textColor}
					/>
				</View>
				<View className="flex-col items-center">
					<Text className="text-text" size="sm" weight="bold">
						1 min
					</Text>
					<View className="flex-row">
						<Text className="text-text" size="xs" weight="medium">
							8-car
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}
