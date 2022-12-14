tposdata = {
    get: function (lst, filter, order, callback) {
        var fa = [];
        var ft = [];
        var ftv = [];
        var fiv = [];

        var ftvs = '';
        var fivs = '';
        var select = '';
        var expand = '';


        getListFields(lst)
            .done(function (data) {
                var f = data.d.results;
                for (var cc = 0; cc < f.length; cc++) {
                    var fld = f[cc];
                    var fldTitle = fld.Title;
                    var fldType = fld.FieldTypeKind;
                    if (fldTitle != 'Content Type' && fldTitle != 'Attachments') {
                        fa.push(fldTitle);
                        ft.push(fldType);
                    }
                }
                fa.push('Author');
                ft.push(20);
                fa.push('Created');
                ft.push(4);
                fa.push('Editor');
                ft.push(20);
                fa.push('Modified');
                ft.push(4);

                fa.push('ID');
                ft.push(1);
                // console.log(fa);
                // console.log(ft);
            }).done(function () {
                var od = 'OData_';
                for (var i = 0; i < fa.length; i++) {
                    var ti = fa[i];
                    if (ti.substring(0, 1) == '_') {
                        ti = od + ti;

                    }
                    if (ft[i] != 20 && ft[i] != 7) {
                        if (fa[i] != 'ID') {
                            select += ti + ',';
                        } else {
                            select += ti;
                        }
                        ftv.push(fa[i]);
                    }
                    if (ft[i] == 7 || ft[i] == 20) {
                        select += ti + '/Title,' + ti + '/ID,';
                        expand += ti + '/Title,' + ti + '/ID,';
                        ftv.push(ti + '.Title');
                        ftv.push(ti + '.ID');

                    }
                }
                // console.log(select);
                expand = expand.substring(0, expand.length - 1);
                // console.log(expand);
                // console.log(ftv);
            }).done(function () {
                getListItemsByListName({
                    listName: lst,
                    select: select,
                    expansion: expand,
                    order: order, // 'ID asc'
                    filter: filter // 'OData__user/Id eq \'' + i + '\''
                }).done(function (data) {
                    if (callback == 'setup_nav') {
                        nav.setup(data, ftv);
                    }
                    if (callback == 'setup_main') {
                        main.setup_userdash(data, ftv);
                    }
                    if(callback.substring(0,3)=='sel') {
                        $('#'+callback).html('<div>Pre-loading options</div>');
                        ui.mkSelect(lst,data, ftv,callback);
                    }
                    if(callback=='mkHazardList'){
                        hazards.list(data,ftv);
                    }
                    if(callback=='frmsel_owner'){
                        frmedit.owner(lst,data);
                    }
                    if(callback=='frmedit_updateview'){
                        frmedit.updateview(lst,data);
                    }

                });

            });

    },
    set: function (lst, data, callback) {
        var ml = list(lst);
        var itemCreateInfo = new SP.ListItemCreationInformation();
        var oListItem = ml.addItem(itemCreateInfo);
        for (var cc = 0; cc < data.length; cc++) {
            if (data[cc] != '') {
                var t = data[cc].toString().split('|');
                var f = t[0];
                var v = t[1];
                oListItem.set_item(f, v);
            }
        }
        oListItem.update();
        ctx().load(oListItem);
        ctx().executeQueryAsync();
        //toastr.success('item saved');
        if (callback) {
            var fn = window[callback];
            fn(oListItem.get_id());
        }

    },
    update: function (lst, data, callback) {
        var ml = list(lst);
        var itemCreateInfo = new SP.ListItemCreationInformation();
        var oListItem = ml.getItemById(hzd);
        for (var cc = 0; cc < data.length; cc++) {
            if (data[cc] != '') {
                var t = data[cc].toString().split('|');
                var f = t[0];
                var v = t[1];
                oListItem.set_item(f, v);
            }
        }
        oListItem.update();
        ctx().load(oListItem);
        ctx().executeQueryAsync();
        //toastr.success('item saved');
        if (callback=='frmedit_updateview') {
            // var fn = window[callback];
            // fn(oListItem);
            tposdata.get('cdmHazards','ID eq \'' + hzd + '\'',null,'frmedit_updateview');
        }
    },

    getCount: function (lst, title, clr, callback) {
        var ListUrl = _spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getbytitle('" + lst + "')/items";
        getJsonFormat(ListUrl)
            .done(function (data) {
                var itemsCount = data.d.results.length;
                $('#mainArea').append(ui.mkDataBox(itemsCount, 'Hazards on system'));
            })
            .fail(
                function (error) {
                    console.log(JSON.stringify(error));
                });

    },
    getQuickCount:function(lst,n,filter,title,trg,clr,size){
        var select='';
        var expand='';
        if(filter||filter!=''){
            var f=filter.split(' ');
            var sl=f[0];
            var select=sl;
            var stest=sl.split('/');
            if(stest[1]){
                var expand=sl;
                // var select=sl;
            }

        }
        getListItemsByListName({
            listName: lst,
            select: select,
            expansion: expand,
            filter: filter // 'OData__user/Id eq \'' + i + '\''
        }).done(function (data) {
            $('#'+lst+'_databox').remove();
            var itemsCount = data.d.results.length;
            if(itemsCount>0){
                var t=ui.mkDataBox(lst+'_databox_'+n,itemsCount,title,clr);
                if(size){
                    t=ui.mkSmallDataBox(lst+'_databox_'+n,itemsCount,title,clr);
                }
                $('#'+trg).append(t);
                $('#'+lst+'_databox_'+n).click(function(){
                    $('#mainTitle').html(title);
                    $('#mainArea').html('');
                    tposdata.get(lst,filter,'Modified desc','mkHazardList');
                });
            }
        });


    },
};

