'use strict';

module.exports = function (model) {
    return '<html>\n<head>\n<meta charset="UTF-8">\n<script> window.H5PIntegration = parent.H5PIntegration || ' + JSON.stringify(model.integration, null, 2) + '</script>\n' + model.styles.map(function (style) {
        return '<link rel="stylesheet" href="' + style + '">';
    }).join('\n    ') + '\n' + model.scripts.map(function (script) {
        return '<script src="' + script + '"></script>';
    }).join('\n    ') + '\n</head>\n<body>\n\n<form method="post" enctype="multipart/form-data" id="h5p-content-form">\n    <div id="post-body-content">\n        <div class="h5p-create">\n            <div class="h5p-editor"></div>\n        </div>\n    </div>\n    <input type="submit" name="submit" value="Create" class="button button-primary button-large">\n</form>\n\n</body>\n</html>';
};