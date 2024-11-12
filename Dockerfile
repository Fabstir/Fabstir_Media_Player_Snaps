FROM node:20.18.0



WORKDIR /app


COPY . .


WORKDIR /app/packages/site

RUN yarn
RUN yarn build

# removing env from container
RUN rm ./.env.local


EXPOSE 3000

CMD ["yarn", "start"]
