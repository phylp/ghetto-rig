const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { deleteVulnerablePackagesFolders } = require('./riggerUtils')
const { colorize, colors } = require('./utils');

const promiseExec = (command) => {
    return new Promise((resolve, reject) => {
        return exec(command, (err, stdout, stderr) => {
            if (err)
                return reject(err);
            else
                return resolve(stdout);
        })
    });
};

let stripColorCodes = (arr) => {
    return arr.map(string => {
        return string
            .split(' ').map(s => s.includes('[') ? '' : s)
            .filter(x => x !== '');
    });
};

let stripExtraData = (arr) => arr.filter(e => ['Package', 'Patched', 'Dependency', 'Path'].includes(e[0]));

let findData = (arr, keyword) => arr.find(e => e[0] == keyword) || null;

let createPackageObject = (arr) => {
    let packageData = findData(arr, 'Package');
    let dependencyOfData = findData(arr, 'Dependency');
    let patchedData = findData(arr, 'Patched');
    let pathData = findData(arr, 'Path');

    let package = {};
    package['package'] = packageData ? packageData[1] : null;
    package['dependencyOf'] = dependencyOfData ? dependencyOfData[2] : null;
    package['patched'] = patchedData ? patchedData[2] : null;
    package['path'] = pathData ? pathData.slice(1).join('') : null;
    return package;
};

const execPromise = () => {
    return new Promise((resolve, reject) => {
        return exec(`npm audit`, (err, stdout, stderr) => {
            return resolve(stdout)
        });
    });
};

let ghettoRig = (packagesToFix, del) => {
    console.log(del)
    if (!packagesToFix.length) {
        colorize(colors.ALERT, 'You must provide packages to fix.');
        process.exit();
    }
    else {
        colorize(colors.WARNING, 'WARNING: package updates do not have guaranteed compatibility')
        colorize(colors.STANDARD, `Preparing to fix dependenc${packagesToFix.length > 1 ? 'ies' : 'y'}: ${packagesToFix}...`);
    }

    return new Promise((resolve, reject) => {
        return execPromise()
        .then(auditResults => {
            let lines = auditResults.split(/[\r\n]+/);
            let results = stripExtraData(stripColorCodes(lines));
            let packageObjects = [];
            for (var i = 1; i < results.length; i++) {
                if (i % 3 === 0) {
                    packageObjects.push(createPackageObject(results.slice(i - 3, i)));
                }
            }
            
            packageObjects.forEach(p => {
                if (packagesToFix.includes(p.package)) {
                    
                    let packageToFix = packagesToFix.reduce(p => p == p.package);
                    colorize(colors.STANDARD, `Attempting to update: ${packageToFix}`);
                    
                    //DELETE DEPENDENCY of VULNERABLE PACKAGE and UPDATE LOCK FILE ATTRS
                    if (p.patched) {
                        colorize(colors.SUCCESS,`Updating vulnerable package: ${p.package} to ${p.patched} in ${p.dependencyOf}...`);
                        let packageJson = `${process.cwd()}\\node_modules\\${p.dependencyOf}\\package.json`;
                        let file = require(packageJson);
                        file.dependencies[p.package] = p.patched.substring(2);
                        fs.writeFileSync(packageJson, JSON.stringify(file, null, 2));

                        colorize(colors.SUCCESS, `Updating vulnerable package: ${p.package} to ${p.patched}...`);
                        let packageLockJson = `${process.cwd()}\\package-lock.json`;
                        let lockFile = require(packageLockJson);
                            let dependencyData = lockFile.dependencies[p.dependencyOf];
                            dependencyData.requires[p.package] = p.patched.substring(2);
                            fs.writeFileSync(packageLockJson, JSON.stringify(lockFile, null, 2));

                            if(del){
                                colorize(colors.WARNING, `Removing vulnerable package: ${p.package}`);
                                deleteVulnerablePackagesFolders(path.join(process.cwd(), 'node_modules'), p.package);
                            }
                        }
                        else {
                            colorize(colors.WARNING, `Unable to patch vulnerable package ${p.package}.`);
                        }
                    }
                })
                return resolve();
            })
            .then(() => {
                colorize(colors.SUCCESS, 'Updating dependencies...');
                return promiseExec(`npm install`)
                    .then(() => {
                        colorize(colors.SUCCESS, `Updates completed. Running 'npm audit' to verify that your specified dependencies have been resolved.`);
                        return promiseExec('npm audit');
                    });
            })
            .then((auditResults2) => {
                console.log(auditResults2);
            })
            .catch(err => {
                colorize(colors.ALERT, `unable to complete package update: ${err}`);
                process.exit();
            })
    });
};    

module.exports = {
    ghettoRig
}