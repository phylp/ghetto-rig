# ghetto-rig
A stop gap solution for vulnerable npm package dependencies. 

ghetto-rig is a CLI utility which enables you to update vulnerable package dependencies for your node applications. 
It addresses scenarios in which an application package uses vulnerable dependencies, and no patched version of this package exists. It is not intended to be a permanent solution for an NPM security audit. Instead, it is intended to be a stop gap solution that allows your application to continue as normal without changes to code and/or CI build definitions. When permanent solution is available, upgrade your packages as per security advisory recommendations.

Please note that using this tool may introduce breaking changes to an application. A parent package may be incompatible with the updated package/s introduced by ghetto-rig. It is up to the user to assess the compatibility of the newly installed packages. 

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

##### TODO:
- list packages/dependencies
- add SEMVER options
- include man page 
- restrict node version