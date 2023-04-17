// POP UP
function gimmepops(title,content,cl){
    $('#pops').html('');
    $('#pops').remove();

    var myvar = '<div id="pops" class="pops animated fadeIn '+cl+'">'+
    '		<div class="pops-title">'+title+'</div>'+
    '		<div class="pops-content">'+content+'</div>'+
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
    var myvar = '<div id="tpos-global-nav" class="tpos-global-nav">'+
    '    <div class="tgn-btn" data-action="init">home</div>'+
    // '    <div class="tgn-btn" data-action="systemstats">system stats</div>'+
    // '    <div class="tgn-btn-xtra" data-action="dynamicstats">dynamic stats</div>'+
    // '    <div class="tgn-btn-xtra" data-action="test1stats">test 1 stats</div>'+
    '</div>';


    // var oldmenuhidden='<div id="oldmenuhidden" class="hide"></div>';
    var oldmenu=$('#DeltaTopNavigation');
    // oldmenu.append(oldmenuhidden);
    // var oldnav=oldmenu.html();
    // $('#oldmenuhidden').html(oldnav);
    oldmenu.html(myvar);

    // oldmenu.replaceWith(myvar);
    // $('#zz12_TopNavigationMenu').replaceWith(myvar);
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
    var t = '<div class="databox-small  ' + color + '" id="' + id + '"><div class="databox-small-content">' + v + '</div><div class="databox-small-title">' + title + '</div></div>';
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

function mkBtn(action, entity, title, v){
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
    // var t = '<div class="tpos-btn ' + action + '" data-action="' + v + '" onclick="' + fn + '(' + v + ')" >' + i1 + ' ' + i3 + ' ' + i2 + '<div>' + title + '</div></div>';
    var t = '<div class="tpos-btn ' + action + '" data-action="' + v + '">' + i1 + ' ' + i3 + ' ' + i2 + '<div>' + title + '</div></div>';
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
    var t='<div class="tpos-rvbtn" data-item="'+hazardid+'" data-action="'+action+'" data-currentstatus="'+currentstatus+'" data-laststatus="'+laststatus+'">'+title+'</div>';
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
        options += '<tr style="display:none;" class="tpos-' + lst + '-select-value dvs" data-list="' + lst + '" data-value="' + itid + '"><td class="hide">*' + ittitle.toLowerCase() + '</td><td id="dv_' + lst + '_' + itid + '">' + ittitle + '</td></tr>';

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
                ////console.log(t);
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
        $('#sel_' + lst).val(dv);
        $('#val_' + lst).html(dvid);

        $('.tpos-' + lst + '-select-value').hide();
        routeSelection(lst, dvid, dv);
    });
}