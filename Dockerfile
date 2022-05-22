# Naively Simple Node Dockerfile

FROM node:lts-alpine3.15

RUN mkdir -p /home/app/ && chown -R node:node /home/app
WORKDIR /home/app
COPY --chown=node:node . .

USER node

# RUN npm ci
# RUN npm run build

RUN yarn install --pure-lockfile
RUN yarn build

EXPOSE 3000
# CMD [ "npm", "start" ]
CMD [ "yarn", "start" ]
