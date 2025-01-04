import { TouchableOpacity, View, Animated } from "react-native";
import { lines } from "@/constants/lines";
import { Text } from "@/components/ui/Text";
import { Ionicons, MaterialCommunityIcons } from "./VectorIcons";
import { useNavigation } from "@react-navigation/native";
import { buttonHaptics } from "@/utils/haptics";
import { getDistance } from "@/utils/map";
import map from "@/constants/map";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTrainWebsocket } from "@/contexts/websocket";
import mapping from "@/constants/mapping";
import { Alert } from "@/api/alerts";
import { Route } from "@/types/line";
import { TrainPositions } from "@/types/train";
import { transformEta } from "@/utils/string";

export default function LineView({
	line,
	data,
	trainPositions,
}: {
	line: (typeof lines)[0];
	data: Route;
	trainPositions: TrainPositions;
}) {
	const navigation = useNavigation();
	const [lineHeights, setLineHeights] = useState<Map<number, number>>(
		new Map()
	);
	const trainAnimations = useRef<Map<string, Animated.Value>>(new Map());

	const sumOfHeights = useMemo(() => {
		return Array.from(lineHeights.values()).reduce(
			(acc, curr) => acc + curr,
			0
		);
	}, [lineHeights]);

	// Calculate train positions relative to the line view
	const trainPositionsOnLine = useMemo(() => {
		if (!trainPositions[line.route_id]) return [];
		return trainPositions[line.route_id].map((train) => {
			const { vehicle_lat, vehicle_lon } = train;

			// Find the closest stations before and after the train
			let beforeStation = data.stops[0];
			let afterStation = data.stops[1];
			let totalDistance = 0;
			let segmentStart = 0;

			for (let i = 0; i < data.stops.length - 1; i++) {
				const station1 = data.stops[i];
				const station2 = data.stops[i + 1];

				const distanceToStation1 = getDistance(
					vehicle_lat,
					vehicle_lon,
					station1.stop_lat,
					station1.stop_lon
				);
				const distanceToStation2 = getDistance(
					vehicle_lat,
					vehicle_lon,
					station2.stop_lat,
					station2.stop_lon
				);
				const stationDistance = getDistance(
					station1.stop_lat,
					station1.stop_lon,
					station2.stop_lat,
					station2.stop_lon
				);

				if (
					distanceToStation1 + distanceToStation2 <=
					stationDistance * 1.1
				) {
					beforeStation = station1;
					afterStation = station2;
					segmentStart = totalDistance;
					break;
				}

				totalDistance += lineHeights.get(i) ?? 0;
			}

			// Calculate position along the line segment
			const segmentLength =
				lineHeights.get(data.stops.indexOf(beforeStation)) ?? 0;
			const ratio =
				getDistance(
					vehicle_lat,
					vehicle_lon,
					beforeStation.stop_lat,
					beforeStation.stop_lon
				) /
				getDistance(
					beforeStation.stop_lat,
					beforeStation.stop_lon,
					afterStation.stop_lat,
					afterStation.stop_lon
				);

			return {
				id: train.train_id,
				position: segmentStart + segmentLength * ratio,
				direction: train.direction_num,
				car_count: train.car_count,
				eta: train.eta,
			};
		});
	}, [trainPositions, data.stops, lineHeights, line.id]);

	// Animate train positions
	useEffect(() => {
		trainPositionsOnLine.forEach((train) => {
			if (!trainAnimations.current.has(train.id)) {
				trainAnimations.current.set(
					train.id,
					new Animated.Value(train.position)
				);
			}

			Animated.timing(trainAnimations.current.get(train.id)!, {
				toValue: train.position,
				duration: 200,
				useNativeDriver: true,
			}).start();
		});
	}, [trainPositionsOnLine]);

	useEffect(() => {
		const heights = data.stops.map((stop, index) => {
			let height = 0;
			if (index === 0) {
				height = map.START_END_STATION_HEIGHT;
			} else if (index === data.stops.length - 1) {
				height = map.START_END_STATION_HEIGHT;
			} else {
				const distance = getDistance(
					stop.stop_lat,
					stop.stop_lon,
					data.stops[index - 1].stop_lat,
					data.stops[index - 1].stop_lon
				);
				height = Math.max(
					map.MIN_STATION_HEIGHT,
					Math.min(
						map.MAX_STATION_HEIGHT,
						distance / map.PIXELS_PER_METER
					)
				);
			}
			return height;
		});
		const hashMap = new Map<number, number>();
		heights.forEach((height, index) => {
			hashMap.set(index, height);
		});
		setLineHeights(hashMap);
	}, [data]);

	return (
		<View className="flex-1 px-4" style={{ height: sumOfHeights + 48 }}>
			<View className="flex-row justify-start items-center">
				<View className="relative flex-col items-center">
					{data?.stops.map((stop, index) => {
						const topBottomRounded =
							index === 0
								? "rounded-t-lg"
								: index === data.stops.length - 1
								? "rounded-b-lg"
								: "";
						const yPosition = Array.from(lineHeights.values())
							.slice(0, index)
							.reduce((acc, curr) => acc + curr, 0);

						// const outages = stop.outages;
						// const hasElevator = outages.some(
						// 	(outage) => outage.unitType === "ELEVATOR"
						// );
						// const hasEscalator = outages.some(
						// 	(outage) => outage.unitType === "ESCALATOR"
						// );

						return (
							<View
								className="absolute flex flex-row items-center justify-center z-5 w-full"
								key={index}
								style={{
									top: yPosition,
									height: lineHeights.get(index),
									zIndex: 5,
									elevation: 5,
								}}
							>
								<View
									className={`${line.color} w-8 h-full ${topBottomRounded}`}
								/>
								<TouchableOpacity
									activeOpacity={0.5}
									onPress={() => {
										buttonHaptics();
										navigation.navigate("StationDetails", {
											id: stop.stop_id,
											title:
												stop.stop_short_name ??
												stop.stop_name,
											line: line,
										} as never);
									}}
									className="absolute rounded-full bg-white border-4 border-black w-8 h-8"
									style={{ zIndex: 10, elevation: 10 }}
								/>
								<View className="absolute flex-col items-start justify-center z-5 right-0">
									<Text
										className="text-text text-left max-w-36"
										size="sm"
										weight="bold"
									>
										{stop.stop_short_name ?? stop.stop_name}
									</Text>
									<View className="flex-row">
										{/* {hasElevator && (
											<MaterialCommunityIcons
												name="elevator"
												size={20}
												className="text-red-500"
											/>
										)}
										{hasEscalator && (
											<MaterialCommunityIcons
												name="escalator"
												size={20}
												className="text-red-500 ml-1"
											/>
										)} */}
									</View>
								</View>
							</View>
						);
					})}

					{/* Trains */}
					{trainPositionsOnLine.map((train) => {
						const animatedPosition = trainAnimations.current.get(
							train.id
						);
						if (!animatedPosition) return null;

						const isGoingUp = train.direction === 1;

						return (
							<Animated.View
								key={train.id}
								className="absolute flex-row items-center justify-center z-10"
								style={{
									transform: [
										{
											translateY: animatedPosition,
										},
									],
									left: isGoingUp ? 0 : 128,
									right: isGoingUp ? 128 : 0,
								}}
							>
								<TouchableOpacity
									activeOpacity={0.7}
									onPress={() => {
										buttonHaptics();
										// navigation.navigate("TrainDetails", {
										//   id: train.vehicle.id,
										//   line: line,
										//   direction: train.direction === 0 ? "Outbound" : "Inbound"
										// } as never);
									}}
								>
									<TrainIndicator
										line={line}
										distance={0}
										direction={train.direction as 1 | 2}
										carCount={Number(train.car_count)}
										eta={train.eta}
									/>
								</TouchableOpacity>
							</Animated.View>
						);
					})}
				</View>
			</View>
		</View>
	);
}

