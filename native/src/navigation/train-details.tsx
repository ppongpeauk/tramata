import { StationArrivalWithStation } from "@/components/primary-train-button";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@/components/VectorIcons";
import { Train } from "@/types/train";
import { api } from "@/utils/web";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { NativeStackNavigationOptions } from "node_modules/@react-navigation/native-stack/lib/typescript/module/src/types";
import { useLayoutEffect } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

export default function TrainDetails() {
	const navigation = useNavigation();
	const route = useRoute();

	const { train } = route.params as {
		train: StationArrivalWithStation;
	};

	const { data, isLoading, refetch } = useQuery<Train>({
		queryKey: ["train-details", train.tripId],
		queryFn: async () => {
			const { data } = await api.get(`/v1/trips/${train.tripId}`);
			return data;
		},
	});

	useLayoutEffect(() => {
		navigation.setOptions({
			title: train.destinationName,
			headerLeft: () => (
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="close" size={24} className="text-text" />
				</TouchableOpacity>
			),
			headerRight: () => (
				<View className="flex-row gap-1 items-center justify-center px-2 py-1 border border-border rounded-md">
					<Ionicons name="train" size={12} className="text-text" />
					<Text weight="medium" size="xs" className="text-text">
						{data?.vehicle.id}
					</Text>
				</View>
			),
		} as NativeStackNavigationOptions);
	}, [train, data]);

	if (isLoading)
		return (
			<View className="flex-1 p-4 h-full">
				<ActivityIndicator size="large" />
			</View>
		);

	return (
		<View className="flex-1 p-4">
			<Text className="text-text" weight="bold" size="lg">
				Coming soon.
			</Text>
		</View>
	);
}
