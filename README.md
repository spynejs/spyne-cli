
# Spyne CLI

`spyne-cli` is a command-line utility designed to streamline the process of generating and managing applications built using the [SpyneJS](https://github.com/spynejs/spynejs) framework. It simplifies the creation of `ViewStream`, `DomElement`, `Channel`, and `SpyneTrait` classes, making it easier to build scalable and modular single-page applications.

## Features

- Create a new SpyneJS application from either of two templates.
- Generate `ViewStream`, `DomElement`, `Channel`, and `SpyneTrait` classes, interactively or from flags.
- Register generated channels in your application's `src/index.js`.
- Run every command non-interactively, with `--json` output for tooling.

## Installation

To install the `spyne-cli`, you need to have Node.js and npm installed on your system.

1. Install the package globally:

   ```bash
   npm install -g spyne-cli
   ```

## Requirements

Node.js 18 or newer.

## Usage

### Interactive

Run with no arguments for the picker:

```bash
npx spyne-cli
```

```
? What would you like to create?
> App          - Create a new SpyneJS application
  ViewStream
  DomElement
  Channel
  SpyneTrait
```

Selecting **App** prompts for a template and an application name. Selecting any
of the four module types prompts for a file name, class name, and output
directory, then writes the file into your project.

### Creating an application

```bash
npx spyne-cli create-app my-app
```

Prompts for a template when one is not supplied. To choose one directly:

```bash
npx spyne-cli create-app my-app --template shell
```

| Template | Contents |
| --- | --- |
| `shell` (default) | pages, navigation, and UI components |
| `starter` | `app.js` and a hello-world view |

Options: `-t, --template`, `--material` for Material Design (below),
`--no-install` to skip dependency installation, `--no-git` to skip git
initialisation.

### Material Design

The `shell` template comes in a second design: Google's
[Material Design 3](https://m3.material.io). It has the same pages, navigation,
and content as the shell, drawn with Material's colours, type, shapes, motion,
and components. See it at [material.spynejs.com](https://material.spynejs.com).

When you choose `shell`, the CLI asks:

```
Use Material Design? (based on Google's Material Design 3)
```

Enter keeps the shell's own design. To answer without being asked:

```bash
npx spyne-cli create-app my-app --material
```

`--material` works with a site description (`--prompt`) too. It is the shell
template in another design, so it is not offered for `starter`. The template is
an independent implementation, and is not affiliated with or endorsed by Google.

### Images in generated apps

When you describe a site (`--prompt`), the generator finds matching photographs
on [Pexels](https://www.pexels.com) and includes them as placeholders — the CLI
prints "Photos provided by Pexels" when it does. Those photographs are under the
[Pexels License](https://www.pexels.com/license/), not your app's license, and
following it is your responsibility if you keep them. The generated app's
`GETTING-STARTED.md`, `NOTICE.md`, and `image-manifest.json` cover the terms and
per-photo credits.

### Generating modules

Each module type is also a direct command, usable inside an existing project:

```bash
npx spyne-cli create-viewstream my-widget-view
npx spyne-cli create-domelement my-element
npx spyne-cli create-channel channel-cart
npx spyne-cli create-trait my-form-trait
```

Options: `--className`, `-d, --fileDirectory`. `create-channel` also accepts
`--channelName` and `--replayLastPayload`; `create-trait` accepts
`--methodPrefix`. Anything not supplied is derived from the file name.

`create-channel` also registers the channel in your `src/index.js`.

### Non-interactive use

Every command runs from flags alone and never prompts when stdin is not a TTY,
so invocations are safe in CI. Add `--json` for machine-readable output:

```bash
npx spyne-cli create-app my-app -t starter --json
```

Exit codes: `0` success, `1` the command ran and failed, `2` usage error.

### Programmatic use

The command registry is exported as data, so tooling can enumerate every
generation target and its arguments:

```javascript
import { describeCommands } from 'spyne-cli/registry';

describeCommands(); // [{ name, summary, kind, args }, ...]
```

### Scaffolding from a fork

`create-app` clones from the published SpyneJS templates. To point it somewhere
else — a fork, or a local mirror — set the matching environment variable:

```bash
SPYNE_CLI_STARTER_REPO=https://github.com/you/your-starter.git \
  npx spyne-cli create-app my-app
```

`SPYNE_CLI_STARTER_REPO` overrides the `starter` template;
`SPYNE_CLI_SHELL_REPO` overrides `shell`;
`SPYNE_CLI_SHELL_MATERIAL_REPO` overrides `shell` with `--material`.

### Deprecated and removed

`spyne-cli new <app-name>` still works and now runs `create-app`. It prints a
deprecation notice and will be removed in a future release.

The `--spa` flag was removed in 0.7.0. Choose a template with
`--template starter` or `--template shell` instead.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue on the [GitHub repository](https://github.com/spynejs/spyne-cli).

## License

This project is licensed under the AGPL-3.0-or-later License.
