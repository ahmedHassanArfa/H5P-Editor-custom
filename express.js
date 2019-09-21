const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const index = require('./index');

const H5PEditor = require('h5p-editor');
const H5PPlayer = require('h5p-player');

const examples = require('./examples.json');

const start = async () => {
    const h5pEditor = new H5PEditor.Editor(
        {
            baseUrl: '/h5p',
            ajaxPath: '/ajax?action=',
            libraryUrl: '/h5p/editor/', // this is confusing as it loads no library but the editor-library files (needed for the ckeditor)
            filesPath: '/h5p/content'
        },
        new H5PEditor.InMemoryStorage(),
        await new H5PEditor.Config(new H5PEditor.JsonStorage(path.resolve('config.json'))).load(),
        new H5PEditor.FileLibraryStorage(`${path.resolve('')}/h5p/libraries`),
        new H5PEditor.FileContentStorage(`${path.resolve('')}/h5p/content`),
        new H5PEditor.User(),
        new H5PEditor.TranslationService(H5PEditor.englishStrings)
    );

    const server = express();

    server.use(bodyParser.json());
    server.use(
        bodyParser.urlencoded({
            extended: true
        })
    );
    server.use(
        fileUpload({
            limits: { fileSize: 50 * 1024 * 1024 }
        })
    );

    const h5pRoute = '/h5p';

    server.get(`${h5pRoute}/libraries/:uberName/:file(*)`, async (req, res) => {
        const stream = await h5pEditor.libraryManager.getFileStream(H5PEditor.Library.createFromName(req.params.uberName), req.params.file);
        stream.on("end", () => { res.end(); })
        stream.pipe(res.type(path.basename(req.params.file)));
    });

    server.get(`${h5pRoute}/content/:id/content/:file(*)`, async (req, res) => {
        const stream = await h5pEditor.contentManager.getContentFileStream(req.params.id, `content/${req.params.file}`, null);
        stream.on("end", () => { res.end(); })
        stream.pipe(res.type(path.basename(req.params.file)));
    });

    server.use(h5pRoute, express.static(`${path.resolve('')}/h5p`));

    server.use('/favicon.ico', express.static(`favicon.ico`));

    server.get('/', (req, res) => {
        fs.readdir(
            'h5p/content',
            (error, files) => {
                if (error) files = [];
                res.end(index({ contentIds: files, examples }));
            }
        );
    });

    server.get('/play', (req, res) => {
        if (!req.query.contentId) {
            return res.redirect('/');
        }

        const libraryLoader = (lib, maj, min) =>
            h5pEditor.libraryManager.loadLibrary(new H5PEditor.Library(lib, maj, min));
        Promise.all([
            h5pEditor.contentManager.loadContent(req.query.contentId),
            h5pEditor.contentManager.loadH5PJson(req.query.contentId)
        ])
            .then(([contentObject, h5pObject]) =>
                new H5PPlayer.Player(libraryLoader)
                    .render(req.query.contentId, contentObject, h5pObject)
                    .then(h5p_page => res.end(h5p_page))
                    .catch(error => res.status(500).end(error.message)));
    });

    server.get('/examples/:key', (req, res) => {
        let key = req.params.key;
        let name = path.basename(examples[key].h5p);
        const tempPath = path.resolve('tmp');
        const tempFilename = path.join(tempPath, name);

        const libraryLoader = async (lib, maj, min) =>
            h5pEditor.libraryManager.loadLibrary(new H5PEditor.Library(lib, maj, min));

        exec(`sh download-example.sh ${examples[key].h5p}`)
            .then(async () => {
                const contentId = await h5pEditor.packageManager.addPackageLibrariesAndContent(tempFilename, { canUpdateAndInstallLibraries: true });
                const h5pObject = await h5pEditor.contentManager.loadH5PJson(contentId);
                const contentObject = await h5pEditor.contentManager.loadContent(contentId);
                return new H5PPlayer.Player(libraryLoader).render(
                    contentId,
                    contentObject,
                    h5pObject
                );
            })
            .then(h5p_page => res.end(h5p_page))
            .catch(error => res.status(500).end(error.message))
            .finally(() => {
                fs.unlinkSync(tempFilename);
                fs.rmdirSync(tempPath);
            });
    });

    server.get('/edit', async (req, res) => {
        if (!req.query.contentId) {
        	if (Object.keys(req.query).length === 0) {
        		res.redirect(`?contentId=${await h5pEditor.contentManager.createContentId()}`);
        	} else {
        		res.redirect(req.originalUrl + `&contentId=${await h5pEditor.contentManager.createContentId()}`);
        	}
        }
        h5pEditor.render(req.query.contentId)
            .then(page => res.end(page));
    });

    server.get('/params', (req, res) => {
        h5pEditor
            .loadH5P(req.query.contentId)
            .then(content => {
                res.status(200).json(content);
            })
            .catch(() => {
                res.status(404).end();
            });
    });

    server.get('/ajax', (req, res) => {
        const { action } = req.query;
        const { majorVersion, minorVersion, machineName, language } = req.query;

        switch (action) {
            case 'content-type-cache':
                h5pEditor.getContentTypeCache().then(contentTypeCache => {
                    res.status(200).json(contentTypeCache);
                });
                break;

            case 'libraries':
                h5pEditor
                    .getLibraryData(
                        machineName,
                        majorVersion,
                        minorVersion,
                        language
                    )
                    .then(library => {
                        res.status(200).json(library);
                    });
                break;

            default:
                res.status(400).end();
                break;
        }
    });

    server.post('/edit', (req, res) => {
    	if(req.body.params !== undefined && req.body !== undefined){
    		h5pEditor
            .saveH5P(
                req.query.contentId,
                req.body.params.params,
                req.body.params.metadata,
                req.body.library
            )
            .then(() => {
                res.status(200).end();
            });
    	} else {
    		res.end();
    	}
    });

    server.post('/ajax', (req, res) => {
        const { action } = req.query;
        switch (action) {

            case 'libraries':
                h5pEditor.getLibraryOverview(req.body.libraries).then(libraries => {
                    res.status(200).json(libraries);
                });
                break;

            case 'files':
                h5pEditor
                    .saveContentFile(
                        req.body.contentId === '0'
                            ? req.query.contentId
                            : req.body.contentId,
                        JSON.parse(req.body.field),
                        req.files.file
                    )
                    .then(response => {
                        res.status(200).json(response);
                    });
                break;

            case 'library-install':
                h5pEditor.installLibrary(req.query.id)
                    .then(() => h5pEditor.getContentTypeCache()
                        .then(contentTypeCache => {
                            res.status(200).json({ success: true, data: contentTypeCache });
                        }))
                break;

            case 'library-upload':
                h5pEditor.uploadPackage(req.files.h5p.data, req.query.contentId)
                    .then((contentId) => Promise.all([
                        h5pEditor.loadH5P(contentId),
                        h5pEditor.getContentTypeCache()
                    ])

                        .then(([content, contentTypes]) =>
                            res.status(200).json({
                                success: true,
                                data: {
                                    h5p: content.h5p,
                                    content: content.params.params,
                                    contentTypes
                                }
                            })))
                break;

            default:
                res.status(500).end('NOT IMPLEMENTED');
                break;
        }
    });
    
    server.get('/download', (req, res) => {
    	
    	var contentPath = __dirname + '/h5p/content/' + req.query.contentId + '/';
    	var libararyPath = __dirname + '/h5p/' + 'libraries/';
    	console.log(contentPath);
    	console.log(libararyPath);
    	var zipped = getZippedFolderSync(contentPath, contentPath);
    	console.log(zipped);
    	fs.writeFile(req.query.contentId + ".h5p", zipped, function(err) {
    	    if(err) {
    	        return console.log(err);
    	    }
    	    res.download(req.query.contentId + '.h5p');
    	    console.log("File saved successfully!");
    	});
//    	return zipped;
//    	res.sendFile('/home/mint/Development/git/' + path.basename(__dirname) + '/zipped.h5p');
    	
    });
    
    
//    const fs = require('fs')
//    var path = require('path')
    const JSZip = require('jszip-sync')

    function getZippedFolderSync(contentDir, libarayDir) {
    	let contentPaths = getFilePathsRecursiveSync(contentDir)
    	let libarayPaths = getFilePathsRecursiveSync(libarayDir)
    	let allPaths = contentPaths.concat(libarayPaths);
    	console.log(allPaths)

    	let zip = new JSZip()
    	let zipped = zip.sync(() => {
    		for (let filePath of contentPaths) {
    			let addPath = path.relative(contentDir, filePath)
    			// let addPath = path.relative(dir, filePath) // use this instead if you don't want the source folder itself in the zip
    			console.log(filePath)
    			let data = fs.readFileSync(filePath)
    			zip.file(addPath, data)
    		}
    		for (let filePath of libarayPaths) {
    			let addPath = path.relative(libarayDir, filePath)
    			// let addPath = path.relative(dir, filePath) // use this instead if you don't want the source folder itself in the zip
    			console.log(filePath)
    			let data = fs.readFileSync(filePath)
    			zip.file(addPath, data)
    		}
    		let data = null;
    		zip.generateAsync({type:"nodebuffer"}).then((content) => {
    			data = content;
    		});
    		return data;
    	})
    	return zipped;
    }

    // returns a flat array of absolute paths of all files recursively contained in the dir
    function getFilePathsRecursiveSync(dir) {
    	var results = []
    	list = fs.readdirSync(dir)
    	var pending = list.length
    	if (!pending) return results

    	for (let file of list) {
    		file = path.resolve(dir, file)
    		let stat = fs.statSync(file)
    		if (stat && stat.isDirectory()) {
    			res = getFilePathsRecursiveSync(file)
    			results = results.concat(res)
    		} else {
    			results.push(file)
    		}
    		if (!--pending) return results
    	}

    	return results
    }
    
    server.get('/download/content', async (req, res) => {
        const stream = await h5pEditor.contentManager.getContentFileStream(1439642047, '/content/beautiful-beauty-blue-414612.jpg', null);
        stream.on("end", () => { res.end(); })
        stream.pipe(res.type(path.basename('beautiful-beauty-blue-414612.jpg')));
        // export 
//        window.location.href = contentData.exportUrl;
//        instance.triggerXAPI('downloaded');
        
    });
    
    
    server.get('/send_content_to_mint', async (req, res) => {
    	var querystring = require('querystring');
        var request = require('request');
        var fs = require("fs");
    	
//    	var url_string = window.location.href
//    	var url = new URL(url_string);
    	var spaceId = req.query.spaceId;
    	var userId = req.query.userId;
    	var access_token = req.query.access_token;
    	var contentId = req.query.contentId;
    	var name = req.query.name;
    	var backendContentId;
    	var contentlength;
    	console.log(req.query);
    	console.log(req.headers.host);
    	
    	 // get content as .h5p
    	var zippedPath = null;
    	request({
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            uri: 'http://' + req.headers.host + '/download?contentId=' + contentId,
            method: 'GET'
          }, function (err, response, body) {
        	  zipped = body;
        	  const stats = fs.statSync(__dirname + '/' + contentId + '.h5p');
        	  contentlength = stats.size;
        	  console.log(contentlength);
//        	  console.log(body);
//        	  console.log(response);
        	  if(err) {
				  console.log(err)
				  res.end(err);
				  return err;
			  }
        	  
        	  

          	
          	// send post request to create content in backend
          	var form = JSON.stringify({
          	    "name": name,
          	    "shelf": 'interactive',
          	    "checkSum":"000",
          	    "spaceId":spaceId,
          	    "contentLength":contentlength ,
          	    "ext":"h5p",
          	    "tags":["ddd","ddd"],
          	    "type":"H5P",
          	    "thumbnail":""
          	});

          	request({
      		    headers: {
      		      'Content-Type': 'application/json',
      		      'Authorization': 'Bearer ' + access_token
      		    },
      		    uri: 'https://testapi.mintplatform.net/api/content',
      		    body: form,
      		    method: 'POST'
      		  }, function (err, response, body) {
      			  if(err) {
      				  console.log(err)
      				  res.end(err);
      				  return err;
      			  }
      			  if(response.statusCode !== 200) {
      				  console.log(response)
      				  res.end(response);
      				  return response;
      			  }  
      			  console.log(body);
      			  backendContentId = JSON.parse(body).data;
      			  
      			// start init upload
      			  var taskId = null;
      			  request({
      		            headers: {
      		              'Authorization': 'Bearer ' + access_token
      		            },
      		            uri: 'https://testapi.mintplatform.net/api/content/upload/' + Number(backendContentId),
      		            method: 'GET'
      		          }, function (err, response, body) {
      		        	  if(response.statusCode !== 200) {
      						  console.log(response.statusCode)
      						  return response;
      					  }
      		        	  console.log(Number(backendContentId));
      		        	  console.log(JSON.parse(body));
      		        	  taskId = JSON.parse(body).data.taskId;
      		        	  console.log(taskId);
      		            
      		            
      		         // resume upload content
      		            
          		        	  // resume upload content
          		        	  request({
          			    		    headers: {
          			    		      'Content-Type': 'multipart/form-data',
          			    		      'Authorization': 'Bearer ' + access_token,
          			    		      'uid': taskId
          			    		    },
          			    		    uri: 'https://testapi.mintplatform.net/api/content/upload',
          			    		    method: 'POST',
          			    		   formData: 
          		    		          { file: 
          		    		             { value: fs.createReadStream(__dirname + '/' + contentId + '.h5p'),
          		    		               options: 
          		    		                { filename: 'zipped.h5p',
          		    		                  contentType: 'application/zip' } } }
          			    		    
          			    		  }, function (err, response, body) {
          			    			  if(err) {
          	    						  console.log(err)
          	    						  res.end(err);
          	    						  return err;
          	    					  }
//          			    			  if(response.statusCode !== 200) {
//          			    				  console.log(response.statusCode)
//          			    				  return response;
//          			    			  }
          			    			  console.log(body);
          			    			  
          			    			// commit upload then redirect
          			    			  request({
          			  		            headers: {
          			  		              'Authorization': 'Bearer ' + access_token
          			  		            },
          			  		            uri: 'https://testapi.mintplatform.net/api/content/upload/commit/' + taskId,
          			  		            method: 'GET'
          			  		          }, function (err, response, body) {
          			  		        	console.log(body);
          			  		        	if(response.statusCode !== 200) {
          			  					  console.log(response.statusCode)
          			  					  return response;
          			  				  }
          			  		        	res.json(body);
          			  		          });
          			    			  
          			    		  });
          		        	  
      		            
      		            
      		          });
      			  
      			  
      		  });
        	  
        	  
        	  
          });	  
    	
    	
    	res.redirect("https://webcore.mintplatform.net/Content/Index/" + backendContentId);
        
    });

    server.listen(process.env.PORT || 8080, () => {
        console.log(`server running at http://localhost:${process.env.PORT || 8080}`);
    });
}

start();
