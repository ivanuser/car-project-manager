#!/bin/bash

echo "🔍 PostgreSQL Service Check"
echo "=========================="
echo

# Check if PostgreSQL service is running
echo "1. Checking PostgreSQL service status..."
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL service is running"
else
    echo "❌ PostgreSQL service is not running"
    echo "   Starting PostgreSQL..."
    sudo systemctl start postgresql
    
    if systemctl is-active --quiet postgresql; then
        echo "✅ PostgreSQL service started successfully"
    else
        echo "❌ Failed to start PostgreSQL service"
        exit 1
    fi
fi

echo

# Check if we can connect to PostgreSQL
echo "2. Testing PostgreSQL connection..."
if sudo -u postgres psql -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ PostgreSQL is accessible"
    
    # Show PostgreSQL version
    echo "📋 PostgreSQL version:"
    sudo -u postgres psql -c "SELECT version();" | head -3
    
    echo
    echo "3. Checking if database 'cajpro' exists..."
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw cajpro; then
        echo "✅ Database 'cajpro' exists"
    else
        echo "❌ Database 'cajpro' does not exist"
        echo "   Creating database..."
        sudo -u postgres createdb cajpro
        
        if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw cajpro; then
            echo "✅ Database 'cajpro' created successfully"
        else
            echo "❌ Failed to create database 'cajpro'"
            exit 1
        fi
    fi
    
    echo
    echo "4. Checking if user 'cajpro' exists..."
    if sudo -u postgres psql -c "SELECT 1 FROM pg_roles WHERE rolname='cajpro';" | grep -q "1 row"; then
        echo "✅ User 'cajpro' exists"
    else
        echo "❌ User 'cajpro' does not exist"
        echo "   Creating user..."
        sudo -u postgres psql -c "CREATE USER cajpro WITH PASSWORD '22@@jesusistheLORD';"
        
        if sudo -u postgres psql -c "SELECT 1 FROM pg_roles WHERE rolname='cajpro';" | grep -q "1 row"; then
            echo "✅ User 'cajpro' created successfully"
        else
            echo "❌ Failed to create user 'cajpro'"
            exit 1
        fi
    fi
    
    echo
    echo "5. Granting permissions..."
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cajpro TO cajpro;"
    sudo -u postgres psql -c "ALTER USER cajpro CREATEDB;"
    echo "✅ Permissions granted"
    
else
    echo "❌ Cannot connect to PostgreSQL"
    echo "   Please check PostgreSQL installation and configuration"
    exit 1
fi

echo
echo "✅ PostgreSQL setup verification complete!"
echo "   You can now test the application database connection."
