const repoList = require('./repos')
const GitHubApi = require('github')
const fs = require('fs');



const requiredVersion = process.env.REQUIRED_VERSION || 'v1.0';
const packageVersion = process.env.TRAVIS_BUILD_NUMBER ?
    requiredVersion + '.' + process.env.TRAVIS_BUILD_NUMBER :
    require('./package.json').version
const HKUBE = 'Kube-HPC'
const CORE_TOPIC = 'hkube-core'
const COMMON_TOPIC = 'hkube-common'
const RELEASE_MANAGER_REPO = 'release-manager'

const main = async () => {
    try {
        const github = new GitHubApi({
            // debug: true,
            headers: {
                'Accept': ' application/vnd.github.mercy-preview+json'
            }
        });
        if (process.env.GH_TOKEN) {
            github.authenticate({
                type: 'oauth',
                token: process.env.GH_TOKEN || undefined
            })

        }
        const reposRaw = await github.repos.getForOrg({
            org: 'Kube-HPC'
        });
        const repos = reposRaw.data.map(r => {
            return {
                name: r.name,
                full_name: r.full_name,
                topics: r.topics
            }
        })
        const commonRepos = repos.filter(r => r.topics.includes(COMMON_TOPIC));
        const coreRepos = repos.filter(r => r.topics.includes(CORE_TOPIC));

        const getVersion = async (repo) => {
            try {
                const tags = await github.repos.getTags({ owner: HKUBE, repo: repo.name })
                const tagNames = tags.data.map(t => ({
                    name: t.name
                })).filter(t => t.name.startsWith(requiredVersion));
                const sorted = tagNames.sort((a, b) => {
                    const aToCompare = parseFloat(a.name.replace(requiredVersion + '.', ''));
                    const bToCompare = parseFloat(b.name.replace(requiredVersion + '.', ''));
                    return bToCompare - aToCompare;
                })
                const versionTag = tagNames[0];
                if (!versionTag) {
                    console.error(`project ${repo.name} has no tags of version ${requiredVersion}`)
                    return ({ project: repo.name, tag: 'none' });
                }
                return ({ project: repo.name, tag: versionTag.name });

            }
            catch (e) {
                console.error(e)
            }
        }

        const coreReposTagPromises = coreRepos.map(getVersion);
        const versions = await Promise.all(coreReposTagPromises);
        const versionsFiltered = versions.filter(v => v.tag !== 'none');
        const output = {
            systemVersion: packageVersion,
            versions: versionsFiltered
        }
        fs.writeFileSync('version.json', JSON.stringify(output, null, 2))
        console.log(JSON.stringify(output, null, 2))
        const masterRef = await github.gitdata.getReference({
            owner: HKUBE,
            repo: RELEASE_MANAGER_REPO,
            ref: 'heads/master'
        });
        if (masterRef.data && masterRef.data.object) {
            const tagResponse = await github.gitdata.createTag({
                owner: HKUBE,
                repo: RELEASE_MANAGER_REPO,
                tag: packageVersion,
                message: 'version ' + packageVersion,
                object: masterRef.data.object.sha,
                type: 'commit',
                tagger: {
                    name: 'Travis CI',
                    email: 'travis@travis-ci.org',
                    date: new Date()
                }
            })
            // const tagRefResponse = await github.gitdata.createReference({
            //     owner:HKUBE,
            //     repo:RELEASE_MANAGER_REPO,
            //     ref:'refs/tags/'+tagResponse.data.tag,
            //     sha: tagResponse.data.sha
            // })
            const tagRefResponse = await github.repos.createRelease({
                owner: HKUBE,
                repo: RELEASE_MANAGER_REPO,
                tag_name: packageVersion,
                name: packageVersion,
                body: JSON.stringify(output, null, 2),
                prerelease: true
            })
            const uploadRes = await github.repos.uploadAsset({
                owner: HKUBE,
                repo: RELEASE_MANAGER_REPO,
                id: tagRefResponse.data.id,
                filePath: './version.json',
                name: 'version.json',
                label: 'Version Description'
            })
            console.log(tagRefResponse)
        }
    }
    catch (e) {
        console.error(e)
    }
}

main();