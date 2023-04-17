$(document).ready(function() {
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', init);
    toastr.success('Safetibase has been upgraded to improve functionality. You may notice a change in the hazard loading screen. Navigating between the dashboard and hazard lists is now much faster.', "Safetibase Upgrade", {timeOut: 20000, progressBar: true, positionClass: "toast-top-center", opacity: 1});
});

function init() {
    $(document).tooltip();
    jQuery.expr[':'].Contains = function(a, i, m) {
        return jQuery(a).text().toUpperCase()
            .indexOf(m[3].toUpperCase()) >= 0;
    };
    // set up the page title and logo
    const urlParams = new URLSearchParams(window.location.search);
    const disableNavigationLinks = urlParams.get("disableNavigationLinks");

    let pageTitle = "";
    const idParam = urlParams.get("hazardId");
    if (idParam) {
        pageTitle = `SafetiBase - Hazard ${idParam}`;
    } else if (urlParams.get("newHazard")) {
        pageTitle = 'SafetiBase - New Hazard';
    } else {
        pageTitle = 'SafetIbase<div id="cdmsearch" class="cdmsearch" title="Input numbers only - hazards ids, including legacy system hazard ids or temporary work designs numbers"  onSubmit="false"><input type="text" placeholder="Search here" id="cdmsearchbox" onSubmit="false"></div>';
    }
    $('#pageTitle').html(pageTitle);

    $('#DeltaSiteLogo').html('<img src="data:image/png;base64,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">');
    // $('#DeltaTopNavigation').replaceWith($('#tpos-global-nav').html());
    // global_nav();
    // load the layout for the page
    $('#tpos-page').load('../3.0/html/layout.html', function() {


        // get the user and their roles and display navigation
        setupleftnav();
        if (disableNavigationLinks) {
            $("#user_roles").hide();
        }

        setupmainareastats(idParam);

        if (urlParams.get("newHazard") === "true") {
            setupnewhazard();
        }

        // activate_global_nav();

    });

    $('#cdmsearch').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            //Disable textbox to prevent multiple submit
            $('#cdmsearchbox').attr("disabled", "disabled");

            //Do Stuff, submit, etc..
            var sv = $('#cdmsearchbox').val();
            getsearchresults(sv);
            $('#cdmsearchbox').val('');
            //Enable the textbox again if needed.
            $('#cdmsearchbox').removeAttr("disabled");
        }
    });

    if (disableNavigationLinks) {
        $("#suiteBarDelta").hide();
        $("#s4-ribbonrow").hide();
        $("#tpos-global-nav").hide();
    }

    // gimmepops('test','more tests');
}

function setupleftnav() {
    $('#tpos-nav').html('<div class="tpos-area-title">' + unm() + '</div><div id="user_roles" class="tpos-area-content"></div>');
    cdmdata.get('cdmUsers', 'cdmUser/Id eq \'' + uid() + '\'', 'ID asc', 'urbuttons', 'tpos-nav');
}

function setupmainareastats(hazardId, cdmSites, allHazardsData) {
    $('#tpos-main').html('');
    // toastr.success('main setup');
    // $('.dataset').removeClass('active');
    // var newmain='<div class="tpos-main" id="tpos-main"></div>';
    // $('.tpos-body').prepend(newmain);
    $('#systemstats').remove();
    $('#userstats').remove();
    $('#stats').remove();
    $('#tpos-main').html('<div class="tpos-area-title">Welcome to SafetIbase</div><div id="stats" class="tpos-area-content"></div>');
    $('#stats').load('../3.0/html/stats.tbl.html', function() {
        if (hazardId) {
            cdmdata.get('cdmHazards', "ID eq " + hazardId, "Modified desc", "hazards-search", 'statstbl', '');
        } else {
            // Passing through 'stats-table-row' in here forwards on the cdmSites data from cdmdata.get() to
            // DATA.FORMAT.CONTROLLER.js - formatdatato.statstablerows()
            if (allHazardsData && cdmSites) {
                formatdatato.createTable(cdmSites, allHazardsData, "cdmHazards", "statstbl")
            } else {
                cdmdata.get('cdmSites', null, 'Title asc', 'stats-table-row', 'statstbl');
            }
        }
    });

}

function setupsystemstats() {
    $('#tpos-main').html('');
    // $('.dataset').removeClass('active');
    $('#stats').remove();
    $('#systemstats').remove();
    $('#userstats').remove();
    // var newmain='<div class="tpos-main" id="tpos-main"></div>';
    // $('.tpos-body').prepend(newmain);

    $('#tpos-main').html('<div class="tpos-area-title">System statistics</div><div id="systemstats" class="tpos-area-content"></div>');

}

