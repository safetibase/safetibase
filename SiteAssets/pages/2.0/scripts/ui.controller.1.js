ui = {
    mkUserActionBtn: function(fn, v, title) {
        var t = '<div class="tpos-btn" data-action="' + v + '" onclick="' + fn + '(' + v + ')">' + title + '</div>';
        return t;
    },
    mkAddHazardBtn: function(fn, v, title) {
        var t = '<div class="tpos-btn" data-action="' + v + '" onclick="' + fn + '(' + v + ')" title="' + title + '"><img width="16" src="../../pages/2.0/img/add.svg"> <img width="32" src="../../pages/2.0/img/toxic-sign.svg"></div>'
        return t;
    },
    mkMitigateHazardBtn: function(fn, v, title) {
        var t = '<div class="tpos-btn" data-action="' + v + '" onclick="' + fn + '(' + v + ')" title="' + title + '"><img width="16" src="../../pages/2.0/img/tools.svg"> <img width="32" src="../../pages/2.0/img/toxic-sign.svg"></div>'
        return t;
    },
    mkReviewHazardBtn: function(fn, v, title) {
        var t = '<div class="tpos-btn" data-action="' + v + '" onclick="' + fn + '(' + v + ')" title="' + title + '"><img width="16" src="../../pages/2.0/img/edit.svg"> <img width="32" src="../../pages/2.0/img/toxic-sign.svg"></div>'
        return t;
    },
    mkBTN: function(action, entity, title, fn, v) {
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
    },
    mkTextInput: function(fldid, placeholder) {
        var t = '<div id="' + fldid + '" class="tpos-input" contenteditable="true" placeholder="test placeholder text"></div>';
        return t;
    },
    mkSaveBtn: function(btnid) {
        var t = '<div class="tpos-btn save" id="btn_' + btnid + '" ><img width="16" src="../../pages/2.0/img/save-icon.svg"><div>Save</div></div>';
        return t;
    },
    mkDataBox: function(id, v, title, clr) {
        var color = '';
        if (clr) {
            color = 'databox-clr-' + clr;
        }
        var t = '<div class="databox  ' + color + '" id="' + id + '"><div class="databox-content">' + v + '</div><div class="databox-title">' + title + '</div></div>';
        return t;
    },
    mkSmallDataBox: function(id, v, title, clr) {
        var color = '';
        if (clr) {
            color = 'databox-clr-' + clr;
        }
        var t = '<div class="databox-small  ' + color + '" id="' + id + '"><div class="databox-small-content">' + v + '</div><div class="databox-small-title">' + title + '</div></div>';
        return t;
    },
    mkSelect: function(lst, data, fset, trg) {
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
        $('#sel_' + lst).bind('keyup change', function(ev) {
            var st = $(this).val().toLowerCase();
            $('#val_' + lst).html('0');
            $('#sctSite').val('0');
            sSite = 0;
            if (st) {
                $('tr:not(:contains(' + st + '))').each(function() {
                    var t = $(this).html();
                    //console.log(t);
                    if ($(this).hasClass('tpos-' + lst + '-select-value') == 1) {
                        $(this).hide();
                    }
                });
                $('tr:contains(' + st + ')').each(function() {
                    if ($(this).hasClass('tpos-' + lst + '-select-value') == 1) {
                        $(this).show();
                    }

                });
                // $('tr td:contains(' + st + ')').show();
            }
        });
        $('#sel_' + lst).click(function() {
            var st = $(this).val().toLowerCase();
            toastr.success(st);
            if (!st || st == '') {
                $('tr').each(function() {
                    if ($(this).hasClass('tpos-' + lst + '-select-value') == 1) {
                        $(this).show();
                    }

                });
            }

        });
        $('.tpos-' + lst + '-select-value').click(function() {
            var dvid = $(this).data('value');
            var dv = $('#dv_' + lst + '_' + dvid).html();
            $('#sel_' + lst).val(dv);
            $('#val_' + lst).html(dvid);

            $('.tpos-' + lst + '-select-value').hide();
            routeSelection(lst, dvid, dv);
        });
    },
    mkTbl: function(id, cl, content) {
        var t = '<table id="tbl_' + id + '" class="' + cl + '">' + content + '</table>';
        return t;
    },
    mkTblRow: function(id, cl, content) {
        var t = '<tr id="row_' + id + '" class="' + cl + '">' + content + '</tr>';
        return t;
    },
    mkTblCell: function(id, cl, content) {
        var t = '<td id="cell_' + id + '" class="' + cl + '"><div class="content-wrapper">' + content + '</div></td>';
        return t;
    }
};

ui_msg = {
    results: function(data) {
        var t = data.length;
        if (t == 0) {
            toastr.warning('no records found');
        }
        if (t < 5000) {
            toastr.success(t + ' records returned');
        }
        if (t >= 5000) {
            toastr.warning(t + ' records returned');
        }
        return t;
    }
};

ui_h = {
    row: function(data, flds) {
        var t = '<div class="row row-hazard tpos-border-right-Amber" id=></div>'
    }
};

page = {
    scroll: function(trg) {
        $('#space').remove();
        $('#tpos-page').append('<div id="space" class="space"></div>');
        $('#s4-workspace').scrollTop(0);
        // callmason();
        //$('#s4-workspace').animate({scrollTop: 500});
        $('#s4-workspace').animate({
            scrollTop: $(trg).offset().top - 100
        }, 1000);

    },
    scrollthis: function(trg) {
        $('#space').remove();
        $('#mainArea').append('<div id="space" class="space"></div>');
        $('#mainArea').scrollTop(0);
        // callmason();
        //$('#s4-workspace').animate({scrollTop: 500});
        $('#mainArea').animate({
            scrollTop: $(trg).offset().top - 100
        }, 1000);

    },

    scrollme: function(trg) {
        //toastr.success(trg);
        $('#space').remove();
        $('#tpos-page').append('<div id="space" class="space"></div>');

        var stop = $(trg).offset().top - 100;
        var delay = 1000;
        $('#s4-workspace').stop(true, true).animate({
            scrollTop: stop
        }, delay);
        return false;
    },
    scrollmefaster: function(trg) {
        //toastr.success(trg);
        $('#space').remove();
        $('#tpos-page').append('<div id="space" class="space"></div>');

        var stop = $(trg).offset().top - 100;
        var delay = 500;
        $('#s4-workspace').stop(true, true).animate({
            scrollTop: stop
        }, delay);
        return false;
    }


};

