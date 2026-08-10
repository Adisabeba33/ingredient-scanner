import type { MetadataRoute } from "next";

/**
 * Nothing here is for anybody who isn't holding the admin token.
 *
 * This is the opposite of the work that went into ingredient.help's crawler
 * metadata, and it is here for the same reason that work exists. This tool is
 * deployed on its own host, it carries the same name and the same palette as
 * the consumer site, and every page of it is a capture screen that would read
 * — to a search engine and to a person who found it — as a stray, broken
 * corner of the real product. A brand search that surfaces the staff entrance
 * costs the front door a click.
 *
 * The root layout already sends `noindex, nofollow` in the page metadata, and
 * that remains the instruction that actually removes a page from an index —
 * `Disallow` only stops the fetch. Both are stated because they fail
 * differently: a crawler that ignores robots.txt still reads the meta tag, and
 * a crawler that reaches a page before the app has rendered still reads this
 * file. Neither is what protects the tool. `ADMIN_TOKEN` does that.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
    // No sitemap. There is nothing here anybody should be led to.
  };
}
