import { julianDate, fhToDate } from "./time";
import {
  normalizeAngle,
  normalizeHour,
  sin,
  cos,
  arctan2,
  arcsin,
  arccos,
  arccot,
  tan,
} from "./math";
import HijrahDate from "hijrah-date";

export const ALL_CALCULATION_AUTHORITIES = [
  "MWL",
  "ISNA",
  "EGAS",
  "UQUM",
  "UISK",
  "IGUT",
  "SIA",
] as const;
export type CalculationAuthorities =
  (typeof ALL_CALCULATION_AUTHORITIES)[number];

export type AngleMap = {
  [K in CalculationAuthorities]: [number, number];
};

export const ALL_MADHABS = ["Hanafi", "Shafi"] as const;
export type Madhab = (typeof ALL_MADHABS)[number];

export const ALL_TIMINGS = [
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
  "Midnight",
  "Imsak",
] as const;
export type TimingNames = (typeof ALL_TIMINGS)[number];

export type Times = {
  [K in TimingNames]: Date;
};

export type PrayerTimeParams = {
  lat: number;
  lng: number;
  tz: number;
  authority?: CalculationAuthorities;
  madhab?: Madhab;
  useCustomAngle?: boolean;
  customAngles?: [number, number];
};
export class PrayerTimes {
  private lat: number;
  private lng: number;
  private tz: number;
  private authority: CalculationAuthorities;
  private madhab: Madhab;
  private useCustomAngles: boolean;
  private angles: [number, number];
  private angleMap: AngleMap = {
    MWL: [18, 17],
    ISNA: [15, 15],
    EGAS: [19.5, 17.5],
    UQUM: [18.5, 90],
    UISK: [18, 18],
    IGUT: [17.7, 14],
    SIA: [16, 14],
  };
  constructor(params: PrayerTimeParams) {
    this.lat = params.lat;
    this.lng = params.lng;
    this.tz = params.tz;
    this.authority = params.authority ?? "MWL";
    this.madhab = params.madhab ?? "Shafi";
    this.useCustomAngles = params.useCustomAngle ?? false;
    if (this.useCustomAngles && !params.customAngles)
      throw new Error(
        "customAngles must be defined when useCustomAngles = true"
      );
    this.angles = this.useCustomAngles
      ? params.customAngles
      : this.angleMap[this.authority];
    
  }

  public set setLat(l: number) {
    this.lat = l;
  }

  public set setLng(l: number) {
    this.lng = l;
  }

  public set setTz(tz: number) {
    this.tz = tz;
  }

  public set setAuthority(a: CalculationAuthorities) {
    this.authority = a;
  }

  public set setMadhab(m: Madhab) {
    this.madhab = m;
  }

  public set setFajrAngle(a: number) {
    this.angles[0] = a;
  }

  public setIshaAngle(a: number) {
    this.angles[1] = a;
  }

  public get fajrAngle() {
    return this.angles[0]
  }

  public get ishaAngle() {
    return this.angles[1]
  }

  /**
   * Computes declination of sun and equation of time
   * @see http://praytimes.org/calculation#:~:text=Let%20%CE%B1%20be%20the%20twilight,%2F60)%20of%20the%20night
   * @param {Date} [d=new Date()]
   *
   */
  public sunPosition = (d: Date = new Date()) => {
    const jd = julianDate(d);
    const D = jd - 2451545.0;
    const g = normalizeAngle(357.529 + 0.98560028 * D);
    const q = normalizeAngle(280.459 + 0.98564736 * D);
    const L = normalizeAngle(q + 1.915 * sin(g) + 0.02 * sin(2 * g));

    const e = 23.439 - 0.00000036 * D;
    const RA = arctan2(cos(e) * sin(L), cos(L)) / 15.0;
    const EqT = q / 15.0 - normalizeHour(RA);
    const decl = arcsin(sin(e) * sin(L));

    return {
      EqT,
      decl,
    };
  };

  /**
   * Computes the time difference between mid-day and the time at which the sun reach angle, a
   *
   * @param {number} a
   * @param {Date} [d=new Date()]
   * @returns {number} Time in fractional hours
   */
  public sunAngle = (a: number, d: Date = new Date()) => {
    const { decl } = this.sunPosition(d);
    const t =
      (1 / 15) *
      arccos(
        (-sin(a) - sin(this.lat) * sin(decl)) / (cos(this.lat) * cos(decl))
      );
    return t;
  };

  /**
   * Computes the mid-day difference for when a given shadow length, 1 = shadow is equal to object, 2 = double length
   *
   * @param {number} a
   * @param {Date} [d=new Date()]
   * @returns {number} Time in fractional hours
   */
  public asrTime = (a: number, d: Date = new Date()) => {
    const { decl } = this.sunPosition(d);
    return (
      (1 / 15) *
      arccos(
        (sin(arccot(a + tan(this.lat - decl))) - sin(this.lat) * sin(decl)) /
          (cos(this.lat) * cos(decl))
      )
    );
  };

  /**
   * Computes the mid-day time using longitude and timezone
   *
   * @param {Date} [d=new Date()]
   * @returns {number}
   */
  public midday = (d: Date = new Date()) => {
    const { EqT } = this.sunPosition(d);
    const calc = 12 + this.tz - this.lng / 15 - EqT;
    return calc;
  };

  /**
   * Computes prayer times
   *
   * @param {Date} [d=new Date()]
   * @param {number} [elevation=0] Optional parameter for higher elevation calculations
   * @returns {Times}
   */
  public getTimes = (d: Date = new Date(), elevation: number = 0, hijriAdjustment?: number): Times => {
    const dhr = this.midday(d);
    let hd = new HijrahDate(d);
    if (hijriAdjustment) {
      hd = hijriAdjustment > 0 ? hd.plusDays(hijriAdjustment) : hd.minusDays(Math.abs(hijriAdjustment))
    }
    const elevAdjustment = 0.0347 * Math.sqrt(elevation);
    const sunrise = dhr - this.sunAngle(0.833 + elevAdjustment, d);
    const sunset = dhr + this.sunAngle(0.833 + elevAdjustment, d);
    const asr = dhr + this.asrTime(this.madhab === "Shafi" ? 1 : 2, d);

    const [fajrAng, ishaAng] = this.angles;
    const fajr = dhr - this.sunAngle(fajrAng, d);
    let isha = dhr + this.sunAngle(ishaAng, d);
    if (this.authority === "UQUM") {
      isha = hd.getMonth() === 8 ? sunset + 1.5 : sunset + 2;
    }

    const midnight =
      sunset +
      (this.authority === "SIA"
        ? 0.5 * normalizeHour(fajr - sunset)
        : 0.5 * normalizeHour(sunrise - sunset));
    const shiaMagrib = dhr + this.sunAngle(4, d);

    return {
      Fajr: fhToDate(d, fajr),
      Sunrise: fhToDate(d, sunrise),
      Dhuhr: fhToDate(d, dhr),
      Asr: fhToDate(d, asr),
      Maghrib: fhToDate(d, this.authority === "SIA" ? shiaMagrib : sunset),
      Isha: fhToDate(d, isha),
      Midnight: fhToDate(d, midnight),
      Imsak: new Date(fhToDate(d, fajr).getTime() - 10 * 60 * 1000),
    };
  };
}