hazards = {
    list: function(data, ftv) {
        $('#mainArea').html('');
        var d = data.d.results;
        var dc = d.length;
        var vs = [];
        for (var cc = 0; cc < dc; cc++) {
            var h = d[cc];
            var hi = h.ID;
            var cell = '';
            var ar_created = 'Created ';
            var ar_modified = '';
            var ar_reviewed = '';

            $.each(h, function(key, element) {
                if (key != '__metadata' && key != 'Title') {

                    cell += hazards.cell(hi, key, element);

                }


            });
            // var row = hazards.row(hi, cell);
            var row = test(h);
            // var row=vw_hazard.ref(h);
            $('#mainArea').append(row);
        }
        toggleCollapse();
        // rightClick('.row-hazard');
        var tpos_search = '<div class="filter-row"><input id="tpos_search" placeholder="Search here" /></div>';
        $('#mainArea').prepend(tpos_search);
        $('#tpos_search').keyup(function() {

            var q = $('#tpos_search').val();
            if (q != '' && q != ' ') {
                var f = $("div.row-hazard:Contains('" + q + "')");

                $("div.row-hazard").css("display", "none")
                    .filter(f)
                    .css("display", "block");

            } else {
                $("div.row-hazard").css("display", "block");
            }

        });
        manageEdits();
    },
    item_edit: function(e) {
        var i = e.attr('id');
        var is = i.split('_');
        var hi = is[1];
        hzd = hi;
        var f = is[2];
        toastr.success('field: ' + f + ' of hazard: ' + hi);
        frmedit.router(f);
        // to edit owner, we need the hazard category to determine if design or rams
        // var hc=$('#h_'+hi+' .row-header').html();
        // if(hc=='Permanent works design hazard'||hc=='Temporary works design hazard'){
        //     hzdt=0; // sets global to 0 for design hazards
        //     if(f=='cdmHazardOwnerTitle'){
        //         var ov=$('#h_'+hi+'_cdmHazardOwner').val();
        //         hazards.edit_cdmHazardOwner(hc,ov,hi);
        //     }

        // }
        // if(hc=='RAMS hazard'){
        //     tposdata.get('cdmCompanies','cdmCompanyRole/Title eq \'Design house\'',null,'frmsel_owner');
        //     hzdt=1; // sets global to 1 for rams hazard

        // }



        // if(f=='cdmHazardOwnerTitle'){
        //     var ov=$('#h_'+hi+'_cdmHazardOwner').val();
        //     hazards.edit_cdmHazardOwner(hc,ov,hi);
        // }
    },
    edit_cdmHazardOwner: function(hc, ov, hi) {
        if (hc == 'Permanent works design hazard' || hc == 'Temporary works design hazard') {
            tposdata.get('cdmCompanies', 'cdmCompanyRole/Title eq \'Design house\'', null, 'frmsel_owner');
        }
        if (hc == 'RAMS hazard') {

        }
    },
    row: function(id, cell) {
        var t = '<div class="row row-hazard tpos-border-right-Amber" id="h_' + id + '">' + cell + '</div>';
        return t;
    },
    cell: function(id, key, element) {
        if (key == 'Created' || key == 'Modified') {
            element = ukdate(element);
        }
        if (key == 'LastReviewDate' && element) {
            element = ukdate(element);
        }
        if (key == 'Created') {
            // ar_created +='';
        }
        if (!element || element == '' || element == undefined) {
            element = 'tbc';
        }
        var t = '';
        var e = isObject(element);
        //console.log(e);
        if (e == false) {
            t = '<div class="cell width-300" id="h_' + id + '_' + key + '"><div class="lbl">' + key + '</div><div class="val">' + element + '</div></div>';
        } else {
            t = '<div class="cell width-300" id="h_' + id + '_' + key + '"><div class="lbl">' + key + '</div><div class="val">' + element.ID + ' - ' + element.Title + '</div></div>';
        }

        return t;
    },
    aval: function(id, key, value) {

        var e = isObject(value);
        if (e == false) { return value; } else {
            return value.ID;
        }

    }
};

