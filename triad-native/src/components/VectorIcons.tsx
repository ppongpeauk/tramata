import { cssInterop } from "nativewind";
import NativeIonicons from "@expo/vector-icons/Ionicons";

export const Ionicons = cssInterop(NativeIonicons, {
	className: {
		target: "style",
	},
});
