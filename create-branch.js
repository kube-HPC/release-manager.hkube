const fs = require('fs');
const path = require('path');
const syncSpawn = require('spawn-sync');
const baseFolder = path.resolve(path.join(process.env.HOME,'dev','hkube'));
const main = async()=>{
    const versions = JSON.parse(fs.readFileSync('./version.json'));
    const branchName='release_beta_v1_0'
    for(let v of versions.versions){
        try{
            console.dir(v);
            const repoFolder =path.join(baseFolder,v.project);
            // await syncSpawn('git',['checkout',`${v.tag}`],{cwd: repoFolder,stdio: 'inherit' })
            // await syncSpawn('git',['checkout','-b',branchName],{cwd: repoFolder,stdio: 'inherit' })
            // await syncSpawn('git',['push','--set-upstream','origin',branchName],{cwd: repoFolder,stdio: 'inherit' })
            // await syncSpawn('git',['checkout','master'],{cwd: repoFolder,stdio: 'inherit' })

            await syncSpawn('npm',['version','minor'],{cwd: repoFolder,stdio: 'inherit' })
            await syncSpawn('git',['push','--follow-tags'],{cwd: repoFolder,stdio: 'inherit' })
            
            await syncSpawn('git',[`status`],{cwd: repoFolder,stdio: 'inherit' })
            
    
        }
        catch(e){
            console.error(e)
        }
    }
}

main()