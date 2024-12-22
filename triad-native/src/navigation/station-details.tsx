import React, { useEffect } from "react";
import {
	ActivityIndicator,
	RefreshControl,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Text } from "@/components/ui/Text";
import { useLayoutEffect, useState } from "react";
import { api } from "@/utils/web";
import {
	TabBarProps,
	Tabs,
	useAnimatedTabIndex,
} from "react-native-collapsible-tab-view";
import Animated, {
	useAnimatedStyle,
	withTiming,
	interpolate,
	Extrapolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@/components/VectorIcons";
import { Ionicons as NativeIonicons } from "@expo/vector-icons";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { lines } from "@/constants/lines";
import OutageUnitSymbol from "@/components/outage-unit-symbol";
import { Station } from "@/types/station";
import PrimaryTrainButton, {
	StationTrainPredictionWithStation,
} from "@/components/primary-train-button";

export type TabDefinition = {
	label: string;
	value: string;
	icon: keyof typeof NativeIonicons.glyphMap;
	alerts?: number;
	component: React.ComponentType<any>;
};
export type TabName = TabDefinition["value"];

function ArrivalsTab({
	station,
	onRefresh,
	refreshing,
}: {
	station: Station;
	onRefresh: () => void;
	refreshing: boolean;
}) {
	if (!station?.predictions?.length) {
		return (
			<View className="flex-1 items-center justify-center">
				<Text className="text-text" weight="semiBold" size="md">
					No arrivals at this time.
				</Text>
			</View>
		);
	}

	return (
		<Tabs.FlatList
			data={station.predictions}
			ItemSeparatorComponent={() => (
				<View className="h-[1px] bg-border" />
			)}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
			renderItem={({ item, index }) => {
				const line = lines.find((line) => line.abbr === item.line);
				if (!line) {
					return null;
				}

				return (
					<PrimaryTrainButton
						lineAbbr={item.line}
						train={
							{
								...item,
							} as StationTrainPredictionWithStation
						}
						key={index}
					/>
				);
			}}
		/>
	);
}

function OutagesTab({
	station,
	onRefresh,
	refreshing,
}: {
	station: Station;
	onRefresh: () => void;
	refreshing: boolean;
}) {
	const navigation = useNavigation();
	if (!station?.outages || station.outages.length === 0) {
		return (
			<View className="flex-1 items-center justify-center">
				<Text className="text-text" weight="semiBold" size="md">
					No outages at this time.
				</Text>
			</View>
		);
	}

	return (
		<Tabs.FlatList
			data={station.outages}
			ItemSeparatorComponent={() => (
				<View className="h-[1px] bg-border" />
			)}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
			renderItem={({ item, index }) => {
				return (
					<TouchableOpacity
						key={index}
						className="flex-row bg-primary dark:bg-background items-center justify-start gap-2 p-4"
						onPress={() => {
							navigation.navigate("StationOutage", {
								data: item,
							} as never);
						}}
					>
						<OutageUnitSymbol
							unitType={item.unitType || "ESCALATOR"}
						/>
						<View>
							<Text
								className="text-text"
								weight="semiBold"
								size="sm"
							>
								{item.unitType === "ESCALATOR"
									? "Escalator"
									: "Elevator"}{" "}
								Outage
							</Text>
							<Text
								className="text-text-secondary"
								weight="medium"
								size="xs"
							>
								{item.symptomDescription}
							</Text>
						</View>
						<Ionicons
							name="chevron-forward-outline"
							size={16}
							className="text-text-secondary ml-auto"
						/>
					</TouchableOpacity>
				);
			}}
		/>
	);
}

export default function StationDetails() {
	const navigation = useNavigation();
	const route = useRoute();
	const { id, title, line } = route.params as {
		id: string;
		title: string;
		line: any;
	};
	const [refreshing, setRefreshing] = useState(true);
	const [stationData, setStationData] = useState<Station | null>(null);

	const TAB_DEFINITIONS: Record<TabName, TabDefinition> = {
		eta: {
			label: "ETAs",
			value: "eta",
			icon: "time",
			component: ArrivalsTab,
		},
		outages: {
			label: "Outages",
			value: "outages",
			icon: "alert-circle-sharp",
			alerts: stationData?.outages?.length || undefined,
			component: OutagesTab,
		},
	};

	const fetchStationData = async () => {
		setRefreshing(true);
		const response = await api.get(`/v1/stations/${id}`);
		setStationData(response.data);
		setRefreshing(false);
	};

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: title,
			headerShadowVisible: false,
			headerRight: () => (
				<View className="flex-row items-center justify-center gap-4">
					<TouchableOpacity>
						<Ionicons
							name="star-outline"
							size={24}
							className="text-text"
						/>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => {
							navigation.navigate("StationInfo", {
								station: stationData,
							} as never);
						}}
					>
						<Ionicons
							name="information-circle-outline"
							size={24}
							className="text-text"
						/>
					</TouchableOpacity>
				</View>
			),
		} as NativeStackNavigationOptions);
	}, [title, stationData]);

	useEffect(() => {
		fetchStationData();
	}, []);

	if (refreshing && !stationData) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<View className="flex-1 items-center justify-center">
			<Tabs.Container
				snapThreshold={0.5}
				renderTabBar={(props) => (
					<StationTabs definitions={TAB_DEFINITIONS} {...props} />
				)}
				headerContainerStyle={{ shadowOpacity: 0, elevation: 0 }}
			>
				{Object.values(TAB_DEFINITIONS).map((tab) => (
					<Tabs.Tab
						name={tab.value}
						label={tab.label}
						key={tab.value}
					>
						<tab.component
							refreshing={refreshing}
							onRefresh={fetchStationData}
							station={stationData}
						/>
					</Tabs.Tab>
				))}
			</Tabs.Container>
		</View>
	);
}

