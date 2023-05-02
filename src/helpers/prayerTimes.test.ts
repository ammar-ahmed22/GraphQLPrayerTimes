import { PrayerTimes, TimingNames } from "./prayerTimes";
import axios from "axios";

const pt = new PrayerTimes({
  lat: 43.879841,
  lng: -78.942207,
  tz: -4,
  authority: "ISNA",
  madhab: "Hanafi",
});

const WHITBY = {
  lat: 43.879841,
  lng: -78.942207,
  tz: -4,
};

test("Check if calculated prayer times match Al-Adhan API", async () => {
  const d = new Date();
  const uri = `http://api.aladhan.com/v1/timings/${d.getDate()}-${
    d.getMonth() + 1
  }-${d.getFullYear()}?latitude=${WHITBY.lat}&longitude=${
    WHITBY.lng
  }&timezone=America/Toronto&school=1&method=2`;
  console.log(uri);
  const { data } = await axios.get(uri);
  const { timings } = data.data;
  const calc = pt.getTimes();
  for (let name in calc) {
    let n = name as TimingNames;
    const calculated = calc[n];
    const [hour, minute] = timings[name].split(":").map((s) => parseInt(s));
    const cHour = calculated.getHours();
    const cMin = calculated.getMinutes();
    expect(cHour).toBe(hour);

    // Allowing for it to be +-2 minute off
    expect(cMin).toBeGreaterThanOrEqual(minute - 2);
    expect(cMin).toBeLessThanOrEqual(minute + 2);
  }
});
