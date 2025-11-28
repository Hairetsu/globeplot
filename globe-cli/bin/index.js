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

    const imageSource = path.join(__dirname, "../templates/earth-map.webp");
    const imageDest = path.join(publicDir, "earth-map.webp");

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

    // Copy all map images
    const mapImages = [
      "earth-map.webp",
      "earth-blue-hologram.webp",
      "earth-dark-gold.webp",
      "earth-minimal-light.webp",
      "earth-night.webp",
      "earth-vintage.webp",
    ];

    for (const image of mapImages) {
      const source = path.join(__dirname, `../templates/${image}`);
      const dest = path.join(publicDir, image);

      if (fs.existsSync(dest)) {
        // Skip asking for every single image to avoid annoyance, just check the main one or overwrite all if confirmed?
        // For simplicity, let's just check if it exists and skip if so, or maybe just overwrite silently if the user approved the main component?
        // Let's stick to the pattern: check if it exists, if so, skip unless we want to prompt.
        // Prompting for 6 images is annoying. Let's just log if we skip.
        // Or better: check if ANY exist, ask once "Overwrite existing map images?", then do it.
        // For now, to keep it simple and consistent with previous behavior (which asked for earth-map.webp), I'll just copy them if they don't exist, or skip if they do.
        // Actually, let's just try to copy and if it exists, maybe just skip logging to avoid spam, or log "Skipping X".
        // I'll stick to the existing pattern but simplified loop.

        // Actually, let's just check the main one (earth-map.webp) as a proxy for "images installed",
        // or just loop and check each.
        // Let's loop and check each.
        console.log(chalk.yellow(`Skipping ${image} (already exists)...`));
      } else {
        await fs.copy(source, dest);
        console.log(chalk.green(`✓ Created public/${image}`));
      }
    }

    console.log(chalk.blue("\nSuccess! Globe components added."));
    console.log("You can now import them in your page:");
    console.log(chalk.cyan('import Globe from "@/components/globe";'));
    console.log(
      chalk.cyan('import GlobalBreakdown from "@/components/global-breakdown";')
    );
  });

program.parse();
