import { readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config()
import path from "path";

const ROOT_URL = process.env.ROOT_URL || "http://localhost:2203/";

const index = readFileSync(path.resolve(__dirname, "index.html"), { encoding: "utf-8" });
const docs = readFileSync(path.resolve(__dirname, "docs.html"), { encoding: "utf-8" });

const insertURL = (html: string, matcher: string, url: string) => {
  return html.replace(matcher, url);
}



export const GraphiQLPlugin = {
  async serverWillStart() {
    return {
      async renderLandingPage() {
        return { html: insertURL(index, "${fetchUrl}", ROOT_URL) }
      }
    }
  }
}

export const DocsPlugin = {
  async serverWillStart() {
    return {
      async renderLandingPage() {
        return { html: insertURL(docs, "${fetchUrl}", ROOT_URL) }
      }
    }
  }
}