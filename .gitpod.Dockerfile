FROM gitpod/workspace-full

# Install PostgreSQL
RUN sudo apt-get update \
    && sudo apt-get install -y postgresql postgresql-contrib \
    && sudo apt-get clean \
    && sudo rm -rf /var/cache/apt/* /var/lib/apt/lists/* /tmp/*

# Install MongoDB
RUN sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4 \
    && echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list \
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
USER gitpod
RUN pg_ctlcluster 12 main start && \
    psql -c "CREATE DATABASE car_project_manager;" && \
    psql -c "CREATE USER gitpod WITH PASSWORD 'gitpod';" && \
    psql -c "GRANT ALL PRIVILEGES ON DATABASE car_project_manager TO gitpod;"

# Set up MongoDB
RUN mkdir -p /workspace/data/mongodb

USER root