function test(h) {
    var hi = h.ID;
    var entitytype = 'Permanent works design hazard';
    var entitytypeclr = 'pwd';
    var p = h.cdmPWStructure.Title;
    var t = h.cdmTW;
    var r = h.cdmRAMS;
    var e = h.cdmPWElement.Title;
    if (!e) { e = '<div id="h_' + hi + '_cdmPWElement" class="clr_5">No element</div>'; }
    var entity = p + ' _ ' + e;
    var entitytitle = h.cdmEntityTitle;
    if (t) { entitytype = 'Temporary works design hazard';
        entity = entitytitle;
        entitytypeclr = 'twd'; }
    if (r) { entitytype = 'RAMS hazard';
        entity = entitytitle;
        entitytypeclr = 'ra'; }
    var stt = h.cdmStageExtra.Title;
    var sti = h.cdmStageExtra.ID;
    var htt = h.cdmHazardType.Title;
    var hti = h.cdmHazardType.ID;
    var o = h.cdmHazardOwner.Title;
    var oi = h.cdmHazardOwner.ID;
    if (!oi) { o = '<div class="clr_5">Unassigned</div>';
        oi = 0; }
    var si = h.cdmSite.ID;
    var st = h.cdmSite.Title;
    var hd = h.cdmHazardDescription;
    var hds = shortText(hd);
    var rd = h.cdmRiskDescription;
    var rds = shortText(rd);
    var md = h.cdmMitigationDescription;
    var mds = shortText(md);
    var dmd = h.cdmMitigationSuggestion;
    var dmds = shortText(dmd);
    var smd = h.cdmSMMitigationSuggestion;
    var smds = shortText(smd);
    var rr = h.cdmResidualRisk;

    if (rr) {
        var $rc = decodeRisk('Residual', rr, 1);
        var bclr = 'tpos-border-right-Green';
        if ($rc == 'clr_5') {
            bclr = 'tpos-border-right-Red';
        }
        if ($rc == 'clr_4') {
            bclr = 'tpos-border-right-Amber';
        }

    }
    if (!rr) { rr = ''; }
    var ir = h.cdmInitialRisk;
    if (!ir) { ir = ''; }

    var cd = ukdate(h.Created);
    var mdt = ukdate(h.Modified);
    var now = new Date();
    var isonow = now.toISOString();
    var isomdt = new Date(h.Modified).toISOString();
    var mmdt = new Date(h.Modified);
    //console.log(isonow+' - '+isomdt);
    var tdMod = getTimeDiff(h.Modified);
    var tdclass = 'mod';
    if (tdMod < 24) { tdclass = 'mod24'; }
    if (tdMod < 9) { tdclass = 'mod9'; }
    if (tdMod < 3) { tdclass = 'mod3'; }
    if (tdMod < 1) { tdclass = 'mod1'; }
    var au = h.Author.Title;
    var ed = h.Editor.Title;
    var aui = h.Author.ID;
    var edi = h.Editor.ID;
    var lrd = h.cdmLastReviewDate;
    var lrv = h.cdmLastReviewer;
    var cs = h.cdmCurrentStatus;
    if (!lrd) {
        lrd = ' - ';
        lrv = ' - ';
    }
    var irag = h.cdmInitialRAG;
    var rrag = h.cdmResidualRAG;
    // var gmissingmsg='<div class="clr_5">Awaiting assessment</div>';
    // if(!irag){}




    var myvar = '<div class="row row-hazard ' + bclr + '" id="h_' + hi + '">' +
        '    <div class="row-header ' + entitytypeclr + '">' + entitytype + '</div>' +
        '    <div class="row vwdefault">' +
        '        <table class="tpos-tbl">' +
        '            <tr>' +
        '                <td class="width-150">' +
        '                    <div class="cell-cell lg">Ref: ' + hi + '</div>' +
        '                    <div class="cell-cell">' +
        '                        <div class="cell-cell-img" title="' + stt + '">' +
        '                            <img style="width:16px;height:16px;" src="../../pages/2.0/img/stages/' + sti + '.svg" alt="' + stt + '">' +
        '                        </div>' +
        '                        <div class="cell-cell-img" title="' + htt + '">' +
        '                            <img style="width:16px;height:16px;" src="../../pages/2.0/img/types/' + hti + '.svg" alt="' + htt + '">' +
        '                        </div>' +
        '                    </div>' +
        '                    <div class="cell-cell" title="h_' + hi + '_Owner">' + o + '</div>' +
        '' +
        '                </td>' +
        '                <td class="width-200">' +
        '                    <div class="cell-cell" title="Site">' + st + '</div>' +
        '                    <div class="cell-cell" id="h_0_cdmPWStructure" title="Entity">' + entity + '</div>' +
        // '                    <div class="cell-cell" id="h_0_cdmPWElement" title="Element">Children\'s Play Equipment</div>'+
        '' +
        '                </td>' +
        '                <td class="width-300">' +
        '                    <div class="cell-cell" id="h_' + hi + '_sm_cdmHazardDescription">' + hds + '</div>' +
        '                    <div class="cell-cell" id="h_' + hi + '_sm_cdmRiskDescription">' + rds + '</div>' +
        '                    <div class="cell-cell" id="h_' + hi + '_sm_cdmMitigation">' + mds + '</div>' +
        '                    <div class="cell-cell" id="h_' + hi + '_sm_cdmMitigationSuggestion">' + dmds + '</div>' +
        '<div class="cell-cell" id="h_' + hi + '_sm_cdmMitigationSuggestion">' + smds + '</div>' +
        '' +
        '' +
        '                </td>' +
        '                <td class="width-250">' +
        '                    <div class="cell-cell" id="h_' + hi + '_sm_created">Created ' + cd + ' by ' + au + '</div>' +
        '                    <div class="cell-cell ' + tdclass + '" id="h_' + hi + '_sm_modded">Modified ' + mdt + ' by ' + ed + '</div>' +
        '                    <div class="cell-cell" id="h_' + hi + '_sm_reviewed">Reviewed ' + lrd + ' by ' + lrv + '</div>' +
        '                    <div class="cell-cell" id="h_' + hi + '_sm_status">Status: ' + cs + '</div>' +

        '' +
        '' +
        '                </td>' +

        decodeRisk('Residual', rr) +
        '            </tr>' +
        '        </table>' +
        '    </div>' +
        '    <div class="row vwhover">' +
        '        <table class="tpos-tbl">' +
        '            <tr>' +
        '                <td class="width-100">' +
        '                    <div class="cell-cell lbl">Reference</div>' +
        '                </td>' +
        '                <td class="width-100">' +
        '                    <div class="cell-cell lbl">Stage' +
        '                    </div>' +
        '                </td>' +
        '                <td class="width-100">' +
        '                    <div class="cell-cell lbl">Type' +
        '                    </div>' +
        '                </td>' +
        '                <td class="width-100">' +
        '                    <div class="cell-cell lbl">Owner</div>' +
        '                </td>' +
        '                <td class="width-50">' +
        '                    <div class="cell-cell lbl">Site</div>' +
        '                </td>' +
        '                <td class="width-600">' +
        '                    <div class="cell-cell lbl">Entity</div>' +
        '                </td>' +

        '            </tr>' +
        '            <tr>' +
        '                <td class="width-100 fld-txt">' +
        '                    <div class="cell-cell lg" id="h_' + hi + '_ID">Ref: ' + hi + '</div>' +
        '                </td>' +
        '                <td class="width-100 fld-txt">' +
        '                    <div class="cell-cell center">' +
        '                        <div class="cell-cell-img" id="h_' + hi + '_cdmStage" title="' + stt + '">' +
        '                            <img style="width:16px;height:16px;" src="../../pages/2.0/img/stages/' + sti + '.svg" alt="' + stt + '"><div>' + stt + '</div>' +
        '                        </div>' +
        '                    </div>' +
        '                </td>' +
        '                <td class="width-100 fld-txt">' +
        '                    <div class="cell-cell center">' +
        '                        <div class="cell-cell-img" id="h_' + hi + '_cdmType" title="' + htt + '">' +
        '                            <img style="width:16px;height:16px;" src="../../pages/2.0/img/types/' + hti + '.svg" alt="' + htt + '"><div>' + htt + '</div>' +
        '                        </div>' +
        '                    </div>' +
        '                </td>' +
        '                <td class="width-100 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmHazardOwnerTitle" title="Owner">' + o + '</div><input class="hidden-cell" type="number" id="h_' + hi + '_cdmHazardOwner" value="' + oi + '" />' +
        '                </td>' +
        '                <td class="width-50 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmSite" title="Site">' + st + '</div>' +
        '                </td>' +
        '                <td class="width-600 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmEntityTitle" title="Entity title">' + entity + '</div>' +
        '                </td>' +

        '            </tr>' +
        '        </table>' +
        '    </div>' +
        '    <div class="row vwhover">' +
        '        <table class="tpos-tbl wbrd">' +
        '            <tr>' +
        '                <td class="width-300">' +
        '                    <div class="cell-cell lbl">The hazard</div>' +
        '                </td>' +
        '                <td class="width-300">' +
        '                    <div class="cell-cell lbl">The risk</div>' +
        '                </td>' +
        '                <td class="width-300">' +
        '                    <div class="cell-cell lbl">Our mitigation</div>' +
        '                </td>' +

        '' +
        '            </tr>' +
        '            <tr>' +
        '                <td class="width-300 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmHazardDescription">' + hd + '</div>' +
        '                </td>' +
        '                <td class="width-300 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmRiskDescription">' + rd + '</div>' +
        '                </td>' +
        '                <td class="width-300 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmMitigationDescription">' + md + '</div>' +
        '                </td>' +

        '' +
        '            </tr>' +
        '        </table>' +
        '    </div>' +
        '    <div class="row vwhover rag">' +
        '        <table class="tpos-tbl wbrd">' +
        '            <tr>' +
        '                <td class="width-300">' +
        '                    <div class="cell-cell lbl"></div>' +
        '                </td>' +
        '                <td class="width-300">' +
        '                    <div class="cell-cell lbl">Initial project controls</div>' +
        '                </td>' +
        '                <td class="width-300">' +
        '                    <div class="cell-cell lbl">Residual project controls</div>' +
        '                </td>' +

        '' +
        '            </tr>' +
        '            <tr>' +
        '                <td class="width-300 fld-txt">' +
        // '                    <div class="cell-cell" id="h_'+hi+'_cdmMitigationSuggestion">'+dmd+'</div>'+
        // '                    <div class="cell-cell" id="h_'+hi+'_cdmSMMitigationSuggestion">'+smd+'</div>'+

        '                </td>' +
        '                <td class="width-300 fld-txt">' +
        '                    ' + decodeRAG(irag) +
        '                </td>' +
        '                <td class="width-300 fld-txt">' +
        '                    ' + decodeRAG(rrag) +
        '                </td>' +

        '' +
        '            </tr>' +
        '        </table>' +
        '    </div>' +


        '    <div class="row vwhover">' +
        '        <table class="tpos-tbl wbrd">' +
        '            <tr>' +
        '                <td class="width-300">' +
        '                    <div class="cell-cell lbl">Designer\'s / Construction Manager\'s mitigation suggestion</div>' +
        '                </td>' +
        '                <td class="width-300">' +
        '                    <div class="cell-cell lbl">Initial risk</div>' +
        '                </td>' +
        '                <td class="width-300">' +
        '                    <div class="cell-cell lbl">Residual risk</div>' +
        '                </td>' +

        '' +
        '            </tr>' +
        '            <tr>' +
        '                <td class="width-300 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmMitigationSuggestion">' + dmd + '</div>' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmSMMitigationSuggestion">' + smd + '</div>' +

        '                </td>' +
        '                <td class="width-300 fld-txt">' +
        '                    <div class="width-250 centered"><table class="tpos-tbl"><tr>' + decodeRisk('Initial', ir) + '</tr></table></div>' +
        '                </td>' +
        '                <td class="width-300 fld-txt">' +
        '                    <div class="width-250 centered"><table class="tpos-tbl"><tr>' + decodeRisk('Residual', rr) + '</tr></table></div>' +
        '                </td>' +

        '' +
        '            </tr>' +
        '        </table>' +
        '    </div>' +
        // tags and links section
        '    <div class="row vwhover">' +
        '        <table class="tpos-tbl wbrd">' +
        '            <tr>' +
        '                <td class="width-250">' +
        '                    <div class="cell-cell lbl">Hazard tags</div>' +
        '                </td>' +
        '                <td class="width-250">' +
        '                    <div class="cell-cell lbl">Uniclass tags</div>' +
        '                </td>' +
        '                <td class="width-250">' +
        '                    <div class="cell-cell lbl">Coordinates</div>' +
        '                </td>' +
        '                <td class="width-250">' +
        '                    <div class="cell-cell lbl">Links</div>' +
        '                </td>' +


        '' +
        '            </tr>' +
        '            <tr>' +
        '                <td class="width-250 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmHazardTags">' + dmd + '</div>' +

        '                </td>' +
        '                <td class="width-250 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmUniclass">' + smd + '</div>' +

        '                </td>' +
        '                <td class="width-250 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmHazardCoordinates">' + smd + '</div>' +

        '                </td>' +
        '                <td class="width-250 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmLinks">' + smd + '</div>' +

        '                </td>' +

        '' +
        '            </tr>' +
        '        </table>' +
        '    </div>' +


        '    <div class="row-header ' + entitytypeclr + ' vwhover">' +
        '        <table class="tpos-tbl wbrd">' +
        '            <tr>' +
        '                <td class="width-150">' +
        '                    <div class="cell-cell lbl">Created</div>' +
        '                </td>' +
        '                <td class="width-150">' +
        '                    <div class="cell-cell lbl">Modified</div>' +
        '                </td>' +
        '                <td class="width-150">' +
        '                    <div class="cell-cell lbl">Reviewed</div>' +
        '                </td>' +
        '                <td class="width-200">' +
        '                    <div class="cell-cell lbl">Status</div>' +
        '                </td><td class="width-500"></td>' +

        '' +
        '            </tr>' +
        '            <tr>' +
        '                <td class="width-150 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_Created">' + cd + '</div>' +
        '                    <div class="cell-cell" id="h_' + hi + '_Author">' + au + '</div>' +
        '                </td>' +
        '                <td class="width-150 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_Modified">' + mdt + '</div>' +
        '                    <div class="cell-cell" id="h_' + hi + '_Editor">' + ed + '</div>' +
        '                </td>' +
        '                <td class="width-150 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmLastReviewDate">' + lrd + '</div>' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmLastReviewer">' + lrv + '</div>' +
        '                </td>' +
        '                <td class="width-150 fld-txt">' +
        '                    <div class="cell-cell" id="h_' + hi + '_cdmCurrentStatus">' + cs + '</div>' +
        '                </td><td class="width-500"></td>' +

        '' +
        '            </tr>' +
        '        </table>' +
        '    </div>' +
        '    <div class="vw vwshow vwdefault" id="h_' + hi + '_vw">' +
        '        <img style="width:16px;height:16px;" src="../../pages/2.0/img/dots.svg" alt="show me everything">' +
        '    </div>' +
        '    <div class="vw vwhide vwhover" id="h_' + hi + '_vw">' +
        '        <img style="width:16px;height:16px;" src="../../pages/2.0/img/dots.svg" alt="hide things">' +
        '    </div><div class="pops" id="pops_' + hi + '">my popup</div>' +
        '' +
        '</div>';
    return myvar;

}


