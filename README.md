[![TypeScript](https://img.shields.io/badge/Built%20With-TypeScript-%230074c1.svg?style=for-the-badge&logo=typescript)](http://www.typescriptlang.org/) [![NPM](https://img.shields.io/npm/v/better-install?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/better-install) [![Build Status](https://img.shields.io/github/workflow/status/dworthen/better-install/CI?style=for-the-badge&logo=github)](https://github.com/dworthen/better-install/actions?query=workflow%3ACI)

# Better Install

Automatically install TypeScript [@types](https://github.com/DefinitelyTyped/DefinitelyTyped) when installing/adding dependencies.

Inspired by [@yarnpkg/plugin-typescript](https://www.npmjs.com/package/@yarnpkg/plugin-typescript) but works with `yarn@1`, `yarn@2`, `pnpm` and `npm`.

<!-- prettier-ignore -->
- [Install](#install)
- [Configure](#configure)
- [Add Packages](#add-packages)
- [Install All Pacakges](#install-all-pacakges)
- [Add devDependency](#add-devdependency)
- [CLI Options](#cli-options)
- [As a Global Bin](#as-a-global-bin)
	- [Install All Packages](#install-all-packages)
	- [Select a Package Manager](#select-a-package-manager)
	- [Project or User Config](#project-or-user-config)

## Install

**yarn**

```shell
yarn add -D better-install
```

**pnpm**

```shell
pnpm add -D better-install
```

**npm**

```shell
npm install -D better-install
```

## Configure

_**package.json**_

```json
{
  "scripts": {
    "bi": "better-install"
  }
}
```

> :star: When running `better-install` as an `npm` script, it will use the package manager that invoked the script to install packages, e.g., `yarn bi lodash` will use `yarn` to install `lodash` and `@types/lodash`.

## Add Packages

**yarn**

```shell
yarn bi lodash yargs-parser minimist-options argville
```

Install packages as a prod dependencies and corresponding `@types/` as a devDependencies using `yarn`.

> :fire: `better-install` installs `@types/` packages if the dependency does not contain a `types`/`typings` field in _package.json_ or an _index.d.ts_ file in the package root. `minimist-options` includes a default declaration file, _index.d.ts_, in the package root but does not specify a `types` or a `typings` field within the [_package.json_](https://github.com/vadimdemedes/minimist-options/blob/master/package.json) file. This is enough for `better-install` to know that `minimist-options` comes bundled with types and therefore will skip installing `@types/minimist-options`. `better-install` checks for `types`, `typings` and _index.d.ts_ the [same as TypeScript](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html).
>
> Like `minimist-options`, `argville` comes bundled with `types` and therfore `better-install` skips installing `@types/argville`.

> :star: `better-install` supports both `yarn@1` and `yarn@2`.

> :thumbsup: `better-install` also supports locating and installing `@types/` for scoped packages.

**pnpm**

```shell
pnpm bi -- lodash yargs-parser minimist-options argville
```

**npm**

```shell
npm run bi -- lodash yargs-parser minimist-options argville
```

## Install All Pacakges

Run `better-install` without any args to install all packages listed in _package.json_ and corresponding `@types/`.

```shell
# with yarn
yarn bi
# OR pnpm
pnpm bi
# OR npm
npm run bi
```

## Add devDependency

`better-install` passes all cli flags to the underlying package manager. So it is possible to install dev dependencies with

```shell
# with yarn
yarn bi -D lodash
# OR pnpm
pnpm bi -D lodash
# OR npm
npm run bi --save-dev lodash
```

Installs `lodash` and `@types/lodash` as devDependencies.

## CLI Options

Run `yarn bi --help` (or with `pnpm` or `npm`) to view a full list of options.

<table>
	<tr>
		<th>Option</th>
		<th>Description</th>
		<th>Default</th>
	</tr>
	<tr>
		<td>--pm [npm|yarn|pnpm]</td>
		<td>
			Select the package manager to use to install dependencies. Defaults to npm or, 
			if used as an npm script, the package manager that invoked the script
		</td>
		<td>
		</td>
	</tr>
	<tr>
		<td>--verbose</td>
		<td>Print debug messages.</td>
		<td>false</td>
	</tr>
	<tr>
		<td>-h, --help</td>
		<td>Print help message.</td>
		<td>false</td>
	</tr>
</table>

> :warning: better-install passes unknown flags to the underlying package manager. For example, `bi lodash -D` sends the -D flag to the package manager and therfore installs `lodash` and `@types/lodash` as devDependencies (`@types` are always installed as devDependencies).

## As a Global Bin

May also install `better-install` globally

```shell
# with yarn
yarn add better-install -g
# OR pnpm
pnpm add better-install -g
# OR npm
npm add better-install -g
```

Exposes two bins, `better-install` and, for convenience, `bi`.

### Install All Packages

```shell
bi
```

Installs all packages listed in _\<CWD>/package.json_.

### Select a Package Manager

As a global bin, `better-install` uses `npm` by default. Override this using the `--pm` option.

```shell
# install all package.json dependencies and @types with yarn
bi --pm yarn
# add lodash and @types/lodash with pnpm
bi lodash --pm pnpm
# add lodash and @types/lodash as devDependencies with npm
bi lodash -D --pm npm
# Same as
bi lodash -D
```

### Project or User Config

`better-install` loads configuration from project level _.npmrc_ config files, `/path/to/project/.npmrc`, and user level _.npmrc_ config files, `~/.npmrc`. Instead of always passing `--pm` to `better-install`, one can define the `pm` key once within an `.npmrc` file.

```ini
# /path/to/project/.npmrc
pm=yarn
```

Now `bi` commands within `/path/to/project` will use `yarn` instead of `npm`. Can still override this using the `--pm` flag.
