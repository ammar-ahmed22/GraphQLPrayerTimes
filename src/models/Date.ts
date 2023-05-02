import { ObjectType, Field, Int } from "type-graphql";
import { format } from "date-fns";
import HijriDate, { toHijri } from "hijri-date/lib/safe";
import HijrahDate from "hijrah-date";

@ObjectType({ description: "The `HijriReadable` type provides an Islamic Hijri date value in Arabic and English." })
export class HijriReadable {
  constructor(hd: HijrahDate, flag: string) {
    this.en = hd.format(flag, "en");
    this.ar = hd.format(flag, "ar");
  }

  @Field()
  public en: string;

  @Field()
  public ar: string;
}

@ObjectType({ description: "The `HijriMonth` type provides the Islamic Hijri month as a number from 1-12 as well as in readable format." })
export class HijriMonth {
  constructor(hd: HijrahDate) {
    this.number = hd.getMonth() + 1;
    this.readable = new HijriReadable(hd, "MMMM");
  }
  @Field((returns) => Int, { description: "Integer from 1-12 for the month of the year"})
  public number: number;

  @Field((returns) => HijriReadable, { description: "Readable long-form month in Arabic and English" })
  public readable: HijriReadable;
}

@ObjectType({ description: "The `Hijri` type provides the Islamic Hijri date in various formats."})
export class Hijri {
  constructor(d: Date, adjustment?: number) {
    let hd: HijrahDate = new HijrahDate(d);
    if (adjustment) {
      if (adjustment > 0) {
        hd = hd.plusDays(adjustment)
      } else {
        console.log("minusDays");
        hd = hd.minusDays(Math.abs(adjustment))
      }
    }
    this.readable = hd.format("fullDate", "en");
    this.year = hd.getFullYear();
    this.month = new HijriMonth(hd);
    this.date = hd.getDate();
    this.day = new HijriReadable(hd, "EEEE")
  }

  @Field({ description: "Readable Hijri date in the format: Thursday, Shawwal 7, 1444"})
  public readable: string;

  @Field((returns) => Int, { description: "Integer Hijri year value. E.g. 1443"})
  public year: number;

  @Field((returns) => HijriMonth, { description: "Hijri month in various formats" })
  public month: HijriMonth;

  @Field((returns) => Int, { description: "Integer day of the month" })
  public date: number;

  @Field((returns) => HijriReadable, { description: "Day of the week in arabic and english" })
  public day: HijriReadable;
}

@ObjectType({ description: "The `GregorianMonth` type provides the Gregorian month as number from 1-12 as well as in it's long form. E.g. `January`" })
export class GregorianMonth {
  constructor(d: Date) {
    this.number = d.getMonth() + 1;
    this.readable = format(d, "LLLL")
  }
  @Field((returns) => Int, { description: "Integer from 1-12 for the month of the year" })
  public number: number;

  @Field({ description: "Readable long-form month of the year. E.g. September, October, etc."})
  public readable: string;
}

@ObjectType({ description: "The `Gregorian` type provides a Gregorian date in various formats." })
export class Gregorian {
  constructor(d: Date) {
    this.readable = format(d, "EEEE, LLLL do, yyyy");
    this.year = d.getFullYear();
    this.month = new GregorianMonth(d);
    this.date = d.getDate();
    this.day = format(d, "EEEE")
  }
  @Field({ description: "Readable date in the format: Thursday, April 27th, 2023"})
  public readable: string;

  @Field((returns) => Int, { description: "Integer value for the year" })
  public year: number;

  @Field((returns) => GregorianMonth, { description: "Month in various formats" })
  public month: GregorianMonth;

  @Field((returns) => Int, { description: "Date of the month" })
  public date: number;

  @Field({ description: "String day of the week E.g. Wednesday" })
  public day: string;
}

@ObjectType({ description: "The `DateType` type provides a date in Gregorian format, Hijri format and as a timestamp." })
export class DateType {
  constructor (d: Date, hijriAdjustment?: number) {
    this.timestamp = d;
    this.gregorian = new Gregorian(d);
    this.hijri = new Hijri(d, hijriAdjustment);
  }
  @Field()
  public timestamp: Date;

  @Field((returns) => Gregorian, { description: "Gregorian date" })
  public gregorian: Gregorian;

  @Field((returns) => Hijri, { description: "Islamic Hijri date" })
  public hijri: Hijri;
}
