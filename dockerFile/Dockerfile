FROM ubuntu
RUN apt update -y
EXPOSE 8080
WORKDIR /data

COPY . /data
VOLUME ["/data/h5p-content"]

RUN apt install curl -y
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash
RUN apt install nodejs -y
RUN npm install
RUN npm install jszip -y
RUN npm install jszip-sync -y
RUN npm install zip-a-folder --no-audit -y
RUN npm install merge-dirs --no-audit -y

#COPY /data/h5p-editor-customization/ /data/node_modules/h5p-editor

CMD ["npm" , "start"]