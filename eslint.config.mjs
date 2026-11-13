import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * Tailwind arbitrary values such as max-w-[42rem], data-[open=true]: and
 * [overflow-wrap:anywhere], and arbitrary variants such as [&_svg]:size-4.
 * Use a theme token or a built-in Tailwind v4 utility instead, or add one to
 * src/app/globals.css. See AGENTS.md.
 */
const ARBITRARY_TAILWIND = String.raw`/[a-z0-9]-\[|(^|[\s:!])\[([a-z-]+:|[&@])/`;
const arbitraryTailwindMessage =
  "Avoid Tailwind arbitrary values and variants. Use a theme token or a built-in Tailwind v4 utility, or add one to src/app/globals.css (see AGENTS.md).";
const ARBITRARY_TAILWIND_SYNTAX = [
  {
    selector: `Literal[value=${ARBITRARY_TAILWIND}]`,
    message: arbitraryTailwindMessage,
  },
  {
    selector: `TemplateElement[value.raw=${ARBITRARY_TAILWIND}]`,
    message: arbitraryTailwindMessage,
  },
];

/** Functions that merge class lists; their arguments are class lists too. */
const CLASS_HELPERS = new Set(["cn", "clsx", "twMerge"]);

/**
 * The project's own rules, for conventions ESLint has no rule for.
 * no-inline-regex: regular expressions live in regex modules, each named for
 * what it matches.
 * no-class-constants: a look used in more than one place is a component, not
 * a class list in a constant or a class-names module.
 * See AGENTS.md.
 */
const toyBox = {
  rules: {
    "no-inline-regex": {
      meta: {
        type: "suggestion",
        docs: {
          description:
            "Keep regular expressions in a regex module, named for what they match.",
        },
        messages: {
          inline:
            "Move this regular expression into a regex module (src/utils/regex.ts, or the feature's own regex.ts), name it, and import it (see AGENTS.md).",
        },
        schema: [],
      },
      create(context) {
        const report = (node) => context.report({ node, messageId: "inline" });
        return {
          "Literal[regex]": report,
          "NewExpression[callee.name='RegExp']": report,
          "CallExpression[callee.name='RegExp']": report,
        };
      },
    },
    "no-class-constants": {
      meta: {
        type: "suggestion",
        docs: {
          description:
            "Give a look used in more than one place a component, not a class list in a constant or imported from another module.",
        },
        messages: {
          imported:
            "'{{name}}' is a class list from another module. Make the look a component and render it instead (see AGENTS.md).",
          constant:
            "'{{name}}' keeps a class list in a constant. Make the look a component, or a child component when one parent repeats it (see AGENTS.md).",
        },
        schema: [],
      },
      create(context) {
        const followed = new Set();

        const findVariable = (scope, name) => {
          for (let current = scope; current; current = current.upper) {
            const variable = current.set.get(name);
            if (variable) return variable;
          }
          return null;
        };
        const unwrap = (node) =>
          node?.type === "TSAsExpression" ||
          node?.type === "TSSatisfiesExpression"
            ? unwrap(node.expression)
            : node;
        const mergesClasses = (node) =>
          node?.type === "CallExpression" &&
          node.callee.type === "Identifier" &&
          CLASS_HELPERS.has(node.callee.name);
        const holdsClasses = (init) => {
          const value = unwrap(init);
          if (value?.type === "Literal") return typeof value.value === "string";
          return value?.type === "TemplateLiteral" || mergesClasses(value);
        };

        function checkName(identifier) {
          const scope = context.sourceCode.getScope(identifier);
          const variable = findVariable(scope, identifier.name);
          const definition = variable?.defs[0];
          const data = { name: identifier.name };
          if (definition?.type === "ImportBinding") {
            context.report({ node: identifier, messageId: "imported", data });
            return;
          }
          if (definition?.type !== "Variable") return;
          const { init } = definition.node;
          if (!holdsClasses(init)) return;
          if (
            variable.scope.type === "module" ||
            variable.scope.type === "global"
          ) {
            context.report({ node: identifier, messageId: "constant", data });
            return;
          }
          // A local list built during render: check what it is built from.
          if (followed.has(definition.node)) return;
          followed.add(definition.node);
          visit(unwrap(init));
        }

        function visit(node) {
          switch (node?.type) {
            case "Identifier":
              checkName(node);
              break;
            case "TemplateLiteral":
              node.expressions.forEach(visit);
              break;
            case "ConditionalExpression":
              visit(node.consequent);
              visit(node.alternate);
              break;
            case "LogicalExpression":
              if (node.operator !== "&&") visit(node.left);
              visit(node.right);
              break;
            case "ArrayExpression":
              node.elements.forEach(visit);
              break;
            case "CallExpression":
              if (mergesClasses(node)) node.arguments.forEach(visit);
              break;
            default:
              break;
          }
        }

        return {
          JSXAttribute(node) {
            const name =
              node.name.type === "JSXIdentifier" ? node.name.name : "";
            if (name !== "className" && !name.endsWith("ClassName")) return;
            if (node.value?.type === "JSXExpressionContainer") {
              visit(node.value.expression);
            }
          },
        };
      },
    },
  },
};

