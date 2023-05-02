import { Resolver, Query, ObjectType, Field } from "type-graphql";
import { listTimeZones } from "timezone-support"
import { CalculationAuthorities, ALL_CALCULATION_AUTHORITIES } from "../helpers/prayerTimes";


@ObjectType({ description: "The `Option` type is used to provide more detailed explanations for options."})
export class Option {
  constructor(value: string, fullName?: string, explanation?: string) {
    this.value = value;
    this.fullName = fullName;
    this.explanation = explanation;
  }
  @Field()
  public value: string;

  @Field({ nullable: true })
  public fullName?: string;

  @Field({ nullable: true })
  public explanation?: string;
}

@Resolver()
export class ParametersResolver {

  private authoritiesMetadata: { 
    [K in CalculationAuthorities]: {
      fullName: string,
      explanation: string
    }
  } = {
    MWL: {
      fullName: "Muslim World League",
      explanation: "18 degree Fajr angle, 17 degree Isha angle"
    },
    ISNA: {
      fullName: "Islamic Society of North America",
      explanation: "15 degree Fajr angle, 15 degree Isha angle"
    },
    EGAS: {
      fullName: "Egyptian General Authority of Survey",
      explanation: "19.5 degree Fajr angle, 17.5 degree Isha angle"
    },
    UQUM: {
      fullName: "Umm al-Qura University, Makkah",
      explanation: "18.5 degree Fajr angle, Isha is 90 min after maghrib during Ramadan, 120 min otherwise"
    },
    UISK: {
      fullName: "University of Islamic Sciences, Karachi",
      explanation: "18 degree Fajr angle, 18 degree Isha angle"
    }, 
    IGUT: {
      fullName: "Institute of Geophysics, University of Tehran",
      explanation: "17.7 degree Fajr angle, 14 degree Isha angle (not explicitly defined)"
    }, 
    SIA: {
      fullName: "Shia Ithna Ashari, Leva Research Institute, Qum",
      explanation: "16 degree Fajr angle, 14 degree Fajr angle. Maghrib also follows later time due to Shia madhab"
    }
  }

  @Query(returns => [String], { description: "Provides all allowed values for timezones."})
  timezones() {
    return listTimeZones()
  }

  @Query(returns => [Option], { description: "Provides all allowed values for calculation authorities as well as detailed explanations." })
  authorities() {
    return ALL_CALCULATION_AUTHORITIES.map((auth: CalculationAuthorities) => {
      const metadata = this.authoritiesMetadata[auth];
      return new Option(auth, metadata.fullName, metadata.explanation);
    })
  }
}