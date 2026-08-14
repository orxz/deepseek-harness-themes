---
"@dshthemes/core": patch
"@dshthemes/ui": patch
---

Declare every peer dependency optional so installing into a profile is quiet and complete. The harness supplies cordis, schemastery, React, and the client runtime through its own module table, and the picker bundle inlines the theme catalog, so none of them belong in a profile's `node_modules`. pnpm previously reported them as missing peers and advised installing them — advice that is unnecessary for the host modules and actively wrong for `@dshthemes/core`, whose bundle row would register the same theme ids a second time and throw.
