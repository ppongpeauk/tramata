import { FlatList, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { useRoute } from "@react-navigation/native";
import { Alert } from "@/api/alerts";

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
		<View className="flex-1 items-center justify-center">
			<FlatList
				data={alerts}
				renderItem={({ item }) => <AlertCard alert={item} />}
			/>
		</View>
	);
}

function AlertCard({ alert }: { alert: Alert }) {
	return (
		<View className="flex-row bg-primary dark:bg-background items-center justify-start gap-2 p-4">
			<View className="flex-1 flex-col items-start justify-start">
				<Text
					className="text-text max-w-64"
					weight="semiBold"
					size="md"
				>
					{alert.message}
				</Text>
				{/* <Text
					className="text-text-secondary flex-shrink"
					weight="normal"
					size="xs"
					numberOfLines={1}
					ellipsizeMode="tail"
				>
					{alert.createdAt.toLocaleDateString()}
				</Text> */}
			</View>
		</View>
	);
}
