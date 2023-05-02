import { queryAPI } from "../../request";
import fs from "fs";
import path from "path";

const query = `
query JanuaryFajrTime(
  $params: CalculationParams!, 
  $month: Int
) {
  month(params: $params, month: $month) {
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
  month: 1
};

( async () => {
  const data = await queryAPI({
    url: "http://localhost:2203/",
    query,
    variables
  })

  fs.writeFileSync(path.resolve(__dirname, "response.json"), JSON.stringify(data, null, 2));
})()



