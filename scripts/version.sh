#!/bin/bash
set -ev
if ([ "$TRAVIS_BRANCH" == "master" ] || [ ! -z "$TRAVIS_TAG" ]) && [ "$TRAVIS_PULL_REQUEST" == "false" ] && [ ! -z "$VERSION" ]; then
  git config --global user.email "travis@hkube.io"
  git config --global user.name "Travis CI"
  git clone --single-branch --branch ${VERSION} --depth 1 https://github.com/kube-HPC/hkube.git ~/hkube
  cd ~/hkube
  npm i
  HKUBE_FOLDER=/home/travis/hkube ./getVersions.js
else
  echo "version skiped!"
fi