function setupuserstats(r, c, s, allHazardsData) {
    $('#tpos-main').html('');
    // $('.dataset').removeClass('active');
    // toastr.success('user setup');
    $('#stats').remove();
    $('#systemstats').remove();
    $('#userstats').remove();
    var sphrase = '';
    if (s) { sphrase = ' and assigned to ' + s; }
    $('#tpos-main').html('<div class="tpos-area-title">Hazards relevant to a ' + r + ' working for ' + c + sphrase + '</div><div id="userstats" class="tpos-area-content"></div>');
    $('#userstats').load('../3.0/html/stats.div.html', function() {
        var utbl1 = '<div class="row">Hazards last modified by you</div><table class="tpos-tbl"><tr><td id="userhighrisk"></td><td id="usernotassigned"></td></tr></table>';
        var utbl4 = '<div class="row">Hazards identified and/or last modified by you (regardless of company)</div><div><table class="tpos-tbl"><tr><td id="aa"></td><td id="ea"></td></tr></table></div>';
        var utbl2 = '<div class="row">' + c + ' hazards by residual risk' + '</div><div><table class="tpos-tbl"><tr><td id="chighrisk"></td><td id="cmediumrisk"></td><td id="clowrisk"></td></tr></table></div>';
        var utbl3 = '<div class="row">' + c + ' hazards by status' + '</div><div><table class="tpos-tbl"><tr><td id="caa"></td><td id="casses"></td><td id="cpeer"></td><td id="cdhm"></td><td id="cprecon"></td><td id="cld"></td><td id="csm"></td><td id="cacc"></td></tr></table></div>';
        $('#stats').html('<table class="tpos-tbl" id="statstbl"><tr><td id="a"></td><td id="e"></td><td id="b"></td><td id="c"></td><td id="d"></td></tr></table>' + utbl4 + utbl2 + utbl3);


        // cdmdata.getQuickCount('cdmHazards', 1, 'Author/ID eq ' + uid() + ' and cdmHazardOwner/Title eq \'' + c + '\'', 'Identified by you for ' + c, 'a', 'blue', null);
        // cdmdata.getQuickCount('cdmHazards', 2, 'Editor/ID eq ' + uid() + ' and cdmHazardOwner/Title eq \'' + c + '\'', 'Last modified by you for ' + c, 'e', 'blue', null);
        // cdmdata.getQuickCount('cdmHazards', 16, 'Author/ID eq ' + uid(), 'Identified by you', 'aa', 'blue', null);
        // cdmdata.getQuickCount('cdmHazards', 17, 'Editor/ID eq ' + uid(), 'Last modified by you', 'ea', 'blue', null);
        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].Author.ID == uid() && allHazardsData[i].cdmHazardOwner.Title == c) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            1,
            "Identified by you for " + c,
            "a",
            "blue",
            null
        );
        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].Editor.ID == uid() && allHazardsData[i].cdmHazardOwner.Title == c) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            2,
            "Last modified by you for " + c,
            "e",
            "blue",
            null
        );
        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].Author.ID == uid()) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            16,
            "Identified by you",
            "aa",
            "blue",
            null
        );
        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].Editor.ID == uid()) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            17,
            "Last modified by you",
            "ea",
            "blue",
            null
        );

        if (r == 'Designer' || r == 'Construction Engineer') {
            // cdmdata.getQuickCount('cdmHazards', 3, 'Editor/ID ne ' + uid() + ' and cdmCurrentStatus eq \'Under peer review\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Hazards you could peer review', 'c', 'blue', null);
            // cdmdata.getQuickCount('cdmHazards', 4, 'Editor/ID eq ' + uid() + ' and cdmCurrentStatus eq \'Under peer review\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Peer reviews requested by you', 'd', 'blue', null);
            cdmdata.createDashboardBoxes(
                (() => {
                    filteredDataset = [];
                    for (var i = 0; i < allHazardsData.length; i++) {
                        if (allHazardsData[i].Editor.ID != uid() && allHazardsData[i].cdmCurrentStatus == "Under peer review" && allHazardsData[i].cdmHazardOwner.Title == c) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                3,
                "Hazards you could peer review",
                "c",
                "blue",
                null
            );
            cdmdata.createDashboardBoxes(
                (() => {
                    filteredDataset = [];
                    for (var i = 0; i < allHazardsData.length; i++) {
                        if (allHazardsData[i].Editor.ID == uid() && allHazardsData[i].cdmCurrentStatus == "Under peer review" && allHazardsData[i].cdmHazardOwner.Title == c) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                4,
                "Peer reviews requested by you",
                "d",
                "blue",
                null
            );
        }
        if (r == 'Design Manager') {
            // cdmdata.getQuickCount('cdmHazards', 3, 'cdmCurrentStatus eq \'Under design manager review\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Hazards you could review', 'c', 'blue', null);
            cdmdata.createDashboardBoxes(
                (() => {
                    filteredDataset = [];
                    for (var i = 0; i < allHazardsData.length; i++) {
                        if (allHazardsData[i].cdmCurrentStatus == "Under design manager review" && allHazardsData[i].cdmHazardOwner.Title == c) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                3,
                "Hazards you could review",
                "c",
                "blue",
                null
            );
            // cdmdata.getQuickCount('cdmHazards',4,'Editor/ID eq '+uid()+' and cdmCurrentStatus eq \'Under peer review\' and cdmHazardOwner/Title eq \''+c+'\'','Peer reviews requested by you','d','blue',null);
        }
        if (r == 'Construction Manager') {
            // cdmdata.getQuickCount('cdmHazards', 3, 'cdmCurrentStatus eq \'Under Construction Manager review\' and cdmSite/Title eq \'' + s + '\'', 'RAMS hazards you could review', 'c', 'blue', null);
            // cdmdata.getQuickCount('cdmHazards', 4, 'cdmCurrentStatus eq \'Under pre-construction review\' and cdmSite/Title eq \'' + s + '\'', 'Hazards for pre-construction review', 'd', 'blue', null);
            cdmdata.createDashboardBoxes(
                (() => {
                    filteredDataset = [];
                    for (var i = 0; i < allHazardsData.length; i++) {
                        if (allHazardsData[i].cdmCurrentStatus == "Under Construction Manager review" && allHazardsData[i].cdmSite.Title == s) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                3,
                "RAMS Hazards you could review",
                "c",
                "blue",
                null
            );
            cdmdata.createDashboardBoxes(
                (() => {
                    filteredDataset = [];
                    for (var i = 0; i < allHazardsData.length; i++) {
                        if (allHazardsData[i].cdmCurrentStatus == "Under pre-construction review" && allHazardsData[i].cdmSite.Title == s) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                4,
                "Hazards for pre-construction review",
                "d",
                "blue",
                null
            );
            // cdmdata.getQuickCount('cdmHazards',4,'Editor/ID eq '+uid()+' and cdmCurrentStatus eq \'Under peer review\' and cdmHazardOwner/Title eq \''+c+'\'','Peer reviews requested by you','d','blue',null);
        }
        if (r == 'Principal designer') {
            // cdmdata.getQuickCount('cdmHazards', 3, 'cdmCurrentStatus eq \'Under principal designer review\' and cdmSite/Title eq \'' + s + '\'', 'Hazards for principal designer review', 'c', 'blue', null);
            cdmdata.createDashboardBoxes(
                (() => {
                    filteredDataset = [];
                    for (var i = 0; i < allHazardsData.length; i++) {
                        if (allHazardsData[i].cdmCurrentStatus == "Under principal designer review" && allHazardsData[i].cdmSite.Title == s) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                3,
                "Hazards for principal designer review",
                "c",
                "blue",
                null
            );
            // cdmdata.getQuickCount('cdmHazards',4,'cdmCurrentStatus eq \'Under pre-construction review\' and cdmSite/Title eq \''+s+'\'','Hazards for pre-construction review','d','blue',null);
            // cdmdata.getQuickCount('cdmHazards',4,'Editor/ID eq '+uid()+' and cdmCurrentStatus eq \'Under peer review\' and cdmHazardOwner/Title eq \''+c+'\'','Peer reviews requested by you','d','blue',null);
        }


        // cdmdata.getQuickCount('cdmHazards', 5, 'cdmResidualRiskScore gt \'9\' and cdmHazardOwner/Title eq \'' + c + '\'', 'High (residual) risk hazards', 'chighrisk', 'red', null);
        // cdmdata.getQuickCount('cdmHazards', 6, 'cdmResidualRiskScore gt \'5\' and cdmResidualRiskScore lt \'10\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Medium (residual) risk hazards', 'cmediumrisk', 'amber', null);
        // cdmdata.getQuickCount('cdmHazards', 7, 'cdmResidualRiskScore lt \'6\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Low (residual) risk hazards', 'clowrisk', 'green', null);
        // cdmdata.getQuickCount('cdmHazards', 8, 'cdmCurrentStatus eq \'Assessment in progress\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Assessment in progress', 'casses', 'blue', null);
        // cdmdata.getQuickCount('cdmHazards', 9, 'cdmCurrentStatus eq \'Under peer review\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Under peer review', 'cpeer', 'blue', null);
        // cdmdata.getQuickCount('cdmHazards', 10, 'cdmCurrentStatus eq \'Under design manager review\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Under design manager review', 'cdhm', 'blue', null);
        // cdmdata.getQuickCount('cdmHazards', 11, 'cdmCurrentStatus eq \'Under pre-construction review\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Under pre-construction review', 'cprecon', 'blue', null);
        // cdmdata.getQuickCount('cdmHazards', 12, 'cdmCurrentStatus eq \'Under principal designer review\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Under principal designer review', 'cld', 'blue', null);
        // cdmdata.getQuickCount('cdmHazards', 13, 'cdmCurrentStatus eq \'Under Construction Manager review\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Under Construction Manager review', 'csm', 'blue', null);
        // cdmdata.getQuickCount('cdmHazards', 14, 'cdmCurrentStatus eq \'Accepted\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Accepted', 'cacc', 'green', null);
        // cdmdata.getQuickCount('cdmHazards', 15, 'cdmCurrentStatus eq \'Requires mitigation\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Awaiting assessment', 'caa', 'red', null);
        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].cdmResidualRiskScore > 9 && allHazardsData[i].cdmHazardOwner.Title == c) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            5,
            "High (residual) risk hazards",
            "chighrisk",
            "red",
            null
        );
        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].cdmResidualRiskScore > 5 && allHazardsData[i].cdmResidualRiskScore < 10 && allHazardsData[i].cdmHazardOwner.Title == c) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            6,
            "Medium (residual) risk hazards",
            "cmediumrisk",
            "amber",
            null
        );
        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].cdmResidualRiskScore < 6 && allHazardsData[i].cdmHazardOwner.Title == c) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            7,
            "Low (residual) risk hazards",
            "clowrisk",
            "green",
            null
        );

        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].cdmCurrentStatus == "Assessment in progress" && allHazardsData[i].cdmHazardOwner.Title == c) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            8,
            "Assessment in progress",
            "casses",
            "blue",
            null
        );
        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].cdmCurrentStatus == "Under peer review" && allHazardsData[i].cdmHazardOwner.Title == c) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            9,
            "Under peer review",
            "cpeer",
            "blue",
            null
        );
        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].cdmCurrentStatus == "Under design manager review" && allHazardsData[i].cdmHazardOwner.Title == c) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            10,
            "Under design manager review",
            "cdhm",
            "blue",
            null
        );
        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].cdmCurrentStatus == "Under pre-construction review" && allHazardsData[i].cdmHazardOwner.Title == c) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            11,
            "Under pre-construction review",
            "cprecon",
            "blue",
            null
        );
        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].cdmCurrentStatus == "Under principal designer review" && allHazardsData[i].cdmHazardOwner.Title == c) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            12,
            "Under principal designer review",
            "cld",
            "blue",
            null
        );
        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].cdmCurrentStatus == "Under Construction Manager review" && allHazardsData[i].cdmHazardOwner.Title == c) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            13,
            "Under Construction Manager review",
            "csm",
            "blue",
            null
        );
        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].cdmCurrentStatus == "Accepted" && allHazardsData[i].cdmHazardOwner.Title == c) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            14,
            "Accepted",
            "cacc",
            "green",
            null
        );
        cdmdata.createDashboardBoxes(
            (() => {
                filteredDataset = [];
                for (var i = 0; i < allHazardsData.length; i++) {
                    if (allHazardsData[i].cdmCurrentStatus == "Requires mitigation" && allHazardsData[i].cdmHazardOwner.Title == c) {
                        filteredDataset.push(allHazardsData[i]);
                    }
                }
                return filteredDataset
            })(),
            "cdmHazards",
            15,
            "Awaiting assessment",
            "caa",
            "red",
            null
        );
    });



}

