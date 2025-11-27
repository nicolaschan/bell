FROM node:24

ADD . /bell
WORKDIR /bell
RUN git config --global user.email "jenkins@nicolaschan.com" \
    && git config --global user.name "Jenkins" \
    && npm version $(git describe) || true \
    && yarn config set network-timeout 600000 -g \
    && yarn install \
    && yarn build

CMD ["yarn", "start"]
