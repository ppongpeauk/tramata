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

export type LineData = {
	lineCode: string;
	displayName: string;
	alerts: Alert[];
	startStationCode: string;
	endStationCode: string;
	internalDestination1: string;
	internalDestination2: string;
	stations: {
		code: string;
		name: string;
		stationTogether1: string;
		stationTogether2: string;
		lineCode1: string;
		lineCode2?: string | null;
		lineCode3?: string | null;
		lineCode4?: string | null;
		lat: number;
		lon: number;
		address: {
			street: string;
			city: string;
			state: string;
			zip: string;
		};
		outages: {
			unitName: string;
			unitType: "ESCALATOR" | "ELEVATOR";
			unitStatus: string | null;
			stationCode: string;
			stationName: string;
			locationDescription: string;
			symptomCode: string | null;
			timeOutOfService: string;
			symptomDescription: string;
			displayOrder: number;
			dateOutOfServ: string;
			dateUpdated: string;
			estimatedReturnToService: string;
		}[];
	}[];
	tracks: {
		seqNum: number;
		circuitId: number;
		stationCode: string | null;
		neighbors: {
			neighborType: string;
			circuitIds: number[];
		}[];
	}[];
};

export default function LineView({
	line,
	data,
}: {
	line: (typeof lines)[0];
	data: LineData;
}) {
	const navigation = useNavigation();
	const { trainPositions } = useTrainWebsocket() ?? { trainPositions: [] };
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
		return trainPositions
			.filter(
				(train) =>
					line.id ===
					mapping.rail.routeMappings.get(train.trip.routeId)
			)
			.map((train) => {
				const { latitude, longitude } = train.position;

				// Find the closest stations before and after the train
				let beforeStation = data.stations[0];
				let afterStation = data.stations[1];
				let totalDistance = 0;
				let segmentStart = 0;

				for (let i = 0; i < data.stations.length - 1; i++) {
					const station1 = data.stations[i];
					const station2 = data.stations[i + 1];

					const distanceToStation1 = getDistance(
						latitude,
						longitude,
						station1.lat,
						station1.lon
					);
					const distanceToStation2 = getDistance(
						latitude,
						longitude,
						station2.lat,
						station2.lon
					);
					const stationDistance = getDistance(
						station1.lat,
						station1.lon,
						station2.lat,
						station2.lon
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
					lineHeights.get(data.stations.indexOf(beforeStation)) ?? 0;
				const ratio =
					getDistance(
						latitude,
						longitude,
						beforeStation.lat,
						beforeStation.lon
					) /
					getDistance(
						beforeStation.lat,
						beforeStation.lon,
						afterStation.lat,
						afterStation.lon
					);

				return {
					id: train.vehicle.id,
					position: segmentStart + segmentLength * ratio,
					direction: train.trip.directionId,
				};
			});
	}, [trainPositions, data.stations, lineHeights, line.id]);

	useEffect(() => {
		console.log(trainPositionsOnLine);
	}, [trainPositionsOnLine]);

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
		const heights = data.stations.map((station, index) => {
			let height = 0;
			if (index === 0) {
				height = map.START_END_STATION_HEIGHT;
			} else if (index === data.stations.length - 1) {
				height = map.START_END_STATION_HEIGHT;
			} else {
				const distance = getDistance(
					station.lat,
					station.lon,
					data.stations[index - 1].lat,
					data.stations[index - 1].lon
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
					{data?.stations.map((station, index) => {
						const topBottomRounded =
							index === 0
								? "rounded-t-lg"
								: index === data.stations.length - 1
								? "rounded-b-lg"
								: "";
						const yPosition = Array.from(lineHeights.values())
							.slice(0, index)
							.reduce((acc, curr) => acc + curr, 0);

						const outages = station.outages;
						const hasElevator = outages.some(
							(outage) => outage.unitType === "ELEVATOR"
						);
						const hasEscalator = outages.some(
							(outage) => outage.unitType === "ESCALATOR"
						);

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
											id: station.code,
											title: station.name,
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
										{station.name}
									</Text>
									<View className="flex-row">
										{hasElevator && (
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
										)}
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

						const isGoingUp = train.direction === 0;

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
										direction={train.direction}
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
}: {
	line: (typeof lines)[0];
	distance: number;
	direction: number;
}) {
	return (
		<View className="flex-row items-center mb-1 gap-2">
			{direction === 0 ? (
				<View>
					<Text className="text-text" size="sm" weight="bold">
						1 min
					</Text>
					<Text className="text-text" size="xs" weight="medium">
						8-car
					</Text>
				</View>
			) : null}

			<View className="flex-col items-center order-2">
				{direction === 1 ? (
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
				{direction === 0 ? (
					<Ionicons
						name="chevron-down"
						size={16}
						className={line.textColor}
					/>
				) : null}
			</View>

			{direction === 1 ? (
				<View>
					<Text className="text-text" size="sm" weight="bold">
						1 min
					</Text>
					<Text className="text-text" size="xs" weight="medium">
						8-car
					</Text>
				</View>
			) : null}
		</View>
	);
}
