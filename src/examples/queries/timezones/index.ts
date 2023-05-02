import { queryAPI } from "../../request";
import fs from "fs";
import path from "path";

const query = `
query Timezones{
  timezones
}
`;

( async () => {
  const data = await queryAPI({
    url: "http://localhost:2203/",
    query,
  })

  fs.writeFileSync(path.resolve(__dirname, "response.json"), JSON.stringify(data, null, 2));
})()



