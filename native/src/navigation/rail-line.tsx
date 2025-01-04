import {
	ActivityIndicator,
	ScrollView,
	TouchableOpacity,
	View,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useLayoutEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { lines } from "@/constants/lines";
import LineSymbol from "@/components/line-symbol";
import { Ionicons } from "@/components/VectorIcons";
import LineView from "@/components/line-view";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { getLine } from "@/api/lines";
import { useQuery } from "@tanstack/react-query";
import { pluralize } from "@/utils/string";
import { getTrainPositions } from "@/utils/trains";
import { TrainPositions } from "@/types/train";

export default function Line() {
	const navigation = useNavigation();
	const { routeId } = useRoute().params as { routeId: string };
	const line = lines.find((line) => line.route_id === routeId);

	const { data, isLoading, error } = useQuery({
		queryKey: ["line", routeId],
		queryFn: () => getLine(routeId),
	});

	const { data: trainPositions } = useQuery<TrainPositions>({
		queryKey: ["trainPositions"],
		queryFn: () => getTrainPositions(),
		refetchInterval: 5000,
		refetchOnMount: true,
	});

	useLayoutEffect(() => {
		navigation.setOptions({
			headerBackButtonDisplayMode: "minimal",
			headerTitle: () => {
				return (
					<View className="flex-row items-center gap-4">
						<LineSymbol routeId={routeId} />
						<View>
							<Text className="text-text" size="md" weight="bold">
								{line?.title}
							</Text>
							{/* <Text className="text-text" size="xs">
								{line?.stationStart} - {line?.stationEnd}
							</Text> */}
						</View>
					</View>
				);
			},
			headerRight: () => {
				return (
					<View className="flex-row items-center gap-4">
						<TouchableOpacity
							onPress={() =>
								navigation.navigate("LineAlerts", {
									alerts: data?.alerts,
								} as never)
							}
						>
							{!data?.alerts.length ? (
								<Ionicons
									name="alert-circle-outline"
									size={24}
									className="text-text"
								/>
							) : (
								<View className="h-8 px-4 bg-red-500 rounded-full border border-red-600 items-center justify-center">
									<Text
										className="text-white"
										size="xs"
										weight="bold"
									>
										{data?.alerts.length}{" "}
										{pluralize(
											"alert",
											data?.alerts.length
										)}
									</Text>
								</View>
							)}
						</TouchableOpacity>
					</View>
				);
			},
		} as NativeStackNavigationOptions);
	}, [navigation, data]);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<ScrollView className="flex-1 bg-primary dark:bg-background py-8">
			<LineView
				line={line as never}
				data={data as never}
				trainPositions={trainPositions as TrainPositions}
			/>
		</ScrollView>
	);
}
