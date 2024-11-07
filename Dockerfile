FROM node:20.18.0



WORKDIR /app


COPY . .


WORKDIR /app/packages/site

RUN yarn
RUN yarn build



EXPOSE 3000

CMD ["yarn", "start"]
