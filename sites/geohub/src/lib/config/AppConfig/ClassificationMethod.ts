export enum ClassificationMethodTypes {
	EQUIDISTANT = 'e',
	QUANTILE = 'q',
	LOGARITHMIC = 'l',
	NATURAL_BREAK = 'n'
}

export enum ClassificationMethodNames {
	EQUIDISTANT = 'Equidistant',
	QUANTILE = 'Quantile',
	LOGARITHMIC = 'Logarithmic',
	NATURAL_BREAK = 'Natural Breaks'
}

export const ClassificationMethods: {
	name: ClassificationMethodNames;
	code: ClassificationMethodTypes;
}[] = [
	{ name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
	{ name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
	{ name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC },
	{
		name: ClassificationMethodNames.NATURAL_BREAK,
		code: ClassificationMethodTypes.NATURAL_BREAK
	}
];
