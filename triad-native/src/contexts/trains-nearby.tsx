import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNearbyTrains } from "@/utils/trains";
import { useLocation } from "./location";
import { StationTrainPredictionWithStation } from "@/components/primary-train-button";

type NearbyTrainContextType = {
	trainPredictions: StationTrainPredictionWithStation[] | null;
	isLoading: boolean;
	errorMsg: string | null;
};

const NearbyTrainContext = createContext<NearbyTrainContextType | undefined>(
	undefined
);

export const NearbyTrainProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { location, accessGranted } = useLocation();
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ["nearby-trains", location],
		queryFn: async () => {
			if (!location || !accessGranted) {
				setErrorMsg(
					"Location access is required to find nearby trains."
				);
				return null;
			}
			const trains = await getNearbyTrains(
				location.coords.latitude,
				location.coords.longitude
			);
			return trains;
		},
		refetchInterval: 1000 * 15,
	});

	useEffect(() => {
		if (!accessGranted) {
			setErrorMsg("Location access is required to find nearby trains.");
		} else {
			setErrorMsg(null);
		}
	}, [accessGranted]);

	return (
		<NearbyTrainContext.Provider
			value={{ trainPredictions: data ?? null, isLoading, errorMsg }}
		>
			{children}
		</NearbyTrainContext.Provider>
	);
};

export const useNearbyTrains = () => {
	const context = useContext(NearbyTrainContext);
	if (context === undefined) {
		throw new Error(
			"useNearbyTrains must be used within a NearbyTrainProvider"
		);
	}
	return context;
};
