import { createInstrumentedFetch } from "@/apiRequestTelemetry";
import PocketBase from "pocketbase";

export const pb = new PocketBase("https://pb3.jorgeadolfo.com");
pb.autoCancellation(false);

const pocketBaseFetch = createInstrumentedFetch("pocketbase");

pb.beforeSend = (url, options) => ({
  url,
  options: {
    ...options,
    fetch: options.fetch
      ? createInstrumentedFetch("pocketbase", { fetchImpl: options.fetch })
      : pocketBaseFetch,
  },
});
