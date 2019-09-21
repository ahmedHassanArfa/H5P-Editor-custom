module.exports = model => `<html>
<head>
<meta charset="UTF-8">
<style>
html, body {
    margin: 0;
    padding: 0;
    color: #212121;
    font-family: "Open Sans",sans-serif;
    max-width: 100%;
    position: relative;
}
</style>
<script> window.H5PIntegration = parent.H5PIntegration || ${JSON.stringify(
    model.integration,
    null,
    2
)}</script>
${model.styles
    .map(style => `<link rel="stylesheet" href="${style}">`)
    .join('\n    ')}
${model.scripts
    .map(script => `<script src="${script}"></script>`)
    .join('\n    ')}
    
</head>
<body>
 
<script>
$(document).ready(function(){
  $("#view").click(function(){
    window.open(window.location.href.replace("/edit", "/play"), "View",'height=400px,width=700px');
  });
  
  $("#download").click(function(){
    var url_string = window.location.href
			var url = new URL(url_string);
        	var contentId = url.searchParams.get("contentId");
            
        	// get send_content_to_mint
	    	var xhttp = new XMLHttpRequest(); 
	    	var url = window.location.origin + "/download?contentId=" + contentId;
	    	console.log(url);
	    	xhttp.open("GET", url);
	    	xhttp.send();
	    	xhttp.onreadystatechange = function() {
        	    if (this.status !== 200) {
        	    	console.log(this.responseText);
        	    	alert(this.responseText);
        	    }
	    	}
  });
  
});

<!--setInterval(function () {document.getElementById("submit").click();}, 1000);-->

</script>

<form method="post" enctype="multipart/form-data" id="h5p-content-form">
    <div id="post-body-content">
    
    <button type="submit" name="submit" id="submit" class="btn btn-default">Save </button>
    <button class="btn btn-default" id="view">View </button>
    <!--<button class="btn btn-default" id="download">Download </button>-->
	           
        <div class="h5p-create">
            <div class="h5p-editor"></div>
        </div>
    </div>
    <!--<input type="submit" name="submit" value="Create Interactive Content" class="button button-primary button-large">-->
</form>

</body>
</html>`;
