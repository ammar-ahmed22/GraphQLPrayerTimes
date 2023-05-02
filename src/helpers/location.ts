import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

export type Position = {
  lat: number;
  lng: number;
};

/**
 * Gets latitude and longitude given a query string using geocoding
 *
 * @async
 * @param {string} query Geocoding query
 * @returns {Promise<Position | undefined>}
 */
export const getPosition = async (
  query: string
): Promise<Position | undefined> => {
  const uri = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
    query
  )}&limit=4&apiKey=${process.env.HERE_API_KEY}`;
  const resp = await axios.get(uri);
  if (resp.data && resp.data.items && resp.data.items.length > 0) {
    const [item] = resp.data.items;
    return item.position as Position;
  } else {
    console.error(`Could not find co-ordinates for query: "${query}"`);
    return undefined;
  }
};
