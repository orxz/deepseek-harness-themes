import { clientBundle } from "../../build/client-bundle.ts";

export default clientBundle(
  "@dsh-themes/core",
  "src/index.ts",
  "src/client.ts",
);
