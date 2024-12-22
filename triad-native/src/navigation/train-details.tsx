import { StationTrainPredictionWithStation } from "@/components/primary-train-button";
import { Ionicons } from "@/components/VectorIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "node_modules/@react-navigation/native-stack/lib/typescript/module/src/types";
import { useLayoutEffect } from "react";
import { TouchableOpacity, View } from "react-native";

export default function TrainDetails() {
	const navigation = useNavigation();
	const route = useRoute();
	const { train } = route.params as {
		train: StationTrainPredictionWithStation;
	};

	useLayoutEffect(() => {
		navigation.setOptions({
			title: train.destinationName,
			headerLeft: () => (
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="close" size={24} className="text-text" />
				</TouchableOpacity>
			),
		} as NativeStackNavigationOptions);
	}, [train]);

	return <View></View>;
}
