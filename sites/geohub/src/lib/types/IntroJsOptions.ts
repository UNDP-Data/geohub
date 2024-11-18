import type { IntroStep } from 'intro.js/src/core/steps';

export interface IntroJsOptions {
	steps: IntroStep[];
	dontShowAgain?: boolean;
	showAsDefault?: boolean;
}
