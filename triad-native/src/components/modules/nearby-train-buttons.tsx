import { ActivityIndicator, FlatList, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { useQuery } from "@tanstack/react-query";
import { getNearbyTrains } from "@/utils/trains";
import PrimaryTrainButton, {
	StationTrainPredictionWithStation,
} from "../primary-train-button";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
export function NearbyTrainButtons() {
	const [location, setLocation] = useState<Location.LocationObject | null>(
		null
	);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [accessGranted, setAccessGranted] = useState<boolean>(false);

	useEffect(() => {
		async function getCurrentLocation() {
			try {
				let { status } =
					await Location.requestForegroundPermissionsAsync();
				if (status !== "granted") {
					setErrorMsg("Permission to access location was denied");
					setAccessGranted(false);
					return;
				}
				setAccessGranted(true);
				let location = await Location.getCurrentPositionAsync({});
				setLocation(location);
			} catch (error) {
				setErrorMsg("Error getting location");
				setAccessGranted(false);
			}
		}

		getCurrentLocation();
	}, []);

	const { data, isLoading, refetch } = useQuery({
		queryKey: ["nearby-trains"],
		queryFn: async () => {
			if (!location) return [];
			const trains = await getNearbyTrains(
				location.coords.latitude,
				location.coords.longitude
			);
			return trains;
		},
		refetchInterval: 1000 * 15,
	});

	useEffect(() => {
		refetch();
	}, [location]);

	const nearbyTrainsComponents = data
		?.map((train: StationTrainPredictionWithStation, index: number) => (
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
					{accessGranted
						? "No nearby trains."
						: "Location access is required to find nearby trains."}
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