export function TrainIndicator({
	line,
	distance,
	direction,
	carCount,
	eta,
}: {
	line: (typeof lines)[0];
	distance: number;
	direction: 1 | 2;
	carCount: number;
	eta: number | string;
}) {
	return (
		<View className="flex-row items-center mb-1 gap-2">
			{direction === 1 ? (
				<View>
					<Text className="text-text" size="sm" weight="bold">
						{transformEta(eta)}
					</Text>
					<Text className="text-text" size="xs" weight="medium">
						{carCount}-car
					</Text>
				</View>
			) : null}

			<View className="flex-col items-center order-2">
				{direction === 2 ? (
					<Ionicons
						name="chevron-up"
						size={16}
						className={line.textColor}
					/>
				) : null}
				<Ionicons
					name="train-sharp"
					size={20}
					className={line.textColor}
				/>
				{direction === 1 ? (
					<Ionicons
						name="chevron-down"
						size={16}
						className={line.textColor}
					/>
				) : null}
			</View>

			{direction === 2 ? (
				<View>
					<Text className="text-text" size="sm" weight="bold">
						{transformEta(eta)}
					</Text>
					<Text className="text-text" size="xs" weight="medium">
						{carCount}-car
					</Text>
				</View>
			) : null}
		</View>
	);
}
