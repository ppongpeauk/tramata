import * as Haptics from "expo-haptics";

export function buttonHaptics() {
	Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}