function isObject(obj) {
    return obj === Object(obj);
}



function mkHazardList(data, ftv) {
    var d = data.d.results;
    var dc = d.length;
    toastr.success(dc + ' items returned');
    var hlist = '';
    for (var cc = 0; cc < dc; cc++) {
        var h = d[cc];

        for (var dd = 0; dd < ftv.length; dd++) {
            var vrb = 'h.' + ftv[dd];

        }
        var hID = h.ID;

        var hz = h.cdmHazardDescription;
        var r = h.cdmRiskDescription;
        var m = h.cdmMitigationDescription;
        var ms = h.cdmMitigationSuggestion;
        var s = h.cdmSite.Title;
        var st = h.cdmStageExtra.Title;
        var sti = h.cdmStageExtra.ID;
        var tp = h.cdmHazardType.Title;
        var tpi = h.cdmHazardType.ID;
        var pw = h.cdmPWStructure.Title;
        var o = h.cdmHazardOwner.Title;
        var oi = h.cdmHazardOwner.ID;
        if (!o || o == undefined) {
            o = '<div class="cell-cell clr_5">Unassigned</div>';
        }
        if (pw) {
            pw = '<div class="cell-cell" id="h_' + hID + '_cdmPWStructure" title="Structure">' + pw + '</div>';
        } else {
            pw = '';
        }
        var tw = h.cdmTW;
        if (tw) {
            tw = '<div class="cell-cell" id="h_' + hID + '_cdmTW" title="Temporary works">' + tw + '</div>';
        } else {
            tw = '';
        }
        var ra = h.cdmRAMS;
        if (ra) {
            ra = '<div class="cell-cell" id="h_' + hID + '_cdmRAMS" title="RAMS">' + ra + '</div>';
        } else {
            ra = '';
        }
        var et = h.cdmEntityTitle;
        if (et) {
            et = '<div class="cell-cell" id="h_' + hID + '_cdmEntityTitle" title="Title">' + et + '</div>';
        } else {
            et = '';
        }
        var el = h.cdmPWElement.Title;
        if (el) {
            el = '<div class="cell-cell" id="h_' + hID + '_cdmPWElement" title="Element">' + el + '</div>';
        } else {
            if (pw) {
                el = '<div class="cell-cell clr_5" id="h_' + hID + '_cdmPWElement" title="Element">No element</div>';
            } else {
                el = '';
            }
        }
        var ir = h.cdmInitialRisk;
        var rr = h.cdmResidualRisk;
        var resrisk = '';
        var inirisk = '';
        if (ir) {
            var irdata = ir.split('^');
            var irrdata = irdata[0].split('-');
        }
        if (rr) {
            var rrdata = rr.split('^');
            var rrrdata = rrdata[0].split('-');
            // console.log(rrrdata);
            resrisk = '<table class="mini-risk-tbl ' + rrrdata[2] + '"><tr><td>' + rrrdata[0] + '</td><td>' + rrrdata[1] + '</td></tr></table>'
        }
        var irag = h.cdmInitialRAG;
        var rrag = h.cdmResidualRAG;
        var iragclr = '';
        var rragclr = '';
        var iragtxt = '';
        var rragtxt = '';
        if (irag) {
            var tirag = irag.split('^');
            iragtxt = tirag[0] + ' - ' + tirag[1];
            iragclr = tirag[2];
        }
        if (rrag) {
            var trrag = rrag.split('^');
            rragtxt = trrag[0] + ' - ' + trrag[1];
            rragclr = trrag[2];
        }
        var bclr = 'tpos-border-right-Green';
        if (rrrdata[2] == 'clr_5') {
            bclr = 'tpos-border-right-Red';
        }
        if (rrrdata[2] == 'clr_4') {
            bclr = 'tpos-border-right-Amber';
        }




        // var $def_Id=ui.mkTblCell('defid_'+hID,'width-80','Ref: '+hID);
        // var $def_StageType=ui.mkTblCell('def_stty_'+hID,'width-80','<img style="width:20px;height:20px;" src="../../pages/2.0/img/stages/'+sti+'.svg" alt="'+st+'">'+'<img style="width:20px;height:20px;" src="../../pages/2.0/img/types/'+tpi+'.svg" alt="'+tp+'">');
        // var $def_Owner=ui.mkTblCell('def_owner_'+hID,'width-80',o);

        // var $def_Site=ui.mkTblCell('def_site_'+hID,'width-300',s);
        // var $def_Entity=ui.mkTblCell('def_entity_'+hID,'width-300',pw+tw+ra);
        // var $def_EntityTitle=ui.mkTblCell('def_entitytitle_'+hID,'width-300',el+et);

        // var $def_Hazard=ui.mkTblCell('def_hazard_'+hID,'width-250',shortText(hz));
        // var $def_Risk=ui.mkTblCell('def_risk_'+hID,'width-250',shortText(r));
        // var $def_Mitigation=ui.mkTblCell('def_mitigation_'+hID,'width-250',shortText(m));

        // var tr1=ui.mkTblRow('tr1_'+hID,'vwdefault',$def_Id+$def_Site+$def_Hazard);
        // var tr2=ui.mkTblRow('tr2_'+hID,'vwdefault',$def_StageType+$def_Entity+$def_Risk);
        // var tr3=ui.mkTblRow('tr3_'+hID,'vwdefault',$def_Owner+$def_EntityTitle+$def_Mitigation);

        // var tbl1=ui.mkTbl('tbl1_'+hID,'tpos-tbl '+bclr,tr1+tr2+tr3);




        var $t = $("<div>", {
            id: 'h_' + hID,
            "class": 'row row-hazard'
        });
        $('#mainArea').append($t);

        // $('#h_'+hID).load('../../pages/2.0/html/tbl.hazard.1.html',function(){


        // });

        var refpanel = '<div class="cell-cell lg" id="h_' + hID + '_ID">Ref: ' + hID + '</div>' +
            '<div class="cell-cell">' +
            '<div class="cell-cell-img" id="h_' + hID + '_cdmStage" title="' + st + '">' +
            '<img style="width:16px;height:16px;" src="../../pages/2.0/img/stages/' + sti + '.svg" alt="' + st + '">' +
            '</div>' +
            '<div class="cell-cell-img" id="h_' + hID + '_cdmType" title="' + tp + '">' +
            '<img style="width:16px;height:16px;" src="../../pages/2.0/img/types/' + tpi + '.svg" alt="' + tp + '">' +
            '</div>' +
            '</div>' +
            '<div class="cell-cell" id="h_' + hID + '_cdmOwner" title="Owner">' + o + '</div>' +
            '</div>';

        // $('#h_'+hID+' .refpanel').html(refpanel);
        var $cell1 = ui.mkTblCell('defid_' + hID, 'width-80', refpanel);

        var locationpanel = '<div class="cell width-200">' +
            '<div class="cell-cell" id="h_' + hID + '_cdmSite" title="Site">' + s + '</div>' +
            pw +
            el +
            tw +
            ra +
            et +
            '</div>';

        // $('#h_'+hID+' .locationpanel').html(locationpanel);
        var $cell2 = ui.mkTblCell('defloc_' + hID, 'width-300', locationpanel);


        var txtpanel = '<div class="cell width-300 vwdefault">' +
            '<div class="cell-cell" id="h_' + hID + '_sm_cdmHazardDescription">' + shortText(hz) + '</div>' +
            '<div class="cell-cell" id="h_' + hID + '_sm_cdmRiskDescription">' + shortText(r) + '</div>' +
            '<div class="cell-cell" id="h_' + hID + '_sm_cdmMitigationDescription">' + shortText(m) + '</div>' +
            '<div class="cell-cell" id="h_' + hID + '_sm_cdmMitigationSuggestion">' + shortText(ms) + '</div>' +
            '</div>';

        // $('#h_'+hID+' .txtpanel').html(txtpanel);
        var $cell3 = ui.mkTblCell('deftxt_' + hID, 'width-250', txtpanel);

        // $('#h_'+hID+' .riskpanel').html(h.cdmResidualRisk);
        var $cell4 = ui.mkTblCell('defrisk_' + hID, 'width-200', resrisk);

        var $row1 = ui.mkTblRow('tr1_' + hID, 'vwdefault', $cell1 + $cell2 + $cell3 + $cell4);

        var $cell8 = ui.mkTblCell('hazard_' + hID, 'width-300', '<div class="cell-cell" id="h_' + hID + '_cdmHazardDescription">' + hz + '</div>');
        var $cell9 = ui.mkTblCell('risk_' + hID, 'width-300', '<div class="cell-cell" id="h_' + hID + '_cdmRiskDescription">' + r + '</div>');
        var $cell10 = ui.mkTblCell('mitigation_' + hID, 'width-300', '<div class="cell-cell" id="h_' + hID + '_cdmMitigationDescription">' + m + '</div>');


        var $cell5 = ui.mkTblCell('hazardlbl_' + hID, 'width-300', '<div class="cell-cell"><div class="lbl">The hazard</div></div>');
        var $cell6 = ui.mkTblCell('risklbl_' + hID, 'width-300', '<div class="cell-cell"><div class="lbl">The risk</div></div>');
        var $cell7 = ui.mkTblCell('mitigationlbl_' + hID, 'width-300', '<div class="cell-cell"><div class="lbl">Our mitigation</div></div>');

        var $row2 = ui.mkTblRow('tr2_' + hID, 'vwhover', $cell5 + $cell6 + $cell7);
        var $row3 = ui.mkTblRow('tr3_' + hID, 'vwhover', $cell8 + $cell9 + $cell10);
        var $tbl1 = ui.mkTbl('tbl1_' + hID, 'tpos-tbl ' + bclr, $row1);
        var $tbl2 = ui.mkTbl('tbl2_' + hID, 'tpos-tbl ' + bclr, $row2 + $row3);

        var cer = '<div class="row-footer">Created ' + ukdate(h.Created) + ' by ' + h.Author.Title + '| Modified ' + ukdate(h.Modified) + ' by ' + h.Editor.Title + '</div>';
        var $cell11 = ui.mkTblCell('footer1_' + hID, '', '<div class="cell-cell">' + cer + '</div>');
        var $row4 = ui.mkTblRow('tr4_' + hID, 'vwdefault', $cell11);

        var $tbl3 = ui.mkTbl('tbl2_' + hID, 'tpos-tbl ' + bclr, $row4);

        // var $ttbl=$("<table>", {id: 'h_tbl_'+hID, "class": "tpos-tbl"});
        $('#h_' + hID).html($tbl1 + $tbl2 + $tbl3);

        // var $defaulttr=$('<tr>',{'class':'vwdefault'});
        // var $hovertr=$('<tr>',{'class':'vwhover'});
        // var $td=$('<td>',{'class':''})






        var t = '<div class="row row-hazard tpos-border-right-Amber" id="h_' + hID + '">' +
            '<div class="cell width-100">' +
            '<div class="cell-cell lg" id="h_' + hID + '_ID">Ref: ' + hID + '</div>' +
            '<div class="cell-cell">' +
            '<div class="cell-cell-img" id="h_' + hID + '_cdmStage" title="' + st + '">' +
            '<img style="width:16px;height:16px;" src="../../pages/2.0/img/stages/' + sti + '.svg" alt="' + st + '">' +
            '</div>' +
            '<div class="cell-cell-img" id="h_' + hID + '_cdmType" title="' + tp + '">' +
            '<img style="width:16px;height:16px;" src="../../pages/2.0/img/types/' + tpi + '.svg" alt="' + tp + '">' +
            '</div>' +
            '</div>' +
            '<div class="cell-cell" id="h_' + hID + '_cdmOwner" title="Owner">' + o + '</div>' +
            '</div>' +
            '<div class="cell width-200">' +
            '<div class="cell-cell" id="h_' + hID + '_cdmSite" title="Site">' + s + '</div>' +
            pw +
            el +
            tw +
            ra +
            et +
            '</div>' +
            '<div class="cell width-300 vwdefault">' +
            '<div class="cell-cell" id="h_' + hID + '_sm_cdmHazardDescription">' + shortText(hz) + '</div>' +
            '<div class="cell-cell" id="h_' + hID + '_sm_cdmRiskDescription">' + shortText(r) + '</div>' +
            '<div class="cell-cell" id="h_' + hID + '_sm_cdmMitigationDescription">' + shortText(m) + '</div>' +
            '<div class="cell-cell" id="h_' + hID + '_sm_cdmMitigationSuggestion">' + shortText(ms) + '</div>' +
            '</div>' +
            '<div class="cell width-200 vwdefault">' +
            resrisk +
            '</div>' +
            '<div class="cell width-150 vwhover">' +
            '<div class="cell-cell" id="h_' + hID + '_cdmTags"></div>' +
            '<div class="cell-cell" id="h_' + hID + '_cdmUniclass"></div>' +
            '</div>' +
            '<div class="cell width-150 vwhover">' +
            '<div class="cell-cell" id="h_' + hID + '_cdmLinks">' +
            '</div>' +
            '</div>' +
            '<div class="cell vwhover">' +
            '<div class="fld">' +
            '<div class="lbl">The hazard</div>' +
            '<div class="cell-cell" id="h_' + hID + '_cdmHazardDescription">' + hz + '</div>' +
            '</div>' +
            '<div class="fld">' +
            '<div class="lbl">The risk</div>' +
            '<div class="cell-cell" id="h_' + hID + '_cdmRiskDescription">' + r + '</div>' +
            '</div>' +
            '<div class="fld">' +
            '<div class="lbl">Our mitigation</div>' +
            '<div class="cell-cell" id="h_' + hID + '_cdmMitigationDescription">' + m + '</div>' +
            '</div>' +
            '<div class="fld">' +
            '<div class="lbl">Designer\'s mitigation suggestion for ' + st + '</div>' +
            '<div class="cell-cell" id="h_' + hID + '_cdmMitigationSuggestion">' + ms + '</div>' +
            '</div>' +
            '<div id="rag">' +
            '<div class="fld">' +
            '<div class="lbl">Initial project control</div>' +
            '<div class="cell-cell ' + iragclr + '" id="h_' + hID + '_cdmInitialRAG">' + iragtxt + '</div>' +
            '</div>' +
            '<div class="fld">' +
            '<div class="lbl">Residual project control</div>' +
            '<div class="cell-cell ' + rragclr + '" id="h_' + hID + '_cdmResidualRAG">' + rragtxt + '</div>' +
            '</div>' +

            '</div>' +
            '</div>' +

            '<div class="row-row" id="h_' + hID + '_footer">' +

            '<div class="cell width-100">' +
            '<div class="cell-cell lbl">Created</div>' +
            '<div class="cell-cell" id="h_' + hID + '_Created">' + ukdate(h.Created) + '</div>' +
            '<div class="cell-cell" id="h_' + hID + '_Author">' + h.Author.Title + '</div>' +
            '</div>' +
            '<div class="cell width-100">' +
            '<div class="cell-cell lbl">Modified</div>' +
            '<div class="cell-cell" id="h_' + hID + '_Modified">' + ukdate(h.Modified) + '</div>' +
            '<div class="cell-cell" id="h_' + hID + '_Editor">' + h.Editor.Title + '</div>' +
            '</div>' +
            '<div class="cell width-100">' +
            '<div class="cell-cell lbl">Last review</div>' +
            '<div class="cell-cell" id="h_' + hID + '_cdmLastReviewDate">' + ukdate(h.cdmLastReviewDate) + '</div>' +
            '<div class="cell-cell" id="h_' + hID + '_cdmLastReviewer">' + h.cdmLastReviewer + '</div>' +
            '</div>' +
            '<div class="cell width-100">' +
            '<div class="cell-cell lbl">Current status</div>' +
            '<div class="cell-cell" id="h_' + hID + '_cdmCurrentStatus">' + h.cdmCurrentStatus + '</div>' +
            '</div>' +
            '<div class="cell width-200 fr vwhover">' +
            '<div class="cell-cell lbl">Initial risk</div>' +
            '<div class="cell-cell" id="h_' + hID + '_cdmIniRisk">' + h.cdmIniRisk + '</div>' +
            '</div>' +
            '<div class="vw vwshow vwdefault" id="h_' + hID + '_vw">' +
            '<img style="width:16px;height:16px;" src="../../scripts/1.0/img/dots.svg" alt="show me everything">' +
            '</div>' +
            '<div class="vw vwhide vwhover" id="h_' + hID + '_vw">' +
            '<img style="width:16px;height:16px;" src="../../scripts/1.0/img/dots.svg" alt="hide things">' +
            '</div>' +

            '</div>' +

            '</div>';

        hlist += t;
        //ui_h.row();
    }
    //$('#mainArea').html(hlist);
    $('.vwshow').click(function() {
        $('.vwdefault').show();
        $('.vwhover').hide();

        var e = $(this).attr('id');
        e = e.substring(0, e.length - 3);
        $('#' + e + ' .vwdefault').hide();
        $('#' + e + ' .vwhover').show();
    });
    $('.vwhide').click(function() {
        $('.vwdefault').show();
        $('.vwhover').hide();

    });


}

