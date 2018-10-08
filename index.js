#!/usr/bin/env node
const { ghettoRig } = require('./lib/rigger');
let program = require('commander');

program
    .version('0.0.1')
    .description('ghetto rig your npm packages FTW')
    .option('-d --delete <delete>', 'Delete outdated packages', /^(true|false)$/i, 'false')

program
    .command('fix <package> [packages...]')
    .alias('f')
    .description('fix a given package')
    .action((package, packages) => {
        if(typeof package !== 'string'){
            console.log('gimme a package name bub')
            process.exit()
        }
        packages.length ? packages.splice(1, 0, package) : [package];
        return ghettoRig((packages || package), program.delete);
    });

program.parse(process.argv);






