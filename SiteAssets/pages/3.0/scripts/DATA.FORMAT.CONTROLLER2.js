
formatdatato = {
    dropdown: function() {},
    tags: function() {},
    urbuttons: function(data, ftv, trg) {
        var tlist = data.d.results;
        var tcnt = tlist.length;
        var user = "";
        var role = [0, 0, 0, 0, 0],
            roles = [
                "Designer",
                "Design Manager",
                "Construction Manager",
                "Lead designer",
                "Construction Engineer"
            ]; // designer, design manager, Construction Manager, lead designer and Construction Engineer

        for (var cc = 0; cc < tcnt; cc++) {
            var u = tlist[cc];
            var ui = u.ID;
            cell = "";
            $.each(u, function(key, element) {
                if (
                    key != "__metadata" &&
                    element.Title != undefined &&
                    key != "Title"
                ) {
                    // ////console.log(element.Title);
                    cell += mkCell("cdmUser", ui, key, element);
                    for (var b = 0; b < role.length; b++) {
                        if (element.Title == roles[b]) {
                            role[b] = 1;
                        }
                    }
                }
            });

            user += '<div id="cdmUser_' + ui + '" class="dataset" tabindex="1" > ' + cell + "</div>";
        }
        $("#user_roles").html("");
        $("#user_roles").html(user);
        $(".celled").hide();
        $(".fld_cdmCompanyTitle").show();
        $(".fld_cdmUserRoleTitle").show();
        $(".fld_cdmSiteTitle").show();

        if (role[0] == 1 || role[1] == 1 || role[2] == 1 || role[3] == 1 || role[4] == 1) {
            var actions = mkBtn("add", "", "Add a hazard", "addHazard", "");
        } else {
            var actions = "<div><br><center>Read Only: No user role assigned</center></div>";
        }
        var reports = mkBtn("reports", "", "View / export reports", "navtoreports", "");
        $("#user_roles").append('<div class="tborder">' + actions + '</div>');
        // $('#user_roles').prepend('<div class="navwrapper" id="lastuserquery"></div>');

        if (role[0] == 1) {
            // designer
            var t = mkBtn(
                "edit",
                "design",
                "Edit/mitigate design hazards",
                "editHazard",
                "mdh"
            );
            t += mkBtn(
                "review",
                "design",
                "Peer review design hazards",
                "prHazard",
                "pdh"
            );
            $("#user_roles").append(t);
        }
        if (role[4] == 1) {
            // Construction Engineer
            var t = mkBtn(
                "edit",
                "rams",
                "Edit/mitigate RAMS hazards",
                "editHazard",
                "mrh"
            );
            t += mkBtn(
                "review",
                "rams",
                "Peer review RAMS hazards",
                "prHazard",
                "prh"
            );
            $("#user_roles").append(t);
        }
        if (role[1] == 1) {
            // Design Manager
            var t = mkBtn(
                "review",
                "design",
                "Undertake design manager reviews",
                "dmrHazard",
                "adh"
            );
            $("#user_roles").append(t);
        }
        if (role[2] == 1) {
            // Construction Manager
            var t = mkBtn(
                "review",
                "design",
                "Undertake pre-construction reviews",
                "pcrHazard",
                "pcdh"
            );
            t += mkBtn(
                "review",
                "rams",
                "Undertake RAMS hazard reviews",
                "smrHazard",
                "arh"
            );
            $("#user_roles").append(t);
        }
        if (role[3] == 1) {
            // lead designer
            var t = mkBtn(
                "review",
                "design",
                "Undertake lead design reviews",
                "ldrHazard",
                "lddh"
            );
            $("#user_roles").append(t);
        }
        // $("#user_roles").append(reports);

        mkLinkButtons();


    },
    xtrabuttons: function(data) {
        var tlist = data.d.results;
        var tcnt = tlist.length;
        var mbtns = '';
        for (var cc = 0; cc < tcnt; cc++) {
            var b = tlist[cc];
            // var ui = u.ID;
            var bt = b.Title;
            var bl = b.URL;

            mbtns += mkBtn("xtrabtn", "", bt, bl);
        }

        $("#user_roles").append('<div class="tborder" >' + mbtns + '</div>');
    },
    list: function() {},
    statstablerows: function(sublot_data, ftv, trg, flst ) {
        //console.log("statstablerows",flst);
        $(".refresh-hazards-btn").remove()
        var loading_text = `<div class="loading-text"><center><h2>Searching for new hazards. This may take a minute...</h2></center></div>`;
       if(flst !== undefined){
        $('#statstbl').html('');
       }
        $("#stats.tpos-area-content").prepend(loading_text)
        // Extract all data from cdmHazards

        var fa = [];
        var ft = [];
        var ftv = [];
        var select = "";
        var expand = "";
        var lst = "cdmHazards";

        getListFields(lst,flst  )
            .done(function(data) {
                var f = data.d.results;
                for (var cc = 0; cc < f.length; cc++) {
                    var fld = f[cc];
                    var fldTitle = fld.Title;
                    var fldType = fld.FieldTypeKind;
                    if (fldTitle != "Content Type" && fldTitle != "Attachments") {
                        fa.push(fldTitle);
                        ft.push(fldType);
                    }
                }
                fa.push("Author");
                ft.push(20);
                fa.push("Created");
                ft.push(4);
                fa.push("Editor");
                ft.push(20);
                fa.push("Modified");
                ft.push(4);

                fa.push("ID");
                ft.push(1);
            })
            .done(function() {
                var od = "OData_";
                for (var i = 0; i < fa.length; i++) {
                    var ti = fa[i];
                    if (ti.substring(0, 1) == "_") {
                        ti = od + ti;
                    }
                    if (ft[i] != 20 && ft[i] != 7) {
                        if (fa[i] != "ID") {
                            select += ti + ",";
                        } else {
                            select += ti;
                        }
                        ftv.push(fa[i]);
                    }
                    
                    if (ft[i] == 7 || ft[i] == 20) {
                        select += ti + "/Title," + ti + "/ID,";
                        expand += ti + "/Title," + ti + "/ID,";
                        ftv.push(ti + ".Title");
                        ftv.push(ti + ".ID");
                    }
                }
                expand = expand.substring(0, expand.length - 1);
                if(lst=="cdmHazards"){
                    expand = expand + ",cdmPWStructure/UAID";
                    select = select + ",cdmPWStructure/UAID";
                    ////console.log('expand',expand);
                }
            })
            .done(function() {
                var order = "ID desc";
                getListItemsByListName({
                    listName: lst,
                    select: select,
                    expansion: expand,
                    order: order, // 'ID asc'
                    filter: null // 'OData__user/Id eq \'' + i + '\''
                }).done(function(data) {
                    var appurl = _spPageContextInfo.webAbsoluteUrl;
                    if (select) {
                        select = '?$select=' + select;
                    } else select = '?$select=*';
                    if (expand) {
                        expand = '&$expand=' + expand;
                    } else expand = '';
                    if (order) {
                        order = '&$orderby=' + order;
                    } else order = '';

                    var initial_url = appurl + "/_api/web/lists/getByTitle(%27" + lst + "%27)/items" + select + expand + order + '&$top=5000'
                    full_dataset = []
                    async function GetListItems(url) {
                        $.ajax({
                            url: url,
                            method: "GET",
                            headers: {
                                "Accept": "application/json; odata=verbose"
                            },
                            success: function(data) {
                                var response = data.d.results;
                                if (data.d.__next) {
                                    full_dataset = [...full_dataset, ...response];
                                    GetListItems(data.d.__next)
                                } else {
                                    full_dataset = [...full_dataset, ...response];
                                    //console.log("fairinput",flst);
                                    formatdatato.createTable(sublot_data, full_dataset, lst, trg ,flst)
                                    $(".loading-text").remove()
                                    // Allows for you to access the dashboard specific to your user roles. 
                                    activateDatasets(sublot_data, full_dataset);
                                    global_nav(sublot_data, full_dataset);
                                }
                            },
                            error: function(error) {
                                ////console.log(error);
                            }
                        });
                    }
                    GetListItems(initial_url);
            });
        });
    },
    filterrowsdata: function(sublot_data, ftv, trg, flst ) {

         $(".refresh-hazards-btn").remove()
    //     var loading_text = `<div class="loading-text"><center><h2>Searching for new hazards. This may take a minute...</h2></center></div>`;
    //    if(flst !== undefined){
    //     $('#statstbl').html('');
    //    }
    //     $("#stats.tpos-area-content").prepend(loading_text)
    //     // Extract all data from cdmHazards

        var fa = [];
        var ft = [];
        var ftv = [];
        var select = "";
        var expand = "";
        var lst = "cdmHazards";

        getListFields(lst,flst  )
            .done(function(data) {
                var f = data.d.results;
                for (var cc = 0; cc < f.length; cc++) {
                    var fld = f[cc];
                    var fldTitle = fld.Title;
                    var fldType = fld.FieldTypeKind;
                    if (fldTitle != "Content Type" && fldTitle != "Attachments") {
                        fa.push(fldTitle);
                        ft.push(fldType);
                    }
                }
                fa.push("Author");
                ft.push(20);
                fa.push("Created");
                ft.push(4);
                fa.push("Editor");
                ft.push(20);
                fa.push("Modified");
                ft.push(4);

                fa.push("ID");
                ft.push(1);
            })
            .done(function() {
                var od = "OData_";
                for (var i = 0; i < fa.length; i++) {
                    var ti = fa[i];
                    if (ti.substring(0, 1) == "_") {
                        ti = od + ti;
                    }
                    if (ft[i] != 20 && ft[i] != 7) {
                        if (fa[i] != "ID") {
                            select += ti + ",";
                        } else {
                            select += ti;
                        }
                        ftv.push(fa[i]);
                    }
                    
                    if (ft[i] == 7 || ft[i] == 20) {
                        select += ti + "/Title," + ti + "/ID,";
                        expand += ti + "/Title," + ti + "/ID,";
                        ftv.push(ti + ".Title");
                        ftv.push(ti + ".ID");
                    }
                }
                expand = expand.substring(0, expand.length - 1);
                if(lst=="cdmHazards"){
                    expand = expand + ",cdmPWStructure/UAID";
                    select = select + ",cdmPWStructure/UAID";
                    ////console.log('expand',expand);
                }
            })
            .done(function() {
                var order = "ID desc";
                getListItemsByListName({
                    listName: lst,
                    select: select,
                    expansion: expand,
                    order: order, // 'ID asc'
                    filter: null // 'OData__user/Id eq \'' + i + '\''
                }).done(function(data) {
                    var appurl = _spPageContextInfo.webAbsoluteUrl;
                    if (select) {
                        select = '?$select=' + select;
                    } else select = '?$select=*';
                    if (expand) {
                        expand = '&$expand=' + expand;
                    } else expand = '';
                    if (order) {
                        order = '&$orderby=' + order;
                    } else order = '';

                    var initial_url = appurl + "/_api/web/lists/getByTitle(%27" + lst + "%27)/items" + select + expand + order + '&$top=5000'
                    full_dataset = []
                    async function GetListItems(url) {
                        $.ajax({
                            url: url,
                            method: "GET",
                            headers: {
                                "Accept": "application/json; odata=verbose"
                            },
                            success: function(data) {
                                var response = data.d.results;
                                if (data.d.__next) {
                                    full_dataset = [...full_dataset, ...response];
                                    GetListItems(data.d.__next)
                                } else {
                                    full_dataset = [...full_dataset, ...response];
                                    //console.log("fairinput",flst);
                                    formatdatato.createTable(sublot_data, full_dataset, lst, trg ,flst)
                                    $(".loading-text").remove()
                                    // Allows for you to access the dashboard specific to your user roles. 
                                    // activateDatasets(sublot_data, full_dataset);
                                    // global_nav(sublot_data, full_dataset);
                                    tposcustomfilters(full_dataset);
                                }
                            },
                            error: function(error) {
                                ////console.log(error);
                            }
                        });
                    }
                    GetListItems(initial_url);
            });
        });
    },

    
    createTable: function(data, allHazardsMain, lst, trg , lstfilter) {
        var allHazards = allHazardsMain;
        //console.log("UAID",lstfilter);
        if(lstfilter == undefined){
            lstfilter =[];
        }
        else
        {
            //console.log("UAID2",lstfilter["cdmUAID"]);
            if (lstfilter["cdmStageHS2"].length != 0){
                ////console.log("lstfilter['cdmStageHS2']",lstfilter["cdmStageHS2"])
            allHazards = customfilters(allHazardsMain,lstfilter["cdmStageHS2"]);
          }
          if (lstfilter["cdmPWStructure"].length != 0){
            ////console.log("lstfilter['cdmPWStructure']",lstfilter["cdmPWStructure"])
        allHazards = customfilters(allHazards,lstfilter["cdmPWStructure"]);
      }
      if (lstfilter["cdmCurrentStatus"].length != 0){
        ////console.log("lstfilter",lstfilter)
    allHazards = customfilters(allHazards,lstfilter["cdmCurrentStatus"]);
  } 
  if (lstfilter["cdmResidualRiskOwner"].length != 0){
    ////console.log("lstfilter",lstfilter)
allHazards = customfilters(allHazards,lstfilter["cdmResidualRiskOwner"]);
}  

    if (lstfilter["cdmUAID"].length != 0){
         ////console.log("lstfilter",lstfilter)
        allHazards = customfilters(allHazards,lstfilter["cdmUAID"]);
        } 
        };
       
            var tlist = data.d.results;
            var tcnt = tlist.length;
            //console.log("createTable",allHazards);
            var row = "";

            var sa = [];
            var stit = [];
            var cnt = 0;
            for (var cc = 0; cc < tcnt; cc++) {
                var s = tlist[cc];
                var st = s.Title;
                var si = s.ID;
                
                row +=
                    '<tr><td id="s_' +
                    si +
                    '" style="vertical-align:middle;">' +
                    st +
                    "</td>" +
                    '<td id="s_pw_' +
                    si +
                    '" ><i class="fa fa-spinner fa-spin"></i></td>' +
                    '<td id="s_tw_' +
                    si +
                    '" ><i class="fa fa-spinner fa-spin"></i></td>' +
                    '<td id="s_ra_' +
                    si +
                    '" ><i class="fa fa-spinner fa-spin"></i></td>' +
                    '<td id="s_hr_' +
                    si +
                    '" ><i class="fa fa-spinner fa-spin"></i></td>' +
                    '<td id="s_ua_' +
                    si +
                    '" ><i class="fa fa-spinner fa-spin"></i></td>' +
                    '<td id="s_ne_' +
                    si +
                    '" ><i class="fa fa-spinner fa-spin"></i></td>' +
                    '<td id="s_ur_' +
                    si +
                    '" ><i class="fa fa-spinner fa-spin"></i></td>' +
                    "</tr>";
                sa.push(si);
                stit.push(st);
            }
            $("#" + trg).html(row);
            var fa = [
                
                "cdmPWStructure/ID ne null",
                "cdmTW ne null",
                "cdmRAMS ne null",
                "cdmResidualRiskScore gt 9",
                "cdmHazardOwner/ID eq null",
                "cdmPWStructure/ID ne null and cdmPWElement/ID eq null",
                "startswith(cdmCurrentStatus,'Under')"
            ];
            var ft = [
                "Permanent works design hazards",
                "Temporary works design hazards",
                "RAMS hazards",
                "High (residual) risk hazards",
                "Unassigned hazards",
                "Permanent works hazards without element",
                "Under review"
            ];
            var ftrg = ["s_pw_", "s_tw_", "s_ra_", "s_hr_", "s_ua_", "s_ne_", "s_ur_"];
            var fclr = ["pwd", "twd", "ra", "red", "red", "red", "blue"];
            for (var dd = 0; dd < sa.length; dd++) {
                for (var ee = 0; ee < fa.length; ee++) {
                    var filtered_data = filterFullDataset(allHazards, sa[dd], ee);
                    cdmdata.createDashboardBoxes(
                        filtered_data,
                        lst,
                        cnt,
                        stit[dd] + " - " + ft[ee],
                        ftrg[ee] + sa[dd],
                        fclr[ee],
                        1
                    );
                    cnt = cnt + 1;
                }
            }

        var refresh_hazards = '<div><center><input class="refresh-hazards-btn" type="button" value="Refresh Hazards"/></center><br><br></div>';
        $("#stats.tpos-area-content").prepend(refresh_hazards)
        $('.refresh-hazards-btn').click(function() {init()});

        function customfilters ( allHazards, filterlst){
            //console.log("enterf",filterlst);
            var fdata = [];
            if(filterlst ==[]){
                fdata = allHazards;
            }
            
            else{
            for (i=0 ; i< allHazards.length ; i++){
                ////console.log(allHazards[i].cdmStageHS2.Title);
            if(  filterlst.includes(allHazards[i].cdmStageHS2.Title))
            {
                fdata.push(allHazards[i]);
            }
            if(  filterlst.includes(allHazards[i].cdmPWStructure.Title))
            {
                fdata.push(allHazards[i]);
            }
            if(  filterlst.includes(allHazards[i].cdmCurrentStatus))
            {
                fdata.push(allHazards[i]);
            }
            if(  filterlst.includes(allHazards[i].cdmhs2residualriskowner))
            {
                fdata.push(allHazards[i]);
            }
            if(  filterlst.includes(allHazards[i].cdmPWStructure.UAID))
            {
                fdata.push(allHazards[i]);
            }
        
        }
    }
            
            ////console.log("fdata",fdata);
    return fdata;
        }
        function filterFullDataset(full_dataset, sublot_id, filter_id) {
            var filteredDataset = [];
            switch(filter_id) {
                case 0:
                    for (var i = 0; i < full_dataset.length; i++) {
                        if (full_dataset[i].cdmSite.ID == sublot_id && full_dataset[i].cdmPWStructure.ID != null) {
                            filteredDataset.push(full_dataset[i]);
                        }
                    }
                    break;
                case 1:
                    for (var i = 0; i < full_dataset.length; i++) {
                        if (full_dataset[i].cdmSite.ID == sublot_id && full_dataset[i].cdmTW != null) {
                            filteredDataset.push(full_dataset[i]);
                        }
                    }
                    break;
                case 2:
                    for (var i = 0; i < full_dataset.length; i++) {
                        if (full_dataset[i].cdmSite.ID == sublot_id && full_dataset[i].cdmRAMS != null) {
                            filteredDataset.push(full_dataset[i]);
                        }
                    }
                    break;
                case 3:
                    for (var i = 0; i < full_dataset.length; i++) {
                        if (full_dataset[i].cdmSite.ID == sublot_id && full_dataset[i].cdmResidualRiskScore > 9) {
                            filteredDataset.push(full_dataset[i]);
                        }
                    }
                    break;
                case 4:
                    for (var i = 0; i < full_dataset.length; i++) {
                        if (full_dataset[i].cdmSite.ID == sublot_id && full_dataset[i].cdmHazardOwner.ID == null) {
                            filteredDataset.push(full_dataset[i]);
                        }
                    }
                    break;
                case 5:
                    for (var i = 0; i < full_dataset.length; i++) {
                        if (full_dataset[i].cdmSite.ID == sublot_id && full_dataset[i].cdmPWStructure.ID != null && full_dataset[i].cdmPWElement.ID == null) {
                            filteredDataset.push(full_dataset[i]);
                        }
                    }
                    break;
                case 6:
                    for (var i = 0; i < full_dataset.length; i++) {
                        if (full_dataset[i].cdmSite.ID == sublot_id && full_dataset[i].cdmCurrentStatus.startsWith("Under")) {
                            filteredDataset.push(full_dataset[i]);
                        }
                    }
                    break;
            }
            return filteredDataset;
        }
    },
    historyrows: function(data, ftv, trg) {
        var tlist = data.d.results;
        var tcnt = tlist.length;
        var rows = "";
        for (var cc = 0; cc < tcnt; cc++) {
            var ht = tlist[cc];
            var user = ht.Editor.Title;
            var date = ukdate(ht.Modified);
            var action = ht.cdmAction;
            rows +=
                "<tr><td>" +
                date +
                "</td><td>" +
                user +
                " " +
                ht.Title +
                "</td><td>" +
                action +
                "</td></tr>";
        }
        var t = '<table class="tpos-tbl">' + rows + "</table>";
        $("#" + trg).html(t);
    },
    hazardtablerowitems: function(data, ftv, trg, wpt) {
        var tlist = data.d.results;
        var tcnt = tlist.length;
        var row = "";
        wpt = '<h1>' + wpt + '</h1>';
        if (tcnt === 0) {
            wpt = '';
        }
        $("#" + trg).html(wpt);

        for (var cc = 0; cc < tcnt; cc++) {
            // build rows
            var h = tlist[cc];
            
            // var hitem=buildHazardListItem(h);
            var hitem = printHazardRow(h);
            
            $("#" + trg).append(hitem);
            //alert(1);
            
            // $('.ramsonly').hide();
            if (h.cdmRAMS) {
                $("#h_" + h.ID + " .ramshide").hide();
                $("#h_" + h.ID + " .ramsonly").show();
            }
            // if (h.cdmHazardType.Title == "Safety") {
            //     $("#h_" + h.ID + " .safetyhide").hide();
            // }
            if (
                h.cdmStageHS2.Title.includes("Construction") ||
                h.cdmStageHS2.Title == "Commission"
            ) {
                // $("#h_" + h.ID + " .stagehide").hide();
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


    cachedhazardtablerows: function(filtered_hazards, prev_number_loaded) {
        // var tlist = data.d.results;
        // ////console.log(tlist);
        var tcnt = filtered_hazards.length;
        var batch_size = 100;
        var index_to_load_to = 0
        if (batch_size + prev_number_loaded < tcnt) {
            index_to_load_to = batch_size + prev_number_loaded
        } else {
            index_to_load_to = tcnt
        }
        var row = "";
        // if(tcnt>100){
        //   xtrafilter('cdmStagesHS2',filter+' and cdmStageHS2 eq ',' Hazards');
        // }
        for (var cc = prev_number_loaded; cc < index_to_load_to; cc++) {
            // build rows
            var h = filtered_hazards[cc];

            // var hitem=buildHazardListItem(h);

            var hitem = printHazardRow(h);
            $("#hazardstable").append(hitem);
            //alert(4);
           
            // $('.ramsonly').hide();
            if (h.cdmRAMS) {
                $("#h_" + h.ID + " .ramshide").hide();
                $("#h_" + h.ID + " .ramsonly").show();
            }
            // if (h.cdmHazardType.Title == "Safety") {
            //     $("#h_" + h.ID + " .safetyhide").hide();
            // }
            if (
                h.cdmStageHS2.Title.includes("Construction") ||
                h.cdmStageHS2.Title == "Commission"
            ) {
                // $("#h_" + h.ID + " .stagehide").hide();
            }
        }

        function loadMore(startingIndex) {
            formatdatato.cachedhazardtablerows(filtered_hazards, startingIndex);
        }

        var num_loaded_text;
        $(".tpos-next").remove();
        if (index_to_load_to < tcnt) {
            var tpos_next = '<div><input class="tpos-next" type="button" value="Load Additional 100 Hazards"/></div>';
            // var tpos_next = $('<input/>').attr({type: "button", name: "btn1", id: "tpos_next", value="Next Page", onclick: "GetListItems(url)"})
            $("#hazardstable").prepend(tpos_next);
            $("#hazardstable").append(tpos_next);
            $('.tpos-next').click(function() {loadMore(index_to_load_to)});
            num_loaded_text = `<div class="num-loaded-text"><p>${index_to_load_to} hazards loaded</p></div>`;
        } else {
            num_loaded_text = `<div class="num-loaded-text"><p>All ${index_to_load_to} hazards loaded</p></div>`;
        }
        $(".num-loaded-text").remove();
        $("#hazardstable").prepend(num_loaded_text);
        $("#hazardstable").append(num_loaded_text);



        var tpos_search =
            '<div class="filter-row"><input id="tpos_search" placeholder="Search loaded hazards" /></div>';
        $("#tpos_search").remove();
        $("#hazardstable").prepend(tpos_search);
        $("#tpos_search").keyup(function() {
            var q = $("#tpos_search").val();
            if (q != "" && q != " ") {
                var f = $("div.row-hazard:Contains('" + q + "')");

                $("div.row-hazard")
                    .css("display", "none")
                    .filter(f)
                    .css("display", "block");
            } else {
                $("div.row-hazard").css("display", "block");
            }
        });



        hazardreviewbuttonaction();
        toggleCollapse();
        toggleInfoPanel();
        activateHazardEdits();
        // activateRAMSActions();
        activateRAMSBtn();
        // rows to target
    },

    hazardtablerows: function(response, next_url, prev_number_loaded) {
        // var tlist = data.d.results;
        // ////console.log(tlist);
        var tlist = response;
        ////console.log(tlist);
        var tcnt = tlist.length;
        number_loaded = tlist.length + prev_number_loaded;
        var row = "";
        // if(tcnt>100){
        //   xtrafilter('cdmStagesHS2',filter+' and cdmStageHS2 eq ',' Hazards');
        // }
        for (var cc = 0; cc < tcnt; cc++) {
            // build rows
            var h = tlist[cc];

            // var hitem=buildHazardListItem(h);

            var hitem = printHazardRow(h);
            $("#hazardstable").append(hitem);
            //alert(2);
            // $('.ramsonly').hide();
            if (h.cdmRAMS) {
                $("#h_" + h.ID + " .ramshide").hide();
                $("#h_" + h.ID + " .ramsonly").show();
            }
            // if (h.cdmHazardType.Title == "Safety") {
            //     $("#h_" + h.ID + " .safetyhide").hide();
            // }
            if (
                h.cdmStageHS2.Title.includes("Construction") ||
                h.cdmStageHS2.Title == "Commission"
            ) {
                // $("#h_" + h.ID + " .stagehide").hide();
            }
        }


        async function GetListItems(url) {
            $.ajax({
                url: url,
                method: "GET",
                headers: {
                    "Accept": "application/json; odata=verbose"
                },
                success: function(data) {
                    var next_url = null;
                    var response = data.d.results;
                    if (data.d.__next) {
                        next_url = data.d.__next;
                    } 
                    formatdatato.hazardtablerows(response, next_url, number_loaded)
                },
                error: function(error) {
                    ////console.log(error);
                }
            });
        }

        var num_loaded_text;
        $(".tpos-next").remove();
        if (next_url) {
            var tpos_next = '<div><input class="tpos-next" type="button" value="Load Additional 100 Hazards"/></div>';
            // var tpos_next = $('<input/>').attr({type: "button", name: "btn1", id: "tpos_next", value="Next Page", onclick: "GetListItems(url)"})
            $("#hazardstable").prepend(tpos_next);
            $("#hazardstable").append(tpos_next);
            $('.tpos-next').click(function() {GetListItems(next_url)});
            num_loaded_text = `<div class="num-loaded-text"><p>${number_loaded} hazards loaded</p></div>`;
        } else {
            num_loaded_text = `<div class="num-loaded-text"><p>All ${number_loaded} hazards loaded</p></div>`;
        }
        $(".num-loaded-text").remove();
        $("#hazardstable").prepend(num_loaded_text);
        $("#hazardstable").append(num_loaded_text);



        var tpos_search =
            '<div class="filter-row"><input id="tpos_search" placeholder="Search loaded hazards" /></div>';
        $("#tpos_search").remove();
        $("#hazardstable").prepend(tpos_search);
        $("#tpos_search").keyup(function() {
            var q = $("#tpos_search").val();
            if (q != "" && q != " ") {
                var f = $("div.row-hazard:Contains('" + q + "')");

                $("div.row-hazard")
                    .css("display", "none")
                    .filter(f)
                    .css("display", "block");
            } else {
                $("div.row-hazard").css("display", "block");
            }
        });



        hazardreviewbuttonaction();
        toggleCollapse();
        toggleInfoPanel();
        activateHazardEdits();
        // activateRAMSActions();
        activateRAMSBtn();
        // rows to target
    },
    hazardtablerowsRAMS: function(data, ftv, trg) {
        var tlist = data.d.results;
        var tcnt = tlist.length;
        var row = "";
        var wpt = '<div><h1>Child RAMS Hazards</h1></div>';
        if (tcnt === 0) {
            wpt = '';
        }
        $("#" + trg).html(wpt);
        for (var cc = 0; cc < tcnt; cc++) {
            // build rows
            var h = tlist[cc];

            // var hitem=buildHazardListItem(h);

            var hitem = printHazardRow(h);
            // $('#tpos-main').html('');
            // // $('.dataset').removeClass('active');
            // $('#stats').remove();
            // $('#systemstats').remove();
            // $('#userstats').remove();
            // var newmain='<div class="tpos-main" id="tpos-main"></div>';
            // $('.tpos-body').prepend(newmain);

            // $('#tpos-main').html('<div class="tpos-area-title">RAMS results for hazard: '+hzd+'</div><div id="hazardstable" class="tpos-area-content"></div>');
            // var utbl='<div class="row">Results</div><div><table class="tpos-tbl"><tr><td id="parentmatch"></td></tr></table></div>';
            // var ramsfrm='<div id="ramsfrm"></div>';
            // $('#hazardstable').prepend(ramsfrm);

            $("#" + trg).append(hitem);
            //alert(3);
            // $('.ramsonly').hide();
            if (h.cdmRAMS) {
                $("#h_" + h.ID + " .ramshide").hide();
                $("#h_" + h.ID + " .ramsonly").show();
            }
            // if (h.cdmHazardType.Title == "Safety") {
            //     $("#h_" + h.ID + " .safetyhide").hide();
            // }
            if (
                h.cdmStageHS2.Title.includes("Construction") ||
                h.cdmStageHS2.Title == "Commission"
            ) {
                // $("#h_" + h.ID + " .stagehide").hide();
            }
        }
        // var tpos_search =
        //   '<div class="filter-row"><input id="tpos_search" placeholder="Search here" /></div>';
        // $("#tpos_search").remove();
        // $("#ramsfrm").append(tpos_search);
        // $("#tpos_search").keyup(function() {
        //   var q = $("#tpos_search").val();
        //   if (q != "" && q != " ") {
        //     var f = $("div.row-hazard:Contains('" + q + "')");

        //     $("div.row-hazard")
        //       .css("display", "none")
        //       .filter(f)
        //       .css("display", "block");
        //   } else {
        //     $("div.row-hazard").css("display", "block");
        //   }
        // });

        // $(".tpos-siblingsbtn").click(function() {
        //   var q = $(this).data("query");
        //   var ent=q.split('|');

        //   // q = new String(q);
        //   $("#tpos-main").html("");
        //   $("#stats").remove();
        //   $("#systemstats").remove();
        //   $("#userstats").remove();
        //   $("#tpos-main").html(
        //     '<div class="tpos-area-title">Linked hazards</div><div id="hazardstable" class="tpos-area-content"></div>'
        //   );
        //   if(ent[1]==='pw'){
        //     cdmdata.get(
        //       "cdmHazards",
        //       "cdmPWStructure eq '" + ent[0] + "'",
        //       "Modified desc",
        //       "hazards-table",
        //       "hazardstable"
        //     );

        //   }else{
        //     cdmdata.get(
        //       "cdmHazards",
        //       "cdmEntityTitle eq '" + ent[0] + "'",
        //       "Modified desc",
        //       "hazards-table",
        //       "hazardstable"
        //     );

        //   }
        //   // cdmdata.get('cdmHazards','Editor/ID eq \''+uid()+'\'','Modified desc','hazards-table','hazardstable');
        // });


        hazardreviewbuttonaction();
        toggleCollapse();
        toggleInfoPanel();

        activateHazardEdits();
        activateADDRAMSBTN();


        // rows to target
    }

};

function mkLinkButtons() {
    cdmdata.get('XtraButtons', null, 'ID asc', 'xtrabuttons', 'tpos-nav',null,[]);
}

function mkUserDataSet(u) {
    var  ui = u.ID;
    var cell = "";
    $.each(u, function(key, element) {
        if (key != "__metadata" && key != "Title") {
            cell += mkCell(ui, key, element);
        }
    });
}

function mkCell(entity, i, key, element) {
    if (key == "Created" || key == "Modified") {
        element = ukdate(element);
    }
    if (key == "LastReviewDate" && element) {
        element = ukdate(element);
    }
    if (key == "Created") {
        // ar_created +='';
    }
    if (!element || element == "" || element == undefined) {
        element = "tbc";
    }
    var t = "";
    var e = isObject(element);
    //////console.log(e);
    if (e == false) {
        // t = '<div class="cell" id="'+entity+'_' + i + '_' + key + '"><div class="lbl">' + key + '</div><div class="val fld_'+key+'">' + element + '</div></div>';
        t =
            '<div class="celled fld_' +
            key +
            '" data-entity="' +
            entity +
            '"  id="' +
            entity +
            "_" +
            i +
            "_" +
            key +
            '">' +
            element +
            "</div>";
    } else {
        t =
            '<div class="celled fld_' +
            key +
            'Title" data-entity="' +
            entity +
            '" data-elementid="' +
            element.ID +
            '" data-elementname="' +
            element.Title +
            '" id="' +
            entity +
            "_" +
            i +
            "_" +
            key +
            '">' +
            element.Title +
            "</div>";
    }

    return t;
}

function buildHazardListItem(h) {
    var hi = h.ID;
    // check user privileges whilst writing hazard - if user can edit, make fields editable
    var user_role = "";
    var user_company = "";
    var user_site = "";
    var userrights = 0; // 0=no edits; 1=editor (correct company, either designer or rep); 2=peer (correct company,correct role, not last editor);
    // 3=dhm (correct design house); 4=sm (correct site and role); 5=ld;
    var urdesigner = 0;
    var urdm = 0;
    var ursm = 0;
    var urld = 0;
    var urscr = 0;

    var ucanedit = 0;
    var ucanpeerreview = 0;
    var ucandmreview = 0;
    var ucanprecon = 0;
    var ucansmreview = 0;
    var ucanldreview = 0;

    var isDesignHazard = 0;
    var isHealthHazard = 0;
    var requiresLDReview = 0;
    if (!h.cdmRAMS) {
        isDesignHazard = 1;
    }
    if (h.cdmHazardType.Title == "Health") {
        isHealthHazard = 1;
    }
    // if (isDesignHazard == 1 && h.cdmStageHS2.Title == "Construction") {
    //   requiresLDReview = 1;
    // }
    // if (isDesignHazard == 1 && h.cdmStageHS2.Title == "Commission") {
    //   requiresLDReview = 1;
    // }

    if (isDesignHazard == 1 && (h.cdmStageHS2.Title.includes("Construction") || h.cdmStageHS2.Title != "Commission")) {
        requiresLDReview = 1;
    }

    if (h.cdmHazardOwner.ID) {
        var ura = $(".fld_cdmUserRoleTitle");
        var urc = $(".fld_fld_cdmCompanyTitle");
        var urs = $(".fld_fld_cdmSiteTitle");
        for (var ii = 0; ii < ura.length; ii++) {
            var urat = $(ura[ii]).data("elementname");
            var urct = $(urc[ii]).data("elementid");
            var urst = $(urs[ii]).data("elementid");
            if (!h.cdmStageHS2.Title.includes("Construction") &&
                h.cdmStageHS2.Title != "Commission"
            ) {
                if (urct == h.cdmHazardOwner.ID) {
                    // belongs to your company
                    if (h.cdmPWStructure.ID || h.cdmTW) {
                        // is a design hazard
                        if (urat == "Designer") {
                            ucanedit = 1;
                        }
                        if (urat == "Design Manager" && uid() != h.Editor.ID) {
                            ucandmreview = 1;
                        }
                    }
                    if (h.cdmRAMS) {
                        // is a RAMS hazard
                        if (urat == "Construction Engineer") {
                            ucanedit = 1;
                        }
                    }
                    if (ucanedit == 1 && uid() != h.Editor.ID) {
                        ucanpeerreview = 1;
                    }
                }
                if (uid() != h.Editor.ID) {
                    if (urat == "Construction Manager" && urs == h.cdmSite.ID) {
                        ucanprecon = 1;
                    }
                    if (urat == "Lead designer" && urs == h.cdmSite.ID) {
                        ucanldreview = 1;
                    }
                    if (urat == "Construction Manager" && urs == h.cdmSite.ID) {
                        ucansmreview = 1;
                    }
                }
            }
        }
        var rvstatus = h.cdmLastReviewStatus;
        if (
            (ucanpeerreview == 1 && rvstatus == "requested design peer review") ||
            (ucanpeerreview == 1 && rvstatus == "requested rams peer review")
        ) {
            ucanpeerreview == 2;
        }
        if (ucandmreview == 1 && rvstatus == "requested design manager review") {
            ucandmreview = 2;
        }
        if (ucanprecon == 1 && rvstatus == "requested pre-construction review") {
            ucanprecon = 2;
        }
        if (ucanldreview == 1 && rvstatus == "requested lesd design review") {
            ucanldreview = 2;
        }
        if (ucansmreview == 1 && rvstatus == "requested Construction Manager review") {
            ucansmreview = 2;
        }
    }

    var permissions =
        ucanedit +
        "-" +
        ucanpeerreview +
        "-" +
        ucandmreview +
        "-" +
        ucanprecon +
        "-" +
        ucanldreview +
        "-" +
        ucansmreview;

    var no_owner =
        "Hazard is locked for editing until an owner has been assigned";
    var under_review =
        "Hazard is currently under review and therefore locked for editing";
    var no_element = "Please add an element before initiating the review";
    var no_rag =
        "Please complete the project controls assessment before initiating the review";
    var msg = "";
    var o = "";
    var s = "";
    var si = h.cdmSite.ID;
    var st = h.cdmSite.Title;
    s == '<div id="h_' + hi + '_cdmSite" class="cell">' + st + "</div>";

    var oi = h.cdmHazardOwner.ID;
    var ot = h.cdmHazardOwner.Title;
    if (!oi) {
        o =
            '<div id="h_' +
            hi +
            '_cdmHazardOwner" class="cell cell-ownereditable clr_5">Unassigned</div>';
        msg = no_owner;
    } else {
        o =
            '<div id="h_' +
            hi +
            '_cdmHazardOwner" class="cell cell-ownereditable">' +
            ot +
            "</div>";
    }
    var he = "Permanent works design hazard";
    var heclass = "pwd";
    var hc = "Designer";
    var et = h.cdmEntityTitle;
    var en = ""; // entity name
    var p = "";
    var pi = h.cdmPWStructure.ID;
    var pt = h.cdmPWStructure.Title;
    var el = "";
    var eli = h.cdmPWElement.ID;
    var elt = h.cdmPWElement.Title;
    //var pd = h.cdmPWStructure.cdmDescription;
    //alert(pd);
    if (pi) {
        p = pt;
        if (!eli) {
            el =
                '<div id="h_' +
                hi +
                '_cdmPWElement" class="cell cell-editable clr_5">No element</div>';
            if (oi) {
                msg = no_element;
            }
        }
        if (eli) {
            el =
                '<div id="h_' +
                hi +
                '_cdmPWElement" class="cell cell-editable">' +
                elt +
                "</div>";
            // en=p+el;
        }
    }
    var t = "";
    var ti = h.cdmTW;
    if (ti) {
        he = "Temporary works design hazard";
        heclass = "twd";
        t = ti;
        // en='<div id="h_'+hi+'_Entity" class="cell">'+ti+' - '+et+'</div>';
    }
    var ra = "";
    var rai = h.cdmRAMS;
    if (rai) {
        ra = rai;
        he = "RAMS hazard";
        heclass = "ra";
        hc = "Construction Engineer";
    }
    en = '<div id="h_' + hi + '_Entity" class="cell">' + p + et + el + "</div>";

    var stt = h.cdmStageHS2.Title;
    var sti = h.cdmStageHS2.ID;
    var htt = h.cdmHazardType.Title;
    var hti = h.cdmHazardType.ID;

    var refpanel =
        '                    <div id="h_' +
        hi +
        '_ref" class="cell lg">Ref: ' +
        hi +
        "</div>" +
        '                    <div id="h_' +
        hi +
        '_stageandtype" class="cell">' +
        '                        <div class="cell-cell-img" title="' +
        stt +
        '">' +
        '                            <img style="width:16px;height:16px;" src="../../pages/2.0/img/stages/' +
        sti +
        '.svg" alt="' +
        stt +
        '">' +
        "                        </div>" +
        '                        <div class="cell-cell-img" title="' +
        htt +
        '">' +
        '                            <img style="width:16px;height:16px;" src="../../pages/2.0/img/types/' +
        hti +
        '.svg" alt="' +
        htt +
        '">' +
        "                        </div>" +
        "                    </div>" +
        o;

    var scaffold =
        '<div class="cdmHazard-row row row-hazard" id="h_' +
        hi +
        '_row">' +
        '    <div class="row-header ' +
        heclass +
        '">' +
        he +
        " - " +
        permissions +
        "</div>" +
        '    <div class="row-notification">' +
        msg +
        "</div>" +
        '    <div class="vwdefault">' +
        '        <div class="row" id="row1">' +
        '            <table class="tpos-tbl">' +
        "                <tr>" +
        '                    <td class="width-150">' +
        refpanel +
        "</td>" +
        '                    <td class="width-200">' +
        s +
        en +
        "</td>" +
        '                    <td class="width-300">hazard,risk,mitigation,suggestions</td>' +
        '                    <td class="width-250">key dates and people</td>' +
        '                    <td class="width-200">residual risk</td>' +
        "                </tr>" +
        "            </table>" +
        "        </div>" +
        "    </div>" +
        '    <div class="vwhover">' +
        '        <div class="row">' +
        '            <table class="tpos-tbl">' +
        "                <tr>" +
        '                    <td class="width-100"><div class="lbl">Reference</div></td>' +
        '                    <td class="width-100"><div class="lbl">Stage</div></td>' +
        '                    <td class="width-100"><div class="lbl">Type</div></td>' +
        '                    <td class="width-100"><div class="lbl">Owner</div></td>' +
        '                    <td class="width-50"><div class="lbl">Sublot</div></td>' +
        '                    <td class="width-600"><div class="lbl">Entity</div></td>' +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-100">Ref</td>' +
        '                    <td class="width-100">Stage</td>' +
        '                    <td class="width-100">Type</td>' +
        '                    <td class="width-100">' +
        o +
        "</td>" +
        '                    <td class="width-50">Sublot</td>' +
        '                    <td class="width-600">' +
        en +
        "</td>" +
        "                </tr>" +
        "            </table>" +
        "        </div>" +
        '        <div class="row">' +
        '            <table class="tpos-tbl">' +
        "                <tr>" +
        '                    <td class="width-300"><div class="lbl">The hazard</div></td>' +
        '                    <td class="width-300"><div class="lbl">The risk</div></td>' +
        '                    <td class="width-300"><div class="lbl">Our mitigation</div></td>' +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-300">hazard</td>' +
        '                    <td class="width-300">risk</td>' +
        '                    <td class="width-300">mitigation</td>' +
        "                </tr>" +
        "" +
        "            </table>" +
        "        </div>" +
        '        <div class="row" id="rag">' +
        '            <table class="tpos-tbl">' +
        "                <tr>" +
        '                    <td class="width-300"><div class="lbl">no label</div></td>' +
        '                    <td class="width-300"><div class="lbl">Initial project control</div></td>' +
        '                    <td class="width-300"><div class="lbl">Residual project control</div></td>' +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-300">none</td>' +
        '                    <td class="width-300">initial rag</td>' +
        '                    <td class="width-300">residual rag</td>' +
        "                </tr>" +
        "            </table>" +
        "        </div>" +
        '        <div class="row">' +
        '            <table class="tpos-tbl">' +
        "                <tr>" +
        '                    <td class="width-300"><div class="lbl">no label</div></td>' +
        '                    <td class="width-300"><div class="lbl">Initial risk</div></td>' +
        '                    <td class="width-300"><div class="lbl">Residual risk</div></td>' +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-300">none</td>' +
        '                    <td class="width-300">initial risk</td>' +
        '                    <td class="width-300">residual risk</td>' +
        "                </tr>" +
        "            </table>" +
        "        </div>" +
        '        <div class="row">' +
        '            <table class="tpos-tbl">' +
        "                <tr>" +
        '                    <td class="width-"><div class="lbl">Designer\'s mitigation suggestion for </div></td>' +
        '                    <td class="width-"><div class="lbl">Construction Manager\'s mitigation suggestion for </div></td>' +
        '                    <td class="width-"><div class="lbl">Linked hazards (siblings) </div></td>' +
        '                    <td class="width-"><div class="lbl">Parent/Child hazards (RAMS) </div></td>' +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-">designer suggestion</td>' +
        '                    <td class="width-">sm suggestion</td>' +
        '                    <td class="width-">siblings</td>' +
        '                    <td class="width-">parent or children</td>' +
        "                </tr>" +
        "            </table>" +
        "        </div>" +
        '        <div class="row" id="tags">' +
        '            <table class="tpos-tbl">' +
        "                <tr>" +
        '                    <td class="width-250"><div class="lbl">Coordinates</div></td>' +
        '                    <td class="width-250"><div class="lbl">Hazard tags</div></td>' +
        '                    <td class="width-250"><div class="lbl">Uniclass tags</div></td>' +
        '                    <td class="width-250"><div class="lbl">Links</div></td>' +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-250">coordinates</td>' +
        '                    <td class="width-250">htags</td>' +
        '                    <td class="width-250">utags</td>' +
        '                    <td class="width-250">links</td>' +
        "                </tr>" +
        "            </table>" +
        "        </div>" +
        '        <div class="row-header ' +
        heclass +
        '">' +
        '            <table class="tpos-tbl">' +
        "                <tr>" +
        '                    <td class="width-150"><div class="lbl">Created</div></td>' +
        '                    <td class="width-150"><div class="lbl">Modified</div></td>' +
        '                    <td class="width-150"><div class="lbl">Reviewed</div></td>' +
        '                    <td class="width-150"><div class="lbl">Status</div></td>' +
        '                    <td class="width-500"></td>' +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-150">created</td>' +
        '                    <td class="width-150">modified</td>' +
        '                    <td class="width-150">reviewed</td>' +
        '                    <td class="width-150">status</td>' +
        '                    <td class="width-500"></td>' +
        "                </tr>" +
        "            </table>" +
        "        </div>" +
        "    </div>" +
        '    <div class="vw vwshow vwdefault" tabindex="2" id="h_' +
        hi +
        '_vw">' +
        '        <img style="width:16px;height:16px;" src="../../pages/2.0/img/dots.svg" alt="show me everything">' +
        "    </div>" +
        '    <div class="vw vwhide vwhover" tabindex="2" id="h_' +
        hi +
        '_vw">' +
        '        <img style="width:16px;height:16px;" src="../../pages/2.0/img/dots.svg" alt="hide things">' +
        "    </div>" +
        "</div>";

    return scaffold;
}

function hrf(hi, ft, fi, ucanedit, editrequired, val, imgsrc) {
    // var htt = hrf(hi,'cdmHazardType',ucanedit,1,h.cdmHazardType.Title);
    var cl = "cell";
    var dtentries = "";
    var imgentry = "";
    if (fi) {
        dtentries = 'data-entityname="' + ft + '" data-entityid="' + fi + '"';
    }
    if (imgsrc) {
        imgentry =
            '<div><img style="width:16px;height:16px;" src="../../pages/2.0/img/' +
            imgsrc +
            "/" +
            fi +
            '.svg" alt="' +
            ft +
            '"></div>';
    }
    if (ucanedit == 1 && editrequired == 1) {
        cl = "cell-editable";
    }
    var t =
        '<div id="h_' + hi + "_" + fld + '" class="' + cl + '">' + val + "</div>";

    var t = '<div id="h_' + hi + "_" + fld + '" ';
    return t;
}

function printNonEditableField() {}

function printEditableField() {}

function printHazardRow(h) {
    //alert("hi");
    var hc = "pwd";
    var hctitle = "Permanent works design hazard";
    var en = h.cdmPWStructure.Title;
    var enid = h.cdmPWStructure.ID;
    if (h.cdmTW) {
        hc = "twd";
        hctitle = "Temporary works design hazard";
        en = h.cdmEntityTitle;
    }
    if (h.cdmRAMS) {
        hc = "ra";
        hctitle = "RAMS hazard";
        en = h.cdmEntityTitle;
    }
    var mitsdisplay = "";
    var revsdisplay = "";
    var mitsowner = h.CurrentMitigationOwner.Title;
    var revsowner = h.CurrentReviewOwner.Title;
    var moi = h.CurrentMitigationOwner.ID;
    var roi = h.CurrentReviewOwner.ID;
    if (!moi) {
        mitsdisplay = "";
    } else {
        mitsdisplay = "last assessed by: " + mitsowner;
    }

    if (!roi) {
        revsdisplay = "";
    } else {
        revsdisplay = "last reviewed by: " + revsowner;
    }

    var pws = h.cdmPWStructure.Title;
    if (!pws) {
        pws = "";
    }
    var pwe = h.cdmPWElement.Title;
  
    if (!pwe && h.cdmPWStructure.Title) {
        pwe = '<span class="clr_5 cell cdmPWElement">No element</span>';
    }
    if (!pwe && !h.cdmPWStructure.Title) {
        pwe = "";
    }
    if (h.cdmPWElement.Title) {
        '<span class="cell cdmPWElement">' + h.cdmPWElement.Title + "</span>";
    }
    var o = h.cdmHazardOwner.Title;
    var warning = "";
    var isLocked = 0;
    var requiresLDReview = 1;
    var permissions = "";
    if (!o) {
        o = '<span class="clr_5">Unassigned</span>';
        warning =
            '<div class="clr_5_active">This hazard has not been assigned to an owner and is therefore locked for editing.</div>';
    }
    var revstatus = h.cdmCurrentStatus;

    if (revstatus.substring(0, 1) == "U") {
        warning =
            '<div class="clr_5_active">This hazard is currently under review and therefore locked for editing.</div>';
        isLocked = 1;
    }
    var uce = 0,
        ucp = 0,
        ucd = 0,
        ucpc = 0,
        ucl = 0,
        ucs = 0;
    var ruce = 0,
        rucp = 0,
        rucd = 0,
        rucpc = 0,
        rucl = 0,
        rucs = 0; // current status and requirements 0=not required/gray  2=required/red 1=accepted/completed/green
    var revbtn = "";
    var isRAMSValid = 0;

    if (h.cdmStageHS2.Title.includes("Construction") || h.cdmStageHS2.Title == "Commission") {
        requiresLDReview = 0;
        // ////console.log(requiresLDReview);
    }
    if (h.cdmStageHS2.Title.includes("Construction") || h.cdmStageHS2.Title == "Commission") {
        isRAMSValid = 1;
    }

    var mkramsbtn = '<div class="tpos-svramsbtn mkramsbtn width-a" data-action="vwrams" id="mkramsbtn_' + h.ID + '">View associated RAMS hazards</div>';
    var lblramshazards = 'RAMS hazards';

    var mkramstrigger = 0;
    var hasRAMS = 0;
    var vwramstrigger = 0;

    if (h.cdmSMMitigationSuggestion === "This hazard is further mitigated via one or more RAMS hazards.") {
        mkramstrigger = 1;
        hasRAMS = 1;
        vwramstrigger = 1;
    }
    var isSM = 0;
    ////console.log(h.cdmSMMitigationSuggestion + ' - mk: ' + hasRAMS + ' - vw: ' + vwramstrigger);
    // if(mkramstrigger===0){
    //   mkramsbtn='';
    // }

    if (h.cdmHazardOwner.Title) {
        var ura = $(".fld_cdmUserRoleTitle");
        var uca = $(".fld_cdmCompanyTitle");
        var usa = $(".fld_cdmSiteTitle");
        for (var cc = 0; cc < ura.length; cc++) {
            var role = $(ura[cc]).data("elementname");
            var comp = $(uca[cc]).data("elementname");
            var site = $(usa[cc]).data("elementname");

            if (revstatus != "Accepted" && revstatus != "Ready for Review by HS2" && revstatus != "Accepted by HS2") {
                if (hc != "ra") {
                    // if not rams hazard = design hazard
                    if (
                        role == "Designer" &&
                        comp == h.cdmHazardOwner.Title &&
                        isLocked == 0
                    ) {
                        uce = 1;
                    }
                    // ////console.log("Role: " + role)
                    // ////console.log("comp: " + comp)
                    // ////console.log("comp_compare: " + h.cdmHazardOwner.Title)
                    // ////console.log("isLocked: " + isLocked)
                    // ////console.log("uid: " + uid())
                    // ////console.log("uid_compare: " + h.Editor.ID)
                    // ////console.log("h.cdmLastReviewStatus: " + h.cdmLastReviewStatus)
                    if (
                        role == "Designer" &&
                        comp == h.cdmHazardOwner.Title &&
                        isLocked == 1 &&
                        uid() != h.Editor.ID &&
                        h.cdmLastReviewStatus == "Review initiated"
                    ) {
                        ucp = 1;
                    }
                    if (
                        role == "Design Manager" &&
                        comp == h.cdmHazardOwner.Title &&
                        h.cdmLastReviewStatus == "Peer review - approved"
                    ) {
                        ////console.log("UCD APPROVED")
                        ucd = 1;
                    }
                    if (role === 'Construction Manager') {
                        isSM = 1;
                    }
                    // if (site == h.cdmSite.Title) {
                    //   ////console.log("Should Show Button")
                    // }
                    if (
                        role == "Construction Manager" &&
                        ((h.cdmLastReviewStatus == "Design manager review - approved") || (h.cdmLastReviewStatus == "Design Manager review - approved"))
                        // requiresLDReview == 1
                    ) {
                        ucpc = 1;
                    }
                    if (hasRAMS === 0 && isSM === 0) {
                        mkramsbtn = '';
                        lblramshazards = '';
                    }
                    // if(role==='Construction Manager'&&h.cdmSMMitigationSuggestion==='Awaiting assessment'){
                    if (isSM === 1 && hasRAMS === 0) {
                        // Below has been changed from "Add associated RAMS hazard" to "View and add associated RAMS hazard"
                        mkramsbtn = '<div class="tpos-svramsbtn mkramsbtn width-a" data-action="mkrams" id="mkramsbtn_' + h.ID + '" title="Only available to Construction Managers to mitigate further via RAMS hazards">View and add associated RAMS hazards</div>';
                    }
                    // if(role==='Construction Manager'&&h.cdmSMMitigationSuggestion!='Awaiting assessment'){
                    if (isSM === 1 && hasRAMS === 1) {
                        mkramsbtn = '<div class="tpos-svramsbtn mkramsbtn width-a" data-action="mkrams" id="mkramsbtn_' + h.ID + '">View and add associated RAMS hazards</div>';
                    }

                    if (
                        role == "Lead Designer" &&
                        //   site == h.cdmSite.Title &&
                        h.cdmLastReviewStatus == "Pre-construction review completed" &&
                        requiresLDReview == 1
                    ) {
                        ucl = 1;
                    }
                    if (
                        role == "Construction Manager" &&
                        h.cdmLastReviewStatus == "Lead designer review completed" &&
                        requiresLDReview == 1
                    ) {
                        ucs = 1;
                    }

                    // Allows you to initiate review if "Our mitigation" field is already populated from the outset so you don't
                    // have to make any changes to it and progress it to the "Assessment in progress" stage in order to initiate review
                    if (h.cdmMitigationDescription != "Awaiting mitigation" && h.cdmCurrentStatus.includes("Requires mitigation") && uce == 1) {
                        revbtn = mkHazardReviewButton(
                            "initiatereview",
                            "Under peer review",
                            "Review initiated",
                            h.ID,
                            "Initiate review"
                        );
                    }

                    if (requiresLDReview == 1) {
                        (ruce = 2), (rucp = 2), (rucd = 2), (rucpc = 2), (rucl = 2), (rucs = 2);
                        if (revstatus == "Assessment in progress") {
                            (ruce = 3), (rucp = 2), (rucd = 2), (rucpc = 2), (rucl = 2), (rucs = 2);
                            if (uce == 1) {
                                // revbtn='<div class="tpos-rvbtn" data-action="initiatereview" data-company="'+h.cdmHazardOwner.ID+'" data-userrole="Designer">Initiate review</div>';
                                // revbtn=mkReviewButton('initiatereview',h.cdmHazardOwner.ID,'Designer',h.cdmSite.ID,h.ID,'Initiate review');
                                revbtn = mkHazardReviewButton(
                                    "initiatereview",
                                    "Under peer review",
                                    "Review initiated",
                                    h.ID,
                                    "Initiate review"
                                );
                            }
                        }
                        if (revstatus == "Under peer review") {
                            (ruce = 1), (rucp = 3), (rucd = 2), (rucpc = 2), (rucl = 2), (rucs = 2);
                            if (ucp == 1) {
                                revbtn =
                                    '<div class="tpos-rvbtn" data-action="peerreview">Undertake peer review</div>';
                                // revbtn=mkHazardReviewButton('completed peer review','Under peer review','Review initiated',h.ID,'Initiate review');
                            }
                        }
                        if (revstatus == "Under design manager review") {
                            (ruce = 1), (rucp = 1), (rucd = 3), (rucpc = 2), (rucl = 2), (rucs = 2);
                            if (ucd == 1) {
                                revbtn =
                                    '<div class="tpos-rvbtn" data-action="dmreview">Undertake design manager review</div>';
                            }
                        }
                        if (revstatus == "Under pre-construction review") {
                            (ruce = 1), (rucp = 1), (rucd = 1), (rucpc = 3), (rucl = 2), (rucs = 2);
                            if (ucpc == 1) {
                                revbtn =
                                    '<div class="tpos-rvbtn" data-action="pcreview">Undertake pre-construction review</div>';
                            }
                        }
                        if (revstatus == "Under lead designer review") {
                            (ruce = 1), (rucp = 1), (rucd = 1), (rucpc = 1), (rucl = 3), (rucs = 2);
                            if (ucl == 1) {
                                revbtn =
                                    '<div class="tpos-rvbtn" data-action="ldreview">Undertake lead designer review</div>';
                            }
                        }
                        if (revstatus == "Under site manager review") {
                            (ruce = 1), (rucp = 1), (rucd = 1), (rucpc = 1), (rucl = 1), (rucs = 3);
                            if (ucs == 1) {
                                revbtn =
                                    '<div class="tpos-rvbtn" data-action="smreview">Undertake site manager review</div>';
                            }
                        }
                        // if (revstatus == "Accepted") {
                        //     (ruce = 1), (rucp = 1), (rucd = 1), (rucpc = 1), (rucl = 1), (rucs = 1);
                        // }
                    } else {
                        (ruce = 2), (rucp = 2), (rucd = 2), (rucpc = 2);
                        if (revstatus == "Assessment in progress") {
                            (ruce = 3), (rucp = 2), (rucd = 2), (rucpc = 2);
                            if (uce == 1) {
                                // revbtn='<div class="tpos-rvbtn" data-action="initiatereview" data-company="'+h.cdmHazardOwner.ID+'" data-userrole="Designer">Initiate review</div>';
                                // revbtn=mkReviewButton('initiatereview',h.cdmHazardOwner.ID,'Designer',h.cdmSite.ID,h.ID,'Initiate review');
                                revbtn = mkHazardReviewButton(
                                    "initiatereview",
                                    "Under peer review",
                                    "Review initiated",
                                    h.ID,
                                    "Initiate review"
                                );
                            }
                        }
                        if (revstatus == "Under peer review") {
                            (ruce = 1), (rucp = 3), (rucd = 2), (rucpc = 2);
                            if (ucp == 1) {
                                revbtn =
                                    '<div class="tpos-rvbtn" data-action="peerreview">Undertake peer review</div>';
                            }
                        }
                        if (revstatus == "Under design manager review") {
                            (ruce = 1), (rucp = 1), (rucd = 3), (rucpc = 2);
                            if (ucd == 1) {
                                revbtn =
                                    '<div class="tpos-rvbtn" data-action="dmreview">Undertake design manager review</div>';
                            }
                        }
                        if (revstatus == "Under pre-construction review") {
                            (ruce = 1), (rucp = 1), (rucd = 1), (rucpc = 3);
                            if (ucpc == 1) {
                                revbtn =
                                    '<div class="tpos-rvbtn" data-action="pcreview">Undertake pre-construction review</div>';
                            }
                        }
                        // if (revstatus == "Accepted") {
                        //     (ruce = 1), (rucp = 1), (rucd = 1), (rucpc = 1);
                        // }
                    }
                } else {
                    if (
                        role == "Construction Engineer" &&
                        comp == h.cdmHazardOwner.Title &&
                        isLocked == 0
                    ) {
                        uce = 1;
                    }
                    if (
                        role == "Construction Engineer" &&
                        comp == h.cdmHazardOwner.Title &&
                        isLocked == 1 &&
                        uid() != h.Editor.ID &&
                        h.cdmLastReviewStatus == "Review initiated"
                    ) {
                        ucp = 1;
                    }
                    if (
                        role == "Construction Manager" &&
                        // site == h.cdmSite.Title &&
                        h.cdmLastReviewStatus == "Peer review - approved"
                    ) {
                        ucs = 1;
                    }
                    (ruce = 2), (rucp = 2), (rucs = 2);
                    if (revstatus == "Assessment in progress") {
                        (ruce = 3), (rucp = 2), (rucs = 2);
                        if (uce == 1) {
                            // revbtn='<div class="tpos-rvbtn" data-action="initiatereview" data-company="'+h.cdmHazardOwner.ID+'" data-userrole="Construction Engineer">Initiate review</div>';
                            // revbtn=mkReviewButton('initiatereview',h.cdmHazardOwner.ID,'Construction Engineer',h.cdmSite.ID,h.ID,'Initiate review');
                            revbtn = mkHazardReviewButton(
                                "initiatereview",
                                "Under peer review",
                                "Review initiated",
                                h.ID,
                                "Initiate review"
                            );
                        }
                    }
                    if (revstatus == "Under peer review") {
                        (ruce = 1), (rucp = 3), (rucs = 2);
                        if (ucp == 1) {
                            revbtn =
                                '<div class="tpos-rvbtn" data-action="peerreview">Undertake peer review</div>';
                        }
                    }
                    if (revstatus == "Under Construction Manager review") {
                        (ruce = 1), (rucp = 1), (rucs = 3);
                        if (ucs == 1) {
                            revbtn =
                                '<div class="tpos-rvbtn" data-action="smreview">Undertake Construction Manager review</div>';
                        }
                    }
                    // if (revstatus == "Accepted") {
                    //     (ruce = 1), (rucp = 1), (rucs = 1);
                    // }
                }

            } else {
                if (revstatus == "Accepted") {
                    if (hc != "ra") {
                        if (requiresLDReview == 1) {
                            (ruce = 1), (rucp = 1), (rucd = 1), (rucpc = 1), (rucl = 1), (rucs = 1);
                        } else {
                            (ruce = 1), (rucp = 1), (rucd = 1), (rucpc = 1);
                        }
                    } else {
                        (ruce = 1), (rucp = 1), (rucs = 1);
                    }
                    if (role === "Construction Manager") {
                        uce = 1;
                        revbtn = 
                            '<div class="tpos-rvbtn" data-action="clientreview">Submit for Client Review</div>';
                    }
                }
                if (revstatus == "Ready for Review by HS2") {
                    if (hc != "ra") {
                        if (requiresLDReview == 1) {
                            (ruce = 4), (rucp = 4), (rucd = 4), (rucpc = 4), (rucl = 4), (rucs = 4);
                        } else {
                            (ruce = 4), (rucp = 4), (rucd = 4), (rucpc = 4);
                        }
                    } else {
                        (ruce = 4), (rucp = 4), (rucs = 4);
                    }
                }
                if (revstatus == "Accepted by HS2") {
                    if (hc != "ra") {
                        if (requiresLDReview == 1) {
                            (ruce = 5), (rucp = 5), (rucd = 5), (rucpc = 5), (rucl = 5), (rucs = 5);
                        } else {
                            (ruce = 5), (rucp = 5), (rucd = 5), (rucpc = 5);
                        }
                    } else {
                        (ruce = 5), (rucp = 5), (rucs = 5);
                    }
                }
            }
        }
    }

    if (h.cdmRAMS) {
        isRAMSValid = 0;
    }


    if (isRAMSValid === 0) {
        mkramsbtn = '';
        lblramshazards = '';
    }

    var lstrev = "";
    if (!h.cdmLastReviewer) {
        lstrev = "No review on record";
    } else {
        lstrev = printDate(
            h.cdmLastReviewStatus,
            h.cdmLastReviewer,
            h.cdmLastReviewDate
        );
    }
    var requiredreviews =
        '<div class="requiredreviews"><div title="Risk assessment and mitigation" class="prm-cell ruce _' +
        ruce +
        '"></div><div title="Peer review"  class="prm-cell rucp _' +
        rucp +
        '"></div><div title="Design manager review"  class="prm-cell rucd _' +
        rucd +
        '"></div><div title="Pre-construction review" class="prm-cell rucpc _' +
        rucpc +
        '"></div><div title="Lead designer review" class="prm-cell rucl _' +
        rucl +
        '"></div><div title="Construction Manager review" class="prm-cell rucs _' +
        rucs +
        '"></div></div>';

    permissions =
        '<div class="permissions"><div title="Green - you can edit / mitigate this hazard" class="prm-cell uce _' +
        uce +
        '"></div><div title="Green - you can peer review this hazard"  class="prm-cell ucp _' +
        ucp +
        '"></div><div title="Green - you can undertake design manager reviews for this hazard"  class="prm-cell ucd _' +
        ucd +
        '"></div><div title="Green - you can undertake pre-construction reviews for this hazard" class="prm-cell ucpc _' +
        ucpc +
        '"></div><div title="Green - you can undertake lead designer reviews for this hazard" class="prm-cell ucl _' +
        ucl +
        '"></div><div title="Green - you can undertake Construction Manager reviews for this hazard" class="prm-cell ucs _' +
        ucs +
        '"></div></div>';

    var legid = '';
    if (h.cdmLegacyId) {
        legid = '<div class="cell lg">Legacy: ' + h.cdmLegacyId + '</div>';

    }
    var haztags = '';
    var unitags = '';
    var links = '';
    var hs2residualriskowner ='';
    var HS2RailSystemsContracts ='';
    var PASRiskClassification ='';
    var assigneduser = '';
    var hiddenrail ='';
    if (h.cdmHazardTags) { haztags = h.cdmHazardTags; }
    if (h.cdmUniclass) { unitags = h.cdmUniclass; }
    if (h.cdmLinks) { links = h.cdmLinks; }
    if (h.cdmhs2residualriskowner) { hs2residualriskowner = h.cdmhs2residualriskowner; }
    if(h.cdmHS2RailSystemsContracts){HS2RailSystemsContracts = h.cdmHS2RailSystemsContracts;}
    if(h.cdmPASRiskClassification){PASRiskClassification = h.cdmPASRiskClassification;}
    if(h.cdmAssignedUser){assigneduser = h.cdmAssignedUser;}
    if (hs2residualriskowner != 'HS2 Rail Systems Interface Engineer'){
        hiddenrail =' hide';
    }
    //alert('oo');
    //setUAID(enid);
    var myvar =
        '<div class="cdmHazard-row row row-hazard ' +
        decodeRisk("Residual", h.cdmResidualRisk, 1) +
        '" id="h_' +
        h.ID +
        '">' +
        '    <div class="row-header ' +
        hc +
        '">' +
        hctitle +
        "</div>" +
        permissions +
        requiredreviews +
        '    <div class="row-warning">' +
        warning +
        "</div>" +
        '    <div class="vwdefault">' +
        '        <div class="row" id="row1">' +
        '            <table class="tpos-tbl">' +
        "                <tr>" +
        '                    <td class="width-150">' +
        '                        <div class="cell lg">Ref: ' +
        h.ID +
        "</div>" + legid +

        '                        <div class="cell">' +
        '                            <div class="cell-cell-img" title="' +
        h.cdmStageHS2.Title +
        '">' +
        '                                <img style="width:16px;height:16px;" src="../../pages/2.0/img/stages/' +
        h.cdmStageHS2.ID +
        '.svg" alt="' +
        h.cdmStageHS2.Title +
        '">' +
        "                            </div>" +
        '                            <div class="cell-cell-img" title="' +
        h.cdmHazardType.Title +
        '">' +
        '                                <img style="width:16px;height:16px;" src="../../pages/2.0/img/types/' +
        h.cdmHazardType.ID +
        '.svg" alt="' +
        h.cdmHazardType.Title +
        '">' +
        "                            </div>" +
        "                        </div>" +
        "                        <div>" +
        '                            <div class="cell cdmHazardOwner">' +
        o +
        "</div>" +
        "                        </div>" +
        "                    </td>" +
        '                    <td class="width-200">' +
        '                        <div class="cell">' +
        h.cdmSite.Title +
        "</div>" +
        '                        <div class="cell">' +
        en +
        "</div>" +
        '                        <div class="cell cdmPWElement">' +
        pwe +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-300">' +
        '                        <div class="cell">' +
        shortText(h.cdmHazardDescription) +
        "</div>" +
        '                        <div class="cell">' +
        shortText(h.cdmRiskDescription) +
        "</div>" +
        '                        <div class="cell">' +
        shortText(h.cdmMitigationDescription) +
        "</div>" +
        '                        <div class="cell">' +
        shortText(h.cdmMitigationSuggestion) +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-250">' +
        '                        <div class="cell">' +
        printDate("Created", h.Author.Title, h.Created) +
        "</div>" +
        '                        <div class="cell">' +
        printDate("Modified", h.Editor.Title, h.Modified) +
        "</div>" +
        '                        <div class="cell">' +
        lstrev +
        "</div>" +
        '                        <div class="cell">' +
        h.cdmCurrentStatus +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-25"></td>' +
        '                    <td class="width-200">' +
        decodeRisk("Residual", h.cdmResidualRisk) +
        "</td>" +
        '                    <td class="width-25"></td>' +
        "                </tr>" +
        "            </table>" +
        "        </div>" +
        "    </div>" +
        '    <div class="vwhover">' +
        '        <div class="row">' +
        '            <table class="tpos-tbl wbrd">' +
        "                <tr>" +
        '                    <td class="width-100">' +
        '                        <div class="lbl">Reference</div>' +
        "                    </td>" +
        '                    <td class="width-100">' +
        '                        <div class="lbl">Stage</div>' +
        "                    </td>" +
        '                    <td class="width-100">' +
        '                        <div class="lbl">Type</div>' +
        "                    </td>" +
        '                    <td class="width-100">' +
        '                        <div class="lbl">Owner</div>' +
        "                    </td>" +
        '                    <td class="width-50">' +
        '                        <div class="lbl">Site</div>' +
        "                    </td>" +
        '                    <td class="width-300">' +
        '                        <div class="lbl">Asset</div>' +
        "                    </td>" +
        '                    <td class="width-300">' +
        '                        <div class="lbl">UAID</div>' +
        "                    </td>" +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-100 fld"><div class="lg">Ref: ' +
        h.ID +
        '</div>' +
        legid +
        "</td>" +
        '                    <td class="width-100 fld">' +
        '                        <img style="width:16px;height:16px;" src="../../pages/2.0/img/stages/' +
        h.cdmStageHS2.ID +
        '.svg" alt="\'+stt+\'">' +
        '                        <div class="cell cdmStageHS2">' +
        h.cdmStageHS2.Title +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-100 fld">' +
        '                        <img style="width:16px;height:16px;" src="../../pages/2.0/img/types/' +
        h.cdmHazardType.ID +
        '.svg" alt="\'+stt+\'">' +
        '                        <div class="cell pointer cdmHazardType" title="Click to toggle Hazard Type (Health or Safety)">' +
        h.cdmHazardType.Title +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-100 fld">' +
        '                        <div class="cell cdmHazardOwner">' +
        o +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-50 fld">' +
        '                        <div class="cell cdmSite" data-siteid="' +
        h.cdmSite.ID +
        '">' +
        h.cdmSite.Title +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-300 fld">' +
        // '                        <div class="cell cdmPWStructure">'+pws+'</div>'+
        // '                        <div class="cell cdmPWElement">'+pwe+'</div>'+
        // '                        <div class="cell cdmTW">'+h.cdmTW+'</div>'+
        // '                        <div class="cell cdmRAMS">'+h.cdmRAMS+'</div>'+
        '                        <div class="cell cdmEntityTitle">' +
        en +
        " - " +
        pwe +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-300 fld">' +
        '                        <div class="cell cdmuaid">' +
        h.cdmPWStructure.UAID + 
        "</div>" +
        "                    </td>" +
        "                </tr>" +
        "            </table>" +
        "        </div>" +
        '        <div class="row">' +
        '            <table class="tpos-tbl wbrd">' +
        "                <tr>" +
        '                    <td class="width-300">' +
        '                        <div class="lbl">The hazard</div>' +
        "                    </td>" +
        '                    <td class="width-300">' +
        '                        <div class="lbl">The risk</div>' +
        "                    </td>" +
        '                    <td class="width-300">' +
        '                        <div class="lbl">Our mitigation</div>' +
        "                    </td>" +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-300 fld">' +
        '                        <div class="cell cdmHazardDescription pointer borderboxing" tabindex="2" title="Click to edit">' +
        h.cdmHazardDescription +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-300 fld">' +
        '                        <div class="cell cdmRiskDescription pointer borderboxing" tabindex="2" title="Click to edit">' +
        h.cdmRiskDescription +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-300 fld">' +
        '                        <div class="cell cdmMitigationDescription pointer borderboxing" tabindex="2" title="Click to edit">' +
        h.cdmMitigationDescription +
        "</div>" +
        "                    </td>" +
        "                </tr>" +
        "" +
        "            </table>" +
        "        </div>" +
        '        <div class="row safetyhide bordered-rag" id="rag">' +
        '            <table class="tpos-tbl wbrd">' +
        "                <tr>" +
        '                    <td class="width-300">' +
        '                        <div class="lbl"></div>' +
        "                    </td>" +
        '                    <td class="width-300">' +
        '                        <div class="lbl">Initial project control</div>' +
        "                    </td>" +
        '                    <td class="width-300">' +
        '                        <div class="lbl">Residual project control</div>' +
        "                    </td>" +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-300 fld"><div class="txt-centered txt-lbl">Health RAG Assessment</div></td>' +
        '                    <td class="width-300 fld">' +
        '                        <div class="cell cdmInitialRAG borderboxing" tabindex="2">' +
        decodeRAG(h.cdmInitialRAG) +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-300 fld">' +
        '                        <div class="cell cdmResidualRAG borderboxing" tabindex="2">' +
        decodeRAG(h.cdmResidualRAG) +
        "</div>" +
        "                    </td>" +
        "                </tr>" +
        "            </table>" +
        "        </div>" +
        '        <div class="row bordered-risk">' +
        '            <table class="tpos-tbl wbrd">' +
        "                <tr>" +
        '                    <td class="width-300">' +
        '                        <div class="lbl"></div>' +
        "                    </td>" +
        '                    <td class="width-300">' +
        '                        <div class="lbl">Initial risk</div>' +
        "                    </td>" +
        '                    <td class="width-300">' +
        '                        <div class="lbl">Residual risk</div>' +
        "                    </td>" +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-300 fld"><div class="txt-centered txt-lbl">Risk Score Assessment</div></td>' +
        '                    <td class="width-300 fld">' +
        '                        <div class="cell cdmInitialRisk">' +
        decodeRisk("Initial", h.cdmInitialRisk) +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-300 fld">' +
        '                        <div class="cell cdmResidualRisk">' +
        decodeRisk("Residual", h.cdmResidualRisk) +
        "</div>" +
        "                    </td>" +
        "                </tr>" +
        "            </table>" +
        "        </div>" +
        '        <div class="row">' +
        '            <table class="tpos-tbl wbrd">' +
        "                <tr>" +
        '                    <td class="width-250">' +
        '                        <div class="lbl">Designer\'s mitigation suggestion for ' +
        h.cdmStageHS2.Title +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-250">' +
        '                        <div class="lbl stagehide">Construction Manager\'s mitigation suggestion for ' +
        h.cdmStageHS2.Title +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-20">' +
        '                        <div class="lbl ramshide">' + lblramshazards + ' </div>' +
        "                    </td>" +
        '                    <td class="width-20">' +
        '                        <div class="lbl ramsonly">Parent </div>' +
        "                    </td>" +
        '                    <td class="width-250">' +
        '                        <div class="lbl ">PAS 1192:6 Risk Classification </div>' +
        "                    </td>" +
        '                    <td class="width-250">' +
        '                        <div class="lbl ">HS2 Residual Risk Owner </div>' +
        "                    </td>" +
        '                    <td class="width-250">' +
        '                        <div class="lbl ">HS2 Rail System Contracts </div>' +
        "                    </td>" +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-250 fld">' +
        '                        <div class="cell cdmStageMitigationSuggestion pointer borderboxing" tabindex="2" title="A designer for this design house can edit this">' +
        h.cdmStageMitigationSuggestion +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-250 fld">' +
        '                        <div class="cell cdmSMMitigationSuggestion stagehide pointer borderboxing" tabindex="2" title="Provided by Construction Manager during the pre-construction review if required">' +
        h.cdmSMMitigationSuggestion +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-20 fld">' + mkramsbtn + '</td>' +
        '                    <td class="width-20 fld"><div class="cell cdmParent ramsonly">' +
        h.cdmParent +
        "</div></td>" +
        '                    <td class="width-250 fld"><div class="cell cdmPASRiskClassification pointer borderboxing" tabindex="2" title="Click to select PAS 1192:6 Risk Classification">' +
        PASRiskClassification +
        "</div></td>" +
        '                    <td class="width-250 fld"><div class="cell cdmhs2residualriskowner pointer borderboxing" tabindex="2" title="Click to manage HS2 Residual risk owner">' +
        hs2residualriskowner +
        "</div></td>" +
        '                    <td class="width-250 fld"><div class="cell cdmHS2RailSystemsContracts'+hiddenrail+' pointer borderboxing" tabindex="2" title="Click to manage HS2 Rail Systems Contracts">' +
        HS2RailSystemsContracts +
        "</div></td>" +
        "                </tr>" +
        "            </table>" +
        "        </div>" +
        '        <div class="row ramshide" id="tags">' +
        '            <table class="tpos-tbl wbrd">' +
        "                <tr>" +
        '                    <td class="width-250">' +
        '                        <div class="lbl">Coordinates</div>' +
        "                    </td>" +
        '                    <td class="width-250">' +
        '                        <div class="lbl">Hazard tags</div>' +
        "                    </td>" +
        '                    <td class="width-250">' +
        '                        <div class="lbl">Status</div>' +
        "                    </td>" +
        '                    <td class="width-250">' +
        '                        <div class="lbl">Links</div>' +
        "                    </td>" +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-250 fld">' +
        '                        <div class="cell cdmHazardCoordinates pointer borderboxing" tabindex="2">' +
        decodeCoordinates(h.cdmHazardCoordinates, uce, h.ID) +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-250 fld">' +
        '                        <div class="cell cdmHazardTags">' +
        haztags +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-250 fld">' +
        '                        <div tabindex="2" class="cell cdmUniclass pointer borderboxing" tabindex="2" title="Click to manage status">' +
        unitags +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-250 fld">' +
        '                        <div class="cell cdmLinks pointer borderboxing" tabindex="2" title="Click to edit">' +
        links +
        "</div>" +
        "                    </td>" +
        "                </tr>" +
        "            </table>" +
        "        </div>" +
        '        <div class="row ' +
        hc +
        '">' +
        '            <table class="tpos-tbl wbrd">' +
        "                <tr>" +
        '                    <td class="width-150">' +
        '                        <div class="lbl">Created</div>' +
        "                    </td>" +
        '                    <td class="width-150">' +
        '                        <div class="lbl hazhis">Last Modified</div>' +
        "                    </td>" +
        '                    <td class="width-150">' +
        '                        <div class="lbl revhis">' +
        h.cdmLastReviewStatus +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-150">' +
        '                        <div class="lbl">Status</div>' +
        "                    </td>" +
        '                    <td class="width-200">' +
        '                        <div class="lbl">Assigned User</div>' +
        "                    </td>" +
        '                    <td class="width-300"></td>' +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-150">' +
        ukdate(h.Created) +
        "</td>" +
        '                    <td class="width-150 hazhis">' +
        ukdate(h.Modified) +
        "</td>" +
        '                    <td class="width-150 revhis">' +
        ukdate(h.cdmLastReviewDate) +
        "</td>" +
        '                    <td class="width-150 cdmCurrentStatus">' +
        h.cdmCurrentStatus +
        "</td>" +
        '                    <td class="width-200 fld">' +
        '                        <div class="cell cdmAssignedUser pointer borderboxing" tabindex="2" title="Click to Assign user">' +
        assigneduser +
        "</div>" +
        "                    </td>" +
        '                    <td class="width-300"></td>' +
        "                </tr>" +
        "                <tr>" +
        '                    <td class="width-150">' +
        h.Author.Title +
        "</td>" +
        '                    <td class="width-150 hazhis">' +
        h.Editor.Title +
        "</td>" +
        '                    <td class="width-150 revhis">' +
        h.cdmLastReviewer +
        "</td>" +
        '                    <td class="width-150">' +
        revbtn +
        "</td>" +
        '                    <td class="width-500"></td>' +
        "                </tr>" +
        "            </table>" +
        "        </div>" +
        "    </div>" +
        '    <div class="vw vwshow vwdefault" tabindex="2" id="h_' +
        h.ID +
        '_vw1">' +
        '        <img style="width:16px;height:16px;" src="../../pages/2.0/img/dots.svg" alt="show me everything">' +
        "    </div>" +
        '    <div class="vw vwhide vwhover" tabindex="2" id="h_' +
        h.ID +
        '_vw2">' +
        '        <img style="width:16px;height:16px;" src="../../pages/2.0/img/dots.svg" alt="hide things">' +
        "    </div>" +
        '    <div class="info-panel hide" id="h_' +
        h.ID +
        '_changehistory">' +
        "    </div>" +
        '    <div class="info-panel hide" id="h_' +
        h.ID +
        '_reviewhistory">' +
        decodeReviews(h.cdmReviews) +
        "    </div>" +
        '    <div class="hide cdmReviews" id="h_' +
        h.ID +
        '_cdmReviews">' +
        h.cdmReviews +
        "    </div>" +
        "</div>";

    return myvar;
}

function shortText(str) {
    //var t=str;
    if (!str) {
        str = "";
    }
    if (str.length > 50) {
        str = str.substring(0, 47) + '<span title="' + str + '">...</span>';
    } else {
        return str;
    }
    return str;
}

function decodeReviews(str) {
    var t = "";
    if (!str || str == "" || str == undefined) {
        t = "<div>No review records found</div>";
    } else {
        var rows = str.split("^");
        var flds = "";

        var row = "";
        for (var cc = 0; cc < rows.length; cc++) {
            flds = rows[cc].split("]");
            var fld = "";
            for (var dd = 0; dd < flds.length; dd++) {
                if (flds[dd]) {
                    fld += "<td>" + flds[dd] + "</td>";
                }
            }
            if (fld) {
                row += "<tr>" + fld + "</tr>";
            }
        }
        t = '<table class="tpos-tbl">' + row + "</table>";
    }
    return t;
}

function decodeRAG(str) {
    var t = "";
    if (!str || str == "" || str == undefined) {
        t = '<div class="clr_5">Awaiting assessment</div>';
    } else {
        var tar = str.split("^");
        var clr = tar[2];
        var tit = tar[0];
        var bod = tar[1];
        t =
            '<div class="width-290 centered tpos-border-risk-' +
            clr +
            '">' +
            tit +
            " - " +
            bod +
            "</div>";
    }
    return t;
}

function decodeRisk(tp, rr, clr) {
    if (!rr) {
        return "";
    }
    var rrrclr = "";
    var rrdata = rr.split("^");
    var rr1data = rrdata[0].split("-");
    var rr2data = rrdata[1].split("-");
    var rr3data = rrdata[2].split("-");
    var rrsc = rr1data[0];
    var rrsct = rr1data[1];
    var rrclr = rr1data[2];
    var rrs = rr2data[0];
    var rrst = rr2data[1];
    var rrl = rr3data[0];
    var rrlt = rr3data[1];

    var bclr = "tpos-border-right-Green";
    if (rrclr == "clr_5") {
        rrrclr = "tpos-border-risk-Red";
        bclr = "tpos-border-right-Red";
    }
    if (rrclr == "clr_4") {
        rrrclr = "tpos-border-risk-Amber";
        bclr = "tpos-border-right-Amber";
    }
    if (rrclr == "clr_1") {
        rrrclr = "tpos-border-risk-Green";
        bclr = "tpos-border-right-Green";
    }

    var myvar =
        '<div class="width-200  center centered "><div class="hide cdmRR">' +
        rr +
        '</div><div class="cell-cell ' +
        rrrclr +
        '">' +
        '                    <div class="cell-cell">Severity: ' +
        rrs +
        " - " +
        rrst +
        "</div>" +
        '                    <div class="cell-cell lg">' +
        tp +
        " risk: " +
        rrsct +
        " - " +
        rrsc +
        "</div>" +
        '                    <div class="cell-cell">Likelihood: ' +
        rrl +
        " - " +
        rrlt +
        "</div></div>";

    if (clr) {
        return bclr;
    } else {
        return myvar;
    }
}

function decodeCoordinates(str, uce, hid) {
    var strings = [];
    var eds = "";
    if (!str || str == "") {
        if (uce == 0) {
            return;
            //return "";
        } else {
            return '<div title="Manage coordinates"> + </div>';
        }
    } else {
        // if we get a string of coordinates
        strings = str.split("^");
        var t = "<tr><th>x</th><th>y</th><th>z</th></tr>";

        for (var i = 0; i < strings.length; i++) {
            var string = strings[i];
            var st = string.split(",");
            var x = st[0];
            var y = st[1];
            var z = st[2];

            if (string != "") {
                t +=
                    '<tr class="ctagtd"><td class="ctagtd">' +
                    x +
                    '</td><td class="ctagtd">' +
                    y +
                    '</td><td class="ctagtd">' +
                    z +
                    "</td></tr>";
            }
        }
        var ctags =
            '<table class="width-250 centered" title="Click to manage coordinates">' +
            t +
            '</table><div class="hide" id="h_' +
            hid +
            '_fullco">' +
            str +
            "</div>";
        return ctags;
    }
}

function printDate(role, username, date) {
    var td = getTimeDiff(date);
    var bgclr = 0;
    var clr = 255;
    var op = 1;
    var t = "";
    if (td < 24) {
        op = 1 - 0.04 * td;
        if (op < 0.5) {
            clr = 0;
        }
        t =
            '<div style="background-color:rgba(0,0,0,' +
            op +
            ");color:rgb(" +
            clr +
            "," +
            clr +
            "," +
            clr +
            ')">' +
            role +
            " " +
            ukdate(date) +
            " by " +
            username +
            "</div>";
    }
    if (td >= 24 && td < 48) {
        op = 1 - 0.04 * (td - 24);
        if (op < 0.5) {
            clr = 0;
        }
        t =
            '<div style="background-color:rgba(0,0,255,' +
            op +
            ");color:rgb(" +
            clr +
            "," +
            clr +
            "," +
            clr +
            ')">' +
            role +
            " " +
            ukdate(date) +
            " by " +
            username +
            "</div>";
    }
    if (td >= 48) {
        t = "<div >" + role + " " + ukdate(date) + " by " + username + "</div>";
    }

    return t;
}

function getTimeDiff(oldDate) {
    var newDate = new Date();
    var fromDate = parseInt(new Date(oldDate).getTime() / 1000);
    var toDate = parseInt(new Date(newDate).getTime() / 1000);
    var timeDiff = (toDate - fromDate) / 3600; // will give difference in hrs

    return Math.round(timeDiff, 0);
} 