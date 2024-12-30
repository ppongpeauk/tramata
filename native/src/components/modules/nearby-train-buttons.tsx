import { ActivityIndicator, FlatList, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { useNearbyTrains } from "@/contexts/trains-nearby";
import PrimaryTrainButton from "../primary-train-button";

export function NearbyTrainButtons() {
	const { trainPredictions: data, isLoading, errorMsg } = useNearbyTrains();

	const nearbyTrainsComponents = data
		?.map((train, index) => (
			<PrimaryTrainButton
				lineAbbr={train.line}
				train={{ ...train, station: train.station }}
				key={index}
				size="sm"
			/>
		))
		.slice(0, 4);

	if (isLoading)
		return (
			<View className="flex-1 flex-row items-center justify-center py-4 px-4 gap-2">
				<ActivityIndicator size="small" />
				<Text className="text-text-secondary" weight="bold" size="sm">
					Locating trains...
				</Text>
			</View>
		);

	if (!data?.length)
		return (
			<View className="flex-1 flex-row items-center justify-center py-4 px-4 gap-2">
				<Text className="text-text-secondary" weight="bold" size="sm">
					{errorMsg || "No nearby trains."}
				</Text>
			</View>
		);

	return (
		<FlatList
			data={nearbyTrainsComponents}
			ItemSeparatorComponent={() => (
				<View className="h-[1px] bg-border" />
			)}
			renderItem={({ item }) => item}
		/>
	);
}
