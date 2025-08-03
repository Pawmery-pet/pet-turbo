#!/bin/bash

APP_NAME=$1
ENV=$2
DRY_RUN=false
TIME_DIFF_THRESHOLD=$((7 * 24 * 60 * 60)) # 7 days

set -e

# Parse arguments for --dry-run flag
for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
    esac
done

# Helper function to execute commands with dry-run support
function execute_command() {
    local cmd="$1"
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY RUN] Would execute: $cmd"
    else
        echo "Executing: $cmd"
        eval "$cmd"
    fi
}

function checkPrerequisits() {
    echo "checking env..."

    local default="dev"
    local allowed_envs="dev, prod"

    if [ -z "$ENV" ]; then
        ENV=$default
        echo "ENV not provided, defaulting to \"$ENV\""
    fi

    if [[ ! $allowed_envs =~ $ENV ]]; then
        echo "ENV must be one of \"$allowed_envs\", received \"$ENV\""
        exit 1
    fi

    echo "checking if git is clean..."
    if [ -n "$(git status -s)" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo "[DRY RUN] Git is not clean, but continuing in dry-run mode"
        else
            read -p "git is not clean, are you sure you want to continue? (y/n): " yn
            if [ "$yn" != "y" ]; then
                echo "okay, cya"
                exit 1
            fi
        fi
    fi
}

function createRelease() {
    echo "creating $ENV release for $APP_NAME..."

    local tag="$APP_NAME-$ENV-$(git rev-parse HEAD)"
    
    execute_command "git tag $tag"
    execute_command "git push"
    execute_command "git push --tags"

    echo "release \"$tag\" has been created."
    echo "head to https://github.com/pawmery-pet/pet-turbo/actions to track the deployment status."
}

function promoteRelease() {
    echo "promoting $ENV release for $APP_NAME..."

    local lastDevTag=$(git tag -l | grep dev | tail -n 1)
    
    local commit_hash=$(echo $lastDevTag | rev | cut -d'-' -f1 | rev)

    # Get timestamp of the commit
    local timestamp=$(git log -1 --format=%cd --date=format:%Y%m%d%H%M%S $commit_hash)

    # Convert timestamp from YYYYMMDDHHmmss to human readable format
    local year=${timestamp:0:4}
    local month=${timestamp:4:2}
    local day=${timestamp:6:2}
    local hour=${timestamp:8:2}
    local minute=${timestamp:10:2}
    local second=${timestamp:12:2}
    
    local humanTime="$day/$month/$year"
    local tagTime="$year-$month-$day $hour:$minute:$second"
    
    # Calculate time difference
    local tagEpoch=$(date -d "$tagTime" +%s)
    local nowEpoch=$(date +%s)
    local diffSeconds=$((nowEpoch - tagEpoch))
    
    local timeDifference=""
    if [ $diffSeconds -lt 60 ]; then
        timeDifference="${diffSeconds} seconds"
    elif [ $diffSeconds -lt 3600 ]; then
        local minutes=$((diffSeconds / 60))
        timeDifference="${minutes} minutes"
    elif [ $diffSeconds -lt 86400 ]; then
        local hours=$((diffSeconds / 3600))
        timeDifference="${hours} hours"
    else
        local days=$((diffSeconds / 86400))
        timeDifference="${days} days"
    fi
    
    echo "found last dev tag from $timeDifference ago, [tag: \"$lastDevTag\" time: \"$humanTime\"]"

    if [ $diffSeconds -gt $TIME_DIFF_THRESHOLD ]; then
        if [ "$DRY_RUN" = true ]; then
            echo "[DRY RUN] Dev deployment might be stale, but continuing in dry-run mode"
        else
            read -p "this dev deployment might be stale, are you sure you want to continue? (y/n): " yn
            if [ "$yn" != "y" ]; then
                echo "okay, cya"
                exit 1
            fi
        fi
    fi

    echo "promoting \"$lastDevTag\" to production..."

    local prodTag=$(echo $lastDevTag | sed 's/dev/prod/')
    
    # Get the commit hash that the dev tag points to
    local commitHash=$(git rev-list -n 1 $lastDevTag)
    
    # Tag that specific commit with the prod tag
    execute_command "git tag $prodTag $commitHash"
    execute_command "git push"
    execute_command "git push --tags"

    echo "promoted \"$lastDevTag\" to \"$prodTag\"."
    echo "head to https://github.com/BindiMaps/hyperlocal-cms/actions to track the deployment status."
}

if [ "$DRY_RUN" = true ]; then
    echo "=== DRY RUN MODE ENABLED ==="
    echo "No actual commands will be executed"
    echo "==============================="
fi

checkPrerequisits

if [ "$ENV" == "dev" ]; then
    createRelease
elif [ "$ENV" == "prod" ]; then
    promoteRelease
else
    echo "unknown environment: $ENV, exiting..."
    exit 1
fi
