// POP UP
function gimmepops(title,content){
    $('#pops').html('');
    $('#pops').remove();
        var myvar = '<div id="pops" class="pops">'+
        '		<div class="pops-title">'+escapeHTML(title)+'</div>'+
        '		<div class="pops-content">'+sanitizeHTML(content)+'</div>'+
        '		<div class="pops-footer">'+
        '			<div class="btn-cancel"><i class="fa fa-times fa-2x"></i></div>'+
        '		</div>'+
        '	</div>';
        
        $('#tpos-page').append(myvar);
        $('#pops').show();
        $('.btn-cancel').click(function(){
            closepops();
        });
}
function closepops(){
    $('#pops').html('');
    $('#pops').remove();
}



// GLOBAL NAV SUB MENU
function gimmesubs(title,content,cl){
    $('#subs').html('');
    $('#subs').remove();

    var myvar = '<div id="subs" class="subs animated fadeIn '+cl+'">'+
    '		<div class="subs-title">'+title+'</div>'+
    '		<div class="subs-content">'+content+'</div>'+
    '		<div class="subs-footer">'+
    '			<div class="btn-cancel"><i class="fa fa-times fa-2x"></i></div>'+
    '		</div>'+
    '	</div>';

    $('#tpos-page').append(myvar);
    $('#subs').show();
    $('.btn-cancel').click(function(){
        closesubs();
    });
}
function closesubs(){
    $('#subs').html('');
    $('#subs').remove();
}


// GLOBAL NAV
function global_nav(cdmSites, allHazardsData){
    var buttonHtml = '<div id="tpos-global-nav" class="tpos-global-nav"><div class="home-button" data-action="init" >Home</div></div>';
    document.getElementById('home-button').innerHTML = buttonHtml;
    activateGlobalNav(cdmSites, allHazardsData);
} 

// BUTTONS
function urbutton(data,trg){

}

function mkSmallDataBox (id, v, title, clr) {
    var color = '';
    if (clr) {
        color = 'databox-clr-' + clr;
    }
    var t = '<div class="databox-small  ' + color + '" id="' + id + '" title="Click to view hazards"><div class="databox-small-content">' + v + '</div><div class="databox-small-title">' + title + '</div></div>';
    return t;
}
function mkSmallQCDataBox (id, v,bt, title, clr) {
    var color = '';
    if (clr) {
        color = 'databox-clr-' + clr;
    }
    var t = '<div class="db-wrapper"><div class="databox-small  ' + color + '" id="' + id + '"><div class="databox-small-content">' + v + '</div><div class="databox-small-title">' + bt + '</div></div></div>';
    return t;
}

function mkBtn(action, entity, title, v, tooltip){
    var actionimg = ['<img width="16" src="../../pages/2.0/img/signing-the-contract.svg">', '<img width="16" src="../../pages/2.0/img/note-interface-symbol.svg">', '<img width="16" src="../../pages/2.0/img/add.svg">'];
    var entityimg = '<img width="32" src="../../pages/2.0/img/toxic-sign.svg">';
    var typeimg = ['<img width="24" src="../../pages/2.0/img/drawing-tool.svg">', '<img width="24" src="../../pages/2.0/img/helmet.svg">'];
    var i1 = '';
    var i2 = entityimg;
    var i3 = '';
    if (action == 'add') {
        i1 = actionimg[2];
    }
    if (action == 'edit') {
        i1 = actionimg[1];
    }
    if (action == 'review') {
        i1 = actionimg[0];
    }
    if (entity == 'design') {
        i3 = typeimg[0];
    }
    if (entity == 'rams') {
        i3 = typeimg[1];
    }
    if (!entity) {
        i3 = '';
    }
    // Added functionality - ability to add an optional tooltip
    var t;
    if (tooltip !== undefined) {
        t = '<div class="tpos-btn ' + action + '" data-action="' + v + '" title="' + tooltip + '" >' + i1 + ' ' + i3 + ' ' + i2 + '<div>' + title + '</div></div>';
    } else {
        t = '<div class="tpos-btn ' + action + '" data-action="' + v + '" >' + i1 + ' ' + i3 + ' ' + i2 + '<div>' + title + '</div></div>';
    }
    return t;

}

