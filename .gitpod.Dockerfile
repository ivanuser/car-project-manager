FROM gitpod/workspace-full

# Install PostgreSQL
RUN sudo apt-get update \
    && sudo apt-get install -y postgresql postgresql-contrib \
    && sudo apt-get clean \
    && sudo rm -rf /var/cache/apt/* /var/lib/apt/lists/* /tmp/*

# Install MongoDB 7.0
RUN sudo apt-get update \
    && sudo apt-get install -y wget gnupg \
    && wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add - \
    && echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && sudo apt-get update \
    && sudo apt-get install -y mongodb-org \
    && sudo apt-get clean \
    && sudo rm -rf /var/cache/apt/* /var/lib/apt/lists/* /tmp/*

# Install Node.js LTS
RUN bash -c ". .nvm/nvm.sh \
    && nvm install --lts \
    && nvm use --lts \
    && npm install -g npm@latest"

# Set up PostgreSQL
USER root
RUN sudo -u postgres pg_ctlcluster 14 main start && \
    sudo -u postgres psql -c "CREATE DATABASE car_project_manager;" && \
    sudo -u postgres psql -c "CREATE USER gitpod WITH PASSWORD 'gitpod';" && \
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE car_project_manager TO gitpod;"

# Set up MongoDB
RUN mkdir -p /workspace/data/mongodb && \
    chown -R gitpod:gitpod /workspace/data

USER gitpod