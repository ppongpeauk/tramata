import { Station } from "@/types/station";
import { useNavigation, useRoute } from "@react-navigation/native";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import { useLayoutEffect } from "react";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

export default function StationInfo() {
	const route = useRoute();
	const navigation = useNavigation();
	const { station } = route.params as { station: Station };

	useLayoutEffect(() => {
		navigation.setOptions({
			headerBackButtonDisplayMode: "minimal",
			title: station.name,
		} as NativeStackNavigationOptions);
	}, [station]);

	return (
		<View className="flex-1 bg-red-500">
			<Text>{station.name}</Text>
		</View>
	);
}
