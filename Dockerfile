FROM node:10

RUN git clone --recursive https://github.com/nicolaschan/bell.git bell
WORKDIR /bell
RUN npm version $(git describe)
RUN yarn install
RUN yarn build

CMD ["yarn", "start"]
