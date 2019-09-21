var ns = H5PEditor;

(function($) {
    H5PEditor.init = function() {
        H5PEditor.$ = H5P.jQuery;
        H5PEditor.basePath = H5PIntegration.editor.libraryUrl;
        H5PEditor.fileIcon = H5PIntegration.editor.fileIcon;
        H5PEditor.ajaxPath = H5PIntegration.editor.ajaxPath;
        H5PEditor.filesPath = H5PIntegration.editor.filesPath;
        H5PEditor.apiVersion = H5PIntegration.editor.apiVersion;

        // Semantics describing what copyright information can be stored for media.
        H5PEditor.copyrightSemantics = H5PIntegration.editor.copyrightSemantics;
        H5PEditor.metadataSemantics = H5PIntegration.editor.metadataSemantics;

        // Required styles and scripts for the editor
        H5PEditor.assets = H5PIntegration.editor.assets;

        // Required for assets
        H5PEditor.baseUrl = '';

        if (H5PIntegration.editor.nodeVersionId !== undefined) {
            H5PEditor.contentId = H5PIntegration.editor.nodeVersionId;
        }

        var h5peditor;
        var $type = $('input[name="action"]');
        var $upload = $('.h5p-upload');
        var $create = $('.h5p-create').hide();
        var $editor = $('.h5p-editor');
        var $library = $('input[name="library"]');
        var $params = $('input[name="parameters"]');
        var library = $library.val();

        // $type.change(function () {
        //   if ($type.filter(':checked').val() === 'upload') {
        //     $create.hide();
        //     $upload.show();
        //   }
        //   else {
        $upload.hide();
        if (h5peditor === undefined) {
            $.ajax({
                type: 'GET',
                url: 'params' + window.location.search,
                success: function(res) {
                    h5peditor = new ns.Editor(
                        res.library,
                        JSON.stringify(res.params),
                        $editor[0]
                    );
                    $create.show();
                    // $type.change();
                },
                error: function(res) {
                    h5peditor = new ns.Editor(undefined, undefined, $editor[0]);
                    $create.show();
                }
            });
        }
        $create.show();
        //   }
        // });

        if ($type.filter(':checked').val() === 'upload') {
            $type.change();
        } else {
            $type
                .filter('input[value="create"]')
                .attr('checked', true)
                .change();
        }

        // important for submit //////////////////////
        
        $('#h5p-content-form').submit(function(event) {
            if (h5peditor !== undefined) {
                var params = h5peditor.getParams();

                if (params.params !== undefined) {
                    // Validate mandatory main title. Prevent submitting if that's not set.
                    // Deliberatly doing it after getParams(), so that any other validation
                    // problems are also revealed
//                    if (!h5peditor.isMainTitleSet()) {
//                    	alert("enter the title");
//                    	return event.preventDefault();
//                    }

                    // Set main library
                    $library.val(h5peditor.getLibrary());

                    // Set params
                    $params.val(JSON.stringify(params));

                    $.ajax({
                        type: 'POST',
                        data: JSON.stringify({
                            params,
                            library: h5peditor.getLibrary()
                        }),
                        success: function(res) {
                            console.log('success', res);
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log(event);
//                    window.open(event.currentTarget.baseURI.replace("/edit", "/play"), "View",'height=400px,width=700px');
                    return event.preventDefault();
                    // TODO - Calculate & set max score
                    // $maxscore.val(h5peditor.getMaxScore(params.params));
                }
            }
        });

        
        $('#useInMintForm').submit(function(event) {
        	if (h5peditor !== undefined) {
        		// Validate mandatory main title. Prevent submitting if that's not set.
                // Deliberatly doing it after getParams(), so that any other validation
                // problems are also revealed
                if (!h5peditor.isMainTitleSet()) {
                	alert("enter the title");
                	return event.preventDefault();
                }
        	}
                    
        	console.log($("input:first").val());
        	var url_string = window.location.href
        	var url = new URL(url_string);
        	var spaceId = url.searchParams.get("spaceId");
        	var userId = url.searchParams.get("userId");
        	var access_token = url.searchParams.get("access_token");
        	var contentId = url.searchParams.get("contentId");
        	var backendContentId;
            
        	// get send_content_to_mint
	    	var xhttp = new XMLHttpRequest(); 
	    	var url = window.location.origin + "/send_content_to_mint?contentId=" + contentId +
	    	"&spaceId=" + spaceId + "&access_token=" + access_token + "&name=" + $("input:first").val() + "&userId=" + userId;
	    	console.log(url);
	    	xhttp.open("GET", url);
	    	xhttp.send();
	    	xhttp.onreadystatechange = function() {
        	    if (this.status !== 200) {
        	    	console.log(this.responseText);
        	    	alert(this.responseText);
        	    }
//        	    backendContentId = this.responseText;
        	    window.location = "https://webcore.mintplatform.net/Space/View/" + spaceId;
	    	}
        	
        	return event.preventDefault();
        });
        
        
        // Title label
        var $title = $('#h5p-content-form #title');
        var $label = $title.prev();
        $title
            .focus(function() {
                $label.addClass('screen-reader-text');
            })
            .blur(function() {
                if ($title.val() === '') {
                    $label.removeClass('screen-reader-text');
                }
            })
            .focus();

        // Delete confirm
        $('.submitdelete').click(function() {
            return confirm(H5PIntegration.editor.deleteMessage);
        });
    };

    H5PEditor.getAjaxUrl = function(action, parameters) {
        var url = H5PIntegration.editor.ajaxPath + action;

        if (parameters !== undefined) {
            for (var property in parameters) {
                if (parameters.hasOwnProperty(property)) {
                    url += '&' + property + '=' + parameters[property];
                }
            }
        }

        url += window.location.search.replace(/\?/g, '&');
        return url;
    };

    $(document).ready(H5PEditor.init);
})(H5P.jQuery);
