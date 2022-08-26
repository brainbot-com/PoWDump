FROM node:18

RUN apt-get update \
    && apt-get install -y bash git python build-essential

WORKDIR /usr/app
COPY ./ .

RUN yarn
WORKDIR /usr/app/packages

ENTRYPOINT ["npx"]
