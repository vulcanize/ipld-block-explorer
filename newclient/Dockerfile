FROM node:15.11.0-alpine3.10 as builder

# Create app directory
WORKDIR /app

RUN apk add --no-cache \
    make g++ git ca-certificates

RUN npm install -g typescript ts-node

COPY package.json ./
COPY yarn.lock ./
COPY .npmrc.example ./

ARG GITHUB_TOKEN
RUN cp .npmrc.example .npmrc && sed -i "s/TOKEN/${GITHUB_TOKEN}/" .npmrc

RUN yarn

COPY . .

RUN yarn build

# nginx container
FROM nginx:1.19.10-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY entrypoint.sh /usr/share/nginx/

ENTRYPOINT ["/usr/share/nginx/entrypoint.sh"]
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
