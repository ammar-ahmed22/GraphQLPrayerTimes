import { InputType, Int, Field, ArgsType, Float, ObjectType } from "type-graphql";
import { Min, Max, Validate } from "class-validator";
import { StringUnion, CannotUseWith, CannotUseWithout } from "./validation";
import {
  ALL_MADHABS,
  Madhab,
  ALL_CALCULATION_AUTHORITIES,
  CalculationAuthorities,
  TimingNames,
  PrayerTimeParams
} from "../helpers/prayerTimes";
import { listTimeZones } from "timezone-support";

type ITimingAdjustment = {
  [K in TimingNames]?: number;
};

@InputType({ description: "The `DateInput` type is used for inputting dates. Year, month and day values must be provided, whereas, hour, minute and second values will be defaulted to `0`."})
export class DateInput {
  @Field((type) => Int)
  public year: number;

  @Field((type) => Int)
  @Min(1)
  @Max(12)
  public month: number;

  @Field((type) => Int)
  @Min(1)
  @Max(31)
  public day: number;

  @Field(type => Int, { defaultValue: 0 })
  @Min(0)
  @Max(23)
  public hour: number;

  @Field(type => Int, { defaultValue: 0 })
  @Min(0)
  @Max(59)
  public minute: number; 

  @Field(type => Int, { defaultValue: 0 })
  @Min(0)
  @Max(59)
  public second: number;
}

export type Angles = {
  fajr: number,
  isha?: number
}

@ObjectType()
export class AnglesType {
  @Field(type => Int)
  public fajr: number;

  @Field(type => Int, { nullable: true })
  public isha?: number;
}

@InputType({ description: "The `AnglesInput` type is used to input custom sun position angles for the Fajr and Isha prayers."})
export class AnglesInput implements Angles {
  @Field((type) => Int)
  public fajr: number;

  @Field((type) => Int)
  public isha: number;
}

@InputType("TimingAdjustmentInput", { description: "The `TimingAdjustmentInput` type is used to input optional adjustments for each prayer timing. Any `Int` value provided for any prayer will increment/decrement that prayer time in minutes." })
@ObjectType({ description: "The `TimingAdjustment` type is used to provide optional adjustments for any of the Islamic prayer times."})
export class TimingAdjustment implements ITimingAdjustment {
  @Field((type) => Int, { nullable: true })
  public Imsak?: number;

  @Field((type) => Int, { nullable: true })
  public Fajr?: number;

  @Field((type) => Int, { nullable: true })
  public Sunrise?: number;

  @Field((type) => Int, { nullable: true })
  public Dhuhr?: number;

  @Field((type) => Int, { nullable: true })
  public Asr?: number;

  @Field((type) => Int, { nullable: true })
  public Maghrib?: number;

  @Field((type) => Int, { nullable: true })
  public Isha?: number;

  @Field((type) => Int, { nullable: true })
  public Midnight?: number;
}



@InputType()
export class CalculationParams {
  @Field((type) => String, { defaultValue: "Shafi", description: "Fiqhi Madhab used to calculate Asr time. The Hanafi method regards Asr time as when the shadow of an object is twice its length. All other madhabs (Shafi) follow the opinion that it is when the shadow is the same length as the object." })
  @Validate(StringUnion, [...ALL_MADHABS])
  public madhab: Madhab;

  @Field(
    (type) => String, 
    { 
      defaultValue: "ISNA", 
      description: "Islamic Authority used to calculate Fajr and Isha times. Each authority has set different angles for the sun's position to calculate Fajr and Isha. Use `Query.authorities` to see all available options with explanations." 
    }
  )
  @Validate(StringUnion, [...ALL_CALCULATION_AUTHORITIES])
  public authority: CalculationAuthorities;

  @Field((type) => Float, { nullable: true, description: "Latitude value to calculate prayer times. Longitude value MUST also be provided." })
  @Validate(CannotUseWithout, ["lat"])
  @Validate(CannotUseWith, ["city", "country"])
  @Min(-90)
  @Max(90)
  public lat?: number;

  @Field((type) => Float, { nullable: true, description: "Longitude value to calculate prayer times. Latitude value MUST also be provided." })
  @Validate(CannotUseWithout, ["lng"])
  @Validate(CannotUseWith, ["city", "country"])
  @Min(-180)
  @Max(180)
  public lng?: number;

  @Field((type) => String, { nullable: true, description: "City name used to find latitude/longitude for calculations. Country **MUST** also be provided" })
  @Validate(CannotUseWithout, ["country"])
  @Validate(CannotUseWith, ["lat", "lng"])
  public city?: string;

  @Field((type) => String, { nullable: true, description: "Country name used to find latitude/longitude for calculations. City **MUST** also be provided" })
  @Validate(CannotUseWithout, ["city"])
  @Validate(CannotUseWith, ["lat", "lng"])
  public country?: string;

  @Field({ description: "Timezone value to calculate prayer times and provide date. Use `Query.timezones` to see all allowed values. E.g. `America/Toronto`", defaultValue: "America/Toronto" })
  @Validate(StringUnion, listTimeZones(), { message: "Text '$value' is not a valid timezone! Use query `timezones` to see all valid options."})
  public timezone: string;

  @Field((type) => AnglesInput, { nullable: true, description: "Optionally define custom sun position angles for Fajr and Isha calculations." })
  public customAngles?: AnglesInput;

  @Field((type) => TimingAdjustment, { nullable: true, description: "Adjust prayer times by x minutes for each time." })
  public timingAdjustment?: TimingAdjustment;

  @Field((type) => Int, { nullable: true, description: "Adjust the Hijri date by x days." })
  public hijriDateAdjustment?: number;
}

export type IParamsUsed = Required<Omit<PrayerTimeParams, "useCustomAngle" | "customAngles" | "tz">> & {
  anglesUsed: Angles,
  timingAdjustment?: ITimingAdjustment,
  hijriDateAdjustment?: number,
  timezone: string,
  dateReadable: string
}

@ObjectType()
export class ParamsUsed implements IParamsUsed {
  constructor(params: IParamsUsed) {
    Object.assign(this, params);
  }
  @Field(type => Float)
  public lat: number

  @Field(type => Float)
  public lng: number;

  @Field(type => String)
  public madhab: Madhab;

  @Field(type => String)
  public authority: CalculationAuthorities

  @Field(type => AnglesType)
  public anglesUsed: AnglesType;

  @Field()
  public timezone: string;

  @Field()
  public dateReadable: string;

  @Field(type => TimingAdjustment, { nullable: true })
  public timingAdjustment?: ITimingAdjustment

  @Field(type => Int, { nullable: true })
  public hijriDateAdjustment?: number
}
