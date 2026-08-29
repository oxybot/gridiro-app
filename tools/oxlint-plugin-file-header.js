// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

const headerLinePattern = /^\s*(?:\/\/\s*)?(Copyright\b.*|SPDX-License-Identifier:.*)$/;

function isValidSetting(value, prefix) {
  return typeof value === "string" && value.startsWith(prefix) && value.length > prefix.length;
}

function getHeaderLines(source) {
  return source.split(/\r?\n/).flatMap((line, index) => {
    const match = line.match(headerLinePattern);
    return match ? [{ index, value: match[1] }] : [];
  });
}

const requireSpdx = {
  meta: {
    type: "suggestion",
    docs: {
      description: "require configured copyright and SPDX identifiers in the file header",
    },
    schema: [],
    fixable: "code",
    messages: {
      missingCopyright: "File header must include '{{ expected }}'.",
      incorrectCopyright: "Copyright header must be '{{ expected }}'.",
      missingSpdx: "File header must include '{{ expected }}'.",
      incorrectSpdx: "SPDX header must be '{{ expected }}'.",
      invalidConfiguration: "fileHeader settings must define non-empty 'copyright' and 'spdx' strings beginning with 'Copyright' and 'SPDX-License-Identifier:'.",
    },
  },
  create(context) {
    const headerSettings = context.settings.fileHeader;
    const requiredCopyright = headerSettings?.copyright;
    const requiredSpdx = headerSettings?.spdx;
    const hasValidConfiguration = isValidSetting(requiredCopyright, "Copyright")
      && isValidSetting(requiredSpdx, "SPDX-License-Identifier:");

    return {
      Program(node) {
        if (!hasValidConfiguration) {
          context.report({ node, messageId: "invalidConfiguration" });
          return;
        }

        const source = context.sourceCode.text;
        const headerLines = getHeaderLines(source);
        const copyright = headerLines.find(({ value }) => value.startsWith("Copyright"));
        const spdx = headerLines.find(({ value }) => value.startsWith("SPDX-License-Identifier:"));

        if (!copyright && !spdx) {
          context.report({
            node,
            messageId: "missingCopyright",
            data: { expected: requiredCopyright },
            fix(fixer) {
              const shebang = source.match(/^#!.*(?:\r?\n|$)/)?.[0] ?? "";
              const header = `// ${requiredCopyright}\n// ${requiredSpdx}\n\n`;
              return fixer.insertTextAfterRange([0, shebang.length], header);
            },
          });
          return;
        }

        if (!copyright) {
          context.report({ node, messageId: "missingCopyright", data: { expected: requiredCopyright } });
        } else if (copyright.value !== requiredCopyright) {
          context.report({ node, messageId: "incorrectCopyright", data: { expected: requiredCopyright } });
        }

        if (!spdx) {
          context.report({ node, messageId: "missingSpdx", data: { expected: requiredSpdx } });
        } else if (spdx.value !== requiredSpdx) {
          context.report({ node, messageId: "incorrectSpdx", data: { expected: requiredSpdx } });
        }
      },
    };
  },
};

export default {
  meta: {
    name: "file-header",
  },
  rules: {
    "require-spdx": requireSpdx,
  },
};