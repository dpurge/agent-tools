#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);

const workspace =
  args.find(a => a.startsWith("--workspace="))
    ?.split("=")[1]
    ?? process.cwd();

const maxDepth =
  Number(
    args.find(a => a.startsWith("--depth="))
      ?.split("=")[1]
  )
  || 3;

const ignored = new Set([
  ".git",
  "node_modules",
  ".venv",
  "dist",
  "build",
  ".next",
  "coverage"
]);

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function analyzeStructure(dir, depth = 0) {
  if (depth > maxDepth) {
    return null;
  }

  const result = {
    name: path.basename(dir),
    type: "directory",
    children: []
  };

  const entries =
    await fs.readdir(
      dir,
      { withFileTypes: true }
    );

  for (const entry of entries) {
    if (ignored.has(entry.name)) {
      continue;
    }

    const fullPath =
      path.join(
        dir,
        entry.name
      );

    if (entry.isDirectory()) {
      const child =
        await analyzeStructure(
          fullPath,
          depth + 1
        );

      if (child) {
        result.children.push(child);
      }
    } else {
      result.children.push({
        name: entry.name,
        type: "file"
      });
    }
  }

  return result;
}

async function findFiles(dir, matcher) {
  const result = [];

  if (!(await exists(dir))) {
    return result;
  }

  const entries =
    await fs.readdir(
      dir,
      { withFileTypes: true }
    );

  for (const entry of entries) {
    if (ignored.has(entry.name)) {
      continue;
    }

    const fullPath =
      path.join(
        dir,
        entry.name
      );

    if (entry.isDirectory()) {
      result.push(
        ...(await findFiles(
          fullPath,
          matcher
        ))
      );
      continue;
    }

    if (matcher(entry.name)) {
      result.push(fullPath);
    }
  }

  return result;
}

async function detectLanguages() {
  const files =
    await findFiles(
      workspace,
      file =>
        /\.(js|ts|jsx|tsx|py|go|java|rs|cs|cpp|c|rb|php)$/
          .test(file)
    );

  const extensions =
    new Set(
      files.map(file =>
        path.extname(file)
      )
    );

  const map = {
    ".js": "JavaScript",
    ".ts": "TypeScript",
    ".jsx": "JavaScript React",
    ".tsx": "TypeScript React",
    ".py": "Python",
    ".go": "Go",
    ".java": "Java",
    ".rs": "Rust",
    ".cs": "C#",
    ".cpp": "C++",
    ".c": "C",
    ".rb": "Ruby",
    ".php": "PHP"
  };

  return [
    ...extensions
  ]
    .map(ext => map[ext])
    .filter(Boolean);
}

async function readJson(file) {
  if (!(await exists(file))) {
    return null;
  }

  try {
    return JSON.parse(
      await fs.readFile(
        file,
        "utf8"
      )
    );
  } catch {
    return null;
  }
}

async function detectDependencies() {
  const dependencies = {};

  const packageJson =
    await readJson(
      path.join(
        workspace,
        "package.json"
      )
    );

  if (packageJson) {
    dependencies.javascript = {
      packageManager: "npm",
      dependencies: {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }
    };
  }

  const pyproject =
    await exists(
      path.join(
        workspace,
        "pyproject.toml"
      )
    );

  if (pyproject) {
    dependencies.python = {
      packageManager: "pip",
      source: "pyproject.toml"
    };
  }

  const goMod =
    await exists(
      path.join(
        workspace,
        "go.mod"
      )
    );

  if (goMod) {
    dependencies.go = {
      packageManager: "go modules"
    };
  }

  return dependencies;
}

async function detectFrameworks() {
  const frameworks = [];

  const packageJson =
    await readJson(
      path.join(
        workspace,
        "package.json"
      )
    );

  const deps = {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {})
  };

  const known = {
    react: "React",
    next: "Next.js",
    vue: "Vue",
    angular: "Angular",
    express: "Express",
    nestjs: "NestJS",
    vite: "Vite"
  };

  for (const key of Object.keys(known)) {
    if (deps[key]) {
      frameworks.push(
        known[key]
      );
    }
  }

  return frameworks;
}

async function main() {
  const result = {
    repository: path.basename(workspace),

    workspace,

    structure:
      await analyzeStructure(
        workspace
      ),

    languages:
      await detectLanguages(),

    frameworks:
      await detectFrameworks(),

    dependencies:
      await detectDependencies(),

    patterns: [],

    recommendations: []
  };

  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
}

main()
  .catch(error => {
    console.error(
      JSON.stringify(
        {
          error: error.message
        },
        null,
        2
      )
    );

    process.exit(1);
  });