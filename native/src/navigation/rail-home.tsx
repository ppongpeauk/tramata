import {
	View,
	TouchableOpacity,
	RefreshControl,
	SectionList,
	SafeAreaView,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { lines as lineMappings, lines } from "@/constants/lines";
import LineSymbol from "@/components/line-symbol";
import { NearbyTrainButtons } from "@/components/modules/nearby-train-buttons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { buttonHaptics } from "@/utils/haptics";
import { useQuery } from "@tanstack/react-query";
import { getLines } from "@/api/lines";
import { Route } from "@/types/route";
export const RailHomeStack = createNativeStackNavigator({
	screens: {
		RailHome: {
			screen: RailHome,
			options: {
				headerTitle: "Rail",
				headerLargeTitle: true,
			},
		},
	},
});

export default function RailHome() {
	const {
		data: linesData,
		isLoading: linesLoading,
		refetch: refetchLines,
	} = useQuery({
		queryKey: ["lines"],
		queryFn: async () => {
			const lines = await getLines();
			return lines;
		},
		initialData: undefined,
	});

	return (
		<SafeAreaView className="flex-1">
			<View className="flex-1 items-center justify-center">
				<SectionList
					className="flex-1 w-full"
					refreshControl={
						<RefreshControl
							refreshing={linesLoading}
							onRefresh={() => {
								refetchLines();
							}}
						/>
					}
					ItemSeparatorComponent={() => (
						<View className="h-[1px] bg-border" />
					)}
					renderSectionHeader={({ section: { title } }) => {
						return (
							<View className="py-3 px-4 bg-primary dark:bg-background">
								<Text
									className="text-text"
									weight="bold"
									size="sm"
								>
									{title}
								</Text>
							</View>
						);
					}}
					SectionSeparatorComponent={() => (
						<View className="h-[1px] bg-border" />
					)}
					sections={[
						{
							title: "Lines",
							data:
								linesData?.routes.map((route) => (
									<LineButton item={route} />
								)) ?? [],
						},
						{
							title: "System Map",
							data: [<SystemMapButton />],
						},
					]}
					renderItem={({ item }) => item}
				/>
			</View>
		</SafeAreaView>
	);
}

function LineButton({ item }: { item: Route }) {
	const navigation = useNavigation();
	const line = lines.find((line) => line.route_id === item.route_id);
	return (
		<TouchableOpacity
			activeOpacity={0.5}
			className="flex flex-row items-center gap-3 bg-white dark:bg-neutral-950 p-4"
			onPress={() => {
				buttonHaptics();
				navigation.navigate("RailLine", {
					routeId: item.route_id,
				} as never);
			}}
		>
			<LineSymbol routeId={item.route_id} />
			<View className="flex flex-1 flex-col flex-shrink">
				<Text className={"text-text"} weight="bold">
					{item.route_short_name}
				</Text>
				<Text
					className="text-text-secondary"
					size="xs"
					weight="normal"
					numberOfLines={1}
					ellipsizeMode="tail"
				>
					{item.headsigns[0] ?? "From Station"} —{" "}
					{item.headsigns[1] ?? "To Station"}
				</Text>
			</View>
			<View className="flex flex-row items-center justify-end gap-2">
				{/* {item.alerts.length ? (
					<View className="w-5 h-5 bg-red-500 rounded-full border border-red-600 items-center justify-center">
						<Text className="text-white" size="xxs" weight="bold">
							{item.alerts.length}
						</Text>
					</View>
				) : null} */}
				<Ionicons
					name="chevron-forward"
					size={16}
					className="ml-auto text-text-secondary"
				/>
			</View>
		</TouchableOpacity>
	);
}

function SystemMapButton() {
	const navigation = useNavigation();
	return (
		<TouchableOpacity
			className="flex flex-row items-center gap-3 bg-white dark:bg-neutral-950 py-4 px-4"
			onPress={() => {
				buttonHaptics();
				navigation.navigate("SystemMap" as never);
			}}
		>
			<Ionicons name="map-sharp" size={24} className="text-text" />
			<View className="flex-1 flex-col">
				<Text className="text-text" weight="bold">
					System Map
				</Text>
				<Text className="text-text-secondary" size="xs">
					View the map of the entire system
				</Text>
			</View>
			<Ionicons
				name="chevron-forward"
				size={16}
				className="ml-auto text-text-secondary"
			/>
		</TouchableOpacity>
	);
}
