const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { deleteVulnerablePackagesFolders } = require('./riggerUtils')

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

    if (!packagesToFix.length) {
        console.log('\n\x1b[31mYou must provide packages to fix.');
        process.exit();
    }
    else {
        console.log('\n\x1b[33mWARNING: package updates do not have guaranteed compatibility');
        console.log(`\n\x1b[32mPreparing to fix dependenc${packagesToFix.length > 1 ? 'ies' : 'y'}: ${packagesToFix}...`);
    }

    return new Promise((resolve, reject) => {
        return execPromise()
            .then(auditResults => {
                console.log(auditResults)
                let lines = auditResults.split(/[\r\n]+/);
                let results = stripExtraData(stripColorCodes(lines));
                let packageObjects = [];
                for (var i = 1; i < results.length; i++) {
                    if (i % 3 === 0) {
                        packageObjects.push(createPackageObject(results.slice(i - 3, i)));
                    }
                }

                if(!packageObjects.length){
                    console.log('nothing to report here, bub');
                    process.exit();
                }
                packageObjects.forEach(p => {
                    if (packagesToFix.includes(p.package)) {
                        let packageToFix = packagesToFix.reduce(p => p == p.package);
                        console.log(packageToFix)
                        console.log(`PACKAGE MARKED FOR DELETION: ${packageToFix}`);

                        //DELETE DEPENDENCY of VULNERABLE PACKAGE and UPDATE LOCK FILE ATTRS
                        if (p.patched) {
                            console.log(`\nUpdating vulnerable package: ${p.package} to ${p.patched} in ${p.dependencyOf}...`);
                            let packageJson = `${__dirname}\\node_modules\\${p.dependencyOf}\\package.json`;
                            let file = require(packageJson);
                            file.dependencies[p.package] = p.patched.substring(2);
                            fs.writeFileSync(packageJson, JSON.stringify(file, null, 2));

                            console.log(`\nUpdating vulnerable package: ${p.package} to ${p.patched}...`);
                            console.log('Updating package-lock file...');
                            let packageLockJson = `${__dirname}\\package-lock.json`;
                            let lockFile = require(packageLockJson);
                            let dependencyData = lockFile.dependencies[p.dependencyOf];
                            dependencyData.requires[p.package] = p.patched.substring(2);
                            fs.writeFileSync(packageLockJson, JSON.stringify(lockFile, null, 2));

                            //remove vulnerable package
                            if(deleted === 'true'){
                                console.log(`\nRemoving vulnerable package...${p.package}`);
                                deleteVulnerablePackagesFolders(path.join(__dirname, 'node_modules'), p.package);
                            }
                        }
                        else {
                            console.log(`Unable to patch vulnerable package ${p.package}.`);
                        }
                    }
                })
                return resolve();
            })
            .then(() => {
                console.log('\nUpdating dependencies...');
                return promiseExec(`npm install`)
                    .then(() => {
                        console.log(`\nUpdates completed. Running 'npm audit' to verify that your specified dependencies have been resolved.`);
                        return promiseExec('npm audit');
                    });
            })
            .then((auditResults2) => {
                console.log(auditResults2);
            })
            .catch(err => {
                console.log(`\n\x1b[37m\x1b[41munable to complete package update: ${err}\x1b[40m`);
                process.exit();
            })
    });
};    

module.exports = {
    ghettoRig
}