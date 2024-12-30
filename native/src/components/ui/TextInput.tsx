import { TextInput as RNTextInput, TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

interface Props extends TextInputProps {
	className?: string;
}

export function TextInput({ className, ...props }: Props) {
	return (
		<RNTextInput
			className={cn(
				"bg-secondary dark:bg-secondary-dark p-4 rounded-lg text-text dark:text-text-dark",
				className
			)}
			placeholderTextColor="#666"
			{...props}
		/>
	);
}
