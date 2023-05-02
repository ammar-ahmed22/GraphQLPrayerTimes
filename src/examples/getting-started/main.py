# install with pip if not already installed
import requests;

# Defining the GraphQL query in a multi-line string
query = """
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
"""


variables = {
    "city": "Toronto",
    "country": "Canada"
}

url = "http://localhost:2203/"

response = requests.post(
    url,
    json = {
      "query": query,
      "variables": variables
    }
)

print(response.json())