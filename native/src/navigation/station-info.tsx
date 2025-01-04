import { Station, StationParking } from "@/types/station";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
	ScrollView,
	View,
	Linking,
	TouchableOpacity,
	RefreshControl,
	Dimensions,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useLayoutEffect, useState, useCallback } from "react";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Ionicons } from "@/components/VectorIcons";
import { lines } from "@/constants/lines";
import LineSymbol from "@/components/line-symbol";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { api } from "@/utils/web";
import { Stop } from "@/types/stop";
import { Parking } from "@/types/parking";

type StationInfoScreenParams = {
	station: Stop;
};

function InfoRow({ label, value }: { label: string; value: string | number }) {
	return (
		<View className="flex-row justify-between items-center py-2 border-b border-border">
			<Text className="text-text-secondary" weight="medium">
				{label}
			</Text>
			<Text className="text-text" weight="semiBold">
				{value}
			</Text>
		</View>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<View className="mb-6">
			<Text className="text-text mb-2" size="lg" weight="bold">
				{title}
			</Text>
			{children}
		</View>
	);
}

function ParkingSection({ parking }: { parking: Parking }) {
	if (!parking?.all_day_parking && !parking?.short_term_parking) {
		return (
			<Section title="Parking">
				<Text className="text-text-secondary" weight="medium">
					No parking information available for this station.
				</Text>
			</Section>
		);
	}

	return (
		<Section title="Parking">
			{parking.notes && (
				<Text className="text-text-secondary mb-4" weight="medium">
					{parking.notes}
				</Text>
			)}

			{parking.all_day_parking && (
				<View className="mb-4">
					<Text className="text-text mb-2" weight="semiBold">
						All-Day Parking
					</Text>
					<InfoRow
						label="Total Spaces"
						value={parking.all_day_parking.total_count ?? "N/A"}
					/>
					<InfoRow
						label="Metro Rider Cost"
						value={`$${
							parking.all_day_parking.rider_cost?.toFixed(2) ??
							"N/A"
						}`}
					/>
					<InfoRow
						label="Non-Rider Cost"
						value={`$${
							parking.all_day_parking.non_rider_cost?.toFixed(
								2
							) ?? "N/A"
						}`}
					/>
					<InfoRow
						label="Saturday Rider Cost"
						value={`$${
							parking.all_day_parking.saturday_rider_cost?.toFixed(
								2
							) ?? "N/A"
						}`}
					/>
					<InfoRow
						label="Saturday Non-Rider Cost"
						value={`$${
							parking.all_day_parking.saturday_non_rider_cost?.toFixed(
								2
							) ?? "N/A"
						}`}
					/>
				</View>
			)}

			{parking.short_term_parking && (
				<View>
					<Text className="text-text mb-2" weight="semiBold">
						Short-Term Parking
					</Text>
					<InfoRow
						label="Total Spaces"
						value={parking.short_term_parking.total_count}
					/>
					{parking.short_term_parking.notes && (
						<Text
							className="text-text-secondary mt-2"
							weight="medium"
						>
							{parking.short_term_parking.notes}
						</Text>
					)}
				</View>
			)}
		</Section>
	);
}

function MapPreview({ station }: { station: Stop }) {
	const { width } = Dimensions.get("window");
	const ASPECT_RATIO = 16 / 9;
	const mapHeight = width / ASPECT_RATIO;

	const region = {
		latitude: station.stop_lat,
		longitude: station.stop_lon,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
	};

	const mapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(
		station.stop_name
	)}&ll=${station.stop_lat},${station.stop_lon}`;

	return (
		<Section title="Location">
			<TouchableOpacity
				onPress={() => Linking.openURL(mapsUrl)}
				className="overflow-hidden rounded-lg mb-3 border border-border"
				activeOpacity={0.5}
			>
				<MapView
					provider={PROVIDER_DEFAULT}
					style={{
						width: "100%",
						height: mapHeight,
					}}
					initialRegion={region}
					scrollEnabled={false}
					zoomEnabled={false}
					rotateEnabled={false}
					pitchEnabled={false}
				>
					<Marker
						coordinate={{
							latitude: station.stop_lat,
							longitude: station.stop_lon,
						}}
						title={station.stop_name}
					/>
				</MapView>
			</TouchableOpacity>
			<TouchableOpacity
				className="flex-row items-center justify-between border border-border p-3 rounded-lg"
				onPress={() => Linking.openURL(mapsUrl)}
				activeOpacity={0.5}
			>
				<Text className="text-text flex-1 mr-4" weight="bold">
					{station.address?.street}, {station.address?.city},{" "}
					{station.address?.state} {station.address?.zip}
				</Text>
				<Ionicons name="navigate" size={24} className="text-text" />
			</TouchableOpacity>
		</Section>
	);
}

function LinesSection({ station }: { station: Stop }) {
	return (
		<Section title="Lines">
			<View className="flex-row flex-wrap gap-2">
				{station.route_ids.map((id) => {
					const line = lines.find((l) => l.route_id === id);
					if (!line) return null;

					return (
						<LineSymbol
							routeId={id}
							size="lg"
							pressable={true}
							key={id}
						/>
					);
				})}
			</View>
		</Section>
	);
}

export default function StationInfo() {
	const route = useRoute();
	const navigation = useNavigation();
	const params = route.params as StationInfoScreenParams;
	const [station, setStation] = useState<Stop>(params.station);
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			const response = await api.get(
				`/v1/agency/WMATA_RAIL/stops/${station.stop_id}`
			);
			setStation(response.data);
		} catch (error) {
			console.error("Failed to refresh station data:", error);
		}
		setRefreshing(false);
	}, [station.stop_id]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerBackButtonDisplayMode: "minimal",
			title: station.stop_short_name ?? station.stop_name,
		} as NativeStackNavigationOptions);
	}, [station]);

	return (
		<ScrollView
			className="flex-1 bg-primary dark:bg-background"
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
		>
			<View className="p-4">
				<LinesSection station={station} />
				<MapPreview station={station} />
				<ParkingSection parking={station.parking as Parking} />
			</View>
		</ScrollView>
	);
}
