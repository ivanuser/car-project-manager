#!/bin/bash

# install-postgres.sh - Script to install PostgreSQL on the local machine
# For Caj-pro car project build tracking application
# Created on: May 4, 2025

echo "===================================="
echo "Installing PostgreSQL for Caj-pro"
echo "===================================="

# Detect OS
if [ -f /etc/os-release ]; then
    # freedesktop.org and systemd
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
elif [ -f /etc/lsb-release ]; then
    # For some versions of Debian/Ubuntu without lsb_release command
    . /etc/lsb-release
    OS=$DISTRIB_ID
    VER=$DISTRIB_RELEASE
else
    # Fall back to uname, e.g. "Linux <version>", also works for BSD, etc.
    OS=$(uname -s)
    VER=$(uname -r)
fi

echo "Detected OS: $OS $VER"

# Install PostgreSQL based on the detected OS
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    echo "Installing PostgreSQL on Ubuntu/Debian..."
    
    echo "Updating package lists..."
    sudo apt-get update
    
    echo "Installing PostgreSQL..."
    sudo apt-get install -y postgresql postgresql-contrib
    
    # Start PostgreSQL service
    echo "Starting PostgreSQL service..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
elif [[ "$OS" == *"Fedora"* ]] || [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
    echo "Installing PostgreSQL on Fedora/CentOS/RHEL..."
    
    echo "Installing PostgreSQL..."
    sudo dnf install -y postgresql-server postgresql-contrib
    
    # Initialize PostgreSQL database
    sudo postgresql-setup --initdb --unit postgresql
    
    # Start PostgreSQL service
    echo "Starting PostgreSQL service..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
elif [[ "$OS" == *"Arch"* ]]; then
    echo "Installing PostgreSQL on Arch Linux..."
    
    echo "Installing PostgreSQL..."
    sudo pacman -S --noconfirm postgresql
    
    # Initialize PostgreSQL database
    sudo mkdir -p /var/lib/postgres/data
    sudo chown -R postgres:postgres /var/lib/postgres
    sudo -u postgres initdb -D /var/lib/postgres/data
    
    # Start PostgreSQL service
    echo "Starting PostgreSQL service..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
elif [[ "$OS" == *"Mac"* ]] || [[ "$OS" == *"Darwin"* ]]; then
    if command -v brew &> /dev/null; then
        echo "Installing PostgreSQL on macOS using Homebrew..."
        brew install postgresql
        brew services start postgresql
    else
        echo "Homebrew not found. Please install Homebrew first and then run this script again."
        echo "You can install Homebrew by running:"
        echo '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
        exit 1
    fi
else
    echo "Unsupported OS: $OS"
    echo "Please install PostgreSQL manually and then run the setup-database.sh script."
    exit 1
fi

# Check if PostgreSQL was installed successfully
if command -v psql &> /dev/null; then
    echo "PostgreSQL installed successfully!"
else
    echo "PostgreSQL installation failed. Please install PostgreSQL manually."
    exit 1
fi

echo "PostgreSQL installation completed successfully."
echo ""
echo "Next steps:"
echo "1. Run setup-database.sh to create the database and user"
echo "2. Run init-schema.sh to initialize the database schema"
echo ""
