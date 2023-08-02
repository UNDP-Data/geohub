import type { ArithmeticOperator } from './ArithmeticOperator';

export interface RasterSimpleExpression {
	band: string;
	operator: ArithmeticOperator | '';
	value?: number | string;
}
