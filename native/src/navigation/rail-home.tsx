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
import { lines } from "@/constants/lines";
import LineSymbol from "@/components/line-symbol";
import * as Haptics from "expo-haptics";
import { NearbyTrainButtons } from "@/components/modules/nearby-train-buttons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { buttonHaptics } from "@/utils/haptics";

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
	return (
		<SafeAreaView className="flex-1">
			<View className="flex-1 items-center justify-center">
				<SectionList
					className="flex-1 w-full"
					refreshControl={
						<RefreshControl
							refreshing={false}
							onRefresh={() => {}}
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
							title: "Nearby Trains",
							data: [<NearbyTrainButtons />],
						},
						{
							title: "Lines",
							data: lines.map((line) => (
								<LineButton item={line} />
							)),
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

function LineButton({ item }: { item: (typeof lines)[number] }) {
	const navigation = useNavigation();
	return (
		<TouchableOpacity
			activeOpacity={0.5}
			className="flex flex-row items-center gap-3 bg-white dark:bg-neutral-950 p-4"
			onPress={() => {
				buttonHaptics();
				navigation.navigate("Line", {
					code: item.abbr,
				} as never);
			}}
		>
			<LineSymbol code={item.abbr} />
			<View className="flex-1 flex-col">
				<Text className={"text-text"} weight="bold">
					{item.title}
				</Text>
				<Text
					className="text-text-secondary flex-shrink"
					size="xs"
					weight="normal"
					numberOfLines={1}
					ellipsizeMode="tail"
				>
					{item.stationStart} — {item.stationEnd}
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