jsondata={
    get:function(lst,selsnm,trg){

        getJsonFromTxt(lst+'.txt').done(function (radata) {
            //data=JSON.parse(data);
            $('#div_' + trg).hide();
            $('#div_' + trg).html('');
            var options = '<tr><td class="hide" id="val_' + lst + '">0</td><td><input class="tpos-' + lst + '-select-input dvi" id="sel_' + lst + '" autofill="false"></td></tr>';
    
            var racnt = radata.length;
            // var tw = '';
            var rabtns = [];
            //toastr.success(cnt);
            for (var cc = 0; cc < racnt; cc++) {
                var tra = radata[cc].Title;
                var sra = radata[cc].Site;
                var dra = radata[cc].Description;
                var tt=tra + '^' + dra;
                if (sra == selsnm) {
                    //btns+='<div id="btn-tw-'+t+'" class="btn">'+t+' - '+d+'</div>';
                    // rabtns.push(tra + '^' + dra);
                    options += '<tr style="display:none" class="tpos-' + lst + '-select-value dvs" data-list="' + lst + '" data-value="' + tra + '"><td class="hide">*' + tt.toLowerCase() + '</td><td id="dv_'+lst+'_'+tra+'">' + tt + '</td></tr>';

                }

            }
            $('#div_' + trg).html('<table class="tpos-select-table">' + options + '</table>');
            $('#div_' + trg).show();
            $('#mainArea').addClass('addheight');
            $('#sel_'+lst).bind('keyup change', function (ev) {
                var st = $('#sel_'+lst).val().toLowerCase();
                //toastr.success(st);
                $('#val_' + lst).html('0');
                // $('#sctSite').val('0');
                // sSite=0;
                if (st) {
                    $('tr:not(:contains(' + st + '))').each(function(){
                        var t=$(this).html();
                        //console.log(t);
                        if($(this).hasClass('tpos-' + lst + '-select-value')==1){
                            $(this).hide();
                        }
                    });
                    $('tr:contains('+st+')').each(function(){
                        if($(this).hasClass('tpos-' + lst + '-select-value')==1){
                            $(this).show();
                        }
    
                    });
                    // $('tr td:contains(' + st + ')').show();
                }
            });
            $('#sel_'+lst).click(function(){
                var st = $(this).val().toLowerCase();
                toastr.success(st);
                if(!st||st==''){
                    $('tr').each(function(){
                        if($(this).hasClass('tpos-' + lst + '-select-value')==1){
                            $(this).show();
                        }
      
                    });
                }
    
            });
            // $('#sel_'+lst).blur(function(){
            //     var st = $(this).val().toLowerCase();
            //     toastr.success(st);
            //     if(!st||st==''){
            //         $('tr').each(function(){
            //             if($(this).hasClass('tpos-' + lst + '-select-value')==1){
            //                 $(this).hide();
            //             }
      
            //         });
            //     }
    
            // });
    
    
            $('.tpos-' + lst + '-select-value').click(function(){
                var dvid=$(this).data('value');
                var dv=$('#dv_'+lst+'_'+dvid).html();
                $('#sel_' + lst).val(dv);
                $('#val_' + lst).html(dvid);
                
                $('.tpos-' + lst + '-select-value').hide();
                routeSelection(lst,dvid,dv);
            });
    

        });



    }
};


function getJsonFormat(ListUrl) {
    return $.ajax({
        url: ListUrl,
        type: "GET",
        contentType: "application/json;odata=verbose",
        headers: {
            "Accept": "application/json;odata=verbose"
        }
    });
}

function qmsg(n){
    toastr.success('hazard ref: '+n+' added');
}