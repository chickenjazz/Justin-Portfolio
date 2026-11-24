import { readFileSync } from "node:fs";

export const html = readFileSync(new URL("../../dist/index.html", import.meta.url), "utf8");

export const text = (fragment) =>
  fragment
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

export const section = (id) => {
  const safe = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.match(new RegExp(String.raw`<section[^>]*id="${safe}"[\s\S]*?</section>`))?.[0] ?? "";
};

export const count = (haystack, needle) => haystack.split(needle).length - 1;
