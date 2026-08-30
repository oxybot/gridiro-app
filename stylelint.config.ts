// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import type { Config } from "stylelint";

export default {
  extends: ["stylelint-config-standard"],
  rules: {
    "import-notation": "string"
  }
} satisfies Config;
