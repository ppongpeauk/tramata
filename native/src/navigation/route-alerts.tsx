import { FlatList, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { useRoute } from "@react-navigation/native";
import { Alert } from "@/types/alert";
import { Ionicons, MaterialCommunityIcons } from "@/components/VectorIcons";

export default function LineAlerts() {
	const route = useRoute();
	const { alerts } = route.params as {
		alerts: Alert[];
	};

	if (!alerts?.length) {
		return (
			<View className="flex-1 items-center justify-center">
				<Text
					className="text-text text-center"
					size="md"
					weight="semiBold"
				>
					No active alerts for this line.
				</Text>
			</View>
		);
	}

	return (
		<FlatList
			data={alerts}
			renderItem={({ item }) => <AlertCard alert={item} />}
			ItemSeparatorComponent={() => (
				<View className="h-[1px] bg-border" />
			)}
		/>
	);
}

function AlertCard({ alert }: { alert: Alert }) {
	return (
		<View className="flex-row bg-primary dark:bg-background items-center justify-start gap-2 p-4">
			<View className={`w-8 h-8 flex items-center justify-center`}>
				<Ionicons
					name={"alert-circle-outline"}
					size={24}
					className="text-text"
				/>
			</View>
			<View className="flex-1">
				<Text className="text-text" weight="semiBold" size="sm">
					Line Alert
				</Text>
				<Text
					className="text-text-secondary"
					weight="medium"
					size="xs"
					selectable
				>
					{alert.description_text}
				</Text>
			</View>
		</View>
	);
}
