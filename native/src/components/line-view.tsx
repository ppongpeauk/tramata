import { TouchableOpacity, View, Animated } from "react-native";
import { lines } from "@/constants/lines";
import { Text } from "@/components/ui/Text";
import { Ionicons, MaterialCommunityIcons } from "./VectorIcons";
import { useNavigation } from "@react-navigation/native";
import { buttonHaptics } from "@/utils/haptics";
import { getDistance } from "@/utils/map";
import map from "@/constants/map";
import { useEffect, useMemo, useRef, useState } from "react";
import { Route } from "@/types/line";
import { TrainPositions } from "@/types/train";
import { transformEta } from "@/utils/string";
import { haversineDistance } from "@/utils/distance";
import CarCapacitySymbol from "./car-capacity-symbol";
import LineSymbol from "./line-symbol";

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
		if (!trainPositions?.[line?.route_id]) return [];
		return trainPositions[line.route_id].map((train) => {
			const { vehicle_lat, vehicle_lon } = train;

			// Special case: If train is at a station
			if (train.location_name && train.location_code) {
				const stationIndex = data.stops.findIndex(
					(stop) => stop.stop_id === train.location_code
				);
				if (stationIndex !== -1) {
					// Calculate exact station position
					let position = 0;
					for (let i = 0; i < stationIndex; i++) {
						position += lineHeights.get(i) ?? 0;
					}
					return {
						id: train.train_id,
						position,
						direction: train.direction_num,
						car_count: train.car_count,
						eta: train.eta,
					};
				}
			}

			// Find the closest station pair that the train is between
			let minTotalDistance = Infinity;
			let bestBeforeStation = data.stops[0];
			let bestAfterStation = data.stops[1];
			let bestSegmentStart = 0;
			let bestPosition = 0;
			let totalDistance = 0;

			for (let i = 0; i < data.stops.length - 1; i++) {
				const station1 = data.stops[i];
				const station2 = data.stops[i + 1];

				const distanceToStation1 = haversineDistance(
					vehicle_lat,
					vehicle_lon,
					station1.stop_lat,
					station1.stop_lon
				);
				const distanceToStation2 = haversineDistance(
					vehicle_lat,
					vehicle_lon,
					station2.stop_lat,
					station2.stop_lon
				);
				const stationDistance = haversineDistance(
					station1.stop_lat,
					station1.stop_lon,
					station2.stop_lat,
					station2.stop_lon
				);

				// If very close to a station (within 50 meters), snap to it
				if (distanceToStation1 < 50) {
					return {
						id: train.train_id,
						position: totalDistance,
						direction: train.direction_num,
						car_count: train.car_count,
						eta: train.eta,
					};
				}

				// Check if train is between these stations (with some tolerance)
				const totalPathDistance =
					distanceToStation1 + distanceToStation2;
				if (
					totalPathDistance < minTotalDistance &&
					totalPathDistance <= stationDistance * 1.2
				) {
					minTotalDistance = totalPathDistance;
					bestBeforeStation = station1;
					bestAfterStation = station2;
					bestSegmentStart = totalDistance;

					// Calculate position using the ratio of distances
					const segmentLength = lineHeights.get(i) ?? 0;
					const progressRatio = distanceToStation1 / stationDistance;
					bestPosition =
						bestSegmentStart + segmentLength * progressRatio;
				}

				totalDistance += lineHeights.get(i) ?? 0;
			}

			return {
				id: train.train_id,
				position: bestPosition,
				direction: train.direction_num,
				car_count: train.car_count,
				eta: train.eta,
			};
		});
	}, [trainPositions, data.stops, lineHeights, line.route_id]);

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
		<View className="px-4" style={{ height: sumOfHeights }}>
			<View className="flex-row justify-start items-center">
				<View className="relative flex-col items-center">
					{data?.stops.map((stop, index) => {
						const topBottomRounded =
							index === 0
								? "rounded-t-full"
								: index === data.stops.length - 1
								? "rounded-b-full"
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
								className="absolute flex flex-row items-start justify-center z-5 w-full"
								key={index}
								style={{
									top: yPosition,
									height:
										index === data.stops.length - 1
											? 28
											: lineHeights.get(index),
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
									className="absolute rounded-full bg-white border-4 border-black w-8 h-8 z-50"
									style={{ zIndex: 50, elevation: 50 }}
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
								className="absolute flex-row items-center justify-center"
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
				<View className="flex-col gap-1">
					<Text className="text-text" size="sm" weight="bold">
						{transformEta(eta)}
					</Text>
					<View className="flex-row items-center justify-center gap-1">
						<LineSymbol routeId={line.route_id} size="sm" />
						<CarCapacitySymbol capacity={carCount} size="sm" />
					</View>
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
				<MaterialCommunityIcons
					name="train"
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
				<View className="flex-col gap-1">
					<Text className="text-text" size="sm" weight="bold">
						{transformEta(eta)}
					</Text>
					<View className="flex-row items-center justify-center gap-1">
						<LineSymbol routeId={line.route_id} size="sm" />
						<CarCapacitySymbol capacity={carCount} size="sm" />
					</View>
				</View>
			) : null}
		</View>
	);
}
