// Defining our GraphQL query in a multi-line string.
// Can also be stored in a .graphql or .gql file and read from there
const query: string = `
  query (
    $city: String!
    $country: String!
  ) {
    date(params: { city: $city, country: $country }) {
      timings {
        Fajr { ...readable }
        Dhuhr { ...readable }
        Asr { ...readable }
        Maghrib { ...readable }
        Isha { ...readable }
      }
      date { ...readableHijri }
    }
  }

  fragment readable on Timing {
    readable {
      default
    }
  }

  fragment readableHijri on DateType {
    hijri {
      readable
    }
  }
`

const variables = {
  city: "Toronto",
  country: "Canada"
};

// Defining the configuration required for our API request.
const url: string = "http://localhost:2203/";
const options: RequestInit = {
  method: "POST",
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
      query: query,
      variables: variables
  })
};

// Making the request
fetch(url, options)
  .then(handleResponse)
  .then(handleData)
  .catch(handleError)

function handleResponse(response: Response): Promise<any> {
  return response.json().then((json) => response.ok ? json : Promise.reject(json))
}

function handleData(data: any): void {
  console.log(JSON.stringify(data, null, 2)); // outputting the data in a readable format
}

function handleError(err: unknown): void {
  console.error(err);
}