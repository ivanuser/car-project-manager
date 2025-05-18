#!/bin/bash

# Script to remove the (auth) directory to fix routing conflicts

echo "Removing (auth) directory to fix routing conflicts..."

# Remove the (auth) directory
rm -rf /home/ihoner/dev01/src/car-project-manager/app/\(auth\)

echo "Directory removed successfully."
echo "The following routes should now be working correctly:"
echo "- /login"
echo "- /register"
echo "- /forgot-password"
echo "- /reset-password"

# Remove this script after execution
echo "Cleaning up..."
rm -- "$0"