function mkReviewButton(action,company,userrole,site,hazardid,title){
    var s=site;
    if(!site){s='';}
    var t='<div class="tpos-rvbtn" data-item="'+hazardid+'" data-action="'+action+'" data-company="'+company+'" data-site="'+s+'" data-userrole="'+userrole+'">'+title+'</div>';
    return t;
}

function mkHazardReviewButton(action,currentstatus,laststatus,hazardid,title){
    // var s=site;
    // if(!site){s='';}
    var t='<div class="tpos-rvbtn" data-item="'+hazardid+'" data-action="'+action+'" data-currentstatus="'+currentstatus+'" data-laststatus="'+laststatus+'" title= "Click to advance the hazard in the workflow">'+title+'</div>';
    return t;
}

// ui={
//     mkBTN: function (action, entity, title, fn, v) {
//         var actionimg = ['<img width="16" src="../../pages/2.0/img/signing-the-contract.svg">', '<img width="16" src="../../pages/2.0/img/note-interface-symbol.svg">', '<img width="16" src="../../pages/2.0/img/add.svg">'];
//         var entityimg = '<img width="32" src="../../pages/2.0/img/toxic-sign.svg">';
//         var typeimg = ['<img width="24" src="../../pages/2.0/img/drawing-tool.svg">', '<img width="24" src="../../pages/2.0/img/helmet.svg">'];
//         var i1 = '';
//         var i2 = entityimg;
//         var i3 = '';
//         if (action == 'add') {
//             i1 = actionimg[2];
//         }
//         if (action == 'edit') {
//             i1 = actionimg[1];
//         }
//         if (action == 'review') {
//             i1 = actionimg[0];
//         }
//         if (entity == 'design') {
//             i3 = typeimg[0];
//         }
//         if (entity == 'rams') {
//             i3 = typeimg[1];
//         }
//         if (!entity) {
//             i3 = '';
//         }
//         // var t = '<div class="tpos-btn ' + action + '" data-action="' + v + '" onclick="' + fn + '(' + v + ')" >' + i1 + ' ' + i3 + ' ' + i2 + '<div>' + title + '</div></div>';
//         var t = '<div class="tpos-btn ' + action + '" data-action="' + v + '">' + i1 + ' ' + i3 + ' ' + i2 + '<div>' + title + '</div></div>';
//         return t;
//     },

// };

function mkSelect (lst, data, fset, trg) {
    var tlist = data.d.results;
    $('#div_' + trg).hide();
    $('#div_' + trg).html('');
    var options = '<tr><td class="hide" id="val_' + lst + '">0</td><td><input class="tpos-' + lst + '-select-input dvi" id="sel_' + lst + '" autofill="false" password="false"></td></tr>';
    for (var cc = 0; cc < tlist.length; cc++) {
        var it = tlist[cc];
        var itid = it.ID;
        var ittitle = it.Title;
        var ittitleHidden = it.Title;
        if (trg === 'sel_structures' && configData['Create hazard show asset description']) {
            // Filter out the assets that aren't marked as assets (prmiary assets, deleted assets, etc)
            if (tlist[cc].AssetType !== "Asset") {
                continue;
            }
            // Add the UAID to the UI
            ittitle = `<b>Asset</b>: ${ittitle}; <b>UAID</b>: ${it.UAID}`;
            ittitleHidden = `Asset: ${ittitle}; UAID: ${it.UAID}`;
        }
        options += '<tr style="display:none;" class="tpos-' + lst + '-select-value dvs" data-list="' + lst + '" data-value="' + itid + '"><td class="hide">*' + ittitleHidden.toLowerCase() + '</td><td id="dv_' + lst + '_' + itid + '">' + ittitle + '</td></tr>';

    }
    $('#div_' + trg).html('<table class="tpos-select-table">' + options + '</table>');
    $('#div_' + trg).show();
    $('#mainArea').addClass('addheight');
    $('#sel_' + lst).bind('keyup change', function (ev) {
        var st = $(this).val().toLowerCase();
        $('#val_' + lst).html('0');
        $('#sctSite').val('0');
        sSite = 0;
        if (st) {
            $('tr:not(:contains(' + st + '))').each(function () {
                var t = $(this).html();
                if ($(this).hasClass('tpos-' + lst + '-select-value') == 1) {
                    $(this).hide();
                }
            });
            $('tr:contains(' + st + ')').each(function () {
                if ($(this).hasClass('tpos-' + lst + '-select-value') == 1) {
                    $(this).show();
                }

            });
            // $('tr td:contains(' + st + ')').show();
        }
    });
    $('#sel_' + lst).click(function () {
        var st = $(this).val().toLowerCase();
        toastr.success(st);
        if (!st || st == '') {
            $('tr').each(function () {
                if ($(this).hasClass('tpos-' + lst + '-select-value') == 1) {
                    if ($(this).is(":visible")) {
                        $(this).hide();
                    } else {
                        $(this).show();
                    }
                }

            });
        }

    });
    $('.tpos-' + lst + '-select-value').click(function () {
        var dvid = $(this).data('value');
        var dv = $('#dv_' + lst + '_' + dvid).html();
        if (trg === 'sel_structures' && configData['Create hazard show asset description']) { // In this case we need to process the string to get just the asset
            dv = dv.split(';')[0].split(':')[1].trim();
        }
        $('#sel_' + lst).val(dv);
        $('#val_' + lst).html(dvid);

        $('.tpos-' + lst + '-select-value').hide();
        routeSelection(lst, dvid, dv);
    });
}

