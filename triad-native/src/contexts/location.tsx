import { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import { useQuery } from "@tanstack/react-query";

type LocationContextType = {
	location?: Location.LocationObject | null;
	errorMsg: string | null;
	accessGranted: boolean;
};

const LocationContext = createContext<LocationContextType | undefined>(
	undefined
);

export const LocationProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [accessGranted, setAccessGranted] = useState<boolean>(false);

	const { data: location, refetch } = useQuery<
		Location.LocationObject | null,
		Error
	>({
		queryKey: ["current-location"],
		queryFn: async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				setErrorMsg("Permission to access location was denied");
				setAccessGranted(false);
				return null;
			}
			setAccessGranted(true);
			let currentLocation = await Location.getCurrentPositionAsync({});
			return currentLocation;
		},
		refetchInterval: 1000 * 60, // Refetch every 60 seconds
	});

	return (
		<LocationContext.Provider value={{ location, errorMsg, accessGranted }}>
			{children}
		</LocationContext.Provider>
	);
};

export const useLocation = () => {
	const context = useContext(LocationContext);
	if (context === undefined) {
		throw new Error("useLocation must be used within a LocationProvider");
	}
	return context;
};
