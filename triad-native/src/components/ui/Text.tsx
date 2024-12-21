import React from "react";
import {
	Text as RNText,
	TextProps as RNTextProps,
	StyleProp,
	TextStyle,
} from "react-native";
import { TxKeyPath, isRTL, translate } from "@/i18n";
import { colors, typography } from "@/theme";
import i18n from "i18n-js";

type Sizes = keyof typeof $sizeStyles;
type Weights = keyof typeof typography.primary;
type Presets = keyof typeof $presets;

export interface TextProps extends RNTextProps {
	/**
	 * Text which is looked up via i18n.
	 */
	tx?: TxKeyPath;
	/**
	 * The text to display if not using `tx` or nested components.
	 */
	text?: string;
	/**
	 * Optional options to pass to i18n. Useful for interpolation
	 * as well as explicitly setting locale or translation fallbacks.
	 */
	txOptions?: i18n.TranslateOptions;
	/**
	 * An optional style override useful for padding & margin.
	 */
	style?: StyleProp<TextStyle>;
	/**
	 * One of the different types of text presets.
	 */
	preset?: Presets;
	/**
	 * Nativewind class name.
	 */
	className?: string;
	/**
	 * Text weight modifier.
	 */
	weight?: Weights;
	/**
	 * Text size modifier.
	 */
	size?: Sizes;
	/**
	 * Children components.
	 */
	children?: React.ReactNode;
}

/**
 * For your text displaying needs.
 * This component is a HOC over the built-in React Native one.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/Text/}
 * @param {TextProps} props - The props for the `Text` component.
 * @returns {JSX.Element} The rendered `Text` component.
 */
export function Text(props: TextProps) {
	const {
		className,
		weight,
		size,
		tx,
		txOptions,
		text,
		children,
		style: $styleOverride,
		...rest
	} = props;

	const i18nText = tx && translate(tx, txOptions);
	const content = i18nText || text || children;

	const preset: Presets = props.preset ?? "default";
	const $styles: StyleProp<TextStyle> = [
		$rtlStyle,
		$presets[preset],
		weight && $fontWeightStyles[weight],
		size && $sizeStyles[size],
		// $styleOverride,
	];

	return (
		<RNText style={$styles} {...rest} className={`${props.className}`}>
			{content}
		</RNText>
	);
}

const $sizeStyles = {
	"4xl": { fontSize: 40, lineHeight: 46 } satisfies TextStyle,
	"3xl": { fontSize: 32, lineHeight: 42 } satisfies TextStyle,
	"2xl": { fontSize: 28, lineHeight: 36 } satisfies TextStyle,
	xl: { fontSize: 24, lineHeight: 32 } satisfies TextStyle,
	lg: { fontSize: 20, lineHeight: 26 } satisfies TextStyle,
	md: { fontSize: 18, lineHeight: 24 } satisfies TextStyle,
	sm: { fontSize: 14, lineHeight: 18 } satisfies TextStyle,
	xs: { fontSize: 12, lineHeight: 16 } satisfies TextStyle,
	xxs: { fontSize: 10, lineHeight: 14 } satisfies TextStyle,
};

const $fontWeightStyles = Object.entries(typography.primary).reduce(
	(acc, [weight, fontFamily]) => {
		return { ...acc, [weight]: { fontFamily } };
	},
	{}
) as Record<Weights, TextStyle>;

const $baseStyle: StyleProp<TextStyle> = [
	// $sizeStyles.xs,
	$fontWeightStyles.normal,
	// { color: colors.text },
];

const $presets = {
	default: $baseStyle,

	bold: [$baseStyle, $fontWeightStyles.bold] as StyleProp<TextStyle>,

	heading: [
		$baseStyle,
		$sizeStyles["2xl"],
		$fontWeightStyles.bold,
	] as StyleProp<TextStyle>,

	subheading: [
		$baseStyle,
		$sizeStyles.lg,
		$fontWeightStyles.medium,
	] as StyleProp<TextStyle>,

	formLabel: [$baseStyle, $fontWeightStyles.medium] as StyleProp<TextStyle>,

	formHelper: [
		$baseStyle,
		$sizeStyles.sm,
		$fontWeightStyles.normal,
	] as StyleProp<TextStyle>,
};

const $rtlStyle: TextStyle = isRTL ? { writingDirection: "rtl" } : {};
