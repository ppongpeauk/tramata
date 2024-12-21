import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
	createStaticNavigation,
	StaticParamList,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Home from "./home";
import More from "./more";
import Lines from "./lines";
import Line from "./line";
import { Text } from "@/components/ui/Text";
import { TouchableOpacity, View } from "react-native";
import LineAlerts from "./line-alerts";
import StationDetails from "./station-details";
const HomeTabs = createBottomTabNavigator({
	screens: {
		Home: {
			screen: Home,
			options: {
				title: "Home",
				tabBarIcon: ({ color, size }) => (
					<Ionicons name="home" size={size} color={color} />
				),
			},
		},
		Lines: {
			screen: Lines,
			options: {
				title: "Lines",
				tabBarIcon: ({ color, size }) => (
					<Ionicons name="git-branch" size={size} color={color} />
				),
			},
		},
		Saved: {
			screen: Home,
			options: {
				title: "Saved",
				tabBarIcon: ({ color, size }) => (
					<Ionicons name="heart" size={size} color={color} />
				),
			},
		},
		More: {
			screen: More,
			options: {
				tabBarIcon: ({ color, size }) => (
					<Ionicons name="add-circle" size={size} color={color} />
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
				title: "Home",
				headerShown: false,
			},
		},
		More: {
			screen: More,
			options: ({ navigation }) => ({}),
		},
		Line: {
			screen: Line,
			initialParams: {
				id: null,
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
