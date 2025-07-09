#!/usr/bin/env node

// Import the 'program' object from the 'commander' package, which is used for building command-line interfaces.
// Example: You could also import the entire module as 'import * as commander from "commander";'
import { program } from "commander";

// Import the Generator class from the local generator module.
// Example: You could import a default export as 'import generator from "../src/lib/generator.js";'
import Generator from "../src/lib/generator.js";

// Set the CLI version to "1.0.0", define a required argument '<project-name>', and provide a description for it.
// The 'action' method specifies the function to run when the command is executed.
// Example: You could add more options with '.option("-f, --force", "force overwrite")'
program
  .version("1.0.0") // Set the CLI version
  .argument('<project-name>', 'The name of the project') // Define a required argument
  .action(
    // The action callback receives the projectName argument from the command line.
    // Example: You could add more arguments: .argument('<template>', 'Project template')
    async (projectName) => {
      // Create a new instance of Generator with the provided project name.
      // Example: You could pass additional options: new Generator(projectName, { force: true })
      const generator = new Generator(projectName);

      // Run the generator's main function, passing the project name.
      // Example: You could call other methods: await generator.prepare();
      await generator.run(projectName);
    }
  );

// Parse the command-line arguments and execute the appropriate command/action.
// Example: You could pass process.argv explicitly: program.parse(process.argv);
program.parse();
