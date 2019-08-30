formatdatato={
    dropdown:function(){

    },
    tags:function(){},
    urbuttons:function(data,ftv,trg){
        var tlist = data.d.results;
        var tcnt = tlist.length;
        var user = '';
        var role = [0,0,0,0,0],roles=['Designer','Design house manager','Site manager','Lead designer','Sub contractor rep']; // designer, design manager, site manager, lead designer and sub contractor rep

        for (var cc = 0; cc < tcnt; cc++) {
            var u = tlist[cc];
            var ui=u.ID;
            cell='';
            $.each(u, function (key, element) {
                if (key != '__metadata' && element.Title != undefined && key != 'Title') {
                    // console.log(element.Title);
                    cell += mkCell('cdmUser',ui, key, element);
                    for(var b=0;b<role.length;b++){
                        if(element.Title==roles[b]){
                            role[b]=1;
                        }
                    }
                }
            });
            
            user += '<div id="cdmUser_' + ui + '" class="dataset">' + cell + '</div>';
        }
        $('#user_roles').html('');
        $('#user_roles').html(user);
        $('.celled').hide();
        $('.fld_cdmCompanyTitle').show();
        $('.fld_cdmUserRoleTitle').show();
        $('.fld_cdmSiteTitle').show();

        var actions = mkBtn('add', '', 'Add a hazard', 'addHazard', '');
        $('#user_roles').append(actions);

        if(role[0]==1){ // designer
            var t=mkBtn('edit', 'design', 'Edit/mitigate design hazards', 'editHazard', 'mdh');
            t+=mkBtn('review', 'design', 'Peer review design hazards', 'prHazard', 'pdh');
            $('#user_roles').append(t);
        }
        if(role[4]==1){ // sub contractor rep
            var t=mkBtn('edit', 'rams', 'Edit/mitigate RAMS hazards', 'editHazard', 'mrh');
            t+=mkBtn('review', 'rams', 'Peer review RAMS hazards', 'prHazard', 'prh');
            $('#user_roles').append(t);
        }
        if(role[1]==1){ // design house manager
            var t=mkBtn('review', 'design', 'Undertake design house reviews', 'dmrHazard', 'adh');
            $('#user_roles').append(t);
        }
        if(role[2]==1){ // site manager
            var t=mkBtn('review', 'design', 'Undertake pre-construction reviews', 'pcrHazard', 'pcdh');
            t+=mkBtn('review', 'rams', 'Undertake RAMS hazard reviews', 'smrHazard', 'arh');
            $('#user_roles').append(t);
        }
        if(role[3]==1){ // lead designer
            var t=mkBtn('review', 'design', 'Undertake lead design reviews', 'ldrHazard', 'lddh');
            $('#user_roles').append(t);
        }




        activateDatasets();
    },
    list:function(){},
    statstablerows:function(data,ftv,trg){
        var tlist = data.d.results;
        var tcnt = tlist.length;

        var row='';
	

        var sa=[];
        var stit=[];
        var cnt=0;
        for(var cc=0;cc<tcnt;cc++){
            var s=tlist[cc];
            var st=s.Title;
            var si=s.ID;
            row+='<tr><td id="s_'+si+'" style="vertical-align:middle;">'+st+'</td>'+
            '<td id="s_pw_'+si+'"><i class="fa fa-spinner fa-spin"></i></td>'+
            '<td id="s_tw_'+si+'"><i class="fa fa-spinner fa-spin"></i></td>'+
            '<td id="s_ra_'+si+'"><i class="fa fa-spinner fa-spin"></i></td>'+
            '<td id="s_hr_'+si+'"><i class="fa fa-spinner fa-spin"></i></td>'+
            '<td id="s_ua_'+si+'"><i class="fa fa-spinner fa-spin"></i></td>'+
            '<td id="s_ne_'+si+'"><i class="fa fa-spinner fa-spin"></i></td>'+
            '<td id="s_ur_'+si+'"><i class="fa fa-spinner fa-spin"></i></td>'+
            '</tr>';
            sa.push(si);
            stit.push(st);
        }
        $('#'+trg).html(row);
        var fa=['cdmPWStructure/ID ne null','cdmTW ne null','cdmRAMS ne null','cdmResidualRiskScore gt 9','cdmHazardOwner/ID eq null','cdmPWStructure/ID ne null and cdmPWElement/ID eq null','startswith(cdmCurrentStatus,\'Under\')'];
        var ft=['Permanent works design hazards','Temporary works design hazards','RAMS hazards','High (residual) risk hazards','Unassigned hazards','Permanent works hazards without element','Under review'];
        var ftrg=['s_pw_','s_tw_','s_ra_','s_hr_','s_ua_','s_ne_','s_ur_'];
        var fclr=['pwd','twd','ra','red','red','red','blue'];
        for(var dd=0;dd<sa.length;dd++){
            for(var ee=0;ee<fa.length;ee++){
                cdmdata.getQuickCount('cdmHazards',cnt,'cdmSite/ID eq '+sa[dd]+' and '+fa[ee],stit[dd]+' - '+ft[ee],ftrg[ee]+sa[dd],fclr[ee],1);
                cnt=cnt+1;
            }
            
        }
    },
    historyrows:function(data,ftv,trg){
        var tlist = data.d.results;
        var tcnt = tlist.length;
        var rows='';
        for(var cc=0;cc<tcnt;cc++){
            var ht=tlist[cc];
            var user=ht.Editor.Title;
            var date=ukdate(ht.Modified);
            var action=ht.cdmAction;
            rows+='<tr><td>'+date+'</td><td>'+user+' '+ht.Title+'</td><td>'+action+'</td></tr>';
        }
        var t='<table class="tpos-tbl">'+rows+'</table>';
        $('#'+trg).html(t);
    },
    hazardtablerowitems:function(data,ftv,trg,wpt) {
        var tlist = data.d.results;
        var tcnt = tlist.length;
        var row = "";
        wpt='<h1>'+wpt+'</h1>';
        if(tcnt===0){
          wpt='';
        }
        $("#"+trg).html(wpt);
  
        for (var cc = 0; cc < tcnt; cc++) {
            // build rows
            var h = tlist[cc];
  
            // var hitem=buildHazardListItem(h);
            var hitem = printHazardRow(h);
            $("#"+trg).append(hitem);
            // $('.ramsonly').hide();
            if (h.cdmRAMS) {
                $("#h_" + h.ID + " .ramshide").hide();
                $("#h_" + h.ID + " .ramsonly").show();
            }
            if (h.cdmHazardType.Title == "Safety") {
                $("#h_" + h.ID + " .safetyhide").hide();
            }
            if (
                h.cdmStage.Title != "Construction" &&
                h.cdmStage.Title != "Commission"
            ) {
                $("#h_" + h.ID + " .stagehide").hide();
            }
        }
  
        hazardreviewbuttonaction();
        toggleCollapse();
        toggleInfoPanel();
        activateHazardEdits();
        // activateRAMSActions();
        activateRAMSBtn();
        // rows to target
    },
    hazardtablerows:function(data,ftv,trg){
        var tlist = data.d.results;
        var tcnt = tlist.length;
        var row='';
        for(var cc=0;cc<tcnt;cc++){
            // build rows
            var h=tlist[cc];

            // var hitem=buildHazardListItem(h);
            var hitem=printHazardRow(h);
            $('#hazardstable').append(hitem);
            // $('.ramsonly').hide();
            if(h.cdmRAMS){
                $('#h_'+h.ID+' .ramshide').hide();
                $('#h_'+h.ID+' .ramsonly').show();
            }
            
            if(h.cdmStage.Title!='Construction'&&h.cdmStage.Title!='Commission'){
                $('#h_'+h.ID+' .stagehide').hide();
            }
        }
        var tpos_search='<div class="filter-row"><input id="tpos_search" placeholder="Search here" /></div>';
        $('#tpos_search').remove();
        $('#hazardstable').prepend(tpos_search);
        $('#tpos_search').keyup(function(){

            var q = $('#tpos_search').val();
            if(q!=''&&q!=' '){
                var f = $("div.row-hazard:Contains('" + q +"')");
        
                $("div.row-hazard").css("display", "none")
                    .filter(f)
                    .css("display", "block");
    
            }else{
                $("div.row-hazard").css("display", "block");
            }
        
        });

        $('.tpos-siblingsbtn').click(function(){
            var q=$(this).data('query');
            q=new String(q);
            $('#tpos-main').html('');
            $('#stats').remove();
            $('#systemstats').remove();
            $('#userstats').remove();
            $('#tpos-main').html('<div class="tpos-area-title">Linked hazards</div><div id="hazardstable" class="tpos-area-content"></div>');
            cdmdata.get('cdmHazards','Title eq \''+q+'\'','Modified desc','hazards-table','hazardstable');
            // cdmdata.get('cdmHazards','Editor/ID eq \''+uid()+'\'','Modified desc','hazards-table','hazardstable');
        });

        hazardreviewbuttonaction();
        toggleCollapse();
        toggleInfoPanel();
        activateHazardEdits();
        // rows to target
    }


};

