#!/usr/bin/env node
const { ghettoRig } = require('./lib/rigger');
let program = require('commander');

program
    .version('0.0.1')
    .description('ghetto rig your npm packages FTW')

program
    .command('fix <package> [packages...]')
    .alias('f')
    .description('fix a given package')
    .action((package, packages) => {
        if(packages.length) packages.splice(1, 0, package)
        return ghettoRig((packages.length ? packages : [package]), false);
    });

program
    .command('clean-fix <package> [packages...]')
    .alias('cf')
    .description('fix a given package and delete the old version')
    .action((package, packages) => {
        if (packages.length) packages.splice(1, 0, package)
        return ghettoRig((packages.length ? packages : [package]), true);
    });

program.parse(process.argv);






