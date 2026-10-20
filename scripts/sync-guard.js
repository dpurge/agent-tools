#!/usr/bin/env node

// Copies adapters/shared/target-guard.mjs (the source of truth) next to each
// host adapter that ships it. Run after editing the source; `npm run build`
// does it too, and scripts/guard-sync.test.js fails when a copy has drifted.

import { GUARD_COPIES, fail, ok, syncGuardModule } from "./lib/install-common.js";

syncGuardModule()
  .then(() => ok(`Synced the guard module to ${GUARD_COPIES.length} locations`))
  .catch(err => {
    fail(err.message);
    process.exit(1);
  });
