import { readFile, readdir, stat } from "node:fs/promises";
import { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";

const DIR_2_ROUTE_ROOT = process.env.DIR_2_ROUTE_ROOT || "public";

const pageRoutes = {};
async function addPagePath(route: string, path: string) {
  if (route === "") route = "/";
  const document = await readFile(path, "utf-8");
  pageRoutes[route] = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(document); 
  }
}

async function dirCrawler(currDir: string) {
  const pagePath = join(currDir, "index.html");
  
  // check if index.html exists
  // if it does add it to the pages object
  if ((await stat(pagePath)).isFile()) {
    addPagePath(currDir.split(DIR_2_ROUTE_ROOT)[1].replace(/\$/g, ""), pagePath);
  }

  // filter entities starts with $ sign
  const routeDirs = (await readdir(currDir)).filter((routeDir: string) =>
    routeDir.startsWith("$")
  );

  // iterate through all the entities started with $ sign
  // if the entity is a directory, recursively call dirCrawler
  for (let routeDir of routeDirs) {
    const routePath = join(currDir, routeDir);
    if ((await stat(routePath)).isDirectory()) {
      await dirCrawler(routePath);
    }
  }
}

export async function dir2route() {
  const workDir = process.cwd();
  const pageRoutesDir = join(workDir, DIR_2_ROUTE_ROOT);
  if ((await stat(pageRoutesDir)).isDirectory()) {
    await dirCrawler(pageRoutesDir);
  }
  
  return pageRoutes
}