function toggleCollapse() {
    $('.vwshow').click(function() {
        $('.vwdefault').show();
        $('.vwhover').hide();
        // $('.vwhover').removeClass('animated');
        // $('.vwhover').removeClass('fadeInTop');
        $('.row-hazard').removeClass('addmargin');
        $('.row-hazard').removeClass('animated');
        $('.row-hazard').removeClass('fadeIn');



        var e = $(this).attr('id');
        e = e.substring(0, e.length - 3);
        $('#' + e + ' .vwdefault').hide();
        $('#' + e + ' .vwhover').show();
        $('#' + e).addClass('animated');
        $('#' + e).addClass('fadeIn');
        $('#' + e).addClass('addmargin');
        var is = e.split('_');
        var i = is[1];
        // data.hazardgetitem(i);
        // page.scroll('#'+e);
    });
    $('.vwhide').click(function() {
        var e = $(this).attr('id');
        e = e.substring(0, e.length - 3);
        $('.row-hazard').removeClass('addmargin');
        $('.row-hazard').removeClass('animated');
        $('.row-hazard').removeClass('fadeIn');
        $('.vwdefault').show();
        $('.vwhover').hide();
        // $('.vwhover').removeClass('animated');
        // $('.vwhover').removeClass('fadeInTop');

    });

}

