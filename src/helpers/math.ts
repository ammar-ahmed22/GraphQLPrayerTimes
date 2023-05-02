/**
 * Normalizes a value based on a mode of normalization
 *
 * @param {number} a
 * @param {number} mode
 * @returns {number}
 */
const normalize = (a: number, mode: number) => {
  a = a - mode * Math.floor(a / mode);
  return a < 0 ? a + mode : a;
};

/**
 * Normalizes an angle in degrees
 *
 * @param {number} deg
 * @returns {number}
 *
 * @example
 * ```
 * normalizeAngle(420)
 * >> 60
 * normalizeAngle(60)
 * >> 60
 * normalizeAngle(-30)
 * >> 330
 * ```
 */
export const normalizeAngle = (deg: number) => normalize(deg, 360);

/**
 * Normalizes hours
 * @date 4/26/2023 - 3:30:35 AM
 *
 * @param {number} h
 * @returns {number}
 *
 * @example
 * ```
 * normalizeHour(26)
 * >> 2
 * ```
 */
export const normalizeHour = (h: number) => normalize(h, 24);

/**
 * Converts degrees to radians
 *
 * @param {number} deg
 * @returns {number}
 */
const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Converts radians to degrees
 *
 * @param {number} rad
 * @returns {number}
 */
const toDegrees = (rad: number) => (rad * 180) / Math.PI;

/**
 * Mathematical sin function in degrees
 *
 * @param {number} deg
 * @returns {*}
 */
export const sin = (deg: number) => Math.sin(toRad(deg));

/**
 * Mathematical cos function in degrees
 *
 * @param {number} deg
 * @returns {*}
 */
export const cos = (deg: number) => Math.cos(toRad(deg));

/**
 * Mathematical tan function in degrees
 *
 * @param {number} deg
 * @returns {*}
 */
export const tan = (deg: number) => Math.tan(toRad(deg));

/**
 * Mathematical arcsine function in degrees
 *
 * @param {number} x
 * @returns {number}
 */
export const arcsin = (x: number) => toDegrees(Math.asin(x));

/**
 * Mathematical arccosine function in degrees
 *
 * @param {number} x
 * @returns {number}
 */
export const arccos = (x: number) => toDegrees(Math.acos(x));

/**
 * Mathematical arctangent function in degrees
 *
 * @param {number} x
 * @returns {number}
 */
export const arctan = (x: number) => toDegrees(Math.atan(x));

/**
 * Mathematical arccotangent function in degrees
 *
 * @param {number} x
 * @returns {number}
 */
export const arccot = (x: number) => toDegrees(Math.atan(1 / x));

/**
 * Mathematical arctangent 2 function in degrees
 *
 * @param {number} x
 * @returns {number}
 */
export const arctan2 = (y: number, x: number) => toDegrees(Math.atan2(y, x));
