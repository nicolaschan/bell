FROM node:10

ADD . /bell
WORKDIR /bell
RUN git config --global user.email "jenkins@nicolaschan.com"
RUN git config --global user.name "Jenkins"
RUN npm version $(git describe)
RUN yarn install
RUN yarn build

CMD ["yarn", "start"]
