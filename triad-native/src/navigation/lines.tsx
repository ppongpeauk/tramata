import { View, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { lines } from "@/constants/lines";
import LineSymbol from "@/components/line-symbol";
import { useLayoutEffect } from "react";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

export default function Lines() {
	const navigation = useNavigation();
	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: () => (
				<View className="flex-row items-center gap-2">
					<Ionicons
						name="git-branch"
						size={24}
						className="text-text"
					/>
					<Text className="text-text" size="md" weight="bold">
						Lines
					</Text>
				</View>
			),
		} as NativeStackNavigationOptions);
	}, [navigation]);

	return (
		<View className="flex-1 items-center justify-center">
			<FlatList
				className="flex-1 w-full"
				contentContainerClassName="border-b border-border"
				refreshControl={
					<RefreshControl refreshing={false} onRefresh={() => {}} />
				}
				ItemSeparatorComponent={() => (
					<View className="h-[1px] bg-border" />
				)}
				data={lines.map((line) => ({
					...line,
					subtitle: `${line.stationStart} — ${line.stationEnd}`,
				}))}
				renderItem={({ item }) => <LineButton item={item} />}
			/>
		</View>
	);
}

function LineButton({ item }: { item: (typeof lines)[number] }) {
	const navigation = useNavigation();
	return (
		<TouchableOpacity
			activeOpacity={0.5}
			className="flex flex-row items-center gap-3 bg-white dark:bg-neutral-950 py-3 px-4"
			onPress={() => {
				navigation.navigate("Line", {
					id: item.id,
				} as never);
			}}
		>
			<LineSymbol line={item} />
			<View className="flex-1 flex-col">
				<Text className={"text-text"} weight="bold">
					{item.title}
				</Text>
				<Text className="text-text-secondary" size="sm">
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
