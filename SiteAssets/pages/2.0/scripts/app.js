
function getListItemsByListName(arg) { // function tol get SharePoint list loaded for use. Can be used without selction, filter, expansion.
    var appurl = _spPageContextInfo.webAbsoluteUrl;
    var listName = arg.listName;
    var selection = arg.select;
    var filter = arg.filter;
    var expansion = arg.expansion;
    var order = arg.order;
    var limit = arg.limit;
    if (selection) {
        selection = '?$select=' + selection;
    } else selection = '?$select=*';
    if (filter) {
        filter = '&$filter=' + filter;
    } else filter = '';
    if (expansion) {
        expansion = '&$expand=' + expansion;
    } else expansion = '';
    if (order) {
        order = '&$orderby=' + order;
    } else order = '';
    if (limit) {
        limit = '&$top=' + limit;
    } else limit = '&$top=200';


    // var url = appurl + "/_api/web/lists/getByTitle(%27" + listName + "%27)/items" + selection + filter + expansion + order + limit
    // var response = response || [];
    // function MakeAJAX() {
    //     return $.ajax({
    //         url: url,
    //         method: "GET",
    //         headers: {
    //             "Accept": "application/json; odata=verbose"
    //         },
    //         success: function(data) {
    //             response = response.concat(data.d.results);
    //             if (data.d.__next) {
    //                 console.log("LOOP");
    //                 url = data.d.__next;
    //                 MakeAJAX();
    //             } else {
    //                 console.log("NOT LOOP");
    //                 finalData = {d: {results: response}}
    //                 console.log(finalData);
    //                 return finalData;
    //             }
    //         },
    //         error: function(error) {
    //             console.log("Hit Error")
    //             console.log(error);
    //         },
    //     });
    // }

    // const res = MakeAJAX();
    // console.log(res);
    // return res;









    return $.ajax({
        url: appurl + "/_api/web/lists/getByTitle(%27" + listName + "%27)/items" + selection + filter + expansion + order + limit,
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        },
    });
}

function getListFields(l){
    var appurl = _spPageContextInfo.webAbsoluteUrl;

    return $.ajax({
        url: appurl + "/_api/web/lists/getbytitle('"+l+"')/fields?select=Title,FieldTypeKind&$filter=Hidden eq false and ReadOnlyField eq false",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        },
    });

}

// function getListFields(l){
//     var appurl = _spPageContextInfo.webAbsoluteUrl;

//     return $.ajax({
//         url: appurl + "/_api/web/lists/getbytitle('"+l+"')/fields?select=Title,FieldTypeKind&$filter=Hidden eq false and ReadOnlyField eq false",
//         method: "GET",
//         headers: {
//             "Accept": "application/json; odata=verbose"
//         },
//         // success: function(data) {
//         //     if (data.d.__next) {
//         //         url = data.d.__next;
//         //         GetListItems();
//         //     } else {
//         //         console.log("Finished getting " + l);
//         //     }
//         // },
//         // error: function(error) {
//         //     console.log("Hit Error :(")
//         //     console.log(error);
//         // }
//     });
// }


function getJsonFromTxt(file){
    var siteurl = _spPageContextInfo.webServerRelativeUrl;
    var appurl=_spPageContextInfo.webAbsoluteUrl;

    return $.ajax({
        //url: appurl + "/_api/web/GetFolderByServerRelativeUrl(/Shared%20Documents/TW.txt)/$value",
        url: appurl+"/_api/web/getfilebyserverrelativeurl('"+siteurl+"/SiteAssets/files/"+file+"')/$value?",
        method: "GET",
        //dataFilter:
        dataType: 'json',
        // binaryStringResponseBody: true,
        headers: {
            "Accept": "application/json; odata=verbose"
        },
    });
}

function takeScreenshotnow(e,i) {
    html2canvas($('#' + e).get(0), {
        letterRendering: true,
        dpi: 288,
        //scale:4,
        useCORS: true,
        taintTest: false,
        allowTaint: false
    }).then(function (canvas) {
        var base64encodedstring = canvas.toDataURL("image/jpeg", 1);
        // $('#img').attr('src', base64encodedstring);
        // $('#'+e).hide();
        var tdata=[];
        tdata.push('Title|'+'review_'+i);
        tdata.push('cdmHazardSnapshot|'+base64encodedstring);
        tdata.push('cdmHazard|'+i);
        tdata.push('cdmPeerReviewStatus|'+2);
        tdata.push('cdmDHReviewStatus|'+1);
        tdata.push('cdmPreconReviewStatus|'+1);
        tdata.push('cdmLDReviewStatus|'+1);

        createReview(tdata);
    });
}




function scrollable() {
    $('.navBtn').click(function () {
        var trg = $(this).data('element');
        //toastr.success(trg);
        page.scrollme(trg);
    });

}


function ukdate(date) {
    if(!date){
        return '';
    }
    var t = new Date(date);
    // var t=date;
    //var dt=parseInt(t.getDate(),10);
    //if(dt<10){dt='0'+dt;}
    var tt = t.getDate() + '/' + (t.getMonth() + 1) + '/' + t.getFullYear();
    return tt;
}
function isodate(date) {
    var t = new Date(date);
    // var dt=parseInt(t.getDate(),10);
    // if(dt<10){dt='0'+dt;}

    var tt = t.getFullYear() + '/' + (t.getMonth() + 1) + '/' + t.getDate();
    return tt;

}


// jsom essentials
function ctx() {
    var t = new SP.ClientContext.get_current();
    return t;
}

function web() {
    var t = ctx().get_web();
    return t;
}

function list(l) {
    var t = web().get_lists().getByTitle(l);
    return t;
}

function errorhandler(sender, args) {
    var e = args.get_stackTrace();
    var m = args.get_message();

    toastr.error('Request failed.\n' + m + '\n' + e);

}

function unm() {
    var t = _spPageContextInfo.userDisplayName;
    return t;
}

// user info - basics

function un() {
    var t = _spPageContextInfo.userLoginName;
    return t;
}

function uid() {
    var t = _spPageContextInfo.userId;
    return t;
}

function urlPara(para) {
    var t = GetUrlKeyValue(para);
    return t;
}




function getListItem(listName,listItemId, complete, failure) {
    var siteurl = _spPageContextInfo.webServerRelativeUrl;
    var webUrl=_spPageContextInfo.webAbsoluteUrl;

    $.ajax({
        url: webUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + listItemId + ")",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            complete(data.d); 
        },
        error: function (data) {
            failure(data);
        }
    });
}



function createListItem(listName, itemProperties, complete, failure) 
{    
    var siteurl = _spPageContextInfo.webServerRelativeUrl;
    var webUrl=_spPageContextInfo.webAbsoluteUrl;

    $.ajax({       
       url: webUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",   
       type: "POST",   
       processData: false,  
       contentType: "application/json;odata=verbose",
       data: JSON.stringify(itemProperties),
       headers: {   
          "Accept": "application/json;odata=verbose",
          "X-RequestDigest": $("#__REQUESTDIGEST").val()
       }, 
       success: function (data) {           
           //complete(data.d); 
           toastr.success('Review snapshot created');  
       },      
       error: function (data) {            
           failure(data.responseJSON.error);    
       }  
    });
} 

function setRandomColours(n) {
    var a = [];
    for (var cc = 0; cc < n; cc++) {
        var r = Math.floor((Math.random() * 255) + 1);
        var g = Math.floor((Math.random() * 255) + 1);
        var b = Math.floor((Math.random() * 255) + 1);
        a.push('rgb(' + r + ',' + g + ',' + b + ')');

    }
    return a;

}


