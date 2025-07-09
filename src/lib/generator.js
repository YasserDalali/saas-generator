import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import PromptsManager from './prompt.js';

class Generator {
  constructor() {
    this.prompts = new PromptsManager();
  }

  async run(projectName) {
    console.log(chalk.blue('✨ Creating a new SaaS application...'));
    
    const config = await this.prompts.getProjectConfig();
    if (projectName == ".") {
        projectName = "";
    }
    const projectPath = path.join(process.cwd(), projectName);
    
    await this.createProject(projectName, projectPath, config);
  }

  async copyBaseTemplate(projectPath) {
    const spinner = ora('Copying base express-ts template...').start();
    try {
      const basePath = path.join(path.dirname(import.meta.url.replace('file:///', '')), '../templates/base');
      await fs.copy(basePath, projectPath);
      spinner.succeed('Base template copied successfully!');
    } catch (error) {
      spinner.fail('Failed to copy base template');
      console.error(error);
      throw error;
    }
  }

  async applyAuthConfig(projectPath, authType) {
    const spinner = ora(`Applying ${authType} authentication...`).start();
    try {
      const authTemplatePath = path.join(path.dirname(import.meta.url.replace('file:///', '')), `../templates/auth/${authType}`);
      
      // Check if auth template exists
      if (await fs.pathExists(authTemplatePath)) {
        await fs.copy(authTemplatePath, projectPath, { overwrite: true });
        spinner.succeed(`${authType} authentication applied successfully!`);
      } else {
        spinner.warn(`Auth template for ${authType} not found, skipping...`);
      }
    } catch (error) {
      spinner.fail('Failed to apply auth configuration');
      console.error(error);
      throw error;
    }
  }

  async applyDatabaseConfig(projectPath, databaseType) {
    const spinner = ora(`Applying ${databaseType} database configuration...`).start();
    try {
      const dbTemplatePath = path.join(path.dirname(import.meta.url.replace('file:///', '')), `../templates/database/${databaseType}`);
      
      // Check if database template exists
      if (await fs.pathExists(dbTemplatePath)) {
        await fs.copy(dbTemplatePath, projectPath, { overwrite: true });
        spinner.succeed(`${databaseType} database configuration applied successfully!`);
      } else {
        spinner.warn(`Database template for ${databaseType} not found, skipping...`);
      }
    } catch (error) {
      spinner.fail('Failed to apply database configuration');
      console.error(error);
      throw error;
    }
  }

  async applyModules(projectPath, selectedModules) {
    if (!selectedModules || selectedModules.length === 0) {
      console.log(chalk.yellow('No additional modules selected.'));
      return;
    }

    const spinner = ora('Applying selected modules...').start();
    try {
      for (const module of selectedModules) {
        const moduleTemplatePath = path.join(path.dirname(import.meta.url.replace('file:///', '')), `../templates/modules/${module}`);
        
        // Check if module template exists
        if (await fs.pathExists(moduleTemplatePath)) {
          await fs.copy(moduleTemplatePath, projectPath, { overwrite: true });
          spinner.text = `Applied ${module} module...`;
        } else {
          console.log(chalk.yellow(`Module template for ${module} not found, skipping...`));
        }
      }
      spinner.succeed(`All selected modules applied successfully!`);
    } catch (error) {
      spinner.fail('Failed to apply modules');
      console.error(error);
      throw error;
    }
  }

  async mergePackageJson(projectPath, config) {
    const spinner = ora('Merging package.json configurations...').start();
    try {
      const basePackageJsonPath = path.join(projectPath, 'package.json');
      let basePackageJson = {};
      
      // Read existing package.json from base template
      if (await fs.pathExists(basePackageJsonPath)) {
        basePackageJson = await fs.readJson(basePackageJsonPath);
      }

      // Update project name if provided
      if (config.projectName) {
        basePackageJson.name = config.projectName;
      }

      // Merge dependencies from auth template
      if (config.auth) {
        await this.mergePackageAdditions(basePackageJson, `auth/${config.auth}`);
      }

      // Merge dependencies from database template
      if (config.database) {
        await this.mergePackageAdditions(basePackageJson, `database/${config.database}`);
      }

      // Merge dependencies from modules
      if (config.modules && config.modules.length > 0) {
        for (const module of config.modules) {
          await this.mergePackageAdditions(basePackageJson, `modules/${module}`);
        }
      }

      // Write the updated package.json
      await fs.writeJson(basePackageJsonPath, basePackageJson, { spaces: 2 });
      spinner.succeed('package.json updated successfully!');
    } catch (error) {
      spinner.fail('Failed to update package.json');
      console.error(error);
      throw error;
    }
  }

  async mergePackageAdditions(basePackageJson, templatePath) {
    try {
      const additionsPath = path.join(
        path.dirname(import.meta.url.replace('file:///', '')), 
        `../templates/${templatePath}/package.additions.json`
      );
      
      if (await fs.pathExists(additionsPath)) {
        const additions = await fs.readJson(additionsPath);
        
        // Merge dependencies
        if (additions.dependencies) {
          basePackageJson.dependencies = {
            ...basePackageJson.dependencies,
            ...additions.dependencies
          };
        }
        
        // Merge devDependencies
        if (additions.devDependencies) {
          basePackageJson.devDependencies = {
            ...basePackageJson.devDependencies,
            ...additions.devDependencies
          };
        }
        
        // Merge scripts
        if (additions.scripts) {
          basePackageJson.scripts = {
            ...basePackageJson.scripts,
            ...additions.scripts
          };
        }
      }
    } catch (error) {
      console.log(chalk.yellow(`Warning: Could not merge package additions for ${templatePath}`));
    }
  }

  async createProject(projectName, projectPath, config) {
    
    try {
      // Ensure project directory exists
      await fs.ensureDir(projectPath);
      
      // Copy base template
      await this.copyBaseTemplate(projectPath);
      
      // Apply auth configuration
      if (config.auth) {
        await this.applyAuthConfig(projectPath, config.auth);
      }
      
      // Apply database configuration
      if (config.database) {
        await this.applyDatabaseConfig(projectPath, config.database);
      }
      
      // Apply modules
      if (config.modules && config.modules.length > 0) {
        await this.applyModules(projectPath, config.modules);
      }
      
      // Update package.json
      await this.mergePackageJson(projectPath, { ...config, projectName });
      
      console.log(chalk.bgGreen.white('Project created successfully!'));
      // spinner.succeed('Project created successfully!');
      this.showNextSteps(projectName, projectPath);
    } catch (error) {
      console.log(chalk.bgRed.white('Failed to create project'));
      // spinner.fail('Failed to create project');
      console.error(error);
      throw error;
    }
  }

  showNextSteps(projectName, projectPath) {
    console.log(chalk.green('\n🎉 Project created successfully!'));
    console.log(chalk.cyan('\nNext steps:'));
    
    if (projectName) {
      console.log(chalk.white(`  cd ${projectName}`));
    }
    
    console.log(chalk.white('  npm install'));
    console.log(chalk.white('  npm run dev'));
    
    console.log(chalk.yellow('\n📝 Don\'t forget to:'));
    console.log(chalk.white('  • Set up your environment variables (.env)'));
    console.log(chalk.white('  • Configure your database connection'));
    console.log(chalk.white('  • Review the generated code and customize as needed'));
    
    console.log(chalk.magenta(`\n✨ Happy coding!`));
  }
}

export default Generator;