function mkUserDataSet(u){
    var ui=u.ID;
    var cell='';
    $.each(u, function (key, element) {
        if (key != '__metadata' && key != 'Title') {
            cell += mkCell(ui, key, element);
        }
    });

}

function mkCell(entity,i,key,element){
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
        // t = '<div class="cell" id="'+entity+'_' + i + '_' + key + '"><div class="lbl">' + key + '</div><div class="val fld_'+key+'">' + element + '</div></div>';
        t = '<div class="celled fld_'+key+'" data-entity="'+entity+'"  id="'+entity+'_' + i + '_' + key + '">' + element + '</div>';
    } else {
        t = '<div class="celled fld_'+key+'Title" data-entity="'+entity+'" data-elementid="'+element.ID+'" data-elementname="' + element.Title + '" id="'+entity+'_' + i + '_' + key + '">' + element.Title + '</div>';
    }

    return t;

}

function buildHazardListItem(h){
    var hi=h.ID;
    // check user privileges whilst writing hazard - if user can edit, make fields editable
    var user_role='';
    var user_company='';
    var user_site='';
    var userrights=0; // 0=no edits; 1=editor (correct company, either designer or rep); 2=peer (correct company,correct role, not last editor); 
    // 3=dhm (correct design house); 4=sm (correct site and role); 5=ld;
    var urdesigner=0;
    var urdm=0;
    var ursm=0;
    var urld=0;
    var urscr=0;

    var ucanedit=0;
    var ucanpeerreview=0;
    var ucandmreview=0;
    var ucanprecon=0;
    var ucansmreview=0;
    var ucanldreview=0;

    var isDesignHazard=0;
    var isHealthHazard=0;
    var requiresPCReview=0;
    if(!h.cdmRAMS){
        isDesignHazard=1;
    }
    if(h.cdmHazardType.Title=='Health'){
        isHealthHazard=1;
    }
    if(isDesignHazard==1&&h.cdmStage.Title=='Construction'){
        requiresPCReview=1;
    }
    if(isDesignHazard==1&&h.cdmStage.Title=='Commission'){
        requiresPCReview=1;
    }

    if(h.cdmHazardOwner.ID){
        var ura=$('.fld_cdmUserRoleTitle');
        var urc=$('.fld_fld_cdmCompanyTitle');
        var urs=$('.fld_fld_cdmSiteTitle');
        for(var ii=0;ii<ura.length;ii++){
            var urat=$(ura[ii]).data('elementname');
            var urct=$(urc[ii]).data('elementid');
            var urst=$(urs[ii]).data('elementid');
            if(h.cdmStage.Title=='Construction'||h.cdmStage.Title=='Commission'){
    
                if(urct==h.cdmHazardOwner.ID){
                    // belongs to your company
                    if(h.cdmPWStructure.ID||h.cdmTW){
                        // is a design hazard 
                        if(urat=='Designer'){ucanedit=1;}
                        if(urat=='Design house manager'&&uid()!=h.Editor.ID){ucandmreview=1;}
                    }
                    if(h.cdmRAMS){
                        // is a RAMS hazard
                        if(urat=='Sub contractor rep'){ucanedit=1;}
                    }
                    if(ucanedit==1&&uid()!=h.Editor.ID){ucanpeerreview=1;}
                }
                if(uid()!=h.Editor.ID){
                    if(urat=='Site manager'&&urs==h.cdmSite.ID){ucanprecon=1;}
                    if(urat=='Lead designer'&&urs==h.cdmSite.ID){ucanldreview=1;}
                    if(urat=='Site manager'&&urs==h.cdmSite.ID){ucansmreview=1;}
                }
            }
        }
        var rvstatus=h.cdmLastReviewStatus;
        if(ucanpeerreview==1&&rvstatus=='requested design peer review'||ucanpeerreview==1&&rvstatus=='requested rams peer review'){ucanpeerreview==2;}
        if(ucandmreview==1&&rvstatus=='requested design manager review'){ucandmreview=2;}
        if(ucanprecon==1&&rvstatus=='requested pre-construction review'){ucanprecon=2;}
        if(ucanldreview==1&&rvstatus=='requested lesd design review'){ucanldreview=2;}
        if(ucansmreview==1&&rvstatus=='requested site manager review'){ucansmreview=2;}
    
    }

    var permissions=ucanedit+'-'+ucanpeerreview+'-'+ucandmreview+'-'+ucanprecon+'-'+ucanldreview+'-'+ucansmreview;

    
    var no_owner='Hazard is locked for editing until an owner has been assigned';
    var under_review='Hazard is currently under review and therefore locked for editing';
    var no_element='Please add an element before initiating the review';
    var no_rag='Please complete the project controls assessment before initiating the review';
    var msg='';
    var o='';
    var s='';
    var si=h.cdmSite.ID;
    var st=h.cdmSite.Title;
    s=='<div id="h_'+hi+'_cdmSite" class="cell">'+st+'</div>';

    var oi=h.cdmHazardOwner.ID;
    var ot=h.cdmHazardOwner.Title;
    if(!oi){
        o='<div id="h_'+hi+'_cdmHazardOwner" class="cell cell-ownereditable clr_5">Unassigned</div>';
        msg=no_owner;
    }else{
        o='<div id="h_'+hi+'_cdmHazardOwner" class="cell cell-ownereditable">'+ot+'</div>';
    }
    var he='Permanent works design hazard';
    var heclass='pwd';
    var hc='Designer';
    var et=h.cdmEntityTitle;
    var en=''; // entity name
    var p='';
    var pi=h.cdmPWStructure.ID;
    var pt=h.cdmPWStructure.Title;
    var el='';
    var eli=h.cdmPWElement.ID;
    var elt=h.cdmPWElement.Title;
    if(pi){
        p=pt;
        if(!eli){
            el='<div id="h_'+hi+'_cdmPWElement" class="cell cell-editable clr_5">No element</div>';
            if(oi){
                msg=no_element;
            }
        }
        if(eli){
            el='<div id="h_'+hi+'_cdmPWElement" class="cell cell-editable">'+elt+'</div>';
            // en=p+el;
        }
    }
    var t='';
    var ti=h.cdmTW;
    if(ti){
        he='Temporary works design hazard';
        heclass='twd';
        t=ti;
        // en='<div id="h_'+hi+'_Entity" class="cell">'+ti+' - '+et+'</div>';
    }
    var ra='';
    var rai=h.cdmRAMS;
    if(rai){
        ra=rai;
        he='RAMS hazard';
        heclass='ra';
        hc='Sub contractor rep';
    }
    en='<div id="h_'+hi+'_Entity" class="cell">'+p+et+el+'</div>';

    var stt=h.cdmStage.Title;
    var sti=h.cdmStage.ID;
    var htt=h.cdmHazardType.Title;
    var hti=h.cdmHazardType.ID;

    var refpanel=        '                    <div id="h_'+hi+'_ref" class="cell lg">Ref: '+hi+'</div>'+
    '                    <div id="h_'+hi+'_stageandtype" class="cell">'+
    '                        <div class="cell-cell-img" title="'+stt+'">'+
    '                            <img style="width:16px;height:16px;" src="../../pages/2.0/img/stages/'+sti+'.svg" alt="'+stt+'">'+
    '                        </div>'+
    '                        <div class="cell-cell-img" title="'+htt+'">'+
    '                            <img style="width:16px;height:16px;" src="../../pages/2.0/img/types/'+hti+'.svg" alt="'+htt+'">'+
    '                        </div>'+
    '                    </div>'+o;





    
    var scaffold = '<div class="cdmHazard-row row row-hazard" id="h_'+hi+'_row">'+
    '    <div class="row-header '+heclass+'">'+he+' - '+permissions+'</div>'+
    '    <div class="row-notification">'+msg+'</div>'+
    '    <div class="vwdefault">'+
    '        <div class="row" id="row1">'+
    '            <table class="tpos-tbl">'+
    '                <tr>'+
    '                    <td class="width-150">'+refpanel+'</td>'+
    '                    <td class="width-200">'+s+en+'</td>'+
    '                    <td class="width-300">hazard,risk,mitigation,suggestions</td>'+
    '                    <td class="width-250">key dates and people</td>'+
    '                    <td class="width-200">residual risk</td>'+
    '                </tr>'+
    '            </table>'+
    '        </div>'+
    '    </div>'+
    '    <div class="vwhover">'+
    '        <div class="row">'+
    '            <table class="tpos-tbl">'+
    '                <tr>'+
    '                    <td class="width-100"><div class="lbl">Reference</div></td>'+
    '                    <td class="width-100"><div class="lbl">Stage</div></td>'+
    '                    <td class="width-100"><div class="lbl">Type</div></td>'+
    '                    <td class="width-100"><div class="lbl">Owner</div></td>'+
    '                    <td class="width-50"><div class="lbl">Site</div></td>'+
    '                    <td class="width-600"><div class="lbl">Entity</div></td>'+
    '                </tr>'+
    '                <tr>'+
    '                    <td class="width-100">Ref</td>'+
    '                    <td class="width-100">Stage</td>'+
    '                    <td class="width-100">Type</td>'+
    '                    <td class="width-100">'+o+'</td>'+
    '                    <td class="width-50">Site</td>'+
    '                    <td class="width-600">'+en+'</td>'+
    '                </tr>'+
    '            </table>'+
    '        </div>'+
    '        <div class="row">'+
    '            <table class="tpos-tbl">'+
    '                <tr>'+
    '                    <td class="width-300"><div class="lbl">The hazard</div></td>'+
    '                    <td class="width-300"><div class="lbl">The risk</div></td>'+
    '                    <td class="width-300"><div class="lbl">Our mitigation</div></td>'+
    '                </tr>'+
    '                <tr>'+
    '                    <td class="width-300">hazard</td>'+
    '                    <td class="width-300">risk</td>'+
    '                    <td class="width-300">mitigation</td>'+
    '                </tr>'+
    ''+
    '            </table>'+
    '        </div>'+
    '        <div class="row" id="rag">'+
    '            <table class="tpos-tbl">'+
    '                <tr>'+
    '                    <td class="width-300"><div class="lbl">no label</div></td>'+
    '                    <td class="width-300"><div class="lbl">Initial project control</div></td>'+
    '                    <td class="width-300"><div class="lbl">Residual project control</div></td>'+
    '                </tr>'+
    '                <tr>'+
    '                    <td class="width-300">none</td>'+
    '                    <td class="width-300">initial rag</td>'+
    '                    <td class="width-300">residual rag</td>'+
    '                </tr>'+
    '            </table>'+
    '        </div>'+
    '        <div class="row">'+
    '            <table class="tpos-tbl">'+
    '                <tr>'+
    '                    <td class="width-300"><div class="lbl">no label</div></td>'+
    '                    <td class="width-300"><div class="lbl">Initial risk</div></td>'+
    '                    <td class="width-300"><div class="lbl">Residual risk</div></td>'+
    '                </tr>'+
    '                <tr>'+
    '                    <td class="width-300">none</td>'+
    '                    <td class="width-300">initial risk</td>'+
    '                    <td class="width-300">residual risk</td>'+
    '                </tr>'+
    '            </table>'+
    '        </div>'+
    '        <div class="row">'+
    '            <table class="tpos-tbl">'+
    '                <tr>'+
    '                    <td class="width-"><div class="lbl">Designer\'s mitigation suggestion for </div></td>'+
    '                    <td class="width-"><div class="lbl">Site manager\'s mitigation suggestion for </div></td>'+
    '                    <td class="width-"><div class="lbl">Linked hazards (siblings) </div></td>'+
    '                    <td class="width-"><div class="lbl">Parent/Child hazards (RAMS) </div></td>'+
    '                </tr>'+
    '                <tr>'+
    '                    <td class="width-">designer suggestion</td>'+
    '                    <td class="width-">sm suggestion</td>'+
    '                    <td class="width-">siblings</td>'+
    '                    <td class="width-">parent or children</td>'+
    '                </tr>'+
    '            </table>'+
    '        </div>'+
    '        <div class="row" id="tags">'+
    '            <table class="tpos-tbl">'+
    '                <tr>'+
    '                    <td class="width-250"><div class="lbl">Coordinates</div></td>'+
    '                    <td class="width-250"><div class="lbl">Hazard tags</div></td>'+
    '                    <td class="width-250"><div class="lbl">Uniclass tags</div></td>'+
    '                    <td class="width-250"><div class="lbl">Links</div></td>'+
    '                </tr>'+
    '                <tr>'+
    '                    <td class="width-250">coordinates</td>'+
    '                    <td class="width-250">htags</td>'+
    '                    <td class="width-250">utags</td>'+
    '                    <td class="width-250">links</td>'+
    '                </tr>'+
    '            </table>'+
    '        </div>'+
    '        <div class="row-header '+heclass+'">'+
    '            <table class="tpos-tbl">'+
    '                <tr>'+
    '                    <td class="width-150"><div class="lbl">Created</div></td>'+
    '                    <td class="width-150"><div class="lbl">Modified</div></td>'+
    '                    <td class="width-150"><div class="lbl">Reviewed</div></td>'+
    '                    <td class="width-150"><div class="lbl">Status</div></td>'+
    '                    <td class="width-500"></td>'+
    '                </tr>'+
    '                <tr>'+
    '                    <td class="width-150">created</td>'+
    '                    <td class="width-150">modified</td>'+
    '                    <td class="width-150">reviewed</td>'+
    '                    <td class="width-150">status</td>'+
    '                    <td class="width-500"></td>'+
    '                </tr>'+
    '            </table>'+
    '        </div>'+
    '    </div>'+
    '    <div class="vw vwshow vwdefault" id="h_'+hi+'_vw">'+
    '        <img style="width:16px;height:16px;" src="../../pages/2.0/img/dots.svg" alt="show me everything">'+
    '    </div>'+
    '    <div class="vw vwhide vwhover" id="h_'+hi+'_vw">'+
    '        <img style="width:16px;height:16px;" src="../../pages/2.0/img/dots.svg" alt="hide things">'+
    '    </div>'+
    '</div>';
        
    return scaffold;
}

