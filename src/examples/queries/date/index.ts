import { queryAPI } from "../../request";

const query = `
query FiveDailyPrayers(
  $params: CalculationParams!, 
  $date: DateInput
) {
  date(params: $params, date: $date) {
      timings {
          Fajr { ...readableTime }
          Dhuhr { ...readableTime }
          Asr { ...readableTime }
          Maghrib { ...readableTime }
          Isha { ...readableTime }
      }
      date {
          hijri {
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
`;


const variables = {
  params: {
    city: "Toronto",
    country: "Canada"
  },
  date: {
      year: 2023,
      month: 3,
      day: 22
  }
};

( async () => {
  const data = await queryAPI({
    url: "http://localhost:2203/",
    query,
    variables
  })

  console.log(JSON.stringify(data, null, 2));
})()