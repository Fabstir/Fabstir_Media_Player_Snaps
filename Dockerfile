FROM node:20.18.0



WORKDIR /app


COPY . .



RUN echo '' > yarn.lock
RUN yarn install


WORKDIR /app/packages/site


# temporary fix
RUN cp -r ./node_modules/viem /app/node_modules/@particle-network/auth-core/node_modules \
    && cp -r ./node_modules/abitype /app/node_modules/@particle-network/auth-core/node_modules \
    && for file in "chunk-H5PUG6U3.mjs.map" "chunk-45SUOK7A.mjs"; do \
    [ -e "node_modules/@particle-network/authkit/dist/esm/$file" ] \
    && sed -i 's|lodash/get|lodash/get.js|g' "node_modules/@particle-network/authkit/dist/esm/$file"; \
    done


RUN yarn build

# removing env from container
RUN rm ./.env.local


EXPOSE 3000

CMD ["yarn", "start"]
