import { TouchableOpacity, View } from "react-native";
import { StationOutage } from "@/types/station";
import { useLayoutEffect, useMemo } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Ionicons } from "@/components/VectorIcons";
import OutageUnitSymbol from "@/components/outage-unit-symbol";
import { Text } from "@/components/ui/Text";
import moment from "moment";
import { Outage } from "@/types/outage";
export default function OutageDetails() {
	const route = useRoute();
	const navigation = useNavigation();
	const { data } = route.params as { data: Outage };

	const dateStringOutOfService = moment(data.date_out_of_serv).calendar();
	const dateStringEstimatedReturnToService = moment(
		data.estimated_return_to_service
	).calendar();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: () => (
				<View className="flex-row items-center gap-2">
					<OutageUnitSymbol
						unitType={data.unit_type as "ESCALATOR" | "ELEVATOR"}
					/>
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
						{data.unit_name}
					</Text>
				</View>
			),
		} as NativeStackNavigationOptions);
	}, [navigation, data]);

	const makeOutageDescription = useMemo(() => {
		const includesGarage = data.location_description
			.toLowerCase()
			.includes("garage");

		if (includesGarage) {
			return `The parking garage elevator at ${
				data.station_name
			} is out for ${data.symptom_description.toLowerCase()}.`;
		}

		return `${data.location_description} at ${
			data.station_name
		} is out for ${data.symptom_description.toLowerCase()}.`;
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