/**
 * Escapes string to be inputted into HTML to prevent XSS
 * @param {str} str The string to escape
 * @return {str} The escaped string
 */
function escapeHTML(str) {
    if (str) {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    } else {
        return str;
    }
}

/**
 * Sanitises html to be inputted into the DOM to prevent XSS. Unlike the above function, this function is for inputs we want to be interpretted as html, so we allow
 * some tags and attributes
 * @param {str} str html to be sanitised
 * @returns {str} sanitised html
 */
function sanitizeHTML(str) {
    var temp = document.createElement('div');
    temp.innerHTML = str;

    // List of allowed tags and attributes
    var allowedTags = ['b', 'i', 'em', 'strong', 'a', 'div', 'span', 'textarea', 'table', 'tbody', 'td', 'tr'];
    var allowedAttributes = ['href', 'title', 'class', 'id', 'rows', 'cols', 'data-ctag'];

    // Function to recursively sanitize nodes
    function sanitizeNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            // Remove disallowed tags
            if (!allowedTags.includes(node.tagName.toLowerCase())) {
                node.parentNode.removeChild(node);
                return;
            }

            // Remove disallowed attributes
            for (var i = node.attributes.length - 1; i >= 0; i--) {
                var attr = node.attributes[i];
                if (!allowedAttributes.includes(attr.name.toLowerCase())) {
                    node.removeAttribute(attr.name);
                }
            }
        }

        // Recursively sanitize child nodes
        for (var i = 0; i < node.childNodes.length; i++) {
            sanitizeNode(node.childNodes[i]);
        }
    }

    sanitizeNode(temp);
    return temp.innerHTML;
}

/**
 * Function to sanitize user input
 * @param {string} input 
 * @returns {string} the sanitised input
 */

function sanitizeInput(input) {
    // Create a temporary div element to hold the plain text
    var temp = document.createElement('div');
    temp.textContent = input; // Use textContent to handle plain text

    // Convert the plain text to HTML
    var html = temp.innerHTML;
    temp.innerHTML = html;

    // List of allowed tags and attributes
    var allowedTags = [];
    var allowedAttributes = [];

    // Function to recursively sanitize nodes
    function sanitizeNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            // Remove disallowed tags
            if (!allowedTags.includes(node.tagName.toLowerCase())) {
                node.replaceWith(...node.childNodes); // Replace the node with its children
                return;
            }

            // Remove disallowed attributes
            for (var i = node.attributes.length - 1; i >= 0; i--) {
                var attr = node.attributes[i];
                if (!allowedAttributes.includes(attr.name.toLowerCase())) {
                    node.removeAttribute(attr.name);
                }
            }
        }

        // Recursively sanitize child nodes
        for (var i = 0; i < node.childNodes.length; i++) {
            sanitizeNode(node.childNodes[i]);
        }
    }

    sanitizeNode(temp);
    return temp.innerHTML; // Return the sanitized HTML as plain text
}



