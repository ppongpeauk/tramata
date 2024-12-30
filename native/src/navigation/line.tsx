import {
	ActivityIndicator,
	ScrollView,
	TouchableOpacity,
	View,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useLayoutEffect, useRef } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { lines } from "@/constants/lines";
import LineSymbol from "@/components/line-symbol";
import { Ionicons } from "@/components/VectorIcons";
import LineView, { LineData } from "@/components/line-view";
import { useState, useEffect } from "react";
import { api } from "@/utils/web";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

export default function Line() {
	const navigation = useNavigation();
	const { code } = useRoute().params as { code: string };
	const line = lines.find((line) => line.abbr === code);

	const [isLoading, setIsLoading] = useState(true);
	const [lineData, setLineData] = useState<LineData | null>(null);

	const getLine = async () => {
		setIsLoading(true);
		try {
			const response = await api.get(`/v1/lines/${line?.abbr}`);
			setLineData(response.data);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getLine();
	}, [line]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerBackButtonDisplayMode: "minimal",
			headerTitle: () => {
				return (
					<View className="flex-row items-center gap-4">
						<LineSymbol code={line?.abbr as string} />
						<View>
							<Text className="text-text" size="md" weight="bold">
								{line?.title}
							</Text>
							{/* <Text className="text-text" size="xs">
								{line?.stationStart} - {line?.stationEnd}
							</Text> */}
						</View>
					</View>
				);
			},
			headerRight: () => {
				return (
					<View className="flex-row items-center gap-4">
						<TouchableOpacity
							onPress={() =>
								navigation.navigate("LineAlerts", {
									id: line?.id,
								} as never)
							}
						>
							<Ionicons
								name="information-circle-outline"
								size={24}
								className="text-text"
							/>
						</TouchableOpacity>
					</View>
				);
			},
		} as NativeStackNavigationOptions);
	}, [navigation]);

	if (isLoading && !lineData) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<ScrollView className="flex-1 bg-primary dark:bg-background py-8">
			<LineView line={line as never} data={lineData as never} />
		</ScrollView>
	);
}
