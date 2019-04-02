frmedit={
    router:function(fld){
        // load popup and loading graphic
        // get current hazard status to determine if changes can be made
        if(check_hazard.isSelected()==true&&check_hazard.isNotLocked()==true){
            if(check_hazard.isAssigned()==false && fld=='cdmHazardOwnerTitle'){
                var tpos_title='Loading data ...';
                var tpos_spinner='<div><i class="fa fa-spinner fa-spin fa-3x"><i></div>';
                $('.pops-title').html(tpos_title);
                $('.pops-content').html(tpos_spinner);
                // $('#pops').html(tpos_title+tpos_spinner);
                $('#pops').show();

                if(check_hazard.isDesignHazard()==true){
                    hzdt=0;
                    tposdata.get('cdmCompanies','cdmCompanyRole/Title eq \'Design house\'',null,'frmsel_owner');
                }else{
                    hzdt=1;
                    tposdata.get('cdmCompanies','cdmCompanyRole/Title eq \'Sub contractor\'',null,'frmsel_owner');
                }
            }
            if(check_hazard.isAssigned()==false && fld != 'cdmHazardOwnerTitle'){
                toastr.error('Before it can be amended, a hazard has to be assigned to an owner.');
            }
            // Owner is assigned and hazard is not locked
            if(check_hazard.isAssigned()==true){
                if(check_user.isEditor()==true){

                }
            }


        }
        if(check_hazard.isSelected()==true&&check_hazard.isNotLocked()==false){
            toastr.error('The hazard is under review and has been locked for editing.');
        }
    },
    owner:function(lst,data){
        var tlist = data.d.results;
        
        // $('#div_' + trg).hide();
        // $('#div_' + trg).html('');
        var options = '<tr><td class="hide" id="val_' + lst + '">0</td><td><input class="tpos-' + lst + '-select-input dvi" id="sel_' + lst + '" autofill="false" placeholder="Select a design house ..."></td></tr>';
        if(hzdt==1){
            options = '<tr><td class="hide" id="val_' + lst + '">0</td><td><input class="tpos-' + lst + '-select-input dvi" id="sel_' + lst + '" autofill="false" placeholder="Select a sub contractor ..."></td></tr>';
        }
        for (var cc = 0; cc < tlist.length; cc++) {
            var it = tlist[cc];
            var itid = it.ID;
            var ittitle = it.Title;
            // options += '<tr style="display:none;" class="tpos-' + lst + '-select-value dvs" data-list="' + lst + '" data-value="' + itid + '"><td class="hide">*' + ittitle.toLowerCase() + '</td><td id="dv_' + lst + '_' + itid + '">' + ittitle + '</td></tr>';
            options += '<tr style="display:none;" class="tpos-' + lst + '-select-value dvs" data-list="' + lst + '" data-value="' + itid + '"><td id="dv_' + lst + '_' + itid + '">' + ittitle + '</td></tr>';

        }
        var intro='<div class="tpos-title">Editing hazard '+hzd+'</div>';
        $('.pops-title').html(intro);
        $('.pops-content').html('<table class="tpos-select-table">' + options + '</table>');
        //$('#div_' + trg).show();
        //$('#pops').addClass('addheight');
        $('#sel_' + lst).bind('keyup change', function (ev) {
            // var st = $(this).val().toLowerCase();
            var st = $(this).val();
            $('#val_' + lst).html('0');
            //$('#sctSite').val('0');
            //sSite = 0;
            if (st) {
                $('tr:not(:Contains(' + st + '))').each(function () {
                    var t = $(this).html();
                    //console.log(t);
                    if ($(this).hasClass('tpos-' + lst + '-select-value') == 1) {
                        $(this).hide();
                    }
                });
                $('tr:Contains(' + st + ')').each(function () {
                    if ($(this).hasClass('tpos-' + lst + '-select-value') == 1) {
                        $(this).show();
                    }

                });
                // $('tr td:contains(' + st + ')').show();
            }
        });
        $('#sel_' + lst).click(function () {
            // var st = $(this).val().toLowerCase();
            var st = $(this).val();
            toastr.success(st);
            if (!st || st == '') {
                $('tr').each(function () {
                    if ($(this).hasClass('tpos-' + lst + '-select-value') == 1) {
                        $(this).show();
                    }

                });
            }

        });
        $('.tpos-' + lst + '-select-value').click(function () {
            var dvid = $(this).data('value');
            var dv = $('#dv_' + lst + '_' + dvid).html();
            $('#sel_' + lst).val(dv);
            $('#val_' + lst).html(dvid);
            $('#h_'+hzd+'_cdmHazardOwnerTitle').html(dv);
            $('#h_'+hzd+'_cdmHazardOwner').val(dvid);
            var tdata=[];
            tdata.push('cdmHazardOwner|'+dvid);
            tposdata.update('cdmHazards',tdata,'frmedit_updateview');

            $('#pops').hide();
            // routeSelection(lst, dvid, dv);
        });
        $('.btn-cancel').click(function(){
            $('.pops-title').html('');
            $('.pops-content').html('');
            $('#pops').hide();
        });
    },
    updateview:function(lst,data){
        var d = data.d.results;
        var h=d[0];
        var row=test(h);
        $('#h_'+hzd).replaceWith(row);
        // toggleCollapse();
        // $('#h' + hzd + ' .vwdefault').hide();
        // $('#h' + hzd + ' .vwhover').show();
        // $('#h'+hzd).addClass('addmargin');
        manageEdits();
        deCollapse('h_'+hzd);
    }
};

check_hazard={
    isSelected:function(){
        if(hzd==0||!hzd){
            toastr.error('something went wrong');
            return false;
        }else{
            return true;
        }
    },
    isNotLocked:function(){
        var cs=$('#h_'+hzd+'_cdmCurrentStatus').html();
        // toastr.success(cs);
        if(!cs){return true;}
        if(cs.substring(0,2)=='Req'){
            
            return false;
        }else{
            return true;
        }
    },
    isAssigned:function(){
        var t=$('#h_'+hzd+'_cdmHazardOwnerTitle').html();
        if(t!='<div class="clr_5">Unassigned</div>'){
            return true;
        }else{
            
            return false;
        }
    },
    isDesignHazard:function(){
        var hc=$('#h_'+hzd+' .row-header').html();
        if(hc=='RAMS hazard'){
            return false;
        }else{
            return true;
        }
    }
};

check_user={
    
    isEditor:function(){},
    isPeer:function(){},
    isAssignedPeer:function(){},
    isDHM:function(){},
    isSM:function(){},
    isLD:function(){}
};

function updateList(item){
    // var i=item.get_id();
    

    tposdata.get('cdmHazards','ID eq \'' + hzd + '\'',null,'updateDisplay');
}
function updateDisplay(data){
    var d = data.d.results;
    var h=d[0];
    var row=test(h);
    $('#mainArea').html(row);

}