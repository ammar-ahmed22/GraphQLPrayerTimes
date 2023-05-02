import { getTimezoneOffset } from "date-fns-tz";

export const julianDate = (d: Date = new Date()) => {
  return d.getTime() / 86400000 + 2440587.5;
};

export const julianDate2 = (d: Date = new Date()) => {
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  let day = d.getDate();

  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  let A = Math.floor(year / 100);
  let B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    B -
    1524.5
  );
};

/**
 * Converts fractional hour to date
 *
 * @param {Date} d Date for the Gregorian Date
 * @param {number} fh Fractional hour for the time
 */
export const fhToDate = (d: Date, fh: number) => {
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  const hour = Math.floor(fh);
  const minutes = Math.floor((fh - hour) * 60);
  return new Date(year, month, day, hour, minutes);
};

export type HijriComponents = {
  year: number;
  month: string;
  day: number;
};

export type HijriComponentsOptions = {
  shortMonth?: boolean;
  adjustment?: number;
};


/**
 * Provides GMT offset given a timezone
 *
 * @param {string} timeZone
 * @returns {number}
 */
export const getGMToffset = (timeZone: string) => {
  return getTimezoneOffset(timeZone) / 3.6e6
}


