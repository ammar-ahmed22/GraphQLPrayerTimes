import {
  Query,
  Resolver,
  ObjectType,
  Field,
  Args,
  Arg,
  Int,
} from "type-graphql";
import { CalculationParams, DateInput, TimingAdjustment, Angles, ParamsUsed, IParamsUsed } from "./arguments";
import { Timings } from "../models/Timings";
import { DateType } from "../models/Date";
import { getPosition } from "../helpers/location";
import { PrayerTimes, Times, TimingNames } from "../helpers/prayerTimes";
import { add, getDaysInMonth, differenceInDays, format } from "date-fns";
import { getGMToffset } from "../helpers/time";
import { parseFromTimeZone } from "date-fns-timezone";

@ObjectType("ResponseType")
export class Response {
  constructor(times: Times, d: Date, params: Omit<IParamsUsed, "dateReadable">) {
    
    this.timings = new Timings(times);
    this.date = new DateType(d, params.hijriDateAdjustment);
    this.params = new ParamsUsed({ 
      dateReadable: format(d, "EEEE, LLLL do, yyyy"),
      ...params
    })
  }
  @Field((returns) => Timings)
  public timings: Timings;

  @Field((returns) => DateType)
  public date: DateType;

  @Field(returns => ParamsUsed)
  public params: ParamsUsed;
}

@Resolver()
export class PrayersResolver {

  private adjustTimes(times: Times, adjustment: TimingAdjustment) {
    let newTimes: Times;
    Object.keys(adjustment).forEach((tn: TimingNames) => {
      if (adjustment[tn]) {
        newTimes[tn] = add(times[tn], { minutes: adjustment[tn] });
      } else {
        newTimes[tn] = times[tn]
      }
    })

    return newTimes;
  }

  private createDate(timezone: string, date?: DateInput): Date {
    return (
      date ? 
      new Date(date.year, date.month - 1, date.day, date.hour, date.minute, date.second) : 
      parseFromTimeZone((new Date()).toUTCString(), { timeZone: timezone })
    )
  }

  private async initializePrayerTimes(params: CalculationParams) : Promise<{ prayerTimes: PrayerTimes, paramsUsed: Omit<IParamsUsed, "dateReadable"> }> {
    let { city, country, lat, lng, authority, madhab, customAngles, timezone } = params
    if (city && country) {
      const pos = await getPosition(`${city},${country}`);
      if (!pos) throw new Error("Could not find latitude and longitude from given city and country.");
      lat = pos.lat;
      lng = pos.lng;
    }
    const pt = new PrayerTimes({
      lat,
      lng,
      tz: getGMToffset(timezone),
      authority,
      madhab,
      useCustomAngle: !!customAngles,
      customAngles: customAngles ? [customAngles.fajr, customAngles.isha] : undefined
    })
    return {
      prayerTimes: pt,
      paramsUsed: {
        lat,
        lng,
        authority,
        madhab,
        timezone,
        anglesUsed: {
          fajr: pt.fajrAngle,
          isha: authority !== "UQUM" ? pt.ishaAngle : undefined
        }
      }
    }
  }

  @Query((returns) => Response, { description: "Provides prayer timings and Islamic date for a given date. If date is not provided, the current date in the given timezone *(`America/Toronto` by default)* will be used."})
  async date(
    @Arg("params") params: CalculationParams,
    @Arg("date", (type) => DateInput, { nullable: true }) date?: DateInput,
  ) {
    const { prayerTimes, paramsUsed } = await this.initializePrayerTimes(params);
    const { timezone, hijriDateAdjustment, timingAdjustment } = params;

    const d = this.createDate(timezone, date);
    
    let times = prayerTimes.getTimes(d, 0, hijriDateAdjustment);
    if (timingAdjustment) {
      times = this.adjustTimes(times, timingAdjustment);
    }

    return new Response(times, d, paramsUsed);
  }

  @Query((returns) => [Response], { description: "Provides prayer timings and Islamic date for a given month of a given year. If month or year is not provided, the current month or year in the given timezone *(`America/Toronto` by default)* will be used."})
  async month(
    @Arg("params") params : CalculationParams,
    @Arg("month", type => Int, { nullable: true }) month?: number,
    @Arg("year", type => Int, { nullable: true }) year?: number
  ) {
    const { timezone, hijriDateAdjustment, timingAdjustment } = params;
    const { prayerTimes, paramsUsed } = await this.initializePrayerTimes(params);
    const today = this.createDate(timezone);
    month = month ? month - 1 : today.getMonth();
    year = year ?? today.getFullYear();
    const numDays = getDaysInMonth(new Date(year, month));
    const result: Response[] = [];
    for (let day = 1; day < numDays + 1; day++) {
      const curr = new Date(year, month, day);
      let times = prayerTimes.getTimes(curr, 0, hijriDateAdjustment);
      if (timingAdjustment) {
        times = this.adjustTimes(times, timingAdjustment);
      }
      result.push(new Response(times, curr, paramsUsed))
    }
    return result;
  }

  @Query((returns) => [Response], { description: "Provides prayer timings and Islamic date for a given range of days *(start inclusive, end exclusive)*. Start date must be before end date."})
  async range(
    @Arg("params") params: CalculationParams,
    @Arg("start") start: DateInput,
    @Arg("end") end: DateInput
  ) {
    const { timezone, hijriDateAdjustment, timingAdjustment } = params;
    const startDate = this.createDate(timezone, start);
    const endDate = this.createDate(timezone, end);
    const numDays = differenceInDays(endDate, startDate);
    if (numDays <= 0) {
      throw new Error("'start' must be at least one day(s) before 'end'")
    }

    const { prayerTimes, paramsUsed } = await this.initializePrayerTimes(params);
    const result: Response[] = [];
    for (let i = 0; i < numDays; i++) {
      let curr: Date
      if (i === 0) {
        curr = startDate;
      } else {
        curr = add(startDate, { days: i });
      }
      let times = prayerTimes.getTimes(curr, 0, hijriDateAdjustment);
      if (timingAdjustment) {
        times = this.adjustTimes(times, timingAdjustment);
      }
      result.push(new Response(times, curr, paramsUsed))
    }
    return result;
  }
}
