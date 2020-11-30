#!/bin/bash
set -evo pipefail
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

export BRANCH=${VERSION:-master}
echo cloning ${BRANCH} branch
git clone --single-branch --branch ${BRANCH} https://github.com/kube-HPC/hkube.git /tmp/hkube
cd /tmp/hkube
npm i
if [ -z $VERSION ]
then
  echo No Version. Defaulting to latest
  export VERSION=$(git describe --abbrev=0 --tags)  
fi
echo using version ${VERSION}
HKUBE_FOLDER=/tmp/hkube ${DIR}/getVersions.js