function deCollapse(e) {
    $('.vwdefault').show();
    $('.vwhover').hide();
    // $('.vwhover').removeClass('animated');
    // $('.vwhover').removeClass('fadeInTop');
    $('.row-hazard').removeClass('addmargin');
    $('.row-hazard').removeClass('animated');
    $('.row-hazard').removeClass('fadeIn');



    // var e = $(this).attr('id');
    // e = e.substring(0, e.length - 3);
    $('#' + e + ' .vwdefault').hide();
    $('#' + e + ' .vwhover').show();
    $('#' + e).addClass('animated');
    $('#' + e).addClass('fadeIn');
    $('#' + e).addClass('addmargin');
    toastr.success('back to normal?');
    toggleCollapse();
}

function manageEdits() {
    $('.cell-cell').off('click').on('click', function() {
        hazards.item_edit($(this));
    });

}

function decodeRisk(tp, rr, clr) {
    if (!rr) {
        return '';
    }
    var rrrclr = '';
    var rrdata = rr.split('^');
    var rr1data = rrdata[0].split('-');
    var rr2data = rrdata[1].split('-');
    var rr3data = rrdata[2].split('-');
    var rrsc = rr1data[0];
    var rrsct = rr1data[1];
    var rrclr = rr1data[2];
    var rrs = rr2data[0];
    var rrst = rr2data[1];
    var rrl = rr3data[0];
    var rrlt = rr3data[1];

    if (rrclr == 'clr_5') { rrrclr = 'tpos-border-risk-Red'; }
    if (rrclr == 'clr_4') { rrrclr = 'tpos-border-risk-Amber'; }
    if (rrclr == 'clr_1') { rrrclr = 'tpos-border-risk-Green'; }

    var myvar = '<td class="width-200  center "><div class="cell-cell ' + rrrclr + '">' +
        '                    <div class="cell-cell">Severity: ' + rrs + ' - ' + rrst + '</div>' +
        '                    <div class="cell-cell lg">' + tp + ' risk: ' + rrsct + ' - ' + rrsc + '</div>' +
        '                    <div class="cell-cell">Likelihood: ' + rrl + ' - ' + rrlt + '</div></div>' +
        '                </td><td class="width-50"></td>';

    if (clr) { return rrclr; } else {
        return myvar;
    }


}

