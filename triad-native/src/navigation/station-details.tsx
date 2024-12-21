import { View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Text } from "@/components/ui/Text";
import { useEffect, useLayoutEffect } from "react";
import { useState } from "react";
import { api } from "@/utils/web";

export type Station = {
	code: string;
	name: string;
	stationTogether1: string;
	stationTogether2: string;
	lineCode1: string;
	lineCode2?: string;
	lineCode3?: string;
	lineCode4?: string;
	lat: number;
	lon: number;
	address: {
		street: string;
		city: string;
		state: string;
		zip: string;
	};
};

export default function StationDetails() {
	const navigation = useNavigation();
	const route = useRoute();
	const { id, title } = route.params as { id: string; title: string };

	const [stationData, setStationData] = useState<Station | null>(null);
	const fetchStationData = async () => {
		const response = await api.get(`/v1/stations/${id}`);
		setStationData(response.data);
	};

	useLayoutEffect(() => {
		fetchStationData();
	}, [id]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: title,
		});
	}, [title]);

	return (
		<View className="flex-1 items-center justify-center">
			<Text className="text-text" size="md" weight="semiBold">
				{stationData?.name}
			</Text>
			<Text className="text-text-secondary" size="sm" weight="semiBold">
				{stationData?.address.street}
			</Text>
		</View>
	);
}
