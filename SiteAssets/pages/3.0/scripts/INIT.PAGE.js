$(document).ready(function() {
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', init);
    toastr.success('<br/>Safetibase has been upgraded to improve functionality. Loading should be smoother, new features have been added and the interface can be easily configured to meet project needs. For a complete list of the upgrades please see the release note <a href="https://safetibase.org/release-notes" target="_blank"><u>here</u></a>.', "Safetibase Upgrade", { timeOut: 0, extendedTimeOut: 0, closeButton: true, positionClass: "toast-top-center", opacity: 1});
});

function init(refresh) {
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
    const versionDiv = '<div class="version-number">V1.5.2</div>';
    const informationLink = '<a class="information-link" target="_blank" href="https://sway.office.com/PLDHKwL45Db1Z4Wx?ref=Link"><div class="information-icon">&#9432;</div></a>';
    if (idParam && refresh === undefined) {
        pageTitle = `<div class="block-container"><div>SafetIbase - Hazard ${idParam}</div><div class="title-container">${versionDiv}</div><div class="title-container">${informationLink}</div></div>`;
    } else if (urlParams.get("newHazard") && refresh === undefined) {
        pageTitle = `<div class="block-container"><div>SafetIbase - New Hazard</div><div class="title-container">${versionDiv}</div><div class="title-container">${informationLink}</div></div>`;
    } else {
        const titleDiv = '<div>SafetIbase</div>';
        const searchDiv = '<div id="cdmsearch" class="cdmsearch" title="Input numbers only - hazards ids, including legacy system hazard ids or temporary work designs numbers"  onSubmit="false"><input type="text" placeholder="Search here" id="cdmsearchbox" onSubmit="false"></div>';
        pageTitle = `<div class="block-container">${titleDiv}<div class="title-container">${versionDiv}</div></div>${searchDiv}`;
    }
    $('#pageTitle').html(pageTitle);

    $('#DeltaSiteLogo').html('<img src="data:image/png;base64,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">');   
    // $('#DeltaTopNavigation').replaceWith($('#tpos-global-nav').html());
    // global_nav();
    // load the layout for the page
    $('#tpos-page').load('../3.0/html/layout.html', function() {

        // set up the home screen nav
        setUpHomeNav()
        // get the user and their roles and display navigation
        setupleftnav();
        if (disableNavigationLinks) {
            $("#user_roles").hide();
        }

        setupmainareastats(idParam);

        if (urlParams.get("newHazard") === "true" && refresh === undefined) {
            setupnewhazard();
        }

        // activate_global_nav();
    })

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

function setUpHomeNav() {
    $('#tpos-home-nav').html('<div class = "tpos-buttons"> <div class="tpos-home-div" id="home-button"> </div> <div id="guidance-buttons"></div></div>');
    //call setup guidance and introduction nav
    setUpGuidanceNav();
}

//write function setup guidance nav
function setUpGuidanceNav(){
    $('#guidance-buttons').html(`<a class = "home-button" href="https://sway.office.com/Zgj5qE5ghmM6lGcJ?ref=Link" target="_blank" >Guidance</a>
    <a class = "home-button" href="https://sway.office.com/PLDHKwL45Db1Z4Wx?ref=Link" target="_blank" >Introduction</a>`);
}

function setupleftnav() {
    $('#tpos-nav').html('<div class="tpos-area-title-user">' + unm() + '</div><div id="user_roles" class="tpos-area-content"></div>');
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
                formatdatato.createTable(cdmSites, allHazardsData, "cdmHazards", "statstbl", {}, true)
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
        var utbl1 = '<div class="row">Hazards last modified by you</div><table class="tpos-tbl-user-dashboard"><tr><td id="userhighrisk"></td><td id="usernotassigned"></td></tr></table>';
        var utbl4 = '<div class="row">Hazards identified and/or last modified by you (regardless of company)</div><div><table class="tpos-tbl-user-dashboard"><tr><td id="aa"></td><td id="ea"></td></tr></table></div>';
        var utbl2 = '<div class="row">' + c + ' hazards by residual risk' + '</div><div><table class="tpos-tbl-user-dashboard"><tr><td id="chighrisk"></td><td id="cmediumrisk"></td><td id="clowrisk"></td></tr></table></div>';
        var utbl3 = '<div class="row">' + c + ' hazards by status' + '</div><div><table class="tpos-tbl-user-dashboard"><tr><td id="caa"></td><td id="casses"></td><td id="cpeer"></td><td id="cdhm"></td><td id="cprecon"></td><td id="cld"></td><td id="csm"></td><td id="cacc"></td></tr></table></div>';
        var utbl5 = '<div class="row">Accepted and rejected hazards</div><div><table class="tpos-tbl-user-dashboard"><tr><td id="stats-accepted"></td><td id="stats-rejected"></td></tr></table></div>';


        // cdmdata.getQuickCount('cdmHazards', 1, 'Author/ID eq ' + uid() + ' and cdmHazardOwner/Title eq \'' + c + '\'', 'Identified by you for ' + c, 'a', 'blue', null);
        // cdmdata.getQuickCount('cdmHazards', 2, 'Editor/ID eq ' + uid() + ' and cdmHazardOwner/Title eq \'' + c + '\'', 'Last modified by you for ' + c, 'e', 'blue', null);
        // cdmdata.getQuickCount('cdmHazards', 16, 'Author/ID eq ' + uid(), 'Identified by you', 'aa', 'blue', null);
        // cdmdata.getQuickCount('cdmHazards', 17, 'Editor/ID eq ' + uid(), 'Last modified by you', 'ea', 'blue', null);

        // Initially work out whether to simplify the general stats and then simplify on a role by role basis
        const simplifiedDashboard = 
            (r == 'Designer' && configData['Simplified designer dashboard']) ||
            (r == 'Design Manager' && configData['Simplified design manager dashboard']) ||
            (r == 'Construction Engineer' && configData['Simplified construction engineer dashboard']) ||
            (r == 'Construction Manager' && configData['Simplified construction manager dashboard']) ||
            (r == 'Principal Designer' && configData['Simplified principal designer dashboard']) ||
            (r == 'System admin' && configData['Simplified system admin dashboard'])
        if (simplifiedDashboard) {
            $('#stats').html('<table class="tpos-tbl-user-dashboard" id="statstbl"><tr><td id="a"></td><td id="e"></td><td id="b"></td><td id="c"></td><td id="d"></td></tr></table>' + utbl4 + utbl2 + utbl5);
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
                "aa",
                "blue",
                null
            );

        } else {
            $('#stats').html('<table class="tpos-tbl-user-dashboard" id="statstbl"><tr><td id="a"></td><td id="e"></td><td id="b"></td><td id="c"></td><td id="d"></td></tr></table>' + utbl4 + utbl2 + utbl3 + utbl5);
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
        }

        if (r == 'Designer' || r == 'Construction Engineer') {
            // cdmdata.getQuickCount('cdmHazards', 3, 'Editor/ID ne ' + uid() + ' and cdmCurrentStatus eq \'Under peer review\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Hazards you could peer review', 'c', 'blue', null);
            // cdmdata.getQuickCount('cdmHazards', 4, 'Editor/ID eq ' + uid() + ' and cdmCurrentStatus eq \'Under peer review\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Peer reviews requested by you', 'd', 'blue', null);
            
            if ((r == 'Designer' && configData['Simplified designer dashboard']) || (r == 'Construction Engineer' && configData['Simplified construction engineer dashboard'])) {
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
                    "a",
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
                    "e",
                    "blue",
                    null
                );
            } else {
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
        }
        if (r == 'Design Manager') {
            // cdmdata.getQuickCount('cdmHazards', 3, 'cdmCurrentStatus eq \'Under design manager review\' and cdmHazardOwner/Title eq \'' + c + '\'', 'Hazards you could review', 'c', 'blue', null);
            if (r == 'Design Manager' && configData['Simplified design manager dashboard']) {
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
                    "a",
                    "blue",
                    null
                );
            } else {
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
            }
            // cdmdata.getQuickCount('cdmHazards',4,'Editor/ID eq '+uid()+' and cdmCurrentStatus eq \'Under peer review\' and cdmHazardOwner/Title eq \''+c+'\'','Peer reviews requested by you','d','blue',null);
        }
        if (r == 'Construction Manager') {
            if (configData['Simplified construction manager dashboard']) { // Some users have requested a simplified dashboard to help process hazards quicker
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
                    1,
                    "Hazards for pre-construction review",
                    "a",
                    "blue",
                    null
                );

            } else {
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
            }
            // cdmdata.getQuickCount('cdmHazards',4,'Editor/ID eq '+uid()+' and cdmCurrentStatus eq \'Under peer review\' and cdmHazardOwner/Title eq \''+c+'\'','Peer reviews requested by you','d','blue',null);
        }
        if (r == 'Principal Designer') {
            // cdmdata.getQuickCount('cdmHazards', 3, 'cdmCurrentStatus eq \'Under principal designer review\' and cdmSite/Title eq \'' + s + '\'', 'Hazards for principal designer review', 'c', 'blue', null);
            
            if ((r == 'Principal Designer' && configData['Simplified principal designer dashboard'])) {
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
                    "a",
                    "blue",
                    null
                );
            } else {
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
            }
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

        if (simplifiedDashboard) { // Some users have requested a simplified dashboard to help process hazards quicker
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
                        if (allHazardsData[i].cdmCurrentStatus == "Accepted" || allHazardsData[i].cdmCurrentStatus == `Accepted by ${configData['Client Name']}`) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                14,
                "Accepted",
                "stats-accepted",
                "green",
                null
            );

            cdmdata.createDashboardBoxes(
                (() => {
                    filteredDataset = [];
                    for (var i = 0; i < allHazardsData.length; i++) {
                        if (allHazardsData[i].cdmCurrentStatus == "Requires Mitigation" && allHazardsData[i].cdmReviews.includes('Rejected')) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                15,
                "Rejected",
                "stats-rejected",
                "red",
                null
            );

        } else {
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
                        if (allHazardsData[i].cdmCurrentStatus == "Accepted" || allHazardsData[i].cdmCurrentStatus == `Accepted by ${configData['Client Name']}`) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                14,
                "Accepted",
                "stats-accepted",
                "green",
                null
            );
            cdmdata.createDashboardBoxes(
                (() => {
                    filteredDataset = [];
                    for (var i = 0; i < allHazardsData.length; i++) {
                        if (allHazardsData[i].cdmCurrentStatus == "Requires Mitigation" && allHazardsData[i].cdmReviews.includes('Rejected')) {
                            filteredDataset.push(allHazardsData[i]);
                        }
                    }
                    return filteredDataset
                })(),
                "cdmHazards",
                15,
                "Rejected",
                "stats-rejected",
                "red",
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
        }
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