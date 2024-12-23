import {
	View,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
	SafeAreaView,
} from "react-native";
import {
	createNativeStackNavigator,
	NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import { Text } from "@/components/ui/Text";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/web";
import { useLayoutEffect, useState } from "react";
import { Ionicons } from "@/components/VectorIcons";
import { lines } from "@/constants/lines";
import LineSymbol from "@/components/line-symbol";
import { Station } from "@/types/station";
import { TextInput } from "@/components/ui/TextInput";

type NavigationStep = {
	type: "RIDE" | "TRANSFER" | "WALK";
	fromStation: string;
	toStation: string;
	line?: string;
	duration: number;
	distance?: number;
	timeframe: {
		start: string;
		end: string;
	};
};

type NavigationRoute = {
	steps: NavigationStep[];
	totalDuration: number;
	totalDistance: number;
	fare: {
		peakTime: number;
		offPeakTime: number;
		seniorDisabled: number;
	};
};

type RootStackParamList = {
	Home: undefined;
	StationSelect: {
		onSelect: (station: Station) => void;
		title: string;
	};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function StationSelector({
	label,
	station,
	onSelect,
	navigation,
}: {
	label: string;
	station?: Station;
	onSelect: (station: Station) => void;
	navigation: any;
}) {
	return (
		<View className="mb-4">
			<Text className="text-text-secondary mb-2" weight="medium">
				{label}
			</Text>
			<TouchableOpacity
				className="flex-row items-center justify-between bg-secondary dark:bg-secondary-dark p-4 rounded-lg"
				onPress={() => {
					navigation.navigate("StationSelect", {
						onSelect,
						title: label,
					});
				}}
			>
				<View>
					<Text className="text-text" weight="semiBold">
						{station?.name || "Select Station"}
					</Text>
				</View>
				<Ionicons
					name="chevron-forward"
					size={20}
					className="text-text-secondary"
				/>
			</TouchableOpacity>
		</View>
	);
}

function StationSelectScreen({ route, navigation }: any) {
	const [search, setSearch] = useState("");
	const { data: stations, isLoading } = useQuery({
		queryKey: ["stations"],
		queryFn: async () => {
			const response = await api.get("/v1/stations?deduplicate=true");
			return response.data as Station[];
		},
	});

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: route.params.title,
			headerSearchBarOptions: {
				placeholder: "Search stations...",
				onChangeText: (e) => setSearch(e.nativeEvent.text),
			},
		} as NativeStackNavigationOptions);
	}, [navigation, route.params.title]);

	const filteredStations = stations?.filter((station) =>
		station.name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<ScrollView
			className="flex-1"
			contentInsetAdjustmentBehavior="automatic"
		>
			{isLoading ? (
				<View className="items-center justify-center py-8">
					<ActivityIndicator size="large" />
				</View>
			) : (
				<View>
					{filteredStations?.map((station) => (
						<TouchableOpacity
							key={station.code}
							className="p-4 border-b border-border"
							onPress={() => {
								route.params.onSelect(station);
								navigation.goBack();
							}}
						>
							<Text className="text-text" weight="semiBold">
								{station.name}
							</Text>
							<View className="flex-row items-center gap-2 mt-1">
								{station.lines.map((line) => {
									const lineInfo = lines.find(
										(l) => l.abbr === line
									);
									return lineInfo ? (
										<LineSymbol
											key={line}
											line={lineInfo}
										/>
									) : null;
								})}
							</View>
						</TouchableOpacity>
					))}
				</View>
			)}
		</ScrollView>
	);
}

function StepIcon({
	type,
	line,
}: {
	type: NavigationStep["type"];
	line?: string;
}) {
	switch (type) {
		case "RIDE":
			const lineInfo = lines.find((l) => l.abbr === line);
			if (!lineInfo) return null;
			return <LineSymbol line={lineInfo} />;
		case "TRANSFER":
			return (
				<View className="w-6 h-6 rounded-full bg-yellow-500 items-center justify-center">
					<Ionicons
						name="git-branch-outline"
						size={16}
						className="text-white"
					/>
				</View>
			);
		case "WALK":
			return (
				<View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center">
					<Ionicons
						name="walk-outline"
						size={16}
						className="text-white"
					/>
				</View>
			);
	}
}

