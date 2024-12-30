import { cssInterop } from "nativewind";
import NativeIonicons from "@expo/vector-icons/Ionicons";
import NativeMaterialIcons from "@expo/vector-icons/MaterialIcons";
import NativeMaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export const Ionicons = cssInterop(NativeIonicons, {
	className: {
		target: "style",
	},
});

export const MaterialIcons = cssInterop(NativeMaterialIcons, {
	className: {
		target: "style",
	},
});

export const MaterialCommunityIcons = cssInterop(NativeMaterialCommunityIcons, {
	className: {
		target: "style",
	},
});
