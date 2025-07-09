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
    const projectPath = path.join(process.cwd(), projectName);
    
    await this.createProject(projectName, projectPath, config);
  }

  async copyBaseTemplate(projectPath) {
    const spinner = ora('Copying base template...').start();
    try {
      await fs.copy(path.join(__dirname, '../templates/base'), projectPath);
      spinner.succeed('Base template copied successfully!');
    } catch (error) {
      spinner.fail('Failed to copy base template');
      console.error(error);
    }
  }

  async applyAuthConfig(projectPath, authConfig) {
    const spinner = ora('Applying auth configuration...').start();
    try {
      await fs.copy(path.join(__dirname, '../templates/auth'), projectPath);
      spinner.succeed('Auth configuration applied successfully!');
    } catch (error) {
      spinner.fail('Failed to apply auth configuration');
      console.error(error);
    }
  }

  async applyDatabaseConfig(projectPath, databaseConfig) {
    const spinner = ora('Applying database configuration...').start();
    try {
      await fs.copy(path.join(__dirname, '../templates/database'), projectPath);
      spinner.succeed('Database configuration applied successfully!');
    } catch (error) {
      spinner.fail('Failed to apply database configuration');
      console.error(error);
    }
  }

  async applyModules(projectPath, modulesConfig) {
    const spinner = ora('Applying modules...').start();
    try {
      await fs.copy(path.join(__dirname, '../templates/modules'), projectPath);
      spinner.succeed('Modules applied successfully!');
    } catch (error) {
      spinner.fail('Failed to apply modules');
      console.error(error);
    }
  }

  async generatePackageJson(projectPath, config) {
    const spinner = ora('Generating package.json...').start();
    try {
      await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(config, null, 2));  
      spinner.succeed('package.json generated successfully!');
    } catch (error) {
      spinner.fail('Failed to generate package.json');
      console.error(error);
    }
  }

  async createProject(projectName, projectPath, config) {
    const spinner = ora('Creating project structure...').start();
    
    try {
      // Copy base template
      await this.copyBaseTemplate(projectPath);
      
      // Apply auth configuration
      await this.applyAuthConfig(projectPath, config.auth);
      
      // Apply database configuration
      await this.applyDatabaseConfig(projectPath, config.database);
      
      // Apply modules
      await this.applyModules(projectPath, config.modules);
      
      // Generate package.json
      await this.generatePackageJson(projectPath, config);
      
      spinner.succeed('Project created successfully!');
      this.showNextSteps(projectName);
    } catch (error) {
      spinner.fail('Failed to create project');
      console.error(error);
    }
  }
}

export default Generator;