function hrf(hi,ft,fi,ucanedit,editrequired,val,imgsrc){ // var htt = hrf(hi,'cdmHazardType',ucanedit,1,h.cdmHazardType.Title);
    var cl='cell';
    var dtentries='';
    var imgentry='';
    if(fi){
        dtentries='data-entityname="'+ft+'" data-entityid="'+fi+'"';
    }
    if(imgsrc){
        imgentry='<div><img style="width:16px;height:16px;" src="../../pages/2.0/img/'+imgsrc+'/'+fi+'.svg" alt="'+ft+'"></div>'
    }
    if(ucanedit==1&&editrequired==1){
        cl='cell-editable';
    }
    var t='<div id="h_'+hi+'_'+fld+'" class="'+cl+'">'+val+'</div>';

    var t='<div id="h_'+hi+'_'+fld+'" '
    return t;
}
function printNonEditableField(){

}
function printEditableField(){

}

function printHazardRow(h){
    var hc='pwd';
    var hctitle='Permanent works design hazard';
    var en=h.cdmPWStructure.Title;
    if(h.cdmTW){
        hc='twd';
        hctitle='Temporary works design hazard';
        en=h.cdmEntityTitle;
    }
    if(h.cdmRAMS){
        hc='ra';
        hctitle='RAMS hazard';
        en=h.cdmEntityTitle;
    }
    var mitsdisplay='';
    var revsdisplay='';
    var mitsowner=h.CurrentMitigationOwner.Title;
    var revsowner=h.CurrentReviewOwner.Title;
    var moi=h.CurrentMitigationOwner.ID;
    var roi=h.CurrentReviewOwner.ID;
    if(!moi){
        mitsdisplay='';
    }else{
        mitsdisplay='last assessed by: '+mitsowner;
    }
    
    if(!roi){
        revsdisplay='';
    }else{
        revsdisplay='last reviewed by: '+revsowner;
    }

    var pws=h.cdmPWStructure.Title;
    if(!pws){pws='';}
    var pwe=h.cdmPWElement.Title;
    if(!pwe&&h.cdmPWStructure.Title){pwe='<span class="clr_5 cell cdmPWElement">No element</span>';}
    if(!pwe&&!h.cdmPWStructure.Title){pwe='';}
    if(h.cdmPWElement.Title){'<span class="cell cdmPWElement">'+h.cdmPWElement.Title+'</span>';}
    var o=h.cdmHazardOwner.Title;
    var warning='';
    var isLocked=0;
    var requiresPCReview=1;
    var permissions='';
    if(!o){o='<span class="clr_5">Unassigned</span>';warning='<div class="clr_5_active">This hazard has not been assigned to an owner and is therefore locked for editing.</div>';}
    var revstatus=h.cdmCurrentStatus;
    
    if(revstatus.substring(0,1)=='U'){
        warning='<div class="clr_5_active">This hazard is currently under review and therefore locked for editing.</div>';
        isLocked=1;
    }
    var uce=0,ucp=0,ucd=0,ucpc=0,ucl=0,ucs=0;
    var ruce=0,rucp=0,rucd=0,rucpc=0,rucl=0,rucs=0; // current status and requirements 0=not required/gray  2=required/red 1=accepted/completed/green 
    var revbtn='';

    if(h.cdmStage.Title!='Construction'&&h.cdmStage.Title!='Commission'){
        requiresPCReview=0;
        // console.log(requiresPCReview);
    }

    if(h.cdmHazardOwner.Title){
        var ura=$('.fld_cdmUserRoleTitle');
        var uca=$('.fld_cdmCompanyTitle');
        var usa=$('.fld_cdmSiteTitle');
        for(var cc=0;cc<ura.length;cc++){
            var role=$(ura[cc]).data('elementname');
            var comp=$(uca[cc]).data('elementname');
            var site=$(usa[cc]).data('elementname');

            if(hc!='ra'){ // if not rams hazard = design hazard
                if(role=='Designer'&&comp==h.cdmHazardOwner.Title&&isLocked==0){uce=1;}
                if(role=='Designer'&&comp==h.cdmHazardOwner.Title&&isLocked==1&&uid()!=h.Editor.ID&&h.cdmLastReviewStatus=='Review initiated'){ucp=1;}
                if(role=='Design house manager'&&comp==h.cdmHazardOwner.Title&&h.cdmLastReviewStatus=='Peer review - approved'){ucd=1;}
                if(role=='Site manager'&&site==h.cdmSite.Title&&h.cdmLastReviewStatus=='Design manager review - approved'&&requiresPCReview==1){ucpc=1;}
                if(role=='Lead designer'&&site==h.cdmSite.Title&&h.cdmLastReviewStatus=='Pre-construction review completed'&&requiresPCReview==1){ucl=1;}
                if(requiresPCReview==1){ruce=2,rucp=2,rucd=2,rucpc=2,rucl=2;
                    if(revstatus=='Assessment in progress'){
                        ruce=3,rucp=2,rucd=2,rucpc=2,rucl=2;
                        if(uce==1){
                            // revbtn='<div class="tpos-rvbtn" data-action="initiatereview" data-company="'+h.cdmHazardOwner.ID+'" data-userrole="Designer">Initiate review</div>';
                            // revbtn=mkReviewButton('initiatereview',h.cdmHazardOwner.ID,'Designer',h.cdmSite.ID,h.ID,'Initiate review');
                            revbtn=mkHazardReviewButton('initiatereview','Under peer review','Review initiated',h.ID,'Initiate review');
                        }
                        
                    }
                    if(revstatus=='Under peer review'){
                        ruce=1,rucp=3,rucd=2,rucpc=2,rucl=2;
                        if(ucp==1){
                            revbtn='<div class="tpos-rvbtn" data-action="peerreview">Undertake peer review</div>';
                            // revbtn=mkHazardReviewButton('completed peer review','Under peer review','Review initiated',h.ID,'Initiate review');
                        }
                    }
                    if(revstatus=='Under design manager review'){
                        ruce=1,rucp=1,rucd=3,rucpc=2,rucl=2;
                        if(ucd==1){revbtn='<div class="tpos-rvbtn" data-action="dmreview">Undertake design manager review</div>';}
                    }
                    if(revstatus=='Under pre-construction review'){
                        ruce=1,rucp=1,rucd=1,rucpc=3,rucl=2;
                        if(ucpc==1){revbtn='<div class="tpos-rvbtn" data-action="pcreview">Undertake pre-construction review</div>';}
                    }
                    if(revstatus=='Under lead designer review'){
                        ruce=1,rucp=1,rucd=1,rucpc=1,rucl=3;
                        if(ucl==1){revbtn='<div class="tpos-rvbtn" data-action="ldreview">Undertake lead designer review</div>';}
                    }
                    if(revstatus=='Accepted'){
                        ruce=1,rucp=1,rucd=1,rucpc=1,rucl=1;
                    }

                }else{
                    ruce=2,rucp=2,rucd=2;
                    if(revstatus=='Assessment in progress'){
                        ruce=3,rucp=2,rucd=2;
                        if(uce==1){
                            // revbtn='<div class="tpos-rvbtn" data-action="initiatereview" data-company="'+h.cdmHazardOwner.ID+'" data-userrole="Designer">Initiate review</div>';
                            // revbtn=mkReviewButton('initiatereview',h.cdmHazardOwner.ID,'Designer',h.cdmSite.ID,h.ID,'Initiate review');
                            revbtn=mkHazardReviewButton('initiatereview','Under peer review','Review initiated',h.ID,'Initiate review');
                        }
                    }
                    if(revstatus=='Under peer review'){
                        ruce=1,rucp=3,rucd=2;
                        if(ucp==1){revbtn='<div class="tpos-rvbtn" data-action="peerreview">Undertake peer review</div>';}
                    }
                    if(revstatus=='Under design manager review'){
                        ruce=1,rucp=1,rucd=3;
                        if(ucd==1){revbtn='<div class="tpos-rvbtn" data-action="dmreview">Undertake design manager review</div>';}
                    }
                    if(revstatus=='Accepted'){
                        ruce=1,rucp=1,rucd=1;
                    }

                }
            }else{
                if(role=='Sub contractor rep'&&comp==h.cdmHazardOwner.Title&&isLocked==0){uce=1;}
                if(role=='Sub contractor rep'&&comp==h.cdmHazardOwner.Title&&isLocked==1&&uid()!=h.Editor.ID&&h.cdmLastReviewStatus=='Review initiated'){ucp=1;}
                if(role=='Site manager'&&site==h.cdmSite.Title&&h.cdmLastReviewStatus=='requested site manager review'){ucs=1;}
                ruce=2,rucp=2,rucs=2;
                if(revstatus=='Assessment in progress'){
                    ruce=3,rucp=2,rucs=2;
                    if(uce==1){
                        // revbtn='<div class="tpos-rvbtn" data-action="initiatereview" data-company="'+h.cdmHazardOwner.ID+'" data-userrole="Sub contractor rep">Initiate review</div>';
                        // revbtn=mkReviewButton('initiatereview',h.cdmHazardOwner.ID,'Sub contractor rep',h.cdmSite.ID,h.ID,'Initiate review');
                        revbtn=mkHazardReviewButton('initiatereview','Under peer review','Review initiated',h.ID,'Initiate review');
                    }
                }
                if(revstatus=='Under peer review'){
                    ruce=1,rucp=3,rucs=2;
                    if(ucp==1){revbtn='<div class="tpos-rvbtn" data-action="peerreview">Undertake peer review</div>';}
                }
                if(revstatus=='Under site manager review'){
                    ruce=1,rucp=1,rucs=3;
                    if(ucs==1){revbtn='<div class="tpos-rvbtn" data-action="smreview">Undertake site manager review</div>';}
                }
                if(revstatus=='Accepted'){
                    ruce=1,rucp=1,rucs=1;
                }

            }
        }
    }

    var lstrev='';
    if(!h.cdmLastReviewer){
        lstrev='No review on record';
    }else{
        lstrev=printDate(h.cdmLastReviewStatus,h.cdmLastReviewer,h.cdmLastReviewDate);
    }
    var requiredreviews='<div class="requiredreviews"><div title="Risk assessment and mitigation" class="prm-cell ruce _'+ruce+'"></div><div title="Peer review"  class="prm-cell rucp _'+rucp+'"></div><div title="Design manager review"  class="prm-cell rucd _'+rucd+'"></div><div title="Pre-construction review" class="prm-cell rucpc _'+rucpc+'"></div><div title="Lead designer review" class="prm-cell rucl _'+rucl+'"></div><div title="Site manager review" class="prm-cell rucs _'+rucs+'"></div></div>';;

    permissions='<div class="permissions"><div title="Green - you can edit / mitigate this hazard" class="prm-cell uce _'+uce+'"></div><div title="Green - you can peer review this hazard"  class="prm-cell ucp _'+ucp+'"></div><div title="Green - you can undertake design manager reviews for this hazard"  class="prm-cell ucd _'+ucd+'"></div><div title="Green - you can undertake pre-construction reviews for this hazard" class="prm-cell ucpc _'+ucpc+'"></div><div title="Green - you can undertake lead designer reviews for this hazard" class="prm-cell ucl _'+ucl+'"></div><div title="Green - you can undertake site manager reviews for this hazard" class="prm-cell ucs _'+ucs+'"></div></div>';

var myvar = '<div class="cdmHazard-row row row-hazard '+decodeRisk('Residual',h.cdmResidualRisk,1)+'" id="h_'+h.ID+'">'+
'    <div class="row-header '+hc+'">'+hctitle+'</div>'+permissions+requiredreviews+
'    <div class="row-warning">'+warning+'</div>'+
'    <div class="vwdefault">'+
'        <div class="row" id="row1">'+
'            <table class="tpos-tbl">'+
'                <tr>'+
'                    <td class="width-150">'+
'                        <div class="cell lg">Ref: '+h.ID+'</div>'+
'                        <div class="cell">'+
'                            <div class="cell-cell-img" title="'+h.cdmStage.Title+'">'+
'                                <img style="width:16px;height:16px;" src="../../pages/2.0/img/stages/'+h.cdmStage.ID+'.svg" alt="'+h.cdmStage.Title+'">'+
'                            </div>'+
'                            <div class="cell-cell-img" title="'+h.cdmHazardType.Title+'">'+
'                                <img style="width:16px;height:16px;" src="../../pages/2.0/img/types/'+h.cdmHazardType.ID+'.svg" alt="'+h.cdmHazardType.Title+'">'+
'                            </div>'+
'                        </div>'+
'                        <div>'+
'                            <div class="cell cdmHazardOwner">'+o+'</div>'+
'                        </div>'+
'                    </td>'+
'                    <td class="width-200">'+
'                        <div class="cell">'+h.cdmSite.Title+'</div>'+
'                        <div class="cell">'+en+'</div>'+
'                        <div class="cell cdmPWElement">'+pwe+'</div>'+
'                    </td>'+
'                    <td class="width-300">'+
'                        <div class="cell">'+shortText(h.cdmHazardDescription)+'</div>'+
'                        <div class="cell">'+shortText(h.cdmRiskDescription)+'</div>'+
'                        <div class="cell">'+shortText(h.cdmMitigationDescription)+'</div>'+
'                        <div class="cell">'+shortText(h.cdmMitigationSuggestion)+'</div>'+
'                    </td>'+
'                    <td class="width-250">'+
'                        <div class="cell">'+printDate('Created',h.Author.Title,h.Created)+'</div>'+
'                        <div class="cell">'+printDate('Modified',h.Editor.Title,h.Modified)+'</div>'+
'                        <div class="cell">'+lstrev+'</div>'+
'                        <div class="cell">'+h.cdmCurrentStatus+'</div>'+
'                    </td>'+
'                    <td class="width-25"></td>'+
'                    <td class="width-200">'+decodeRisk('Residual',h.cdmResidualRisk)+'</td>'+
'                    <td class="width-25"></td>'+
'                </tr>'+
'            </table>'+
'        </div>'+
'    </div>'+
'    <div class="vwhover">'+
'        <div class="row">'+
'            <table class="tpos-tbl wbrd">'+
'                <tr>'+
'                    <td class="width-100">'+
'                        <div class="lbl">Reference</div>'+
'                    </td>'+
'                    <td class="width-100">'+
'                        <div class="lbl">Stage</div>'+
'                    </td>'+
'                    <td class="width-100">'+
'                        <div class="lbl">Type</div>'+
'                    </td>'+
'                    <td class="width-100">'+
'                        <div class="lbl">Owner</div>'+
'                    </td>'+
'                    <td class="width-50">'+
'                        <div class="lbl">Site</div>'+
'                    </td>'+
'                    <td class="width-600">'+
'                        <div class="lbl">Entity</div>'+
'                    </td>'+
'                </tr>'+
'                <tr>'+
'                    <td class="width-100 fld"><div class="lg">Ref: '+h.ID+'</div></td>'+
'                    <td class="width-100 fld">'+
'                        <img style="width:16px;height:16px;" src="../../pages/2.0/img/stages/'+h.cdmStage.ID+'.svg" alt="\'+stt+\'">'+
'                        <div class="cell cdmStage">'+h.cdmStage.Title+'</div>'+
'                    </td>'+
'                    <td class="width-100 fld">'+
'                        <img style="width:16px;height:16px;" src="../../pages/2.0/img/types/'+h.cdmHazardType.ID+'.svg" alt="\'+stt+\'">'+
'                        <div class="cell cdmHazardType">'+h.cdmHazardType.Title+'</div>'+
'                    </td>'+
'                    <td class="width-100 fld">'+
'                        <div class="cell cdmHazardOwner">'+o+'</div>'+
'                    </td>'+
'                    <td class="width-50 fld">'+
'                        <div class="cell cdmSite">'+h.cdmSite.Title+'</div>'+
'                    </td>'+
'                    <td class="width-600 fld">'+
// '                        <div class="cell cdmPWStructure">'+pws+'</div>'+
// '                        <div class="cell cdmPWElement">'+pwe+'</div>'+
// '                        <div class="cell cdmTW">'+h.cdmTW+'</div>'+
// '                        <div class="cell cdmRAMS">'+h.cdmRAMS+'</div>'+
'                        <div class="cell cdmEntityTitle">'+en+' - '+pwe+'</div>'+
'                    </td>'+
'                </tr>'+
'            </table>'+
'        </div>'+
'        <div class="row">'+
'            <table class="tpos-tbl wbrd">'+
'                <tr>'+
'                    <td class="width-300">'+
'                        <div class="lbl">The hazard</div>'+
'                    </td>'+
'                    <td class="width-300">'+
'                        <div class="lbl">The risk</div>'+
'                    </td>'+
'                    <td class="width-300">'+
'                        <div class="lbl">Our mitigation</div>'+
'                    </td>'+
'                </tr>'+
'                <tr>'+
'                    <td class="width-300 fld">'+
'                        <div class="cell cdmHazardDescription ">'+h.cdmHazardDescription+'</div>'+
'                    </td>'+
'                    <td class="width-300 fld">'+
'                        <div class="cell cdmRiskDescription ">'+h.cdmRiskDescription+'</div>'+
'                    </td>'+
'                    <td class="width-300 fld">'+
'                        <div class="cell cdmMitigationDescription">'+h.cdmMitigationDescription+'</div>'+
'                    </td>'+
'                </tr>'+
''+
'            </table>'+
'        </div>'+
'        <div class="row safetyhide" id="rag">'+
'            <table class="tpos-tbl wbrd">'+
'                <tr>'+
'                    <td class="width-300">'+
'                        <div class="lbl"></div>'+
'                    </td>'+
'                    <td class="width-300">'+
'                        <div class="lbl">Initial project control</div>'+
'                    </td>'+
'                    <td class="width-300">'+
'                        <div class="lbl">Residual project control</div>'+
'                    </td>'+
'                </tr>'+
'                <tr>'+
'                    <td class="width-300 fld"></td>'+
'                    <td class="width-300 fld">'+
'                        <div class="cell cdmInitialRAG">'+decodeRAG(h.cdmInitialRAG)+'</div>'+
'                    </td>'+
'                    <td class="width-300 fld">'+
'                        <div class="cell cdmResidualRAG">'+decodeRAG(h.cdmResidualRAG)+'</div>'+
'                    </td>'+
'                </tr>'+
'            </table>'+
'        </div>'+
'        <div class="row">'+
'            <table class="tpos-tbl wbrd">'+
'                <tr>'+
'                    <td class="width-300">'+
'                        <div class="lbl"></div>'+
'                    </td>'+
'                    <td class="width-300">'+
'                        <div class="lbl">Initial risk</div>'+
'                    </td>'+
'                    <td class="width-300">'+
'                        <div class="lbl">Residual risk</div>'+
'                    </td>'+
'                </tr>'+
'                <tr>'+
'                    <td class="width-300 fld"></td>'+
'                    <td class="width-300 fld">'+
'                        <div class="cell cdmInitialRisk">'+decodeRisk('Initial',h.cdmInitialRisk)+'</div>'+
'                    </td>'+
'                    <td class="width-300 fld">'+
'                        <div class="cell cdmResidualRisk">'+decodeRisk('Residual',h.cdmResidualRisk)+'</div>'+
'                    </td>'+
'                </tr>'+
'            </table>'+
'        </div>'+
'        <div class="row">'+
'            <table class="tpos-tbl wbrd">'+
'                <tr>'+
'                    <td class="width-250">'+
'                        <div class="lbl">Designer\'s mitigation suggestion for '+h.cdmStage.Title+'</div>'+
'                    </td>'+
'                    <td class="width-250">'+
'                        <div class="lbl stagehide">Site manager\'s mitigation suggestion for '+h.cdmStage.Title+'</div>'+
'                    </td>'+
'                    <td class="width-250">'+
'                        <div class="lbl">Linked hazards (siblings) </div>'+
'                    </td>'+
'                    <td class="width-250">'+
'                        <div class="lbl ramsonly">Parent </div>'+
'                    </td>'+
'                </tr>'+
'                <tr>'+
'                    <td class="width-250 fld">'+
'                        <div class="cell cdmStageMitigationSuggestion">'+h.cdmStageMitigationSuggestion+'</div>'+
'                    </td>'+
'                    <td class="width-250 fld">'+
'                        <div class="cell cdmSMMitigationSuggestion stagehide">'+h.cdmSMMitigationSuggestion+'</div>'+
'                    </td>'+
'                    <td class="width-250 fld"><div class="tpos-siblingsbtn" data-query="'+h.Title+'">View related / linked hazards</div></td>'+
'                    <td class="width-250 fld"><div class="cell cdmParent ramsonly">'+h.cdmParent+'</div></td>'+
'                </tr>'+
'            </table>'+
'        </div>'+
'        <div class="row ramshide" id="tags">'+
'            <table class="tpos-tbl wbrd">'+
'                <tr>'+
'                    <td class="width-250">'+
'                        <div class="lbl">Coordinates</div>'+
'                    </td>'+
'                    <td class="width-250">'+
'                        <div class="lbl">Hazard tags</div>'+
'                    </td>'+
'                    <td class="width-250">'+
'                        <div class="lbl">Uniclass tags</div>'+
'                    </td>'+
'                    <td class="width-250">'+
'                        <div class="lbl">Links</div>'+
'                    </td>'+
'                </tr>'+
'                <tr>'+
'                    <td class="width-250 fld">'+
'                        <div class="cell cdmHazardCoordinates">'+decodeCoordinates(h.cdmHazardCoordinates,uce,h.ID)+'</div>'+
'                    </td>'+
'                    <td class="width-250 fld">'+
'                        <div class="cell cdmHazardTags">'+h.cdmHazardTags+'</div>'+
'                    </td>'+
'                    <td class="width-250 fld">'+
'                        <div class="cell cdmUniclass">'+h.cdmUniclass+'</div>'+
'                    </td>'+
'                    <td class="width-250 fld">'+
'                        <div class="cell cdmLinks"></div>'+
'                    </td>'+
'                </tr>'+
'            </table>'+
'        </div>'+
'        <div class="row '+hc+'">'+
'            <table class="tpos-tbl wbrd">'+
'                <tr>'+
'                    <td class="width-150">'+
'                        <div class="lbl">Created</div>'+
'                    </td>'+
'                    <td class="width-150">'+
'                        <div class="lbl hazhis">Last Modified</div>'+
'                    </td>'+
'                    <td class="width-150">'+
'                        <div class="lbl revhis">'+h.cdmLastReviewStatus+'</div>'+
'                    </td>'+
'                    <td class="width-150">'+
'                        <div class="lbl">Status</div>'+
'                    </td>'+
'                    <td class="width-500"></td>'+
'                </tr>'+
'                <tr>'+
'                    <td class="width-150">'+ukdate(h.Created)+'</td>'+
'                    <td class="width-150 hazhis">'+ukdate(h.Modified)+'</td>'+
'                    <td class="width-150 revhis">'+ukdate(h.cdmLastReviewDate)+'</td>'+
'                    <td class="width-150 cdmCurrentStatus">'+h.cdmCurrentStatus+'</td>'+
'                    <td class="width-500"></td>'+
'                </tr>'+
'                <tr>'+
'                    <td class="width-150">'+h.Author.Title+'</td>'+
'                    <td class="width-150 hazhis">'+h.Editor.Title+'</td>'+
'                    <td class="width-150 revhis">'+h.cdmLastReviewer+'</td>'+
'                    <td class="width-150">'+revbtn+'</td>'+
'                    <td class="width-500"></td>'+
'                </tr>'+

'            </table>'+
'        </div>'+
'    </div>'+
'    <div class="vw vwshow vwdefault" id="h_'+h.ID+'_vw1">'+
'        <img style="width:16px;height:16px;" src="../../pages/2.0/img/dots.svg" alt="show me everything">'+
'    </div>'+
'    <div class="vw vwhide vwhover" id="h_'+h.ID+'_vw2">'+
'        <img style="width:16px;height:16px;" src="../../pages/2.0/img/dots.svg" alt="hide things">'+
'    </div>'+
'    <div class="info-panel hide" id="h_'+h.ID+'_changehistory">'+

'    </div>'+
'    <div class="info-panel hide" id="h_'+h.ID+'_reviewhistory">'+decodeReviews(h.cdmReviews)+

'    </div>'+
'    <div class="hide cdmReviews" id="h_'+h.ID+'_cdmReviews">'+h.cdmReviews+

'    </div>'+


'</div>';
	
    return myvar;
}

