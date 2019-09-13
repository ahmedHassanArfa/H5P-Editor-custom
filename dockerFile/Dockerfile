FROM ubuntu
RUN apt update -y
EXPOSE 8080
WORKDIR /data

COPY . /data
VOLUME ["/data/h5p-content"]

RUN sudo apt install nodejs -y
RUN sudo apt install npm -y
RUN npm install
RUN npm start