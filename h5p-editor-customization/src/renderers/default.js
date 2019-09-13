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

<dialog id="myDialog" style="width:50%; z-index:150;">
	        <!DOCTYPE html><html><body style="text-align: center;"><h2>Add Content To Mint</h2>
		        <form method="post" id="useInMintForm" > 
		           Content Name:<br>  <input type="text" name="Content Name" >
		           <br>Self Name:<br><input type="text" name="Self Name" >
		           <br>Tags:<br><textarea rows="4" cols="50"> </textarea>
		           <br><br>
		         <button type="submit" class="h5peditor-copy-button" onclick="my_button_click_handler()" >Submit</button>
		            <script>
					function my_button_click_handler()
					{
					    console.log(parent.document.getElementById('useInMintForm'));
						
					}
					</script>
		         <button type="button" class="h5peditor-copy-button" onclick="closeDialog()" title="Close">Close</button>
		         </form>
	           </body></html>
	           </dialog>


<form method="post" enctype="multipart/form-data" id="h5p-content-form">
    <div id="post-body-content">
    
    
    <button type="submit" name="submit" style="background: none; border: none;" class="h5p-example-url">Save </button>
    
    <button class="h5p-example-url" style="background: none; border: none;" onclick="openDialog()" title="Use In Mint">Use In Mint</button>
	        
	           <script>
	             function openDialog() {
	               console.log(parent.document.getElementById('myDialog'));
	              parent.document.getElementById("myDialog").show();
	            }
	             function closeDialog() {
	              parent.document.getElementById("myDialog").close();
	            }
	           </script> 
	           
	           
	           
        <div class="h5p-create">
            <div class="h5p-editor"></div>
        </div>
    </div>
    <!--<input type="submit" name="submit" value="Create Interactive Content" class="button button-primary button-large">-->
</form>

</body>
</html>`;