function shortText(str) {
    //var t=str;
    if (!str) {
        str = '';
    }
    if (str.length > 50) {
        str = str.substring(0, 47) + '<span title="' + str + '">...</span>';
    } else {
        return str;
    }
    return str;
}

function decodeReviews(str){
    var t='';
    if(!str||str==''||str==undefined){
        t='<div>No review records found</div>';
    }else{
        var rows=str.split('^');
        var flds='';
        
        var row='';
        for(var cc=0;cc<rows.length;cc++){
            flds=rows[cc].split(']');
            var fld='';
            for(var dd=0;dd<flds.length;dd++){
                if(flds[dd]){
                    fld+='<td>'+flds[dd]+'</td>';
                }
                
            }
            if(fld){
                row+='<tr>'+fld+'</tr>';
            }
            
        }
        t='<table class="tpos-tbl">'+row+'</table>';
        
    }
    return t;

}

function decodeRAG(str) {
    var t='';
    if(!str||str==''||str==undefined){
        t='<div class="clr_5">Awaiting assessment</div>';
    }else{
        var tar=str.split('^');
        var clr=tar[2];
        var tit=tar[0];
        var bod=tar[1];
        t='<div class="width-290 centered tpos-border-risk-'+clr+'">'+tit+' - '+bod+'</div>';
    }
    return t;

}

