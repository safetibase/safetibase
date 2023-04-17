main = {
    setup_userdash: function(data, fset) {
        $('#mainTitle').html('Welcome to our hazards register');
        $('#mainArea').html('');
        var tlist = data.d.results;
        var tcnt = ui_msg.results(tlist);
        var t = '';
        if (tcnt == 0) {
            t = 'So far you haven\'t identified, reviewed or amended/mitigated any hazards.';
        } else {
            // var t1 = '<div class="ibox width-500" id="wp_site_hazardscategories"><div class="ibox-title"><h4>hazards per category</h4></div><div class="ibox-content"><div><canvas id="chart_site_hazardscategories"></canvas></div></div></div>';
            // var t2 = '<div class="ibox width-200" id="wp_site_hazardsstages"><div class="ibox-title"><h4>hazards per stage</h4></div><div class="ibox-content"><div><canvas id="chart_site_hazardsstages"></canvas></div></div></div>';
            // var t3 = '<div class="ibox width-200" id="wp_site_hazardsactions"hazards requiring actions</h4></div><div class="ibox-content"><div><canvas id="chart_site_hazardsactions"></canvas></div></div></div>';
            // var t4 = '<div class="ibox width-200" id="wp_site_hazardsrisks"><div class="ibox-title"><h4>hazards by residual risk</h4></div><div class="ibox-content"><div><canvas id="chart_site_hazardsrisks"></canvas></div></div></div>';
            // $('#mainArea').append(t1);
            var acnt = 0,
                ecnt = 0,
                aecnt = 0;
            var pwcnt = 0,
                twcnt = 0,
                racnt = 0;
            var cats = ['Permanent works', 'Temporary works', 'RAMS'];
            var stages = ['Construction', 'Commission', 'Operation', 'Maintenance', 'Demolition'];
            var actions = ['Unassigned', 'No element', 'Under review'];
            var resrisk = ['Low', 'Medium', 'High'];

            var catvals = [0, 0, 0];
            var stagevals = [0, 0, 0, 0, 0];
            var actionvals = [0, 0, 0];
            var resriskvals = [0, 0, 0];

            var catscolours = setRandomColours(3);
            var stagecolours = setRandomColours(5);
            var actioncolours = setRandomColours(3);
            var resriskcolours = ['rgb(0,255,0)', 'rgb(252, 146, 8)', 'rgb(255,0,0)'];

            var pwa = [],
                pwaid = [];
            var pwac = [];

            var twa = [],
                twaid = [];
            var ramsa = [],
                ramsaid = [];

            var hoa = [],
                hoaid = []; // owners array

            for (var i = 0; i < tcnt; i++) {
                var it = tlist[i];
                if (it.Author.ID == uid()) {
                    acnt++;
                }
                if (it.Editor.ID == uid()) {
                    ecnt++;
                }
                if (it.Author.ID == uid() && it.Editor.ID == uid()) {
                    aecnt++;
                }
                if (it.cdmPWStructure) {
                    pwcnt++;
                }
                if (it.cdmTW) {
                    twcnt++;
                }
                if (it.cdmRAMS) {
                    racnt++;
                }
                var pw = it.cdmPWStructure.ID;
                var tpw = it.cdmPWStructure.Title;
                var tw = it.cdmTW;
                var ra = it.cdmRAMS;
                var sg = it.cdmStageExtra.Title;
                var ho = it.cdmHazardOwner.Title;
                var hoi = it.cdmHazardOwner.ID;
                var ec = it.cdmPWElement.ID;
                var lrs = it.cdmLastReviewStatus;
                var s = it.cdmSite.Title;
                var rr = it.cdmResidualRiskScore;

                if (rr < 500) {
                    resriskvals[0]++;
                }
                if (rr > 500 && rr < 1000) {
                    resriskvals[1]++;
                }
                if (rr > 1000) {
                    resriskvals[2]++;
                }
                if (!ho) {
                    actionvals[0]++;
                }
                if (pw) {
                    catvals[0]++;
                    pwa.push(tpw);
                    pwaid.push('pw^' + pw);
                    if (!ec) {
                        actionvals[1]++;
                    }
                    if (sg == 'Construction') {
                        stagevals[0]++;
                    }

                    //$('#tpos-data').append(hz.cdmPWStructure.Title);
                }
                if (tw != null) {
                    catvals[1]++;
                    twa.push(tw);
                    twaid.push('tw^' + tw);
                }
                if (ra != null) {
                    catvals[2]++;
                    ramsa.push(ra);
                    ramsaid.push('ra^' + ra);
                }
                if (sg == 'Commission') {
                    stagevals[1]++;
                }
                if (sg == 'Operation') {
                    stagevals[2]++;
                }
                if (sg == 'Maintenance') {
                    stagevals[3]++;
                }
                if (sg == 'Demolition') {
                    stagevals[4]++;
                }
                if (lrs == 'Under review') {
                    actionvals[2]++;
                }
                if (ho) {
                    hoa.push(ho);
                    hoaid.push('ho^' + hoi);
                }
            }

            var catsData = {
                labels: cats,
                datasets: [{
                    data: catvals,
                    backgroundColor: catscolours
                }]
            };
            var catsOptions = {
                // responsive: true,
                onClick: function(evt, item) {
                    if (item[0]._index > -1) {
                        var cid = ids[item[0]._index];
                        var cn = lbls[item[0]._index];
                        //console.log(sid);
                        //getSiteData(sid,sn);
                        //getHazardsList()
                    }
                },
                legend: {
                    display: true,

                    position: 'left',
                    labels: {
                        fontSize: 10,
                        padding: 5
                    }

                }

            };
            // var ctx2 = document.getElementById("chart_site_hazardscategories").getContext("2d");
            // new Chart(ctx2, {
            //     type: 'pie',
            //     data: catsData,
            //     options: catsOptions
            // });
            // mkUnique(twa, 'site_tw', '--width3', 'Hazards per temporary works', 'By temporary works', twaid);
            // mkUnique(hoa, 'site_ho', '--width3', 'Hazards per owner', 'By owners', hoaid);
            // mkUnique(pwa, 'site_pwstr', '--width4', 'Hazards per permanent works', 'By permanent works', pwaid);
            //callmason('#tpos-page');

            // mkUnique(ramsa, 'site_ra', '--width4', 'Hazards per RAMS', 'By RAMS', ramsaid);

            tposdata.getCount('cdmHazards', 'Hazards on system');
            var uh = ui.mkDataBox(acnt, 'Hazards created by you');



            // t = '<div>So far you have recorded/identified ' + acnt + ' hazards.</div>' +
            //     '<div>So far you have amended ' + ecnt + ' hazards.</div>'+
            //     '<div>So far you are author and last editor for ' + aecnt + ' hazards.</div>'
            $('#mainArea').append(uh);
        }



    },
    setup_welcome: function() {
        // tposdata.getCount('cdmHazards','Hazards on system');
        $('#mainTitle').html('Welcome to our hazards register');
        $('#mainArea').html('');

        var fr1 = '<div class="filter-row">System users</div><div class="filter-row" id="tpos_users"></div>';
        var fr2 = '<div class="filter-row">Hazard stats</div><div class="filter-row" id="tpos_hazardstats"></div>';


        var newDate = new Date('2018/08/29');
        var today = parseInt(new Date(newDate).getTime());
        var daysToSubtract = -2;
        var minusDays = daysToSubtract * (86400000);

        var yd = today - (86400000);
        var yw = today - (7 * 86400000);
        var ym = today - (30 * 86400000);

        var ydd = new Date(yd);
        var ywd = new Date(yw);
        var ymd = new Date(ym);

        var ydu = ukdate(ydd);
        var ywu = ukdate(ywd);
        var ymu = ukdate(ymd);

        var ydi = ydd.toISOString();
        var ywi = ywd.toISOString();
        var ymi = ymd.toISOString();


        var fr3 = '<div class="filter-row">Hazards added since yesterday</div><div class="filter-row" id="tpos_yesterdayhazards"></div>';
        var fr4 = '<div class="filter-row">Hazards added since last week</div><div class="filter-row" id="tpos_lastweekhazards"></div>';
        var fr5 = '<div class="filter-row">Hazards added in the last 30 days</div><div class="filter-row" id="tpos_lastmonthhazards"></div>';

        $('#mainArea').html(fr1 + fr2 + fr3 + fr4 + fr5);


        tposdata.getQuickCount('cdmHazards', 1, '', 'Hazards on system', 'tpos_hazardstats', 'blue', 1);
        tposdata.getQuickCount('cdmHazards', 10, 'Created ge datetime\'' + ydi + '\'', 'Hazards added since ' + ydu, 'tpos_yesterdayhazards', 'blue', 1);
        tposdata.getQuickCount('cdmHazards', 100, 'Created ge datetime\'' + ywi + '\'', 'Hazards added since ' + ywu, 'tpos_lastweekhazards', 'blue', 1);
        tposdata.getQuickCount('cdmHazards', 1000, 'Created ge datetime\'' + ymi + '\'', 'Hazards added since ' + ymu, 'tpos_lastmonthhazards', 'blue', 1);
        tposdata.getQuickCount('cdmHazards', 2, 'Author/ID eq \'' + uid() + '\'', 'Hazards identified by you', 'tpos_hazardstats', 'green', 1);
        tposdata.getQuickCount('cdmHazards', 20, 'Created ge datetime\'' + ydi + '\' and Author/ID eq \'' + uid() + '\'', 'Hazards identified by you', 'tpos_yesterdayhazards', 'green', 1);
        tposdata.getQuickCount('cdmHazards', 3, 'cdmPWStructure/ID ne null', 'Permanent works hazards', 'tpos_hazardstats', '', 1);
        tposdata.getQuickCount('cdmHazards', 4, 'cdmTW ne null', 'Temporary works hazards', 'tpos_hazardstats', '', 1);
        tposdata.getQuickCount('cdmHazards', 5, 'cdmRAMS ne null', 'RAMS hazards', 'tpos_hazardstats', '', 1);
        tposdata.getQuickCount('cdmHazards', 6, 'cdmHazardOwner/ID eq null', 'Unassigned hazards', 'tpos_hazardstats', 'red', 1);
        tposdata.getQuickCount('cdmHazards', 7, 'cdmResidualRiskScore gt 9', 'High (residual) risk', 'tpos_hazardstats', 'red', 1);
        tposdata.getQuickCount('cdmUsers', 1, 'cdmUserRole/Title eq \'Designer\'', 'Designers', 'tpos_users', '', 1);
        tposdata.getQuickCount('cdmUsers', 2, 'cdmUserRole/Title eq \'Construction Engineer\'', 'Construction Engineers', 'tpos_users', '', 1);
        tposdata.getQuickCount('cdmUsers', 3, 'cdmUserRole/Title eq \'Design Manager\'', 'Design Managers', 'tpos_users', '', 1);
        tposdata.getQuickCount('cdmUsers', 4, 'cdmUserRole/Title eq \'Construction Manager\'', 'Construction Managers', 'tpos_users', '', 1);
        tposdata.getQuickCount('cdmUsers', 5, 'cdmUserRole/Title eq \'Lead designer\'', 'Lead designers', 'tpos_users', '', 1);
        tposdata.getQuickCount('cdmCompanies', 1, '', 'Companies', 'tpos_users', 'blue', 1);
        $('#tpos-main').removeClass('hide');
    },
    setup_user: function(userrole, company, site) {
        $('#mainTitle').html('Your dashboard');
        $('#mainArea').html('');
        var fr1 = '<div class="filter-row">To do</div><div class="filter-row" id="tpos_hazards"></div>';
        var fr2 = '<div class="filter-row">Useful info</div><div class="filter-row" id="tpos_info"></div>';

        $('#mainArea').html(fr1 + fr2);

        tposdata.getQuickCount('cdmHazards', 1, 'Author/ID eq \'' + uid() + '\'', 'Hazards identified by you', 'tpos_info', 'green', 1);
        tposdata.getQuickCount('cdmHazards', 2, 'Author/ID eq \'' + uid() + '\' and cdmHazardOwner/ID eq null', 'Unassigned hazards', 'tpos_hazards', 'red', 1);
        // tposdata.getQuickCount('cdmHazards',3,'Author/ID eq \'' + uid() + '\' and cdmMitigationDescription eq \'Awaiting mitigation\'','Require mitigation','tpos_hazards','red',1);

        var fr3 = '<div class="filter-row">' + userrole + '</div><div class="filter-row" id="tpos_' + userrole + '"></div>';
        var fr4 = '<div class="filter-row">' + company + '</div><div class="filter-row" id="tpos_' + company + '"></div>';
        var fr5 = '<div class="filter-row">' + site + '</div><div class="filter-row" id="tpos_' + site + '"></div>';

        // $('#mainArea').append(fr3 + fr4 + fr5);
        $('#mainArea').append('<div class="tpos-area-content-filler"></div>');


        if (userrole == 'Designer') {}

        // $('#mainArea').html();

    },
    new_hazard: function() {
        $('.tpos-btn').removeClass('tpos-btn-active');
        $('.add').addClass('tpos-btn-active');
        $('#mainTitle').html('Identify a hazard');
        $('#mainArea').html('');
        $('#mainArea').load('../../pages/2.0/html/frm.new_hazard.1.html', function() {
            $('.selectnext').hide();
            tposdata.get('cdmSites', '', '', 'sel_sites');



        });
    }
};


