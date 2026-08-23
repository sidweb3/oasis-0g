import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { downloadZip } from "./download";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/download-source",
  method: "GET",
  handler: downloadZip,
});

export default http;