function decodeRisk(tp,rr,clr){
    if(!rr){
        return '';
    }
    var rrrclr='';
    var rrdata=rr.split('^');
    var rr1data=rrdata[0].split('-');
    var rr2data=rrdata[1].split('-');
    var rr3data=rrdata[2].split('-');
    var rrsc=rr1data[0];
    var rrsct=rr1data[1];
    var rrclr=rr1data[2];
    var rrs=rr2data[0];
    var rrst=rr2data[1];
    var rrl=rr3data[0];
    var rrlt=rr3data[1];

    var bclr = 'tpos-border-right-Green';
    if(rrclr=='clr_5'){rrrclr='tpos-border-risk-Red';bclr = 'tpos-border-right-Red';}
    if(rrclr=='clr_4'){rrrclr='tpos-border-risk-Amber';bclr = 'tpos-border-right-Amber';}
    if(rrclr=='clr_1'){rrrclr='tpos-border-risk-Green';bclr = 'tpos-border-right-Green';}

    var myvar = '<div class="width-200  center centered "><div class="cell-cell '+rrrclr+'">'+
'                    <div class="cell-cell">Severity: '+rrs+' - '+rrst+'</div>'+
'                    <div class="cell-cell lg">'+tp+' risk: '+rrsct+' - '+rrsc+'</div>'+
'                    <div class="cell-cell">Likelihood: '+rrl+' - '+rrlt+'</div></div>';


if(clr){return bclr;}else{
    return myvar;
}


}

