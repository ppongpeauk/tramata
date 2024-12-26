import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import CarCapacitySymbol from "@/components/car-capacity-symbol";
import LineSymbol from "@/components/line-symbol";
import { lines } from "@/constants/lines";
import { Station, StationTrainPrediction } from "@/types/station";
import { useNavigation } from "@react-navigation/native";
import Animated, {
	useAnimatedStyle,
	withRepeat,
	withSequence,
	withTiming,
	Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { buttonHaptics } from "@/utils/haptics";
export type StationTrainPredictionWithStation = StationTrainPrediction & {
	station?: Station;
};

export default function PrimaryTrainButton({
	lineAbbr,
	train,
	size = "md",
}: {
	lineAbbr: string;
	train: StationTrainPredictionWithStation;
	size?: "sm" | "md";
}) {
	const navigation = useNavigation();
	const line = lines.find((line) => line.abbr === lineAbbr);
	if (!line) {
		return null;
	}

	const isImminentArrival = train.min === "BRD" || train.min === "ARR";

	const pulsingStyle = useAnimatedStyle(() => {
		if (!isImminentArrival) {
			return { opacity: 1 };
		}

		return {
			opacity: withRepeat(
				withSequence(
					withTiming(0.5, {
						duration: 500,
						easing: Easing.inOut(Easing.ease),
					}),
					withTiming(1, {
						duration: 500,
						easing: Easing.inOut(Easing.ease),
					})
				),
				-1,
				true
			),
		};
	}, [isImminentArrival]);

	return (
		<TouchableOpacity
			className={`flex-row bg-primary dark:bg-background items-center justify-start gap-2 p-4`}
			activeOpacity={0.5}
			onPress={() => {
				buttonHaptics();
				navigation.navigate("TrainDetails", {
					train,
				} as never);
			}}
		>
			<LineSymbol code={lineAbbr} />
			<CarCapacitySymbol capacity={train.car || "?"} />
			<View className="flex-1 flex-col items-start justify-start">
				<View
					className={`flex-row items-center justify-start ${
						size === "sm" ? "gap-1" : "gap-2"
					}`}
				>
					{size === "sm" && train.destinationName !== "LastTrain" ? (
						<Ionicons
							name="flag"
							size={16}
							className="text-text-secondary"
						/>
					) : null}
					{train.destinationName === "LastTrain" ? (
						<View className="flex-row items-center justify-center gap-1 bg-red-500 border-2 border-red-600 rounded-lg py-0.5 px-2">
							<Text
								className="text-white"
								size="xs"
								weight="semiBold"
							>
								Last Train
							</Text>
						</View>
					) : (
						<Text
							className="text-text max-w-64"
							weight="semiBold"
							size={size === "sm" ? "sm" : "md"}
						>
							{train.destination}
						</Text>
					)}
				</View>
				{train.station && (
					<View className="flex-row items-center justify-center gap-1">
						<Ionicons
							name="location"
							size={12}
							className="text-text-secondary"
						/>
						<Text
							className="text-text-secondary flex-shrink"
							weight="normal"
							size="xs"
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{train.station.name}
						</Text>
					</View>
				)}
			</View>
			<Animated.View style={pulsingStyle}>
				<Text
					className="text-text text-right ml-auto"
					size="md"
					weight="semiBold"
				>
					{train.min}
				</Text>
			</Animated.View>

			<Ionicons
				name="chevron-up"
				size={16}
				className="text-text-secondary"
			/>
		</TouchableOpacity>
	);
}
