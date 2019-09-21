# README #


apt install curl -y
curl -sL https://deb.nodesource.com/setup_10.x | bash
apt install nodejs -y
npm install
npm install jszip -y
npm install jszip-sync -y
npm install zip-a-folder --no-audit -y
npm install merge-dirs --no-audit -y

npm start
# view from "http://localhost:8080/edit"
# note port 8080 if want to change from express.js
# also there is docker file if you want to use docker
# note there is editing in ./node_modules/h5p-editor and this changes also found in ./h5p-editor-customization , so if remove node_modules or # # # reinstall you can move this again , this changes not important but it handle how save button appear and another button in the main form to can # submit it

# there is project call standalone ./h5p-standalone we can use it here by copy content and it's liberaries under ./h5p-standdalone/content and    # make api in express.js and link it with button, this api will get standalone and copy #it to content to can download it as normal zip file with # index.html that you can use it normal from any device
