import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
	createStaticNavigation,
	StaticParamList,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Home, { HomeStack } from "./home";
import More from "./more";
import Line from "./line";
import { TouchableOpacity } from "react-native";
import LineAlerts from "./line-alerts";
import StationDetails from "./station-details";
import StationOutage from "./station-outage";
import SystemMap from "./system-map";
import AboutApp from "./more/about-app";
import { DiscoverStack } from "./discover";
import StationInfo from "./station-info";
import TrainDetails from "./train-details";

const HomeTabs = createBottomTabNavigator({
	screens: {
		Home: {
			screen: HomeStack,
			options: {
				title: "Home",
				headerTitle: "Home",
				headerShown: false,
				tabBarIcon: ({ color, size }) => (
					<Ionicons name="home" size={size} color={color} />
				),
			},
		},
		Discover: {
			screen: DiscoverStack,
			options: {
				title: "Discover",
				headerTitle: "Discover",
				headerShown: false,
				tabBarIcon: ({ color, size }) => (
					<Ionicons name="search" size={size} color={color} />
				),
			},
		},
		Status: {
			screen: Home,
			options: {
				title: "Status",
				headerTitle: "Status",
				headerShown: false,
				tabBarIcon: ({ color, size }) => (
					<Ionicons name="pulse" size={size} color={color} />
				),
			},
		},
		More: {
			screen: More,
			options: {
				title: "More",
				headerTitle: "More",
				tabBarIcon: ({ color, size }) => (
					<Ionicons name="menu" size={size} color={color} />
				),
			},
		},
	},
});

const RootStack = createNativeStackNavigator({
	screens: {
		HomeTabs: {
			screen: HomeTabs,
			options: {
				title: "HomeStack",
				headerShown: false,
			},
		},
		AboutApp: {
			screen: AboutApp,
			options: {
				title: "About This App",
			},
		},
		More: {
			screen: More,
			options: ({ navigation }) => ({}),
		},
		Line: {
			screen: Line,
			initialParams: {
				code: "RD",
			},
			options: ({ navigation }) => ({
				headerShown: true,
			}),
		},
		LineAlerts: {
			screen: LineAlerts,
			initialParams: {
				id: null,
			},
			options: ({ navigation }) => ({
				presentation: "modal",
				title: "Alerts",
				headerShown: true,
				headerLeft: () => (
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<Ionicons
							name="close"
							size={24}
							className="text-text"
						/>
					</TouchableOpacity>
				),
			}),
		},
		StationDetails: {
			screen: StationDetails,
			options: ({ navigation }) => ({
				title: "Station Details",
				headerShown: true,
			}),
		},
		StationInfo: {
			screen: StationInfo,
			options: ({ navigation }) => ({
				title: "Station Info",
				headerShown: true,
			}),
		},
		StationOutage: {
			screen: StationOutage,
			options: ({ navigation }) => ({
				title: "Outage Details",
				headerShown: true,
				presentation: "modal",
			}),
		},
		SystemMap: {
			screen: SystemMap,
			options: ({ navigation }) => ({
				title: "System Map",
				headerShown: true,
			}),
		},
		TrainDetails: {
			screen: TrainDetails,
			options: ({ navigation }) => ({
				title: "Train Details",
				headerShown: true,
				presentation: "modal",
			}),
		},
	},
	linking: {
		path: "*",
	},
});

export const Navigation = createStaticNavigation(RootStack);

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}
