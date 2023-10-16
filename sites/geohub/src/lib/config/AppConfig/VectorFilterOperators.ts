export const VectorFilterOperators = [
	{ value: '==', label: 'Equals', text: 'is equal to', disabled: false, symbol: '=' },
	{ value: '!=', label: 'Differs', text: 'is different then', disabled: false, symbol: '≠' },
	{ value: '>', label: 'Larger', text: 'is larger then', disabled: false, symbol: '>' }, // < disabled when property is string
	{ value: '<', label: 'Smaller', text: 'is smaller then', disabled: false, symbol: '<' }, // < disabled when property is string
	{ value: 'in', label: 'Contains', text: 'contains', disabled: false, symbol: '⊂' },
	{ value: '!in', label: 'Excludes', text: 'does not contain', disabled: false, symbol: '⊄' }
];