export function StationTabs({
	tabNames,
	onTabPress,
	definitions,
}: TabBarProps & { definitions: Record<TabName, TabDefinition> }) {
	const animatedIndex = useAnimatedTabIndex();
	const { width } = useWindowDimensions();
	const tabWidth = width / tabNames.length;

	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateX: animatedIndex.value * tabWidth,
			},
		],
	}));

	return (
		<View className="border-b border-primary dark:border-border bg-primary dark:bg-background">
			<View className="flex-row">
				{tabNames.map((tab, index) => {
					const tabName = tab as TabName;

					const iconStyle = useAnimatedStyle(() => {
						const opacity = interpolate(
							animatedIndex.value,
							[index - 1, index, index + 1],
							[0.5, 1, 0.5],
							Extrapolate.CLAMP
						);

						return {
							opacity: withTiming(opacity, { duration: 150 }),
						};
					});

					return (
						<TouchableOpacity
							key={tab}
							onPress={() => {
								Haptics.selectionAsync();
								onTabPress(tab);
							}}
							activeOpacity={0.75}
							style={{ width: tabWidth }}
						>
							<View className="flex-row items-center justify-center py-3 px-4 gap-2">
								<Animated.View
									style={iconStyle}
									className="flex-row items-center justify-center gap-2"
								>
									<Ionicons
										name={definitions[tabName].icon as any}
										size={20}
										className="text-text"
									/>
									<Text
										className="text-text"
										weight="semiBold"
									>
										{definitions[tabName].label}
									</Text>
									{definitions[tabName].alerts && (
										<View className="w-5 h-5 bg-red-500 rounded-full border border-red-600 items-center justify-center">
											<Text
												className="text-white"
												size="xxs"
												weight="bold"
											>
												{definitions[tabName].alerts}
											</Text>
										</View>
									)}
								</Animated.View>
							</View>
						</TouchableOpacity>
					);
				})}
			</View>

			<Animated.View
				style={[
					{
						position: "absolute",
						bottom: 0,
						width: tabWidth,
						height: 2,
					},
					indicatorStyle,
				]}
				className="bg-text"
			/>
		</View>
	);
}
