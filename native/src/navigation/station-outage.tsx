import { TouchableOpacity, View } from "react-native";
import { StationOutage } from "@/types/station";
import { useLayoutEffect, useMemo } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Ionicons } from "@/components/VectorIcons";
import OutageUnitSymbol from "@/components/outage-unit-symbol";
import { Text } from "@/components/ui/Text";
import moment from "moment";
export default function OutageDetails() {
	const route = useRoute();
	const navigation = useNavigation();
	const { data } = route.params as { data: StationOutage };

	const dateStringOutOfService = moment(data.dateOutOfServ).calendar();
	const dateStringEstimatedReturnToService = moment(
		data.estimatedReturnToService
	).calendar();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: () => (
				<View className="flex-row items-center gap-2">
					<OutageUnitSymbol unitType={data.unitType} />
					<Text weight="semiBold" size="md" className="text-text">
						Outage Details
					</Text>
				</View>
			),
			headerLeft: () => (
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="close" size={24} className="text-text" />
				</TouchableOpacity>
			),
			headerRight: () => (
				<View className="items-center justify-center px-2 py-1 border border-border rounded-md">
					<Text weight="medium" size="xs" className="text-text">
						{data.unitName}
					</Text>
				</View>
			),
		} as NativeStackNavigationOptions);
	}, [navigation, data]);

	const makeOutageDescription = useMemo(() => {
		const includesGarage = data.locationDescription
			.toLowerCase()
			.includes("garage");

		if (includesGarage) {
			return `The parking garage elevator at ${
				data.stationName
			} is out for ${data.symptomDescription.toLowerCase()}.`;
		}

		return `${data.locationDescription} at ${
			data.stationName
		} is out for ${data.symptomDescription.toLowerCase()}.`;
	}, [data]);

	return (
		<View className="flex-1 items-start my-6 px-4 gap-2">
			<Text weight="semiBold" size="md" className="text-text text-left">
				{makeOutageDescription}
			</Text>
			<Text
				weight="medium"
				size="sm"
				className="text-text-secondary text-left"
			>
				Outage started on: {dateStringOutOfService}.
			</Text>
			<Text
				weight="medium"
				size="sm"
				className="text-text-secondary text-left"
			>
				Estimated return to service:{" "}
				{dateStringEstimatedReturnToService}.
			</Text>
		</View>
	);
}
