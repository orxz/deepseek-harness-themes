---
"@dshthemes/core": patch
"@dshthemes/ui": patch
---

Keep the settings schema out of the browser bundle so the picker loads. The durable schema is built with `@deepseek-ai/schemastery`, a host package the web shell does not seed into the browser plugin module table, and the client entry reached it through the shared preference module — so the loader rejected the whole plugin with "missed the module table" and no Theme row ever appeared. The schema now lives in a Node-only module, and the packaged client bundle is validated against the browser module table so a future host import fails the release instead of the page.
