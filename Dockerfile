FROM nginx
COPY ./index.html /usr/share/nginx/html
COPY ./src /usr/share/nginx/html/src
COPY ./node_modules /usr/share/nginx/html/node_modules