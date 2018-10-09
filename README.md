# ghetto-rig
A stop gap solution for vulnerable npm package dependencies. 

ghetto-rig is a CLI utility which enables you to patch package dependencies for your node applications. 
It addresses scenarios in which a dependency of an application contains vulnerable packate dependencies, and no patched version of the parent package exists. It is not intended to be a permanent solution for your application's NPM security audit. Instead, it is intended to be a stop gap solution that allows your application to continue as normal without changes to code or CI builds until a permanent release is available.

Please note that using this tool may introduce breaking changes to an application. An application's main dependencies may be incompatible with the updated packages introduced by ghetto-rig. It is up to the user to assess the compatibility of the newly installed packages. 

## Installation

`npm install ghetto-rig -g`

## Usage
`ghetto-rig [command] [packages]`

## Examples
fix single vulnerable package

`ghetto-rig fix lodash`

fix multiple vulnerable packages

`ghetto-rig fix underscore lodash`

fix package and delete vulnerable version
`ghetto-rig clean-fix lodash`

TODO:
- list packages/dependencies
- add SEMVER options
- include man page 
- restrict node version