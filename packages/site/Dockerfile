FROM node:20.18.0

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY fabstirdb-lib.tgz ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application code
COPY . .

# Apply particle-network fixes
RUN cp -r ./node_modules/viem ./node_modules/@particle-network/auth-core/node_modules \
    && cp -r ./node_modules/abitype ./node_modules/@particle-network/auth-core/node_modules \
    && for file in "chunk-H5PUG6U3.mjs.map" "chunk-45SUOK7A.mjs"; do \
    [ -e "node_modules/@particle-network/authkit/dist/esm/$file" ] \
    && sed -i 's|lodash/get|lodash/get.js|g' "node_modules/@particle-network/authkit/dist/esm/$file"; \
    done

# Build the application
RUN yarn build

# Remove env from container
RUN rm -f ./.env.local

# Expose port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]