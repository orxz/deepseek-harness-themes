import { clientBundle } from "../../build/client-bundle.ts";

// The core package is a pure data/function library (frozen theme definitions
// plus one registration helper) with no cross-plugin runtime identity, so it
// is inlined into the picker bundle — the same inlining rule the host applies
// to its wire/type layers. Users mount only this package; core ships as a
// standalone row for compositions that want themes without the picker.
export default clientBundle("@dsh-themes/ui", "src/index.ts", "src/client.ts", {
  bundledDependencies: ["@dsh-themes/core", "clsx"],
});
