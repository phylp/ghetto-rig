module.export =  deleteVulnerablePackagesFolders = (basePath, package) => {
    let deleteFolderRecursive = (path) => {
        console.log(`deleting ${path}`)
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                }
                else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    let packagesList = fs.readdirSync(basePath).filter(d => d.indexOf(package) === 0 || d.indexOf(`${package}.`) === 0);

    packagesList.forEach(p => {
        let targetPath = path.join(basePath, p);
        deleteFolderRecursive(targetPath)
    });
};
