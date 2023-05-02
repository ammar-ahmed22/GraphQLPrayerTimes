import { queryAPI } from "../../request";
import fs from "fs";
import path from "path";

const query = `
query WeeklyFajrTime(
  $params: CalculationParams!, 
  $start: DateInput!,
  $end: DateInput!
) {
  range(params: $params, start: $start, end: $end) {
      timings {
          Fajr { ...readableTime }
      }
      date {
          hijri {
              readable
          }
          gregorian {
              readable
          }
      }
      params {
          lat
          lng
      }
  }
}

fragment readableTime on Timing {
  readable { 
      default
  }
}
`

const variables = {
  params: {
    city: "Toronto",
    country: "Canada"
  },
  start: {
    year: 2023,
    month: 1,
    day: 1
  },
  end: {
    year: 2023,
    month: 1,
    day: 7
  }
};

( async () => {
  const data = await queryAPI({
    url: "http://localhost:2203/",
    query,
    variables
  })

  fs.writeFileSync(path.resolve(__dirname, "response.json"), JSON.stringify(data, null, 2));
})()



