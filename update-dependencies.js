#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of all package.additions.json files
const packageAdditionsFiles = [
  'src/templates/auth/jwt/package.additions.json',
  'src/templates/modules/docs/package.additions.json',
  'src/templates/modules/mail/package.additions.json',
  'src/templates/modules/bullmq/package.additions.json',
  'src/templates/database/prisma/package.additions.json',
  'src/templates/modules/gemini-ai/package.additions.json',
  'src/templates/database/mongoose/package.additions.json'
];

console.log(chalk.blue('🚀 Starting dependency updates...\n'));

// Function to check if ncu is installed
function checkNCU() {
  try {
    execSync('ncu --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Function to safely remove directory with retry (Windows compatibility)
async function safeRemoveDir(dirPath, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fs.remove(dirPath);
      return;
    } catch (error) {
      if (i === maxRetries - 1) {
        console.log(chalk.orange(`⚠️  Could not remove temp directory: ${error.message}`));
        return;
      }
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// Function to update main package.json
function updateMainPackage() {
  console.log(chalk.yellow('📦 Updating main package.json...'));
  try {
    execSync('ncu -u', { stdio: 'inherit' });
    console.log(chalk.green('✅ Main package.json updated successfully\n'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to update main package.json:'), error.message);
  }
}

// Function to update a custom package file
async function updateCustomPackage(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  console.log(chalk.yellow(`📋 Updating ${relativePath}...`));
  
  // Create unique temp directory for each file to avoid conflicts
  const tempDir = path.join(__dirname, 'temp', `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const tempPackageJson = path.join(tempDir, 'package.json');
  
  try {
    // Check if file exists
    if (!await fs.pathExists(filePath)) {
      console.log(chalk.orange(`⚠️  File not found: ${relativePath}`));
      return;
    }

    // Read the current file
    const currentData = await fs.readJson(filePath);
    
    // Create temporary directory
    await fs.ensureDir(tempDir);
    
    // Create temp package.json with the dependencies
    const tempData = {
      name: 'temp-package',
      version: '1.0.0',
      dependencies: currentData.dependencies || {},
      devDependencies: currentData.devDependencies || {}
    };
    
    await fs.writeJson(tempPackageJson, tempData, { spaces: 2 });
    
    // Run ncu on the temp package.json
    execSync('ncu -u', { cwd: tempDir, stdio: 'pipe' });
    
    // Read the updated temp package.json
    const updatedTempData = await fs.readJson(tempPackageJson);
    
    // Update the original file with new versions
    const updatedData = {
      ...currentData,
      dependencies: updatedTempData.dependencies || currentData.dependencies,
      devDependencies: updatedTempData.devDependencies || currentData.devDependencies
    };
    
    await fs.writeJson(filePath, updatedData, { spaces: 2 });
    
    console.log(chalk.green(`✅ ${relativePath} updated successfully`));
    
  } catch (error) {
    console.error(chalk.red(`❌ Failed to update ${relativePath}:`), error.message);
  } finally {
    // Clean up temp directory safely
    await safeRemoveDir(tempDir);
  }
}

// Function to clean up all temp directories on exit
async function cleanupTempDirs() {
  const tempBasePath = path.join(__dirname, 'temp');
  try {
    if (await fs.pathExists(tempBasePath)) {
      await safeRemoveDir(tempBasePath);
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

// Main function
async function main() {
  // Check if ncu is installed
  if (!checkNCU()) {
    console.error(chalk.red('❌ npm-check-updates (ncu) is not installed globally.'));
    console.log(chalk.yellow('Install it with: npm install -g npm-check-updates'));
    process.exit(1);
  }

  // Update main package.json
  updateMainPackage();

  // Update all custom package files
  console.log(chalk.blue('🔄 Updating custom package files...\n'));
  
  for (const filePath of packageAdditionsFiles) {
    await updateCustomPackage(filePath);
  }

  console.log(chalk.green('\n🎉 All dependency updates completed!'));
  console.log(chalk.blue('💡 Don\'t forget to run "npm install" to install the updated dependencies.'));
}

// Handle process termination
process.on('exit', cleanupTempDirs);
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n🛑 Process interrupted, cleaning up...'));
  await cleanupTempDirs();
  process.exit(0);
});
process.on('uncaughtException', async (error) => {
  console.error(chalk.red('❌ Uncaught exception:'), error);
  await cleanupTempDirs();
  process.exit(1);
});

// Run the script
main().catch(async (error) => {
  console.error(chalk.red('❌ Script failed:'), error);
  await cleanupTempDirs();
  process.exit(1);
}); 