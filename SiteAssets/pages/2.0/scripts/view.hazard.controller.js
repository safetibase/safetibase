// how to display hazard list and items
vw_hazardlist = {

};

vw_hazard = {
    ref: function(h) {
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
        var stt = h.cdmStageHS2.Title;
        var sti = h.cdmStageHS2.ID;
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
};