function shortText(str) {
    //var t=str;
    if (!str) {
        str = '';
    }
    if (str.length > 40) {
        str = str.substring(0, 37) + '<span title="' + str + '">...</span>';
    } else {
        return str;
    }
    return str;
}

function decodeRAG(str) {
    var t = '';
    if (!str || str == '' || str == undefined) {
        t = '<div class="clr_5">Awaiting assessment</div>';
    } else {
        var tar = str.split('^');
        var clr = tar[2];
        var tit = tar[0];
        var bod = tar[1];
        t = '<div class="width-290 centered cell-cell tpos-border-risk-' + clr + '">' + tit + ' - ' + bod + '</div>';
    }
    return t;

}

function getTimeDiff(oldDate) {
    var newDate = new Date();
    var fromDate = parseInt(new Date(oldDate).getTime() / 1000);
    var toDate = parseInt(new Date(newDate).getTime() / 1000);
    var timeDiff = (toDate - fromDate) / 3600; // will give difference in hrs
    return timeDiff;
}

function rightClick(e) {
    $(e).on('contextmenu', function(ee) {
        ee.preventDefault();
        var idar = $(this).attr('id');
        var id = idar.substring(2);
        toastr.success(id);
        // $('#pops_'+id).css('left',ee.pageX);      // <<< use pageX and pageY
        // $('#pops_'+id).css('top',ee.pageY);
        $('#pops_' + id).css('display', 'block');
        // $('#pops_'+id).css("position", "fixed"); 
        //$(this).append('<div class="row ">test</div>')

    });
}
// function writeScript() {
//     $('.tpos-select-input').bind('keyup change', function (ev) {
//             // pull in the new value
//             var searchTerm = $(this).html();
//             if (searchTerm) {
//                 // highlight the new term
//                 $("# div:contains(" + searchTerm + ")").each(function () {
//                     $(this).parent('.rag').addClass('highlight');
//                 });

//             }

//         }

//     });

// }