function mkUnique(data, wpid, wpwidth, wptitle, navme, xtra) {
    //var upwa = Array.from(new Set(data));
    //var upwa=mkSet(new Set(data));
    var setdata = new Set(data);
    //console.log(setdata);
    //var upwa= [...setdata];
    var upwa = hybridToArray(setdata);
    var setxtra = new Set(xtra);
    //var xtraa=[...setxtra];
    var xtraa = hybridToArray(setxtra);
    //var xtraa = Array.from(new Set(xtra));
    //var xtraa=mkSet(new Set(xtra));
    // if (xtra) {
    //     xtraa = Array.from(new Set(xtra));
    // }
    var arr = xtra;

    var counts = {};
    for (var i = 0; i < arr.length; i++) {
        counts[arr[i]] = 1 + (counts[arr[i]] || 0);
    }
    var array = $.map(counts, function(value, index) {
        return [value];
    });


    // console.log(array);
    // console.log(upwa);
    // console.log(xtraa);
    pwBarChart(upwa, array, wpid, wpwidth, wptitle, navme, xtraa);

}

function hybridToArray(nodes) {
    var arr = [];
    var set = nodes;
    set.forEach(function(i) {
        arr.push(i);
    });
    return arr;
}

function pwBarChart(lbl, pwa, wpid, wpwidth, wptitle, navme, xtraa) {
    var t1 = '<div class="ibox width-200" id="wp_' + wpid + '"><div class="ibox-title"><h3>' + wptitle + '</h3></div><div class="ibox-content"><div><canvas id="chart_' + wpid + '"></canvas></div></div></div>';
    $('#mainArea').append(t1);
    //appendtomason(t1);
    var strcolours = setRandomColours(pwa.length);
    var strData = {
        labels: lbl,


        datasets: [{
            data: pwa,
            keys: xtraa,
            backgroundColor: strcolours,
            borderColor: strcolours
        }]

    };
    var strOptions = {
        // responsive: true,
        scales: {
            yAxes: [{
                barPercentage: 0.25
            }],
            xAxes: [{
                ticks: {
                    beginAtZero: true
                }

            }]
        },
        elements: {
            rectangle: {
                borderSkipped: 'left',
            }
        },
        legend: {
            display: false
        },
        maxBarThickness: 20,
        onAnimationComplete: function() {
            recallMason();
        },
        onClick: function(evt, item) {
            if (item[0]._index > -1) {
                var rid = pwa[item[0]._index];
                var rn = lbl[item[0]._index];
                var rk = xtraa[item[0]._index];
                //var rl=label[item[0]._index];
                //var ttest=key;
                toastr.success(rn + '-' + rk);
                var keys = rk.split('^');
                var key = keys[0];
                var kid = keys[1];
                // buildHazardTable(key, kid);
                //console.log(rn);
                //getSiteData(sid,sn);
            }
        }
    };
    var te = 'chart_' + wpid;

    var ctx6 = document.getElementById(te).getContext("2d");
    new Chart(ctx6, {
        type: 'horizontalBar',
        data: strData,
        options: strOptions
    });

    // var nav_btn = '<div style="width:12%;" class="nav-btn" onclick="page.scroll(\'#wp_' + wpid + '\')">' + navme + '</div>';
    // $('#tpos-nav').append(nav_btn);
}