function decodeCoordinates(str,uce,hid) {
    var strings = [];
    var eds='';
    if(!str||str==''){
        if(uce==0){
            return '';
        }else{
            return '<div title="Add coordinates"> + </div>';
        }
    }else{ // if we get a string of coordinates
        strings = str.split('^');
        var t = '<tr><th>x</th><th>y</th><th>z</th></tr>';
        
        for (var i = 0; i < strings.length; i++) {
            var string = strings[i];
            var st=string.split(',');
            var x=st[0];
            var y=st[1];
            var z=st[2];

            if (string != '') {
                
                t += '<tr class="ctagtd"><td>' + x + '</td><td>' + y + '</td><td>' + z + '</td></tr>';
            }
        }
        var ctags='<table class="width-250 centered">'+t+'</table><div class="hide" id="h_'+hid+'_fullco">'+str+'</div>';
        return ctags;
    }
}


function printDate(role,username,date){
    var td=getTimeDiff(date);
    console.log('time difference: '+td);
    var bgclr=0;
    var clr=255;
    var op=1;
    var t='';
    if(td<24){
        op=1-(0.04*td);if(op<0.5){clr=0;}
        t='<div style="background-color:rgba(0,0,0,'+op+');color:rgb('+clr+','+clr+','+clr+')">'+role+' '+ukdate(date)+' by '+username+'</div>';
    }
    if(td>=24&&td<48){
        op=1-(0.04*(td-24));if(op<0.5){clr=0;}
        t='<div style="background-color:rgba(0,0,255,'+op+');color:rgb('+clr+','+clr+','+clr+')">'+role+' '+ukdate(date)+' by '+username+'</div>';
    }
    if(td>=48){
        t='<div >'+role+' '+ukdate(date)+' by '+username+'</div>';
    }
    
    return t;
}


function getTimeDiff(oldDate){
    var newDate=new Date();
    var fromDate = parseInt(new Date(oldDate).getTime()/1000); 
    var toDate = parseInt(new Date(newDate).getTime()/1000);
    var timeDiff = (toDate - fromDate)/3600;  // will give difference in hrs
    
    return Math.round(timeDiff,0);
}

