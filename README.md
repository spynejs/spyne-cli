
# Spyne CLI

`spyne-cli` is a command-line utility designed to streamline the process of generating and managing applications built using the [SpyneJS](https://github.com/spynejs/spynejs) framework. It simplifies the creation of `ViewStream`, `DomElement`, `Channel`, and `SpyneTrait` classes, making it easier to build scalable and modular single-page applications.

## Features

- Create a new SpyneJS application with a single command.
- Generate `ViewStream`, `DomElement`, `Channel`, and `SpyneTrait` classes via interactive prompts.
- Easily extend and customize applications.
- Built-in support for channel-driven development.

## Installation

To install the `spyne-cli`, you need to have Node.js and npm installed on your system.

1. Install the package globally:

   ```bash
   npm install -g spyne-cli
   ```

## Usage

### Creating a New SpyneJS Application

To create a new SpyneJS application, run:

```bash
npx spyne-cli new <app-name>
```

This will generate a fully structured SpyneJS SPA in the specified `<app-name>` directory.

---

### Generating Components (Interactive CLI)

To generate SpyneJS components, simply run:

```bash
npx spyne-cli
```

You’ll be presented with an interactive menu where you can select the file type:

- `ViewStream`
- `DomElement`
- `Channel`
- `SpyneTrait`

Use the arrow keys to make a selection, and follow the prompts to name and configure your file.

This interface is ideal for developers who want fast, zero-config scaffolding during development.

---

### Example Workflow

1. Create a new application:

```bash
npx spyne-cli new my-spyne-app
```

2. Navigate to the project and start the application:

```bash
cd my-spyne-app && npm start
```

3. Run the interactive generator:

```bash
npx spyne-cli
```

4. Select the file type (e.g., `ViewStream`), and follow the prompts to generate a new component.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue on the [GitHub repository](https://github.com/spynejs/spyne-cli).

## License

This project is licensed under the MIT License.
