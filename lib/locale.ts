export const APP_LOCALE = "en-US";

export function formatAppDate(
	value: number | Date,
	options?: Intl.DateTimeFormatOptions,
): string {
	return new Date(value).toLocaleDateString(APP_LOCALE, options);
}

export function formatAppTime(
	value: number | Date,
	options?: Intl.DateTimeFormatOptions,
): string {
	return new Date(value).toLocaleTimeString(APP_LOCALE, options);
}

export function formatAppDateTime(
	value: number | Date,
	options?: Intl.DateTimeFormatOptions,
): string {
	return new Date(value).toLocaleString(APP_LOCALE, options);
}
