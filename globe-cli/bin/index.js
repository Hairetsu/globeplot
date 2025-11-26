#!/usr/bin/env node

const { Command } = require("commander");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const prompts = require("prompts");

const program = new Command();

program
  .name("globeplot")
  .description("Add the Globe component to your Next.js project")
  .version("1.0.0");

program
  .command("add")
  .description("Add the Globe component and assets to your project")
  .action(async () => {
    console.log(chalk.blue("Adding Globe component..."));

    const cwd = process.cwd();
    const componentsDir = path.join(cwd, "components");
    const publicDir = path.join(cwd, "public");

    // Define source and destination paths
    const globeSource = path.join(__dirname, "../templates/globe.tsx");
    const globeDest = path.join(componentsDir, "globe.tsx");

    const breakdownSource = path.join(
      __dirname,
      "../templates/global-breakdown.tsx"
    );
    const breakdownDest = path.join(componentsDir, "global-breakdown.tsx");

    const imageSource = path.join(__dirname, "../templates/earth-map.jpg");
    const imageDest = path.join(publicDir, "earth-map.jpg");

    // Check if directories exist
    if (!fs.existsSync(componentsDir)) {
      const response = await prompts({
        type: "confirm",
        name: "createDir",
        message: 'The "components" directory does not exist. Create it?',
        initial: true,
      });
      if (!response.createDir) {
        console.log(chalk.red("Operation cancelled."));
        return;
      }
      await fs.ensureDir(componentsDir);
    }

    if (!fs.existsSync(publicDir)) {
      // Usually public exists in Next.js, but good to check
      await fs.ensureDir(publicDir);
    }

    // Install globe.tsx
    if (fs.existsSync(globeDest)) {
      const response = await prompts({
        type: "confirm",
        name: "overwrite",
        message: "components/globe.tsx already exists. Overwrite?",
        initial: false,
      });
      if (!response.overwrite) {
        console.log(chalk.yellow("Skipping globe.tsx..."));
      } else {
        await fs.copy(globeSource, globeDest);
        console.log(chalk.green("✓ Updated components/globe.tsx"));
      }
    } else {
      await fs.copy(globeSource, globeDest);
      console.log(chalk.green("✓ Created components/globe.tsx"));
    }

    // Install global-breakdown.tsx
    if (fs.existsSync(breakdownDest)) {
      const response = await prompts({
        type: "confirm",
        name: "overwrite",
        message: "components/global-breakdown.tsx already exists. Overwrite?",
        initial: false,
      });
      if (!response.overwrite) {
        console.log(chalk.yellow("Skipping global-breakdown.tsx..."));
      } else {
        await fs.copy(breakdownSource, breakdownDest);
        console.log(chalk.green("✓ Updated components/global-breakdown.tsx"));
      }
    } else {
      await fs.copy(breakdownSource, breakdownDest);
      console.log(chalk.green("✓ Created components/global-breakdown.tsx"));
    }

    if (fs.existsSync(imageDest)) {
      const response = await prompts({
        type: "confirm",
        name: "overwrite",
        message: "public/earth-map.jpg already exists. Overwrite?",
        initial: false,
      });
      if (!response.overwrite) {
        console.log(chalk.yellow("Skipping earth-map.jpg..."));
      } else {
        await fs.copy(imageSource, imageDest);
        console.log(chalk.green("✓ Updated public/earth-map.jpg"));
      }
    } else {
      await fs.copy(imageSource, imageDest);
      console.log(chalk.green("✓ Created public/earth-map.jpg"));
    }

    console.log(chalk.blue("\nSuccess! Globe components added."));
    console.log("You can now import them in your page:");
    console.log(chalk.cyan('import Globe from "@/components/globe";'));
    console.log(
      chalk.cyan('import GlobalBreakdown from "@/components/global-breakdown";')
    );
  });

program.parse();
