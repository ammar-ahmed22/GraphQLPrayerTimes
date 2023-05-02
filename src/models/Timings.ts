import { Field, ObjectType, Int } from "type-graphql";
import { format } from "date-fns";
import { TimingNames, Times } from "../helpers/prayerTimes";

@ObjectType({ description: "The `Numerical` type express a time numerically in hours and minutes. "})
export class Numerical {
  constructor(d: Date) {
    this.hour = d.getHours();
    this.minute = d.getMinutes();
  }

  @Field(returns => Int)
  public hour: number;

  @Field(returns => Int)
  public minute: number;
}

@ObjectType({ description: "The `Readable` type provides a time in military format, default AM/PM format and numerically. E.g. `1:32 PM`, `13:32` and `{ hour: 13, minute: 32 }`"})
export class Readable {
  constructor(d: Date) {
    this.military = format(d, "H:mm");
    this.default = format(d, "p");
    this.numerical = new Numerical(d);
  }
  @Field()
  public military: string;

  @Field()
  public default: string;

  @Field(returns => Numerical)
  public numerical: Numerical
}

@ObjectType({ description: "The `Timing` type provides a timing as a timestamp as well as in readable format."})
export class Timing {
  constructor(d: Date) {
    this.timestamp = d;
    this.readable = new Readable(d)
  }
  @Field()
  public timestamp: Date;

  @Field((returns) => Readable)
  public readable: Readable;
}

type ITimings = {
  [K in TimingNames]: Timing;
};

@ObjectType({ description: "The `Timings` type provides all the timings pertinent to Islamic prayers."})
export class Timings implements ITimings {
  constructor(times: Times) {
    Object.keys(times).forEach((tn: TimingNames) => {
      this[tn] = new Timing(times[tn]);
    })
  }

  @Field((returns) => Timing)
  public Imsak: Timing;

  @Field((returns) => Timing)
  public Fajr: Timing;

  @Field((returns) => Timing)
  public Sunrise: Timing;

  @Field((returns) => Timing)
  public Dhuhr: Timing;

  @Field((returns) => Timing)
  public Asr: Timing;

  @Field((returns) => Timing)
  public Maghrib: Timing;

  @Field((returns) => Timing)
  public Isha: Timing;

  @Field((returns) => Timing)
  public Midnight: Timing;
}
