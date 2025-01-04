export const pluralize = (word: string, count: number) => {
	return count > 1 ? `${word}s` : word;
};

export const transformEta = (eta: number | string) => {
	if (typeof eta === "number") {
		return `${eta} min`;
	} else if (eta === "ARR") {
		return "Arriving";
	} else if (eta === "BRD") {
		return "Boarding";
	} else {
		return "Unknown";
	}
};