function setupEditableHazards(allHazardsData) { // designers and Construction Engineers only
    $('#tpos-main').html('');
    // $('.dataset').removeClass('active');
    $('#stats').remove();
    $('#systemstats').remove();
    $('#userstats').remove();
    // var newmain='<div class="tpos-main" id="tpos-main"></div>';
    // $('.tpos-body').prepend(newmain);

    $('#tpos-main').html('<div class="tpos-area-title">Mitigate and edit hazards for your company/companies</div><div id="mitigatehazards" class="tpos-area-content"></div>');


    var ds = $('.dataset');
    var ids = [];
    var cs = [];
    toastr.success(ds.length + ' data sets');
    $.each(ds, function() {
        var tid = $(this).attr('id');
        console.log(tid);
        var dd = tid;

        var tjs = $('#' + tid + '_cdmUserRole').data('elementname');
        console.log(tjs);
        var tc = $('#' + tid + '_cdmCompany').data('elementname');
        console.log(tc);
        if (tjs == 'Designer' || tjs == 'Construction Engineer') {
            var c = tc;

            var utbl = '<div class="row">' + c + ' hazards - mitigation required' + '</div><div><table class="tpos-tbl"><tr><td id="' + dd + '_chighrisk"></td><td id="' + dd + '_cmediumrisk"></td><td id="' + dd + '_clowrisk"></td></tr></table></div>';
            var utbl1 = '<div class="row">' + c + ' hazards - assessment in progress' + '</div><div><table class="tpos-tbl"><tr><td id="' + dd + '_ahighrisk"></td><td id="' + dd + '_amediumrisk"></td><td id="' + dd + '_alowrisk"></td></tr></table></div>';
            $('#mitigatehazards').append(utbl + utbl1);

            // cdmdata.getQuickCount('cdmHazards', 5, 'cdmResidualRiskScore gt \'9\' and cdmHazardOwner/Title eq \'' + c + '\' and cdmCurrentStatus eq \'Requires mitigation\'', 'High (residual) risk hazards', dd + '_chighrisk', 'red', null);
            // cdmdata.getQuickCount('cdmHazards', 6, 'cdmResidualRiskScore gt \'4\' and cdmResidualRiskScore lt \'10\' and cdmHazardOwner/Title eq \'' + c + '\' and cdmCurrentStatus eq \'Requires mitigation\'', 'Medium (residual) risk hazards', dd + '_cmediumrisk', 'amber', null);
            // cdmdata.getQuickCount('cdmHazards', 7, 'cdmResidualRiskScore lt \'5\' and cdmHazardOwner/Title eq \'' + c + '\' and cdmCurrentStatus eq \'Requires mitigation\'', 'Low (residual) risk hazards', dd + '_clowrisk', 'green', null);
            cdmdata.createDashboardBoxes(
                (() => {
                    filteredDataset = [];
                    for (var i = 0; i < allHazardsData.length; i++) {
                        if (allHazardsData[i].cdmCurrentStatus == "Requires mitigation" && allHazardsData[i].cdmResidualRiskScore > 9 && allHazardsData[i].cdmHazardOwner.Title == c) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                5,
                "High (residual) risk hazards",
                dd + "_chighrisk",
                "red",
                null
            );
            cdmdata.createDashboardBoxes(
                (() => {
                    filteredDataset = [];
                    for (var i = 0; i < allHazardsData.length; i++) {
                        if (allHazardsData[i].cdmCurrentStatus == "Requires mitigation" && allHazardsData[i].cdmResidualRiskScore > 4 && allHazardsData[i].cdmResidualRiskScore < 10 && allHazardsData[i].cdmHazardOwner.Title == c) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                6,
                "Medium (residual) risk hazards",
                dd + "_cmediumrisk",
                "amber",
                null
            );
            cdmdata.createDashboardBoxes(
                (() => {
                    filteredDataset = [];
                    for (var i = 0; i < allHazardsData.length; i++) {
                        if (allHazardsData[i].cdmCurrentStatus == "Requires mitigation" && allHazardsData[i].cdmResidualRiskScore < 5 && allHazardsData[i].cdmHazardOwner.Title == c) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                7,
                "Low (residual) risk hazards",
                dd + "_clowrisk",
                "green",
                null
            );

            // cdmdata.getQuickCount('cdmHazards', 8, 'cdmResidualRiskScore gt \'9\' and cdmHazardOwner/Title eq \'' + c + '\' and cdmCurrentStatus eq \'Assessment in progress\'', 'High (residual) risk hazards', dd + '_ahighrisk', 'red', null);
            // cdmdata.getQuickCount('cdmHazards', 9, 'cdmResidualRiskScore gt \'4\' and cdmResidualRiskScore lt \'10\' and cdmHazardOwner/Title eq \'' + c + '\' and cdmCurrentStatus eq \'Assessment in progress\'', 'Medium (residual) risk hazards', dd + '_amediumrisk', 'amber', null);
            // cdmdata.getQuickCount('cdmHazards', 10, 'cdmResidualRiskScore lt \'5\' and cdmHazardOwner/Title eq \'' + c + '\' and cdmCurrentStatus eq \'Assessment in progress\'', 'Low (residual) risk hazards', dd + '_alowrisk', 'green', null);
            cdmdata.createDashboardBoxes(
                (() => {
                    filteredDataset = [];
                    for (var i = 0; i < allHazardsData.length; i++) {
                        if (allHazardsData[i].cdmCurrentStatus == "Assessment in progress" && allHazardsData[i].cdmResidualRiskScore > 9 && allHazardsData[i].cdmHazardOwner.Title == c) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                8,
                "High (residual) risk hazards",
                dd + "_ahighrisk",
                "red",
                null
            );
            cdmdata.createDashboardBoxes(
                (() => {
                    filteredDataset = [];
                    for (var i = 0; i < allHazardsData.length; i++) {
                        if (allHazardsData[i].cdmCurrentStatus == "Assessment in progress" && allHazardsData[i].cdmResidualRiskScore > 4 && allHazardsData[i].cdmResidualRiskScore < 10 && allHazardsData[i].cdmHazardOwner.Title == c) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                9,
                "Medium (residual) risk hazards",
                dd + "_amediumrisk",
                "amber",
                null
            );
            cdmdata.createDashboardBoxes(
                (() => {
                    filteredDataset = [];
                    for (var i = 0; i < allHazardsData.length; i++) {
                        if (allHazardsData[i].cdmCurrentStatus == "Assessment in progress" && allHazardsData[i].cdmResidualRiskScore < 5 && allHazardsData[i].cdmHazardOwner.Title == c) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                10,
                "Low (residual) risk hazards",
                dd + "_alowrisk",
                "green",
                null
            );

        }

    });
}

function setupReviewableHazards(a, allHazardsData) {
    $('#tpos-main').html('');
    // $('.dataset').removeClass('active');
    $('#stats').remove();
    $('#systemstats').remove();
    $('#userstats').remove();
    // var newmain='<div class="tpos-main" id="tpos-main"></div>';
    // $('.tpos-body').prepend(newmain);

    $('#tpos-main').html('<div class="tpos-area-title">Mitigate and edit hazards for your company/companies</div><div id="reviewhazards" class="tpos-area-content"></div>');


    var ds = $('.dataset');
    var ids = [];
    var cs = [];
    toastr.success(ds.length + ' data sets');
    $.each(ds, function() {
        var tid = $(this).attr('id');
        console.log(tid);
        var dd = tid;

        var tjs = $('#' + tid + '_cdmUserRole').data('elementname');
        console.log(tjs);
        var tc = $('#' + tid + '_cdmCompany').data('elementname');
        console.log(tc);
        var ts = $('#' + tid + '_cdmSite').data('elementname');
        var c = tc;
        var cst = '';
        var q = '';
        var utbl1 = '';
        var cst1 = '';
        var q1 = '';
        var utbl = '';
        if (a == 'prHazard') {
            if (tjs == 'Designer') {
                cst = 'Under peer review';
                q = ' and cdmHazardOwner/Title eq \'' + c + '\' and cdmCurrentStatus eq \'' + cst + '\' and cdmRAMS eq null';
                utbl = '<div class="row">' + c + ' hazards - ' + cst + '</div><div><table class="tpos-tbl"><tr><td id="' + dd + '_chighrisk"></td><td id="' + dd + '_cmediumrisk"></td><td id="' + dd + '_clowrisk"></td></tr></table></div>';
                // var utbl1='<div class="row">'+c+' hazards - assessment in progress'+'</div><div><table class="tpos-tbl"><tr><td id="'+dd+'_ahighrisk"></td><td id="'+dd+'_amediumrisk"></td><td id="'+dd+'_alowrisk"></td></tr></table></div>';
                $('#reviewhazards').append(utbl);

                // cdmdata.getQuickCount('cdmHazards', 5, 'cdmResidualRiskScore gt \'9\'' + q, 'High (residual) risk hazards', dd + '_chighrisk', 'red', null);
                // cdmdata.getQuickCount('cdmHazards', 6, 'cdmResidualRiskScore gt \'4\' and cdmResidualRiskScore lt \'10\'' + q, 'Medium (residual) risk hazards', dd + '_cmediumrisk', 'amber', null);
                // cdmdata.getQuickCount('cdmHazards', 7, 'cdmResidualRiskScore lt \'5\'' + q, 'Low (residual) risk hazards', dd + '_clowrisk', 'green', null);
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmRAMS == null && allHazardsData[i].cdmResidualRiskScore > 9 && allHazardsData[i].cdmHazardOwner.Title == c) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    5,
                    "High (residual) risk hazards",
                    dd + "_chighrisk",
                    "red",
                    null
                );
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmRAMS == null && allHazardsData[i].cdmResidualRiskScore > 4 && allHazardsData[i].cdmResidualRiskScore < 10 && allHazardsData[i].cdmHazardOwner.Title == c) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    6,
                    "Medium (residual) risk hazards",
                    dd + "_cmediumrisk",
                    "amber",
                    null
                );
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmRAMS == null && allHazardsData[i].cdmResidualRiskScore < 5 && allHazardsData[i].cdmHazardOwner.Title == c) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    7,
                    "Low (residual) risk hazards",
                    dd + "_clowrisk",
                    "green",
                    null
                );

            }
            if (tjs == 'Construction Engineer') {
                cst = 'Under peer review';
                q = ' and cdmHazardOwner/Title eq \'' + c + '\' and cdmCurrentStatus eq \'' + cst + '\' and cdmRAMS ne null';
                utbl = '<div class="row">' + c + ' hazards - ' + cst + '</div><div><table class="tpos-tbl"><tr><td id="' + dd + '_chighrisk"></td><td id="' + dd + '_cmediumrisk"></td><td id="' + dd + '_clowrisk"></td></tr></table></div>';
                // var utbl1='<div class="row">'+c+' hazards - assessment in progress'+'</div><div><table class="tpos-tbl"><tr><td id="'+dd+'_ahighrisk"></td><td id="'+dd+'_amediumrisk"></td><td id="'+dd+'_alowrisk"></td></tr></table></div>';
                $('#reviewhazards').append(utbl);

                // cdmdata.getQuickCount('cdmHazards', 5, 'cdmResidualRiskScore gt \'9\'' + q, 'High (residual) risk hazards', dd + '_chighrisk', 'red', null);
                // cdmdata.getQuickCount('cdmHazards', 6, 'cdmResidualRiskScore gt \'4\' and cdmResidualRiskScore lt \'10\'' + q, 'Medium (residual) risk hazards', dd + '_cmediumrisk', 'amber', null);
                // cdmdata.getQuickCount('cdmHazards', 7, 'cdmResidualRiskScore lt \'5\'' + q, 'Low (residual) risk hazards', dd + '_clowrisk', 'green', null);
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmRAMS != null && allHazardsData[i].cdmResidualRiskScore > 9 && allHazardsData[i].cdmHazardOwner.Title == c) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    5,
                    "High (residual) risk hazards",
                    dd + "_chighrisk",
                    "red",
                    null
                );
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmRAMS != null && allHazardsData[i].cdmResidualRiskScore > 4 && allHazardsData[i].cdmResidualRiskScore < 10 && allHazardsData[i].cdmHazardOwner.Title == c) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    6,
                    "Medium (residual) risk hazards",
                    dd + "_cmediumrisk",
                    "amber",
                    null
                );
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmRAMS != null && allHazardsData[i].cdmResidualRiskScore < 5 && allHazardsData[i].cdmHazardOwner.Title == c) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    7,
                    "Low (residual) risk hazards",
                    dd + "_clowrisk",
                    "green",
                    null
                );

            }

        }
        if (a == 'dmrHazard') {
            if (tjs == 'Design Manager') {
                cst = 'Under design manager review';
                q = ' and cdmHazardOwner/Title eq \'' + c + '\' and cdmCurrentStatus eq \'' + cst + '\'';
                utbl = '<div class="row">' + c + ' hazards - ' + cst + '</div><div><table class="tpos-tbl"><tr><td id="' + dd + '_chighrisk"></td><td id="' + dd + '_cmediumrisk"></td><td id="' + dd + '_clowrisk"></td></tr></table></div>';
                // var utbl1='<div class="row">'+c+' hazards - assessment in progress'+'</div><div><table class="tpos-tbl"><tr><td id="'+dd+'_ahighrisk"></td><td id="'+dd+'_amediumrisk"></td><td id="'+dd+'_alowrisk"></td></tr></table></div>';
                $('#reviewhazards').append(utbl);

                // cdmdata.getQuickCount('cdmHazards', 5, 'cdmResidualRiskScore gt \'9\'' + q, 'High (residual) risk hazards', dd + '_chighrisk', 'red', null);
                // cdmdata.getQuickCount('cdmHazards', 6, 'cdmResidualRiskScore gt \'4\' and cdmResidualRiskScore lt \'10\'' + q, 'Medium (residual) risk hazards', dd + '_cmediumrisk', 'amber', null);
                // cdmdata.getQuickCount('cdmHazards', 7, 'cdmResidualRiskScore lt \'5\'' + q, 'Low (residual) risk hazards', dd + '_clowrisk', 'green', null);
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmResidualRiskScore > 9 && allHazardsData[i].cdmHazardOwner.Title == c) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    5,
                    "High (residual) risk hazards",
                    dd + "_chighrisk",
                    "red",
                    null
                );
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmResidualRiskScore > 4 && allHazardsData[i].cdmResidualRiskScore < 10 && allHazardsData[i].cdmHazardOwner.Title == c) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    6,
                    "Medium (residual) risk hazards",
                    dd + "_cmediumrisk",
                    "amber",
                    null
                );
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmResidualRiskScore < 5 && allHazardsData[i].cdmHazardOwner.Title == c) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    7,
                    "Low (residual) risk hazards",
                    dd + "_clowrisk",
                    "green",
                    null
                );
            }

        }
        if (a == 'pcrHazard') {
            if (tjs == 'Construction Manager') {
                cst = 'Under pre-construction review';
                q = ' and cdmSite/Title eq \'' + ts + '\' and cdmCurrentStatus eq \'' + cst + '\'';
                utbl = '<div class="row">' + c + ' hazards - ' + cst + '</div><div><table class="tpos-tbl"><tr><td id="' + dd + '_chighrisk"></td><td id="' + dd + '_cmediumrisk"></td><td id="' + dd + '_clowrisk"></td></tr></table></div>';
                // var utbl1='<div class="row">'+c+' hazards - assessment in progress'+'</div><div><table class="tpos-tbl"><tr><td id="'+dd+'_ahighrisk"></td><td id="'+dd+'_amediumrisk"></td><td id="'+dd+'_alowrisk"></td></tr></table></div>';
                $('#reviewhazards').append(utbl);

                // cdmdata.getQuickCount('cdmHazards', 5, 'cdmResidualRiskScore gt \'9\'' + q, 'High (residual) risk hazards', dd + '_chighrisk', 'red', null);
                // cdmdata.getQuickCount('cdmHazards', 6, 'cdmResidualRiskScore gt \'4\' and cdmResidualRiskScore lt \'10\'' + q, 'Medium (residual) risk hazards', dd + '_cmediumrisk', 'amber', null);
                // cdmdata.getQuickCount('cdmHazards', 7, 'cdmResidualRiskScore lt \'5\'' + q, 'Low (residual) risk hazards', dd + '_clowrisk', 'green', null);
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmResidualRiskScore > 9 && allHazardsData[i].cdmSite.Title == ts) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    5,
                    "High (residual) risk hazards",
                    dd + "_chighrisk",
                    "red",
                    null
                );
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmResidualRiskScore > 4 && allHazardsData[i].cdmResidualRiskScore < 10 && allHazardsData[i].cdmSite.Title == ts) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    6,
                    "Medium (residual) risk hazards",
                    dd + "_cmediumrisk",
                    "amber",
                    null
                );
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmResidualRiskScore < 5 && allHazardsData[i].cdmSite.Title == ts) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    7,
                    "Low (residual) risk hazards",
                    dd + "_clowrisk",
                    "green",
                    null
                );
            }

        }
        if (a == 'smrHazard') {
            if (tjs == 'Construction Manager') {
                cst = 'Under Construction Manager review';
                q = ' and cdmSite/Title eq \'' + ts + '\' and cdmCurrentStatus eq \'' + cst + '\'';
                utbl = '<div class="row">' + c + ' hazards - ' + cst + '</div><div><table class="tpos-tbl"><tr><td id="' + dd + '_chighrisk"></td><td id="' + dd + '_cmediumrisk"></td><td id="' + dd + '_clowrisk"></td></tr></table></div>';
                // var utbl1='<div class="row">'+c+' hazards - assessment in progress'+'</div><div><table class="tpos-tbl"><tr><td id="'+dd+'_ahighrisk"></td><td id="'+dd+'_amediumrisk"></td><td id="'+dd+'_alowrisk"></td></tr></table></div>';
                $('#reviewhazards').append(utbl);

                // cdmdata.getQuickCount('cdmHazards', 5, 'cdmResidualRiskScore gt \'9\'' + q, 'High (residual) risk hazards', dd + '_chighrisk', 'red', null);
                // cdmdata.getQuickCount('cdmHazards', 6, 'cdmResidualRiskScore gt \'4\' and cdmResidualRiskScore lt \'10\'' + q, 'Medium (residual) risk hazards', dd + '_cmediumrisk', 'amber', null);
                // cdmdata.getQuickCount('cdmHazards', 7, 'cdmResidualRiskScore lt \'5\'' + q, 'Low (residual) risk hazards', dd + '_clowrisk', 'green', null);
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmResidualRiskScore > 9 && allHazardsData[i].cdmSite.Title == ts) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    5,
                    "High (residual) risk hazards",
                    dd + "_chighrisk",
                    "red",
                    null
                );
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmResidualRiskScore > 4 && allHazardsData[i].cdmResidualRiskScore < 10 && allHazardsData[i].cdmSite.Title == ts) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    6,
                    "Medium (residual) risk hazards",
                    dd + "_cmediumrisk",
                    "amber",
                    null
                );
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmResidualRiskScore < 5 && allHazardsData[i].cdmSite.Title == ts) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    7,
                    "Low (residual) risk hazards",
                    dd + "_clowrisk",
                    "green",
                    null
                );
            }

        }
        if (a == 'ldrHazard') {
            if (tjs == 'Principal designer') {
                cst = 'Under principal designer review';
                q = ' and cdmSite/Title eq \'' + ts + '\' and cdmCurrentStatus eq \'' + cst + '\'';
                utbl = '<div class="row">' + c + ' hazards - ' + cst + '</div><div><table class="tpos-tbl"><tr><td id="' + dd + '_chighrisk"></td><td id="' + dd + '_cmediumrisk"></td><td id="' + dd + '_clowrisk"></td></tr></table></div>';
                // var utbl1='<div class="row">'+c+' hazards - assessment in progress'+'</div><div><table class="tpos-tbl"><tr><td id="'+dd+'_ahighrisk"></td><td id="'+dd+'_amediumrisk"></td><td id="'+dd+'_alowrisk"></td></tr></table></div>';
                $('#reviewhazards').append(utbl);

                // cdmdata.getQuickCount('cdmHazards', 5, 'cdmResidualRiskScore gt \'9\'' + q, 'High (residual) risk hazards', dd + '_chighrisk', 'red', null);
                // cdmdata.getQuickCount('cdmHazards', 6, 'cdmResidualRiskScore gt \'4\' and cdmResidualRiskScore lt \'10\'' + q, 'Medium (residual) risk hazards', dd + '_cmediumrisk', 'amber', null);
                // cdmdata.getQuickCount('cdmHazards', 7, 'cdmResidualRiskScore lt \'5\'' + q, 'Low (residual) risk hazards', dd + '_clowrisk', 'green', null);
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmResidualRiskScore > 9 && allHazardsData[i].cdmSite.Title == ts) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    5,
                    "High (residual) risk hazards",
                    dd + "_chighrisk",
                    "red",
                    null
                );
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmResidualRiskScore > 4 && allHazardsData[i].cdmResidualRiskScore < 10 && allHazardsData[i].cdmSite.Title == ts) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    6,
                    "Medium (residual) risk hazards",
                    dd + "_cmediumrisk",
                    "amber",
                    null
                );
                cdmdata.createDashboardBoxes(
                    (() => {
                        filteredDataset = [];
                        for (var i = 0; i < allHazardsData.length; i++) {
                            if (allHazardsData[i].cdmCurrentStatus == cst && allHazardsData[i].cdmResidualRiskScore < 5 && allHazardsData[i].cdmSite.Title == ts) {
                                filteredDataset.push(allHazardsData[i]);
                            }
                        }
                        return filteredDataset
                    })(),
                    "cdmHazards",
                    7,
                    "Low (residual) risk hazards",
                    dd + "_clowrisk",
                    "green",
                    null
                );
            }

        }

        // if(tjs=='Designer'||tjs=='Construction Engineer'){
        //     cst='Under peer review';
        //     if(a=='mdh'){
        //         q=' and cdmHazardOwner/Title eq \''+c+'\' and cdmCurrentStatus eq \''+cst+'\' and cdmRAMS eq null';
        //     }
        //     if(a=='mrh'){
        //         q=' and cdmHazardOwner/Title eq \''+c+'\' and cdmCurrentStatus eq \''+cst+'\' and cdmRAMS ne null';
        //     }

        // }
        // if(tjs=='Design Manager'){
        //     cst='Under design manager review';
        //     q=' and cdmHazardOwner/Title eq \''+c+'\' and cdmCurrentStatus eq \''+cst+'\'';
        // }
        // if(tjs=='Construction Manager'){
        //     cst='Under pre-construction review';
        //     q=' and cdmSite/Title eq \''+ts+'\' and cdmCurrentStatus eq \''+cst+'\'';
        //     cst1='Under Construction Manager review';
        //     q1=' and cdmSite/Title eq \''+ts+'\' and cdmCurrentStatus eq \''+cst1+'\'';
        //     utbl1='<div class="row">'+ts+' hazards - '+cst1+'</div><div><table class="tpos-tbl"><tr><td id="'+dd+'_ahighrisk"></td><td id="'+dd+'_amediumrisk"></td><td id="'+dd+'_alowrisk"></td></tr></table></div>';
        // }

        // cdmdata.getQuickCount('cdmHazards',8,'cdmResidualRiskScore gt \'9\' and cdmHazardOwner/Title eq \''+c+'\' and cdmCurrentStatus eq \'Assessment in progress\'','High (residual) risk hazards',dd+'_ahighrisk','red',null);
        // cdmdata.getQuickCount('cdmHazards',9,'cdmResidualRiskScore gt \'4\' and cdmResidualRiskScore lt \'10\' and cdmHazardOwner/Title eq \''+c+'\' and cdmCurrentStatus eq \'Assessment in progress\'','Medium (residual) risk hazards',dd+'_amediumrisk','amber',null);
        // cdmdata.getQuickCount('cdmHazards',10,'cdmResidualRiskScore lt \'5\' and cdmHazardOwner/Title eq \''+c+'\' and cdmCurrentStatus eq \'Assessment in progress\'','Low (residual) risk hazards',dd+'_alowrisk','green',null);


    });

}

