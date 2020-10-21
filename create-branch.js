const fs = require('fs');
const path = require('path');
const syncSpawn = require('spawn-sync');
const baseFolder = path.resolve(path.join(process.env.HOME, 'dev', 'hkube'));
const main = async () => {
    const versions = JSON.parse(fs.readFileSync('./version.json'));
    const branchName = 'release_v1_3'
    for (let v of versions.versions) {
        try {
            console.log(`${v.project}: ${v.tag}`);
            const repoFolder = path.join(baseFolder, v.project);
            await syncSpawn('grep', ['-Po', '\\"version\\": \\"\\K(.*)(?=\\",)', 'package.json'], { cwd: repoFolder ,stdio: 'inherit'})

            
            await syncSpawn('git',['status'],{cwd: repoFolder,stdio: 'inherit' })

            // await syncSpawn('git',['checkout',`${v.tag}`],{cwd: repoFolder,stdio: 'inherit' })
            // await syncSpawn('git',['checkout','-b',branchName],{cwd: repoFolder,stdio: 'inherit' })
            // await syncSpawn('git',['push','--set-upstream','origin',branchName],{cwd: repoFolder,stdio: 'inherit' })
            // await syncSpawn('git',['checkout','master'],{cwd: repoFolder,stdio: 'inherit' })

            // await syncSpawn('npm',['version','major'],{cwd: repoFolder,stdio: 'inherit' })
            // await syncSpawn('git',['push','--follow-tags'],{cwd: repoFolder,stdio: 'inherit' })


            // await syncSpawn('git',[`status`],{cwd: repoFolder,stdio: 'inherit' })


        }
        catch (e) {
            console.error(e)
        }
    }
}

main()