/** Where regular expressions are written. */
const REGEX_MODULES = ["src/utils/regex.ts", "src/lib/features/*/regex.ts"];

/**
 * Files written before these rules, or before a rule grew to catch what they
 * do. Each rule stays off for the files listed under it until the file is
 * brought up to standard; then delete its line. Never add a file here: new
 * code follows the rules.
 */
const LEGACY = {
  arbitraryTailwind: [
    "src/app/[[]locale]/page.tsx",
    "src/components/site/site-footer.tsx",
    "src/components/site/tool-shell.tsx",
    "src/components/site/toy-theme-toggle.tsx",
    "src/lib/features/dinner/dinner-result/index.tsx",
    "src/lib/features/dinner/dinner-roulette/index.tsx",
    "src/lib/features/dinner/dinner-roulette/roulette-wheel-svg.tsx",
    "src/lib/features/dinner/dinner-selections/index.tsx",
    "src/lib/features/dinner/dinner-tool.tsx",
    "src/lib/features/duration/components/add-duration-button/index.tsx",
    "src/lib/features/duration/components/copy-all-durations-button/index.tsx",
    "src/lib/features/duration/components/date-calendar/index.tsx",
    "src/lib/features/duration/components/delete-duration-dialog/index.tsx",
    "src/lib/features/duration/components/duration-widget/index.tsx",
    "src/lib/features/duration/components/duration-widget/widget-menu.tsx",
    "src/lib/features/duration/components/edit-duration-dialog/index.tsx",
    "src/lib/features/duration/components/import-durations-button/index.tsx",
    "src/lib/features/duration/components/sort-controls/index.tsx",
    "src/lib/features/duration/duration-tool.tsx",
    "src/lib/features/sponsorship/sponsorship-tool.tsx",
    "src/lib/features/translate/translate-tool.tsx",
  ],
  nestedTernary: [
    "src/components/select/type-select/type-select.tsx",
    "src/i18n/locales.ts",
    "src/lib/features/sponsorship/sponsorship-tool.tsx",
  ],
  multipleComponents: ["src/lib/features/sponsorship/sponsorship-tool.tsx"],
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { plugins: { "toy-box": toyBox } },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // One component per file, so every component has a home and a name.
      "react/no-multi-comp": ["error", { ignoreStateless: false }],
      // Use a lookup object, an early return or a small function instead.
      "no-nested-ternary": "error",
      "toy-box/no-inline-regex": "error",
      "toy-box/no-class-constants": "error",
      "no-restricted-syntax": ["error", ...ARBITRARY_TAILWIND_SYNTAX],
    },
  },
  {
    // view/ holds pure helpers. Whatever renders is a component.
    files: ["src/lib/features/*/view/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...ARBITRARY_TAILWIND_SYNTAX,
        {
          selector: "JSXElement, JSXFragment",
          message:
            "view/ holds pure helpers. Render this from a component in components/ instead (see AGENTS.md).",
        },
      ],
    },
  },
  {
    // shadcn/ui primitives are generated code and keep their own style.
    files: ["src/components/ui/**"],
    rules: {
      "react/no-multi-comp": "off",
      "no-restricted-syntax": "off",
      "toy-box/no-class-constants": "off",
    },
  },
  {
    // Tests may define small wrapper components and text matchers inline.
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "react/no-multi-comp": "off",
      "toy-box/no-inline-regex": "off",
    },
  },
  {
    files: REGEX_MODULES,
    rules: { "toy-box/no-inline-regex": "off" },
  },
  { files: LEGACY.arbitraryTailwind, rules: { "no-restricted-syntax": "off" } },
  { files: LEGACY.nestedTernary, rules: { "no-nested-ternary": "off" } },
  {
    files: LEGACY.multipleComponents,
    rules: { "react/no-multi-comp": "off" },
  },
];

export default eslintConfig;
