FROM node:10

RUN git clone https://github.com/nicolaschan/bell.git bell
WORKDIR /bell
RUN yarn install
RUN yarn build

CMD ["yarn", "start"]
