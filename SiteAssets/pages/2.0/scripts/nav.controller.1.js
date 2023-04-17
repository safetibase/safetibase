nav = {
    setup: function(data, fset) {

        var tlist = data.d.results;
        var tcnt = ui_msg.results(tlist);
        var user = '';
        var actions = ui.mkBTN('add', '', 'Add a hazard', 'addHazard', '');

        for (var cc = 0; cc < tcnt; cc++) {
            var it = tlist[cc];
            var itid = it.ID;
            var vals = '';
            var fld = '';
            var item = '';
            for (var j = 0; j < fset.length; j++) {
                var fs = fset[j].split('.');
                var ft = fs[0];
                var fn = '';
                if (ft.substring(0, 7) == 'OData__') {
                    fn = ft.substring(7);
                } else {
                    fn = ft;
                }
                var fv = it[ft];
                if (fs[1]) {
                    fn = fn + fs[1];
                    fv = fv[fs[1]];
                }
                if (fv != undefined && fn != 'cdmUserTitle') {
                    fld += '<div style="display:none;" id="cdmUser_' + itid + '_fld_' + fn + '" class="fld_' + fn + '">' + fv + '</div>';
                }
                if (fv == 'Designer') {
                    actions += ui.mkBTN('edit', 'design', 'Edit/mitigate design hazards', 'editHazard', '');
                    actions += ui.mkBTN('review', 'design', 'Peer review design hazards', 'prHazard', '');
                }
                if (fv == 'Construction Engineer') {
                    actions += ui.mkBTN('edit', 'rams', 'Edit/mitigate RAMS hazards', 'editHazard', '');
                    actions += ui.mkBTN('review', 'rams', 'Peer review RAMS hazards', 'prHazard', '');
                }
                if (fv == 'Design Manager') {
                    actions += ui.mkBTN('review', 'design', 'Undertake design manager reviews', 'reviewHazard', '');
                }
                if (fv == 'Construction Manager') {
                    actions += ui.mkBTN('review', 'design', 'Undertake pre-construction reviews', 'reviewHazard', '');
                    actions += ui.mkBTN('review', 'rams', 'Undertake RAMS hazard reviews', 'reviewHazard', '');
                }
                if (fv == 'Lead designer') {
                    actions += ui.mkBTN('review', 'design', 'Undertake lead design reviews', 'reviewHazard', '');
                }
            }
            item = fld;
            user += '<div id="cdmUser_' + itid + '" class="dataset">' + item + '</div>';
        }

        $('#navTitle').html(unm());
        $('#user_roles').html(user);
        $('#user_actions').html(actions);
        $('.fld_cdmUserTitle').show();
        $('.fld_cdmCompanyTitle').show();
        $('.fld_cdmUserRoleTitle').show();
        $('.fld_cdmSiteTitle').show();
        // $('.fld_cdmCompanyTitle').addClass('c-0');
        $('#tpos-nav').addClass('animate fadeIn');
        $('#tpos-nav').addClass('fadeIn');
        $('#tpos-nav').removeClass('hide');

        $('.dataset').click(function() {
            var hc = $(this).hasClass('active');
            $('.dataset').removeClass('active');
            $('.tpos-btn').removeClass('tpos-btn-active');
            // $('.add').addClass('tpos-btn-active');

            if (hc == 0) {
                var rid = $(this).attr('id');
                console.log(rid);
                $(this).addClass('active');
                var role = $('#' + rid + '_fld_cdmUserRoleTitle').html();
                var comp = $('#' + rid + '_fld_cdmCompanyTitle').html();
                var site = $('#' + rid + '_fld_cdmSiteTitle').html();
                main.setup_user(role, comp, site);
            }
            if (hc == 1) {
                main.setup_welcome();
            }
        });
        $('.add').click(function() {
            var hc = $(this).hasClass('tpos-btn-active');
            $('.dataset').removeClass('active');
            $('.tpos-btn').removeClass('tpos-btn-active');
            if (hc == 0) {
                $('.add').addClass('tpos-btn-active');
                main.new_hazard();
            }
            if (hc == 1) {
                $(this).removeClass('tpos-btn-active');
                main.setup_welcome();
            }

        });


    }
};


// function addHazard(){
//     var hc=$('.add').hasClass('tpos-btn-active');
//     $('.dataset').removeClass('active');
//     $('.tpos-btn').removeClass('tpos-btn-active');

//     if(hc==0){
//         $('.add').addClass('tpos-btn-active');
//         main.new_hazard();
//     }
//     if(hc==1){
//         // $('.add').removeClass('tpos-btn-active');
//         main.setup_welcome();
//     }


// }