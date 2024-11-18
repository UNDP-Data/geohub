import type { IntroStep } from 'intro.js/src/core/steps';

export interface IntroJsOptions {
	/**
	 * For defining steps using JSON configuration.
	 * See https://introjs.com/docs/tour/examples/json-config
	 */
	steps: IntroStep[];
	dontShowAgain?: boolean;
	/**
	 * "Don't show again" cookie name
	 * Default: "introjs-dontShowAgain"
	 * Note: This is cookie name, to use IntroJS tour on multiple pages, and wish to enable the "Don't show again" checkbox,
	 * it must use the dontShowAgainCookie option to set a unique cookie name on each page where using IntroJS.
	 */
	dontShowAgainCookie?: string;
	/**
	 * "Don't show again" cookie expiry (in days)
	 * Default: 365
	 */
	dontShowAgainCookieDays?: number;
	/**
	 * If true, it shows tour automatically unless users checked Don't show again.
	 */
	showAsDefault?: boolean;
}
