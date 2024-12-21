import { FlatList, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@/components/VectorIcons";
import { Ionicons as NativeIonicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function More() {
	const navigation = useNavigation();
	return (
		<FlatList
			className="flex-1 w-full py-8"
			contentContainerClassName="border-y border-border"
			ItemSeparatorComponent={() => (
				<View className="h-[1px] bg-border" />
			)}
			data={[
				{
					icon: "information-circle",
					title: "About This App",
					onPress: () => {
						navigation.navigate("about" as never);
					},
				},
				{
					icon: "call",
					title: "Call Metro Transit Police (Emergencies Only)",
					subtitle: "Call 202-962-2121 or Text 696873",
					onPress: () => {},
					emergency: true,
				},
			]}
			renderItem={({ item }) => (
				<MainButton
					icon={item.icon as any}
					title={item.title}
					subtitle={item.subtitle}
					onPress={item.onPress}
					emergency={item.emergency}
				/>
			)}
		/>
	);
}

function MainButton({
	icon,
	title,
	subtitle,
	onPress,
	emergency = false,
	hideChevron = false,
}: {
	icon: keyof typeof NativeIonicons.glyphMap;
	title: string;
	subtitle?: string;
	onPress: () => void;
	hideChevron?: boolean;
	emergency?: boolean;
}) {
	return (
		<TouchableOpacity
			activeOpacity={0.5}
			className="flex flex-row items-center gap-3 bg-white dark:bg-neutral-950 py-4 px-4"
		>
			<Ionicons
				name={icon as any}
				size={20}
				className={emergency ? "text-red-500" : "text-text"}
			/>
			<View className="flex-1 flex-col">
				<Text
					className={`${emergency ? "text-red-500" : "text-text"}`}
					weight="bold"
				>
					{title}
				</Text>
				{subtitle && (
					<Text
						className={
							emergency ? "text-red-500" : "text-text-secondary"
						}
						size="sm"
					>
						{subtitle}
					</Text>
				)}
			</View>
			{!hideChevron && (
				<Ionicons
					name="chevron-forward"
					size={16}
					className="ml-auto text-text-secondary"
				/>
			)}
		</TouchableOpacity>
	);
}