function getsearchresults(v) {

    var vn = parseInt(v, 10);
    // console.log(vn);
    // console.log(v);
    var vs = v.toString();
    var vcnt = vs.replace(/ /g, '').length;
    for (var cc = 0; cc < 5 - vcnt; cc++) {
        vs = '0' + vs;
    }
    console.log(vs);
    // if(vcnt===1){
    //     vs='0000'+vs;
    // }
    // if(vcnt===2){
    //     vs='000'+vs;
    // }
    // if(vcnt=)
    // console.log(vs);
    $('#tpos-main').html('');
    // $('.dataset').removeClass('active');
    $('#stats').remove();
    $('#systemstats').remove();
    $('#userstats').remove();
    // var newmain='<div class="tpos-main" id="tpos-main"></div>';
    // $('.tpos-body').prepend(newmain);

    $('#tpos-main').html('<div class="tpos-area-title">Search results for query: ' + v + '</div><div id="searchresults" class="tpos-area-content"></div>');
    // var utbl='<div class="row">Results</div><div><table class="tpos-tbl"><tr><td id="idmatch"></td><td id="legacymatch"></td><td id="swidmatch"></td><td id="parentmatch"></td><td id="siblingmatch"></td><td id="twmatch"></td><td id="ramsmatch"></td></tr></table></div>';
    var utbl = '<div id="legacymatch"></div><div id="idmatch"></div><div id="twmatch"></div><div id="ramsmatch"></div>';
    $('#searchresults').append(utbl);

    // cdmdata.getQuickCount('cdmHazards',20,'ID eq '+vn,'Exact ID Match','idmatch','blue',null);
    // cdmdata.getQuickCount('cdmHazards',21,'startswith(cdmLegacyId,'+v+')','Starts with','swidmatch','blue',null);
    // cdmdata.getQuickCount('cdmHazards',22,'cdmLegacyId eq \''+vs+'\'','Legacy ID Match','legacymatch','blue',null);
    // cdmdata.getQuickCount('cdmHazards',23,'cdmTW eq \''+v+'\'','Temporary Work Hazards','twmatch','blue',null);
    // cdmdata.getQuickCount('cdmHazards',24,'cdmParent eq \''+vn+'\'','RAMS Hazards associated with this ID','ramsmatch','blue',null);

    cdmdata.get(
        "cdmHazards",
        'ID eq ' + vn,
        "Modified desc",
        "hazards-search",
        "idmatch",
        'ID Match'
    );
    cdmdata.get(
        "cdmHazards",
        'cdmLegacyId eq \'' + vs + '\'',
        "Modified desc",
        "hazards-search",
        "legacymatch",
        'Legacy ID Match'
    );
    cdmdata.get(
        "cdmHazards",
        'cdmTW eq \'' + v + '\'',
        "Modified desc",
        "hazards-search",
        "twmatch",
        'Temporary Works Design Hazard Matches'
    );
    cdmdata.get(
        "cdmHazards",
        'cdmParent eq \'' + vn + '\'',
        "Modified desc",
        "hazards-table-rams",
        "ramsmatch"
    );

    // cdmdata.getQuickCount('cdmHazards',20,'LegacyId eq '+vn,'Exact ID Match','idmatch','blue',null);

}


function setupnewhazard() {
    $('#tpos-main').html('');
    // $('.dataset').removeClass('active');
    $('#tpos-main').html('<div class="tpos-area-title">Identify new hazard(s)</div><div id="newhazardform" class="tpos-area-content"></div>');
    $('#newhazardform').load('../3.0/html/new.hazard.form.html', function() {
        $('.selectnext').hide();
        tposdata.get('cdmSites', '', '', 'sel_sites');

    });
}