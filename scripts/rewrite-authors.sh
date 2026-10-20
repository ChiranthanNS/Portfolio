#!/bin/sh
git filter-branch -f --env-filter '
GIT_AUTHOR_NAME="Chiranthan N S"
GIT_AUTHOR_EMAIL="chiranthanns24056@gmail.com"
GIT_COMMITTER_NAME="Chiranthan N S"
GIT_COMMITTER_EMAIL="chiranthanns24056@gmail.com"
export GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL
' -- --all
