export const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

const conjunction = new Intl.ListFormat("en", { type: "conjunction" });
export const list = (items: string[]) => conjunction.format(items);
export const listParts = (items: string[]) => conjunction.formatToParts(items);
