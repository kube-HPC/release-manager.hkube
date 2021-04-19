const GitHubApi = require('github')
const fs = require('fs');

const HKUBE = 'Kube-HPC'
const CORE_TOPIC = 'hkube-core'
const COMMON_TOPIC = 'hkube-common'
const RELEASE_MANAGER_REPO = 'release-manager'

const paginationHelper = async (github, method, options) => {
    let response = await method({ ...options, per_page: 200 });
    let { data } = response;
    while (github.hasNextPage(response)) {
        response = await github.getNextPage(response, { 'user-agent': HKUBE });
        data = data.concat(response.data);
    }
    return data;

}

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
        const reposRaw = await paginationHelper(github,github.repos.getForOrg,{
            org: 'Kube-HPC'
        });
        // const reposRaw = await github.repos.getForOrg({
        //     org: 'Kube-HPC'
        // });
        // const repos = reposRaw.map(r => {
        //     return {
        //         name: r.name,
        //         full_name: r.full_name,
        //         topics: r.topics
        //     }
        // })
        const repos = reposRaw;
        // const commonRepos = repos.filter(r => r.topics.includes(COMMON_TOPIC));
        const commonRepos = repos.filter(r=>r.name.endsWith('.hkube'))
        const coreRepos = repos.filter(r => r.topics.includes(CORE_TOPIC));
        commonRepos.forEach(r=>console.log(r.git_url))
        // console.log(coreRepos) 
    }
    catch (e) {
        console.error(e)
    }
}

main();