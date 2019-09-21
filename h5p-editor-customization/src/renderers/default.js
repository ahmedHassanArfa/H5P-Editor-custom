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
    
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.blockUI/2.70/jquery.blockUI.js"></script>

  <style>
  .modal-header, h4, .close {
    background-color: #8d1b3d;
    color:white !important;
    text-align: center;
    font-size: 30px;
  }
  .modal-footer {
    background-color: #f9f9f9;
  }
  </style>    
</head>
<body>

<div class="modal fade" id="myModal" role="dialog">
    <div class="modal-dialog">
    
      <!-- Modal content-->
      <div class="modal-content">
        <div class="modal-header" style="padding:35px 50px;">
          <button type="button" class="close" data-dismiss="modal">&times;</button>
          <h4> Add Content to Mint</h4>
        </div>
        <div class="modal-body" style="padding:40px 50px;">

          <form method="post" id="useInMintForm" role="form">
            <div class="form-group">
              <label for="Content_Name"><span class="glyphicon glyphicon-user"></span> Content Name</label>
              <input type="text" class="form-control" id="Content_Name" >
            </div>
            <div class="form-group">
              <label for="Self_Name"><span class="glyphicon glyphicon-user"></span> Self Name</label>
              <input type="text" class="form-control" id="Self_Name" >
            </div>
            <div class="form-group">
              <label for="tags"><span class="glyphicon glyphicon-user"></span> Tags</label>
              <textarea rows="4" cols="60" id="tags"> </textarea>
            </div>
            <button type="submit" class="btn btn-danger btn-default"  onclick="block()" >Submit</button>
            <button type="submit" class="btn btn-danger btn-default" data-dismiss="modal"> Cancel</button>
          </form>
        </div>
      </div>
      
    </div>
  </div> 
</div>
 
<script>
$(document).ready(function(){
  $("#myBtn").click(function(){
    $("#myModal").modal();
  });
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

function block() {
  $.blockUI();
  $("#myModal").modal('hide');
}

function unBlock() {
  $.unblockUI();
}

</script>

<form method="post" enctype="multipart/form-data" id="h5p-content-form">
    <div id="post-body-content">
    
    <button type="submit" name="submit" id="submit" class="btn btn-default">Save </button>
    <button class="btn btn-default" id="view">View </button>
    <!--<button class="btn btn-default" id="download">Download </button>-->
    <button type="button" class="btn btn-default" id="myBtn">Use In Mint</button>
	           
        <div class="h5p-create">
            <div class="h5p-editor"></div>
        </div>
    </div>
    <!--<input type="submit" name="submit" value="Create Interactive Content" class="button button-primary button-large">-->
</form>

</body>
</html>`;
