#!/bin/sh
#
# Copies everything to my githubio directory since this is just JS now. To commit, pass
# anything as arguments, e.g.
#
#   $ ./scripts/publish.sh asdf
#
set -e

outdir=../spudtrooper.github.io
mkdir -p $outdir/wordpath
cp *.png *.html *.css *.js $outdir/wordpath

if [[ "$@" != "" ]]; then
    echo "Copied to $outdir...committing..."
    pushd $outdir
    scripts/commit.sh
    popd
else
    echo "Copied to $outdir...run the following to commit"
    echo
    echo "  pushd $outdir && scripts/commit.sh && popd"
    echo
fi