function NavigationStepItem({ step }: { step: NavigationStep }) {
	return (
		<View className="flex-row items-start p-4 gap-3">
			<StepIcon type={step.type} line={step.line} />
			<View className="flex-1">
				<Text className="text-text" weight="semiBold">
					{step.type === "RIDE"
						? `Take ${step.line} line to ${step.toStation}`
						: step.type === "TRANSFER"
						? `Transfer at ${step.fromStation}`
						: `Walk to ${step.toStation}`}
				</Text>
				<Text className="text-text-secondary" size="sm">
					{step.duration} min • {step.timeframe.start} -{" "}
					{step.timeframe.end}
				</Text>
				{step.distance && (
					<Text className="text-text-secondary" size="sm">
						{(step.distance / 5280).toFixed(1)} miles
					</Text>
				)}
			</View>
		</View>
	);
}

function NavigationSummary({ route }: { route: NavigationRoute }) {
	return (
		<View className="p-4 bg-secondary dark:bg-secondary-dark rounded-lg mb-4">
			<View className="flex-row justify-between items-center mb-2">
				<Text className="text-text" weight="semiBold">
					Total Duration
				</Text>
				<Text className="text-text" weight="bold">
					{route.totalDuration} min
				</Text>
			</View>
			<View className="flex-row justify-between items-center mb-2">
				<Text className="text-text" weight="semiBold">
					Total Distance
				</Text>
				<Text className="text-text" weight="bold">
					{(route.totalDistance / 5280).toFixed(1)} miles
				</Text>
			</View>
			<View className="border-t border-border mt-2 pt-2">
				<Text className="text-text mb-1" weight="semiBold">
					Fares
				</Text>
				<View className="flex-row justify-between">
					<Text className="text-text-secondary" size="sm">
						Peak
					</Text>
					<Text className="text-text" weight="semiBold">
						${route.fare.peakTime.toFixed(2)}
					</Text>
				</View>
				<View className="flex-row justify-between">
					<Text className="text-text-secondary" size="sm">
						Off-Peak
					</Text>
					<Text className="text-text" weight="semiBold">
						${route.fare.offPeakTime.toFixed(2)}
					</Text>
				</View>
				<View className="flex-row justify-between">
					<Text className="text-text-secondary" size="sm">
						Senior/Disabled
					</Text>
					<Text className="text-text" weight="semiBold">
						${route.fare.seniorDisabled.toFixed(2)}
					</Text>
				</View>
			</View>
		</View>
	);
}

function HomeScreen({ navigation }: any) {
	const [fromStation, setFromStation] = useState<Station>();
	const [toStation, setToStation] = useState<Station>();

	const { data: route, isLoading } = useQuery({
		queryKey: ["navigation", fromStation?.code, toStation?.code],
		queryFn: async () => {
			const response = await api.get(
				`/v1/stations/navigation/${fromStation?.code}/${toStation?.code}`
			);
			return response.data as NavigationRoute;
		},
		enabled: !!fromStation?.code && !!toStation?.code,
	});

	return (
		<SafeAreaView className="flex-1 bg-primary dark:bg-background">
			<ScrollView
				className="flex-1 bg-primary dark:bg-background"
				automaticallyAdjustContentInsets
			>
				<View className="p-4">
					<StationSelector
						label="From Station"
						station={fromStation}
						onSelect={setFromStation}
						navigation={navigation}
					/>
					<StationSelector
						label="To Station"
						station={toStation}
						onSelect={setToStation}
						navigation={navigation}
					/>

					<View className="mb-6">
						<Text
							className="text-text mb-2"
							size="lg"
							weight="bold"
						>
							Route
						</Text>
						{isLoading ? (
							<View className="items-center justify-center py-8">
								<ActivityIndicator size="large" />
							</View>
						) : route ? (
							<>
								<NavigationSummary route={route} />
								<View className="bg-secondary dark:bg-secondary-dark rounded-lg overflow-hidden">
									{route.steps?.map((step, index) => (
										<View key={index}>
											<NavigationStepItem step={step} />
											{index < route.steps.length - 1 && (
												<View className="h-[1px] bg-border mx-4" />
											)}
										</View>
									))}
								</View>
							</>
						) : (
							<Text className="text-text-secondary">
								Select stations to see route
							</Text>
						)}
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

export function HomeStack() {
	return (
		<Stack.Navigator>
			<Stack.Screen
				name="Home"
				component={HomeScreen}
				options={{
					headerTitle: "Navigation",
					headerLargeTitle: true,
				}}
			/>
			<Stack.Screen
				name="StationSelect"
				component={StationSelectScreen}
				options={{
					presentation: "modal",
				}}
			/>
		</Stack.Navigator>
	);
}

export default HomeStack;
