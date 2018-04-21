build: install

install:
	yarn install --pure-lockfile

container: build
	docker build -t privacy .

docker: container

up: 
	docker run -d -p 4500:80 -v /home/jnevins/repositories/spotx-js-privacy/index.html:/usr/share/nginx/html/index.html -v /home/jnevins/repositories/spotx-js-privacy/src:/usr/share/nginx/html/src -v /home/jnevins/repositories/spotx-js-privacy/node_modules:/usr/share/nginx/html/node_modules nginx

run-container: container
	docker run -d -p 4500:80 --name privacy privacy