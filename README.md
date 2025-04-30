# Spyne CLI

`spyne-cli` is a command-line utility designed to streamline the process of generating and managing applications built using the [SpyneJS](https://github.com/spynejs/spynejs) framework. It simplifies the creation of `ViewStream`, `Channel`, and `SpyneTrait` classes, making it easier to build scalable and modular single-page applications.

## Features

- Create a new SpyneJS application with a single command.
- Generate `ViewStream`, `Channel`, and `SpyneTrait` classes based on user prompts.
- Easily extend and customize applications.
- Built-in support for channel-driven development.

## Installation

To install the `spyne-cli`, you need to have Node.js and npm installed on your system.

1. Install the package globally:

   ```bash
   npm install -g @spynejs/spyne-cli
   ```

## Usage

### Creating a New SpyneJS Application

To create a new SpyneJS application, run:

```bash
npx spyne-cli create-app <app-name>
```

This will generate the necessary project files in the specified `<app-name>` directory.

### Generating Components

You can use `spyne-cli` to generate new `ViewStream`, `Channel`, and `SpyneTrait` components:

- **ViewStream**: To generate a new `ViewStream`, use:

  ```bash
  npx spyne-cli generate viewstream <view-name>
  ```

- **Channel**: To generate a new `Channel`, use:

  ```bash
  npx spyne-cli generate channel <channel-name>
  ```

- **SpyneTrait**: To generate a new `SpyneTrait`, use:

  ```bash
  npx spyne-cli generate spynetrait <trait-name>
  ```

### Example

To create a new application and add a `ViewStream` component:

1. Create a new application:

   ```bash
   npx spyne-cli create-app my-spyne-app
   ```

2. Navigate to the application directory:

   ```bash
   cd my-spyne-app
   ```

3. Generate a `ViewStream` component:

   ```bash
   npx spyne-cli generate viewstream MyView
   ```

## Configuration

The `spyne-cli` supports customization via the `spyne.config.js` file located in your project’s root directory. You can modify the config file to control the file structure, template generation, and more.

### Example `spyne.config.js`

```javascript
module.exports = {
  templates: {
    viewstream: './templates/viewstream.hbs',
    channel: './templates/channel.hbs',
    spynetrait: './templates/spynetrait.hbs',
  },
  outputDir: './src/components',
};
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue on the [GitHub repository](https://github.com/spynejs/spyne-cli).

## License

This project is licensed under the MIT License.
