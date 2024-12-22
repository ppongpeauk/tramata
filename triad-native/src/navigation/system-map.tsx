import { View, Dimensions, ActivityIndicator } from "react-native";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { useState, useEffect } from "react";
import { fetchAndSaveMap } from "@/utils/map";
import { Image } from "expo-image";
import { Text } from "@/components/ui/Text";

export default function SystemMap() {
	const [mapUri, setMapUri] = useState<string | null>(null);

	useEffect(() => {
		async function prepareMap() {
			const localUri = await fetchAndSaveMap();
			setMapUri(localUri);
		}

		prepareMap();
	}, []);

	if (!mapUri) {
		return (
			<View className="flex-1 items-center justify-center">
				<Text className="text-text" weight="bold" size="lg">
					Loading map...
				</Text>
			</View>
		);
	}

	return (
		<ReactNativeZoomableView
			maxZoom={8}
			minZoom={0.75}
			zoomStep={0.5}
			initialZoom={1}
			bindToBorders={true}
		>
			<Image
				source={{
					uri: mapUri,
				}}
				contentFit="contain"
				style={{
					width: Dimensions.get("window").width,
					height: Dimensions.get("window").height,
				}}
			/>
		</ReactNativeZoomableView>
	);
}
