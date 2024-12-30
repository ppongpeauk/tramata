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
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { buttonHaptics } from "@/utils/haptics";

export const BusHomeStack = createNativeStackNavigator({
	screens: {
		BusHome: {
			screen: BusHome,
			options: {
				headerTitle: "Bus",
				headerLargeTitle: true,
			},
		},
	},
});

export default function BusHome() {
	const navigation = useNavigation();

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
							title: "Nearby Buses",
							data: [<View />],
						},
					]}
					renderItem={({ item }) => item}
				/>
			</View>
		</SafeAreaView>
	);
}
