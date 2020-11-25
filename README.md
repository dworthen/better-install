[![TypeScript](https://img.shields.io/badge/Built%20With-TypeScript-%230074c1.svg?style=for-the-badge&logo=typescript)](http://www.typescriptlang.org/) [![NPM](https://img.shields.io/npm/v/better-install?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/better-install) [![Build Status](https://img.shields.io/github/workflow/status/dworthen/better-install/CI?style=for-the-badge&logo=github)](https://github.com/dworthen/better-install/actions?query=workflow%3ACI)

# Better Install

Automagically install typescript [@types](https://github.com/DefinitelyTyped/DefinitelyTyped) when installing/adding dependencies.

Inspired by [@yarnpkg/plugin-typescript](https://www.npmjs.com/package/@yarnpkg/plugin-typescript) but works with `yarn@1`, `yarn@2`, `pnpm` and `npm`.

<!-- prettier-ignore -->
- [Install](#install)
      - [yarn](#yarn)
      - [pnpm](#pnpm)
      - [npm](#npm)
- [Configure](#configure)
- [Add Packages](#add-packages)
      - [yarn](#yarn-1)
      - [pnpm](#pnpm-1)
      - [npm](#npm-1)
- [Install All Pacakges](#install-all-pacakges)
- [Add devDependency](#add-devdependency)
- [As Global Bin](#as-global-bin)
  - [Install All Packages](#install-all-packages)
  - [Select a Package Manager](#select-a-package-manager)
  - [Project or User Config](#project-or-user-config)

## Install

##### yarn

```shell
yarn add -D better-install
```

##### pnpm

```shell
pnpm add -D better-install
```

##### npm

```shell
npm install -D better-install
```

## Configure

_**package.json**_

```json
{
  ...
  "scripts": {
    "bi": "better-install"
  }
}
```

> :star: When running `better-install` as an `npm` script, it will use the package manager that invoked the script to install packages, e.g., `yarn bi lodash` will use `yarn` to install `lodash` and `@types/lodash`.

## Add Packages

##### yarn

```shell
yarn bi lodash yargs-parser minimist-options argville
```

Install packages as a prod dependencies and corresponding `@types/` as a devDependencies using `yarn`.

> :fire: `better-install` installs `@types/` packages if the dependency does not contain a `types`/`typings` field in _package.json_ or an _index.d.ts_ file in the package root. `minimist-options` includes a default declaration file, _index.d.ts_, in the package root but does not specify a `types` or a `typings` field within the [_package.json_](https://github.com/vadimdemedes/minimist-options/blob/master/package.json) file. This is enough for `better-install` to know that `minimist-options` comes bundled with types and therefore will skip installing `@types/minimist-options`. `better-install` checks for `types`, `typings` and _index.d.ts_ the [same as TypeScript](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html).
>
> Like `minimist-options`, `argville` comes bundled with `types` and therfore `better-install` skips installing `@types/argville`.

> :star: `better-install` supports both `yarn@1` and `yarn@2`/`berry`.

##### pnpm

```shell
pnpm bi -- lodash yargs-parser minimist-options argville
```

Install packages and types using `pnpm`.

##### npm

```shell
npm run bi -- lodash yargs-parser minimist-options argville
```

Install packages and types using `npm`.

## Install All Pacakges

Run `better-install` without any args to install all packages listed in _package.json_ and the corresponding `@types/`.

```shell
# with yarn
yarn bi
# OR pnpm
pnpm bi
# OR npm
npm bi
```

## Add devDependency

`better-install` passes all cli flags to the underlying package manager. So it is possible to install dev dependencies with

```shell
# with yarn
yarn bi -D lodash
# OR pnpm
pnpm bi -D lodash
# OR npm
npm bi --save-dev lodash
```

Installs `lodash` and `@types/lodash` as devDependencies.

## As Global Bin

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

Installs all packages listed in _CWD/package.json_.

### Select a Package Manager

As a global bin, `better-install` uses `npm` by default. This can be overriden using `--pm`.

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
