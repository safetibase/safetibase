var flst = [];
var maindata = [];
function activateDatasets(cdmSites, allHazardsData) {
    //console.log("actdatasets",allHazardsData);
 maindata = allHazardsData;
    $(".dataset")
        .off("click")
        .on("click", function() {
            var hc = $(this).hasClass("active");
            $(".dataset").removeClass("active");
            $(".tpos-btn").removeClass("tpos-btn-active");
            // $('.add').addClass('tpos-btn-active');

            if (hc == 0) {
                var rid = $(this).attr("id");
                var trid = rid.split("_");
                var i = trid[1];
                // //console.log('ds test id: '+i);
                // //console.log(rid);
                $(this).addClass("active");
                var role = $("#" + rid + "_cdmUserRole").data("elementname");
                var comp = $("#" + rid + "_cdmCompany").data("elementname");
                var site = $("#" + rid + "_cdmSite").data("elementname");
                // toastr.success('getting user data');
                // //console.log('ds test role: '+role);
                setupuserstats(role, comp, site, allHazardsData);
                // main.setup_user(role,comp,site);
            }
            if (hc == 1) {
                // main.setup_welcome();
                setupmainareastats(null, cdmSites, allHazardsData);
                // toastr.success('back home');
            }
        });
    $(".add")
        .off("click")
        .on("click", function() {
            var hc = $(this).hasClass("tpos-btn-active");
            $(".dataset").removeClass("active");
            $(".tpos-btn").removeClass("tpos-btn-active");
            if (hc == 0) {
                $(".add").addClass("tpos-btn-active");
                setupnewhazard();
            }
            if (hc == 1) {
                $(this).removeClass("tpos-btn-active");
                setupmainareastats(null, cdmSites, allHazardsData);
            }
        });
    $(".xtrabtn")
        .off("click")
        .on("click", function() {
            
            var ulink = $(this).data('action');
            // window.location.href = 'https://tidewayeastlondon.sharepoint.com/sites/powerbi/SitePages/CDM-Risk-Register.aspx';
            // window.location.href = ulink;
            //window.open(ulink, '_blank');
            if (ulink == 'addfilters'){
                gimmepops("Filter selection pane",
          
                '<p style="color:white"><Strong>Note : <Strong> Filters will work only on Home Screen <p>'+
                '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>');
                $('#langOpt').multiselect({
                    columns: 1,
                    placeholder: 'Select Languages',
                    search: true,
                    selectAll: true
                });
                
                cdmdata.get("cdmhazards","",null,"frmsel_customfilters",null,null,[]);
                
            }
            if (ulink == 'synccsv') {
                var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle(%27cdmCompanies%27)/items?$select=ID,Title,cdmCompanyRole/Title&$expand=cdmCompanyRole/Title"
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Accept": "application/json; odata=verbose"
                    },
                    success: function(data) {
                        var Company_ID = null
                        for (var i = 0; i < data.d.results.length; i++) {
                            if (data.d.results[i].Title == configData['Client Name']) {
                                Company_ID = data.d.results[i].ID
                            }
                        }
                        if (Company_ID) {
                            console.log(Company_ID)
                            gimmepops(`Sync ${configData['Client Name']} CSV`,
                            '<div id="popscontentarea"><input id="csvFileInput" type="file" accept=".csv"/><input id="sync-hs2-hazards-btn" type="button" value="Sync"/></div>');
                            var csvFile = document.getElementById("csvFileInput");
                            readFile = function() {
                                var reader = new FileReader();
                                reader.onload = function() {
                                    rows = reader.result.split("\n");
                                    csvArray = [];
                                    syncedCounter = 0
                                    for (var row of rows) {
                                        csvArray.push(row.split(","));
                                    }
                                    for (var i = 1; i < csvArray.length; i++) {
                                        if (csvArray[i].length > 1) {
                                            hzd = csvArray[i][0];
                                            var status = csvArray[i][1];
                                            console.log(status)
                                            if (status.includes("Accepted")) {
                                                var tdata = ["cdmCurrentStatus|" + `Accepted by ${configData['Client Name']}`, "cdmHazardOwner|" + Company_ID];
                                            } else if (status.includes("Rejected")) {
                                                var tdata = ["cdmCurrentStatus|" + "Requires Mitigation"];
                                            } 
                                            console.log(tdata)
                                            cdmdata.update("cdmHazards", tdata);
                                            syncedCounter++
                                        }
                                    }
                                    toastr.success(`Synced ${syncedCounter} hazards`, {positionClass: "toast-top-right"});
                                }
                                reader.readAsBinaryString(csvFile.files[0]);
                            }
                            $("#sync-hs2-hazards-btn").on("click", readFile);
                        } else {
                            toastr.error(`Could not find ${configData['Client Name']} in cdmCompanies List.`)
                        }
                    },
                    error: function(error) {
                        //console.log(error);
                    }
                });
            }
            if (ulink == 'archivehazards') {
                const userRolesPreProcessing = $(".fld_cdmUserRoleTitle");
                const userRoles = [];
                for (let i=0; i<userRolesPreProcessing.length; i++) {
                    userRoles.push($(userRolesPreProcessing[i]).data('elementname'));
                }

                if (userRoles.some(role => configData['Archive risks permissions'].includes(role))) {
                    gimmepops("Archiving Hazards",
                    '<p style="color:white">Do you want to archive all hazards marked as "cancelled". This will remove these hazards from the app to the Sharepoint list "cdmHazardsArchived".<p>' +
                    '<div id="popscontentarea"><div id="archive-button" class="archive-button">Archive hazards</div></div>');

                    // Add an event listner to listen for clicks
                    document.getElementById('archive-button').addEventListener('click', () => {
                        toastr.warning('Archiving hazards...');
                        getCdmHazardsListItemsAndArchive();
                        closepops();
                    })
                } else {
                    toastr.error('You do not have the required permissions to archive hazards. Ask your system administrator to grant you further user roles or edit the config file.')
                }

                // Get all the list items and then filter for the ones thhat are cancelled. We have to it this way round (even though it makes no sense) because you can't filter by the required column
                const url = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmHazards%27)/items`;
                const response = [];
                function getCdmHazardsListItemsAndArchive() {
                    $.ajax({
                        url: url,
                        method: "GET",
                        headers: {
                            "Accept": "application/json; odata=verbose"
                        },
                        success: (data) => {
                            response.push(...data.d.results)
                            if(data.d.__next) {
                                url = data.d.__next;
                                getCdmHazardsListItems()
                            } else {
                                var successCounter = 0;
                                archiveHazards();
                                if (successCounter > 0) {
                                    toastr.success(`Successfully deleted ${successCounter} hazards`)
                                }
                            }
                        },
                        error: {
                            function(error) {}
                        }
                    })
                    return response
                }

                function archiveHazards() {
                    // Find the relevant hazards
                    const cdmHazardData = response;

                    // Loop over hazards to be archived and extract the relevant information
                    let hazardCounter = 0;
                    let succesfulArchives = 0;
                    const promises = [];
                    for (let i=0; i<cdmHazardData.length; i++) {
                        if (cdmHazardData[i].cdmUniclass == 'Cancelled') {
                            hazardCounter++;
                            const hazardData = [];
                            if (cdmHazardData[i].cdmCurrentStatus) hazardData.push(`cdmCurrentStatus|${cdmHazardData[i].cdmCurrentStatus}`);
                            if (cdmHazardData[i].cdmEntityTitle) hazardData.push(`cdmEntityTitle|${cdmHazardData[i].cdmEntityTitle}`);
                            if (cdmHazardData[i].cdmGeometry) hazardData.push(`cdmGeometry|${cdmHazardData[i].cdmGeometry}`);
                            if (cdmHazardData[i].cdmHazardCoordinates) hazardData.push(`cdmHazardCoordinates|${cdmHazardData[i].cdmHazardCoordinates}`);
                            if (cdmHazardData[i].cdmHazardDescription) hazardData.push(`cdmHazardDescription|${cdmHazardData[i].cdmHazardDescription}`);
                            if (cdmHazardData[i].cdmHazardOwnerId) hazardData.push(`cdmHazardOwner|${cdmHazardData[i].cdmHazardOwnerId}`);
                            if (cdmHazardData[i].cdmHazardTags) hazardData.push(`cdmHazardTags|${cdmHazardData[i].cdmHazardTags}`);
                            if (cdmHazardData[i].cdmHazardTypeId) hazardData.push(`cdmHazardType|${cdmHazardData[i].cdmHazardTypeId}`);
                            if (cdmHazardData[i].cdmIniRisk) hazardData.push(`cdmIniRisk|${cdmHazardData[i].cdmIniRisk}`);
                            if (cdmHazardData[i].cdmInitialRAG) hazardData.push(`cdmInitialRAG|${cdmHazardData[i].cdmInitialRAG}`);
                            if (cdmHazardData[i].cdmInitialRisk) hazardData.push(`cdmInitialRisk|${cdmHazardData[i].cdmInitialRisk}`);
                            if (cdmHazardData[i].cdmInitialRiskScore) hazardData.push(`cdmInitialRiskScore|${cdmHazardData[i].cdmInitialRiskScore}`);
                            if (cdmHazardData[i].cdmLastReviewDate) hazardData.push(`cdmLastReviewDate|${cdmHazardData[i].cdmLastReviewDate}`);
                            if (cdmHazardData[i].cdmLastReviewer) hazardData.push(`cdmLastReviewer|${cdmHazardData[i].cdmLastReviewer}`);
                            if (cdmHazardData[i].cdmLastReviewSnapShot) hazardData.push(`cdmLastReviewSnapshot|${cdmHazardData[i].cdmLastReviewSnapShot}`);
                            if (cdmHazardData[i].cdmLastReviewStatus) hazardData.push(`cdmLastReviewStatus|${cdmHazardData[i].cdmLastReviewStatus}`);
                            if (cdmHazardData[i].cdmLastReviewType) hazardData.push(`cdmLastReviewType|${cdmHazardData[i].cdmLastReviewType}`);
                            if (cdmHazardData[i].cdmMitigationDescription) hazardData.push(`cdmMitigationDescription|${cdmHazardData[i].cdmMitigationDescription}`);
                            if (cdmHazardData[i].cdmLinks) hazardData.push(`cdmLinks|${cdmHazardData[i].cdmLinks}`);
                            if (cdmHazardData[i].cdmParent) hazardData.push(`cdmParent|${cdmHazardData[i].cdmParent}`);
                            if (cdmHazardData[i].cdmPWElementId) hazardData.push(`cdmPWElement|${cdmHazardData[i].cdmPWElementId}`);
                            if (cdmHazardData[i].cdmPWStructureId) hazardData.push(`cdmPWStructure|${cdmHazardData[i].cdmPWStructureId}`);
                            if (cdmHazardData[i].cdmRAGSuggestion) hazardData.push(`cdmRAGSuggestion|${cdmHazardData[i].cdmRAGSuggestion}`);
                            if (cdmHazardData[i].cdmRAMS) hazardData.push(`cdmRAMS|${cdmHazardData[i].cdmRAMS}`);
                            if (cdmHazardData[i].cdmRelatedRAMS) hazardData.push(`cdmRelatedRAMS|${cdmHazardData[i].cdmRelatedRAMS}`);
                            if (cdmHazardData[i].cdmResidualRAG) hazardData.push(`cdmResidualRAG|${cdmHazardData[i].cdmResidualRAG}`);
                            if (cdmHazardData[i].cdmResidualRisk) hazardData.push(`cdmResidualRisk|${cdmHazardData[i].cdmResidualRisk}`);
                            if (cdmHazardData[i].cdmResidualRiskScore) hazardData.push(`cdmResidualRiskScore|${cdmHazardData[i].cdmResidualRiskScore}`);
                            if (cdmHazardData[i].cdmResRisk) hazardData.push(`cdmResRisk|${cdmHazardData[i].cdmResRisk}`);
                            if (cdmHazardData[i].cdmReviews) hazardData.push(`cdmReviews|${cdmHazardData[i].cdmReviews}`);
                            if (cdmHazardData[i].cdmRiskDescription) hazardData.push(`cdmRiskDescription|${cdmHazardData[i].cdmRiskDescription}`);
                            if (cdmHazardData[i].cdmSiblings) hazardData.push(`cdmSiblings|${cdmHazardData[i].cdmSiblings}`);
                            if (cdmHazardData[i].cdmSiteId) hazardData.push(`cdmSite|${cdmHazardData[i].cdmSiteId}`);
                            if (cdmHazardData[i].cdmStageId) hazardData.push(`cdmStage|${cdmHazardData[i].cdmStageId}`);
                            if (cdmHazardData[i].cdmSMMitigationSuggestion) hazardData.push(`cdmSMMitigationSuggestion|${cdmHazardData[i].cdmSMMitigationSuggestion}`);
                            if (cdmHazardData[i].cdmTW) hazardData.push(`cdmTW|${cdmHazardData[i].cdmTW}`);
                            if (cdmHazardData[i].cdmStageMitigationSuggestion) hazardData.push(`cdmStageMitigationSuggestion|${cdmHazardData[i].cdmStageMitigationSuggestion}`);
                            if (cdmHazardData[i].cdmUniclass) hazardData.push(`cdmUniclass|${cdmHazardData[i].cdmUniclass}`);
                            if (cdmHazardData[i].CurrentMitigationOwnerId)  hazardData.push(`CurrentMitigationOwner|${cdmHazardData[i].CurrentMitigationOwnerId}`);
                            if (cdmHazardData[i].CurrentReviewOwnerId) hazardData.push(`CurrentReviewOwner|${cdmHazardData[i].CurrentReviewOwnerId}`);
                            if (cdmHazardData[i].LegacyID) hazardData.push(`LegacyID|${cdmHazardData[i].LegacyID}`);
                            if (cdmHazardData[i].cdmhs2residualriskowner) hazardData.push(`cdmhs2residualriskowner|${cdmHazardData[i].cdmhs2residualriskowner}`);
                            if (cdmHazardData[i].cdmHS2RailSystemsContracts) (`cdmHS2RailSystemsContracts|${cdmHazardData[i].cdmHS2RailSystemsContracts}`);
                            if (cdmHazardData[i].cdmPASRiskClassification) hazardData.push(`cdmPASRiskClassification|${cdmHazardData[i].cdmPASRiskClassification}`);
                            if (cdmHazardData[i].cdmStageExtraId) hazardData.push(`cdmStageExtra|${cdmHazardData[i].cdmStageExtraId}`);
                            if (cdmHazardData[i].cdmResidualRiskOwner) hazardData.push(`cdmResidualRiskOwner|${cdmHazardData[i].cdmResidualRiskOwner}`);
                            if (cdmHazardData[i].cdmContract) hazardData.push(`cdmContract|${cdmHazardData[i].cdmContract}`);
                            if (cdmHazardData[i].ID) hazardData.push(`cdmHazardId|${cdmHazardData[i].ID}`);

                            // Create a promise to resolve later once the item has been archived
                            const deferred = new $.Deferred();
                            promises.push(deferred);

                            // Create the item in the archive list
                            const cdmHazardsArchived = list('cdmHazardsArchived');
                            const itemCreateInfo = new SP.ListItemCreationInformation();
                            let oListItem = cdmHazardsArchived.addItem(itemCreateInfo);

                            for (let j=0; j<hazardData.length; j++) {
                                const dataSplit = hazardData[j].split('|');
                                oListItem.set_item(dataSplit[0], dataSplit[1]);
                            }
                            oListItem.update();
                            ctx().load(oListItem);
                            ctx().executeQueryAsync(onSuccessfulCopy, onUnsuccessfulCopy);

                            function onSuccessfulCopy() {
                                // Delete the item in the original list
                                const cdmHazards = list('cdmHazards');
                                oListItem = cdmHazards.getItemById(cdmHazardData[i].ID);
                                oListItem.deleteObject();
                                ctx().executeQueryAsync(onSuccessfulDelete, onUnsuccessfulDelete);
                            }
            
                            function onUnsuccessfulCopy() {
                                toastr.error(`Could not archive hazard with id ${cdmHazardData[i].ID}`);
                                deferred.resolve(true);
                            }

                            function onSuccessfulDelete() {
                                succesfulArchives++;
                                deferred.resolve(true);
                            }

                            function onUnsuccessfulDelete() {
                                toastr.error(`The hazard with id ${cdmHazardData[i].ID} has been copied to the cdmHazardArchived list, but it could not be deleted`);
                                deferred.resolve('true');
                            }
                        }
                    }
                    
                    // Wait for all promises to resolve and then give success message
                    $.when(...promises)
                        .then(() => {
                            if (promises.length > 0) {
                                toastr.success(`Successfully archived ${succesfulArchives} hazard(s). Refresh the hazards to see the latest updates.`);
                            }
                        })
                    
                    if (hazardCounter == 0) {
                        toastr.error('There are no hazards to archive. To mark a hazard as ready to be archived change its status to "Cancelled".')
                    }
                }
            }
            
        });

    $(".edit")
        .off("click")
        .on("click", function() {
            var hc = $(this).hasClass("tpos-btn-active");
            $(".dataset").removeClass("active");
            $(".tpos-btn").removeClass("tpos-btn-active");
            if (hc == 0) {
                $(".edit").addClass("tpos-btn-active");
                setupEditableHazards(allHazardsData);
            }
            if (hc == 1) {
                $(this).removeClass("tpos-btn-active");
                setupmainareastats(null, cdmSites, allHazardsData);
            }
        });
    $(".review")
        .off("click")
        .on("click", function() {
            var hc = $(this).hasClass("tpos-btn-active");
            $(".dataset").removeClass("active");
            var action = $(this).data("action");
            toastr.success(action);
            $(".tpos-btn").removeClass("tpos-btn-active");
            if (hc == 0) {
                $(this).addClass("tpos-btn-active");
                setupReviewableHazards(action, allHazardsData);
            }
            if (hc == 1) {
                $(this).removeClass("tpos-btn-active");
                setupmainareastats(null, cdmSites, allHazardsData);
            }
        });
}

function activateGlobalNav(cdmSites, allHazardsData) {
    $(".tgn-btn")
        .off("click")
        .on("click", function() {
            var action = $(this).data("action");
            $(".dataset").removeClass("active");
            if (action == "init") {
                setupmainareastats(null, cdmSites, allHazardsData);
            }
            if (action == "systemstats") {
                setupsystemstats();
            }
        });
    $(".tgn-btn-xtra").mouseover(function() {
        var action = $(this).data("action");
        if (action == "dynamicstats") {
            gimmesubs("", "this is DYNAMIC STATS");
        }
        if (action == "test1stats") {
            gimmesubs("", "this is TEST CONTENT 1");
        }
    });
}

function activateHazardOwnerEdit() {
    $(".cell-ownereditable")
        .off("click")
        .on("click", function() {
            var ii = $(this).attr("id");
            var ia = ii.split("_");
            var id = ia[1];
            var is = ia[2];
        });
}
var hzd = 0;
// function setUAID(k){
//     //alert(k);

//     cdmdata.get(
//         "cdmPWStructures",
//         "ID eq '" + k + "'",
//         null,
//         "frmsel_UAID"
//     );
// }
function activateHazardEdits() {
    $(".cell")
        .off("click")
        .on("click", function() {
            var ucanedit = 0;
            var ucanpeerreview = 0;
            var ucandmreview = 0;
            var ucanprecon = 0;
            var ucansmreview = 0;
            var ucanldreview = 0;
            toastr.warning('registered');

            var hi = $(this)
                .parents(".row-hazard")
                .attr("id");
            var hia = hi.split("_");
            var id = hia[1];
            hzd = id;
            var hc = $("#" + hi + " .row-header").html();
            var o = $("#" + hi + " .cdmHazardOwner").html();
            var s = $("#" + hi + " .cdmSite").html();
            var stage = $("#" + hi + " .cdmStageExtra").html();
            var lastrevstatus = $("#" + hi + " .cdmLastReviewStatus").html();
            var revstatus = $("#" + hi + " .cdmCurrentStatus").html();
            // var mitigationowner=$('#'+hi+' .CurrentMitigationOwner').html();
            // var reviewowner=$('#'+hi+' .CurrentReviewOwner').html();
            var flds;
            var fld = "";
            var uce = $("#" + hi + " .uce").hasClass("_1");
            
            const userRoles = $(".fld_cdmUserRoleTitle");
            const userSites = $(".fld_cdmSiteTitle");
            const userRolesSites = [];
            for (let i=0; i<userRoles.length; i++) {
                userRolesSites.push([
                    $(userRoles[i]).data("elementname"),
                    $(userSites[i]).data("elementname"),
                ])
            }

            if (o == '<span class="clr_5">Unassigned</span>') {
                var warning =
                    '<div class="clr_5_active">Before the hazard can be edited and mitigated, an owner has to be assigned.</div>';
                gimmepops(
                    "Assigning an owner",
                    warning +
                    '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                );

                if (hc == "RAMS hazard") {
                    cdmdata.get(
                        "cdmCompanies",
                        "cdmCompanyRole/Title eq 'Sub contractor'",
                        null,
                        "frmsel_owner",
                        hc,null,[]
                    );
                } else {
                    cdmdata.get(
                        "cdmCompanies",
                        "cdmCompanyRole/Title eq 'Design house'",
                        null,
                        "frmsel_owner",
                        hc,null,[]
                    );
                }
            } else {
                flds = $(this)
                    .attr("class")
                    .split(" ");
                for (var cc = 0; cc < flds.length; cc++) {
                    var tst = flds[cc].substring(0, 3);
                    if (tst == "cdm") {
                        fld = flds[cc];
                    }
                }
                if (fld == "cdmResidualRiskOwner") {
                    gimmepops(
                        "Assigning a Residual Risk Owner",
                        '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                    );
                    cdmdata.get("cdmResidualRiskOwners", "", null, "frmsel_ResidualRiskOwner", hc,null,[]);
                }
                else if (!uce) {
                    const peerReviewStage = $("#" + hi + " .rucp").hasClass('_3');
                    const designManagerReviewStage = $("#" + hi + " .rucd").hasClass('_3');
                    const preconstructionReviewStage = $("#" + hi + " .rucpc").hasClass('_3');
                    const principleDesignerReviewStage = $("#" + hi + " .rucl").hasClass('_3');
                    const constructionManagerReviewStage = $("#" + hi + " .rucs").hasClass('_3');
                    
                    if (peerReviewStage) {
                        const canPeerReview = $("#" + hi + " .ucp").hasClass("_1");
                        if (canPeerReview) {
                            toastr.error('This hazard is under peer review so is locked for editing. Please review this hazard before editing.');
                        } else {
                            toastr.error('This hazard is under peer review so is locked for editing. Contact a designer to complete the review.');
                        }
                    } else if (designManagerReviewStage) {
                        const canDesignManagerReview = $("#" + hi + " .ucd").hasClass("_1");
                        if (canDesignManagerReview) {
                            toastr.error('This hazard is under design manager review so is locked for editing. Please review this hazard before editing.');
                        } else {
                            toastr.error('This hazard is under design manager review so is locked for editing. Contact a designer manager to complete the review.');
                        }
                    } else if (preconstructionReviewStage) {
                        const canPreconstructionReview = $("#" + hi + " .ucpc").hasClass("_1");
                        if (canPreconstructionReview) {
                            toastr.error('This hazard is under pre-construction review so is locked for editing. Please review this hazard before editing.');
                        } else {
                            toastr.error('This hazard is under pre-construction review so is locked for editing. Contact a construction manager to complete the review.');
                        }
                    } else if (principleDesignerReviewStage) {
                        const canPrincipleDesignerReview = $("#" + hi + " .ucl").hasClass("_1");
                        if (canPrincipleDesignerReview) {
                            toastr.error('This hazard is under principal designer review so is locked for editing. Please review this hazard before editing.');
                        } else {
                            toastr.error('This hazard is under principal designer review so is locked for editing. Contact a principal designer to complete the review.');
                        }
                    } else if (constructionManagerReviewStage) {
                        const canConstructionManagerReview = $("#" + hi + " .ucs").hasClass("_1");
                        if (canConstructionManagerReview) {
                            toastr.error('This hazard is under construction manager review so is locked for editing. Please review this hazard before editing.');
                        } else {
                            toastr.error('This hazard is under construction manager review so is locked for editing. Contact a construction manager to complete the review.');
                        }
                    } else if (revstatus == 'Accepted') {
                        toastr.error('This hazard has been accepted so is locked for editing. If necessary you can submit this hazard for client review.')
                    } else if (revstatus == 'Ready for Review by Client') {
                        toastr.error('This hazard is under client review so is locked for editing.');
                    } else if (userRoles.length == 0) {
                        toastr.error('You do not have a user role assigned so you cannot edit hazards. Ask your system administrator to add you to the system.')
                    } else {
                        toastr.error("Not permitted");
                    }
                } else {
                    if (fld == "cdmUniclass") {
                        gimmepops(
                            "Assigning a status",
                            '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                        );
                        cdmdata.get("cdmStatus", "", null, "frmsel_utag", hc,null,[]);
                    }
                    if (fld == "cdmPASRiskClassification") {
                        gimmepops(
                            "Assigning PAS 1192:6 Risk Classification",
                            '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                        );
                        cdmdata.get("cdmPASRiskClassification", "", null, "frmsel_PASRiskClassification", hc,null,[]);
                    }
                    if (fld == "cdmContract") {
                        gimmepops(
                            "Assigning a future works contract",
                            '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                        );
                        cdmdata.get("cdmContracts", "", null, "frmsel_Contract", hc,null,[]);
                    }
                    if (fld == "cdmPWElement") {
                        gimmepops(
                            "Assigning an element",
                            '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                        );
                        cdmdata.get("cdmPWElementTerms", "", null, "frmsel_element", hc,null,[]);
                    }
                    if (fld == "cdmHazardDescription") {
                        var existingTxt = $("#" + hi + " .cdmHazardDescription").html();
                        var txtbox =
                            '<div><textarea id="txtform" rows="6" cols="60">' +
                            existingTxt +
                            "</textarea></div>";
                        var svBtn =
                            '<div class="tpos-left-btn sv-hazard" onclick="savetxt(\'cdmHazardDescription\');">Save</div>';
                        gimmepops(
                            "Describing the hazard",
                            '<div class="clr_3_active">A hazard is something with the potential to cause harm</div>' +
                            txtbox +
                            svBtn
                        );
                    }
                    if (fld == "cdmRiskDescription") {
                        var existingTxt = $("#" + hi + " .cdmRiskDescription").html();
                        var txtbox =
                            '<div><textarea id="txtform" rows="6" cols="60">' +
                            existingTxt +
                            "</textarea></div>";
                        var svBtn =
                            '<div class="tpos-left-btn sv-hazard" onclick="savetxt(\'cdmRiskDescription\');">Save</div>';
                        gimmepops(
                            "Describing the risk",
                            '<div class="clr_3_active">What harm could be caused to whom or what?</div>' +
                            txtbox +
                            svBtn
                        );
                    }

                    if (fld == "cdmMitigationDescription") {
                        var existingTxt = $("#" + hi + " .cdmMitigationDescription").html();
                        var txtbox =
                            '<div><textarea id="txtform" rows="6" cols="60">' +
                            existingTxt +
                            "</textarea></div>";
                        var svBtn =
                            '<div class="tpos-left-btn sv-hazard" onclick="savetxt(\'cdmMitigationDescription\');">Save</div>';
                        gimmepops(
                            "Our mitigation",
                            '<div class="clr_3_active">Completed actions to minimise the risks</div>' +
                            txtbox +
                            svBtn
                        );
                    }
                    if (fld == "cdmStageMitigationSuggestion" && hc != "RAMS hazard") {
                        var existingTxt = $(
                            "#" + hi + " .cdmStageMitigationSuggestion"
                        ).html();
                        var txtbox =
                            '<div><textarea id="txtform" rows="6" cols="60">' +
                            existingTxt +
                            "</textarea></div>";
                        var svBtn =
                            '<div class="tpos-left-btn sv-hazard" onclick="savetxt(\'cdmStageMitigationSuggestion\');">Save</div>';
                        gimmepops(
                            "Your mitigation suggestion for " + stage,
                            '<div class="clr_3_active">Suggested actions to minimise the risks</div>' +
                            txtbox +
                            svBtn
                        );
                    }
                    // To edit the smmitigation we need to test that the user is a site manager of the current site
                    let canSiteManagerEdit = false;
                    for (let i=0; i<userRolesSites.length; i++) {
                        if (userRolesSites[i][0] == 'Construction Manager' && userRolesSites[i][1] == s) {
                            canSiteManagerEdit = true;
                        }
                    }
                    if (fld == "cdmSMMitigationSuggestion" && canSiteManagerEdit) {
                        var existingTxt = $(
                            "#" + hi + " .cdmSMMitigationSuggestion"
                        ).html();
                        var txtbox =
                            '<div><textarea id="txtform" rows="6" cols="60">' +
                            existingTxt +
                            "</textarea></div>";
                        var svBtn =
                            '<div class="tpos-left-btn sv-hazard" onclick="savetxt(\'cdmSMMitigationSuggestion\');">Save</div>';
                        gimmepops(
                            "Your mitigation suggestion for " + stage,
                            '<div class="clr_3_active">Suggested actions to minimise the risks</div>' +
                            txtbox +
                            svBtn
                        );
                    }
                    if (fld == "cdmInitialRAG" || fld == "cdmResidualRAG") {
                        var rags = '<div id="rags"></div>';
                        gimmepops(
                            "Assessing and applying project controls - Initial control",
                            '<div class="clr_3_active">Search for, select or suggest a project control applicable to the hazard / risk</div>' +
                            rags,
                            "pops-fullscreen"
                        );
                        $("#rags").load("../3.0/html/rag.tables.html", function() {
                            getJsonFromTxt("rag.txt").done(function(data) {
                                //data=JSON.parse(data);
                                var cnt = data.length;
                                var reda = "";
                                var amba = "";
                                var grea = "";
                                var btns = [];
                                //toastr.success(cnt);
                                for (var cc = 0; cc < cnt; cc++) {
                                    var t = data[cc].RAG;
                                    var s = data[cc].Colour;
                                    var d = data[cc].RAGStatement;
                                    var tds =
                                        '<td><div class="padded">' +
                                        t +
                                        '</div></td><td><div class="padded">' +
                                        d +
                                        "</div></td>";
                                    if (s == "Red") {
                                        reda =
                                            '<tr class="rag rag-red" data-v="' +
                                            cc +
                                            '"><td>' +
                                            tds +
                                            "</tr>";
                                        $("#ragdatared").append(reda);
                                    }
                                    if (s == "Amber") {
                                        amba =
                                            '<tr class="rag rag-amber" data-v="' +
                                            cc +
                                            '"><td>' +
                                            tds +
                                            "</tr>";
                                        $("#ragdataamber").append(amba);
                                    }
                                    if (s == "Green") {
                                        grea =
                                            '<tr class="rag rag-green" data-v="' +
                                            cc +
                                            '"><td>' +
                                            tds +
                                            "</tr>";
                                        $("#ragdatagreen").append(grea);
                                    }
                                    btns.push([t, s, d]);
                                }
                                $(".sk-circle").hide();
                                $(".rag").click(function() {
                                    var v = $(this).data("v");
                                    ////console.log(v);
                                    var trm = btns[v];
                                    var val = trm[0] + "^" + trm[2] + "^" + trm[1];
                                    var tdata = [];
                                    tdata.push(fld + "|" + val);
                                    cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                    $("#pops").remove();
                                });
                                $(".svrag").click(function() {
                                    var sggid = $(this).attr("id");
                                    var clr = $("#ragclr").val();
                                    var sgg = $("#ragsuggestion").val();
                                    if (sggid == "ragu") {
                                        if (clr == "none" || sgg == "" || sgg == null) {
                                            toastr.error("Please provide a colour and a suggestion");
                                        }
                                        if (clr != "none" && sgg != "") {
                                            var tdata = [];
                                            tdata.push(
                                                fld + "|" + "RAGSG" + hzd + "^" + sgg + "^" + clr
                                            );
                                            cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                            $("#pops").remove();
                                        }
                                    } else {
                                        var tdata = [];
                                        tdata.push(
                                            fld +
                                            "|" +
                                            "None^No applicable project control found^NONE"
                                        );
                                        tdata.push("cdmCurrentStatus|Assessment in progress");
                                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                        $("#pops").remove();
                                    }
                                });
                            });
                        });

                        // $('#pops').css('min-height','250px');
                    }
                    if (fld == "cdmInitialRisk" || fld == "cdmResidualRisk") {
                        gimmepops("Setting the risk score", '<div id="rsselector"></div>');
                        $("#rsselector").load(
                            "../3.0/html/risk.selection.panel.html",
                            function() {
                                $("#inirisk").append(
                                    '<div class="tpos-left-btn sv-hazard" onclick="saversk(\'' +
                                    fld +
                                    "');\">Save</div>"
                                );
                            }
                        );
                    }
                    if (fld == "cdmHazardType") {
                        var cv = $(this).html();
                        var tdata = [];
                        if (cv == "Health") {
                            tdata.push("cdmHazardType|2");
                        } else {
                            tdata.push("cdmHazardType|1");
                        }
                        tdata.push("cdmCurrentStatus|Assessment in progress");
                        toastr.success("Switching hazard type");
                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                        $("#pops").remove();
                    }
                    if (fld == "cdmHazardCoordinates") {
                        var str = $("#h_" + hzd + "_fullco").html();
                        var coordinates = [];
                        if (str) {
                            coordinates = str.split("^");
                        }
                        var cd = "";
                        for (var cc = 0; cc < coordinates.length; cc++) {
                            cd += decCTag(cc, coordinates[cc]);
                        }
                        var cdtbl =
                            '<table id="newcoordinates" class="width-350">' +
                            cd +
                            '<tr class="ctagnew"><td><input style="color:rgb(0,0,0)" type="number" id="nx" placeholder="x" ></td><td><input style="color:rgb(0,0,0)" type="number" id="ny" placeholder="y" ></td><td><input style="color:rgb(0,0,0)" type="number" id="nz" placeholder="z" ></td><td><div class="tpos-addbtn">+</div></td></tr><tr><td colspan="4"><div class="tpos-svbtn">Save and Close</div></td></tr></table>';

                        // var ctags=getctags(str);
                        gimmepops("Managing coordinates", cdtbl);
                        var na = [];
                        $(".tpos-delbtn")
                            .off("click")
                            .on("click", function() {
                                // var na=[];
                                coordinates = [];
                                var rid = $(this)
                                    .attr("id")
                                    .substring(5);
                                var delrow = $("#ctagrow_" + rid);
                                delrow.remove();
                                var keeprow = $(".tpos-delbtn");
                                keeprow.each(function() {
                                    coordinates.push($(this).data("ctag"));
                                });
                                // //console.log(coordinates);
                            });
                        $(".tpos-addbtn")
                            .off("click")
                            .on("click", function() {
                                var x = $("#nx").val();
                                var y = $("#ny").val();
                                var z = $("#nz").val();
                                if (!x || !y || !z) {}
                                else{
                                    var xyz = x + "," + y + "," + z;
                                    coordinates.push(xyz);
                                    var dd = "";
                                    // //console.log(coordinates);
                                    for (var cc = 0; cc < coordinates.length; cc++) {
                                        dd += decCTag(cc, coordinates[cc]);
                                    }

                                    var cdtbl =
                                        '<table id="newcoordinates" class="width-350">' +
                                        dd +
                                        '<tr class="ctagnew"><td><input style="color:rgb(0,0,0)" type="number" id="nx" placeholder="x" ></td><td><input style="color:rgb(0,0,0)" type="number" id="ny" placeholder="y" ></td><td><input style="color:rgb(0,0,0)" type="number" id="nz" placeholder="z" ></td><td><div class="tpos-addbtn">+</div></td></tr><tr><td colspan="4"><div class="tpos-svbtn">Save and Close</div></td></tr></table>';
                                    $("#newcoordinates").replaceWith(cdtbl);
                                    $(".tpos-svbtn")
                                        .off("click")
                                        .on("click", function() {
                                            var savecoordinates = "";
                                            for (var ff = 0; ff < coordinates.length; ff++) {
                                                if (ff == 0) {
                                                    savecoordinates = coordinates[ff];
                                                } else {
                                                    savecoordinates += "^" + coordinates[ff];
                                                }
                                            }
                                            var tdata = [];
                                            tdata.push("cdmHazardCoordinates|" + savecoordinates);
                                            cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                            $("#pops").remove();
                                        });
                            }});
                        $(".tpos-svbtn")
                            .off("click")
                            .on("click", function() {
                                var savecoordinates = "";
                                for (var ff = 0; ff < coordinates.length; ff++) {
                                    if (ff == 0) {
                                        savecoordinates = coordinates[ff];
                                    } else {
                                        savecoordinates += "^" + coordinates[ff];
                                    }
                                }
                                var tdata = [];
                                tdata.push("cdmHazardCoordinates|" + savecoordinates);
                                cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                $("#pops").remove();
                            });
                        // activateCoordinatesSave();
                    }
                    if (fld == "cdmHazardTags") {
                        gimmepops(
                            "Assigning a hazard tag",
                            '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                        );
                        cdmdata.get("cdmTags", "", null, "frmsel_htag", hc,null,[]);
                    }
                    if (fld == "cdmLinks") {
                        var existingTxt = $("#" + hi + " .cdmLinks").html();
                        var txtbox =
                        '<div><textarea id="txtform" rows="6" cols="60">' +
                        existingTxt +
                        "</textarea></div>";
                        var svBtn =
                        '<div class="tpos-left-btn sv-hazard" onclick="savetxt(\'cdmLinks\');">Save</div>';
                        gimmepops(
                        "Associated Links",
                        txtbox +
                        svBtn
                        );
                    }
                    // if (fld == "cdmUniclass") {
                    //     gimmepops(
                    //         "Assigning a status",
                    //         '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                    //     );
                    //     cdmdata.get("cdmStatus", "", null, "frmsel_utag", hc);
                    // }
                }
            }

            // if(is='cdmHazardOwner'){
            //     gimmepops('Assigning an owner');
            // }else{

            // }
        });

}

function activateRAMSBtn() {
    // toastr.error('what is this?');
    // $('.mkramsbtn').off('click').on('click',function(){
    $('.mkramsbtn').on('click', function() {
        var a = $(this).data("action");
        var hi = $(this)
            // .parents(".row-hazard")
            .attr("id");
        var hia = hi.split("_");
        var id = hia[1];
        // toastr.success("what???: " + id);
        hzd = id;
        var hist = "";
        var nd = new Date();
        var nnd = ukdate(nd);
        var ind = isodate(nd);
        //   toastr.success(nnd);
        var user = unm();
        var nl = "";
        var vn = $("#h_" + hzd + " .cdmSite").html();
        toastr.success('action: ' + a + ' id: ' + hzd);
        var tdata = [];

        var ht = "#h_" + hzd + " ";
        var hz = $("#h_" + hzd + " .cdmHazardDescription").html();
        var rs = $("#h_" + hzd + " .cdmRiskDescription").html();
        var risks = $(ht + ".cdmRR").html();
        var dasite = $(ht + ".cdmSite").data("siteid");
        var trisks = risks.split("-");
        var riskscoreval = trisks[0];
        var rscv = parseInt(riskscoreval, 10);

        var title1 = new Date();
        //var title2=uid();
        var title10 =
            title1.getTime() +
            "^" +
            title1.getDate() +
            "^" +
            title1.getMonth() +
            1 +
            "^" +
            title1.getFullYear();
        var title = title10.toString() + "^" + uid();
        var ms = "Awaiting mitigation";
        var stmsugg = $(
            ht + ".cdmStageMitigationSuggestion"
        ).html();
        var stg = $(ht + ".cdmStageExtra").html();
        var stgi = 1;
        if (stg != "Construction") {
            stgi = 2;
        }
        var hzt = $(ht + ".cdmType").html();
        var hzti = 2;
        if (hzt == "Health") {
            hzti = 1;
        }
        // base array for any new rams hazard

        tdata.push("Title|" + title);
        tdata.push("cdmSiblings|" + title);
        tdata.push("cdmParent|" + hzd);
        tdata.push("cdmHazardDescription|" + hz);
        tdata.push("cdmRiskDescription|" + rs);
        tdata.push("cdmMitigationDescription|" + ms);
        tdata.push("cdmSite|" + dasite);
        tdata.push("cdmInitialRisk|" + risks);
        tdata.push("cdmResidualRisk|" + risks);
        tdata.push("cdmHazardType|" + hzti);
        tdata.push("cdmInitialRiskScore|" + rscv);
        tdata.push("cdmResidualRiskScore|" + rscv);
        tdata.push("cdmStageExtra|" + stgi);
        // tdata.push('cdmIniRisk|'+$('#inirisk').prop('outerHTML'));
        // tdata.push('cdmResRisk|'+$('#inirisk').prop('outerHTML'));
        tdata.push("cdmStageMitigationSuggestion|" + stmsugg);
        var screen = $('#tpos-main').html();
        $('#tpos-main').html('');
        // $('.dataset').removeClass('active');
        $('#stats').remove();
        $('#systemstats').remove();
        $('#userstats').remove();
        // var newmain='<div class="tpos-main" id="tpos-main"></div>';
        // $('.tpos-body').prepend(newmain);

        $('#tpos-main').html('<div class="tpos-area-title">RAMS results for hazard: ' + hzd + '</div><div id="ramsresults" class="tpos-area-content"></div><div class="clsbtn">Close</div>');
        var utbl = '<div class="row"><div id="hazardstable"></div></div>';
        var ramsfrm = '<div class="row"><div id="ramsfrm"></div></div>';
        var datapack = '<div id="parentdata" data-parent="' + tdata + '"></div>';
        $('#ramsresults').html(ramsfrm + utbl + datapack);
        cdmdata.get(
            "cdmHazards",
            'cdmParent eq ' + hzd,
            "Modified desc",
            "hazards-table-rams",
            "hazardstable",null,[]
        );

        $('.clsbtn').click(function() {
            $('#tpos-main').html('');
            $('#tpos-main').html(screen);
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


        });



        if (a === 'mkrams') {
            // $('#ramsfrm').load('../3.0/html/rams.adder.html',function(){
            // $("#addramsbtn").hide();
            $('#ramsfrm').html(
                '<div><p>As the Construction Manager undertaking the Pre-Construction Review, you can link this hazard to RAMS documents. The system then generates RAMS hazards which can be independently reviewed and mitigated by the construction team.</p><p>Note that you can add several RAMS hazards; just select another hazard after clicking the Create button.</p></div>' +
                '<div><textarea id="smmsgg" rows="3" cols="35" placeholder="Enter Construction Manager mitigation suggestion?"></textarea></div>' +
                '<div class="select-panel" id="rams"><div class="tpos-lbl">Search for a RAMS</div><div class="tpos-select" id="div_sel_rams"></div></div><div id="rmsbutton" class="row content"><div id="addramsbtn" class="tpos-svramsbtn">Create RAMS Hazard</div></div>'
            );
            jsonRAMS.get("rams", vn, "sel_rams");
            $('#addramsbtn').click(function() {
                var nrdata = [];
                // var tdata=$('#parentdata').data('parent');
                for (var cc = 0; cc < tdata.length; cc++) {
                    nrdata.push(tdata[cc]);
                }
                var mits = $("#smmsgg").val();
                if (!mits) {
                    toastr.error(
                        "Please enter a mitigation suggestion first"
                    );
                } else {

                    var raid = $("#val_rams").html();
                    var ratx = $("#sel_rams").val();
                    if (raid && ratx) {
                        nrdata.push("cdmSMMitigationSuggestion|" + mits);
                        nrdata.push("cdmRAMS|" + raid);
                        nrdata.push("cdmEntityTitle|" + ratx);

                        // $('#ramssummary').html(nrdata);
                        $("#val_rams").html('');
                        $("#sel_rams").val('');
                        $("#addramsbtn").hide();
                        tposdata.setRAMS("cdmHazards", nrdata, hzd);
                    }

                }

            });

        }

    });

}

function activateADDRAMSBTN() {
    // $('#rmsbutton').html('<div id="addramsbtn" class="tpos-svramsbtn">Create RAMS Hazard</div>');
    $('#addramsbtn').click(function() {
        var nrdata = [];
        var tdata=$('#parentdata').data('parent');
        for (var cc = 0; cc < tdata.length; cc++) {
            nrdata.push(tdata[cc]);
        }
        var mits = $("#smmsgg").val();
        if (!mits) {
            toastr.error(
                "Please enter a mitigation suggestion first"
            );
        } else {

            var raid = $("#val_rams").html();
            var ratx = $("#sel_rams").val();
            //console.log("RAID::: " + raid);
            //console.log("RATX::: " + ratx);
            if (raid && ratx) {
                //console.log("Missing Information");
                nrdata.push("cdmSMMitigationSuggestion|" + mits);
                nrdata.push("cdmRAMS|" + raid);
                nrdata.push("cdmEntityTitle|" + ratx);

                // $('#ramssummary').html(nrdata);
                $("#val_rams").html('');
                $("#sel_rams").val('');
                $("#addramsbtn").hide();
                tposdata.setRAMS("cdmHazards", nrdata, hzd);
            }

        }

    });

}

function activateRAMSActions() {
    //console.log('rams actions activated');
    $('.mkramsbtn').click(function() {
        var a = $(this).data("action");
        var hi = $(this)
            // .parents(".row-hazard")
            .attr("id");
        var hia = hi.split("_");
        var id = hia[1];
        //   toastr.success("what???: " + id);

        hzd = id;
        //console.log('rams actions activated for ' + hzd);
        var hist = "";
        var nd = new Date();
        var nnd = ukdate(nd);
        var ind = isodate(nd);
        //   toastr.success(nnd);
        var user = unm();
        var nl = "";
        var vn = $("#h_" + hzd + " .cdmSite").html();
        toastr.success('action: ' + a + ' id: ' + hzd);
        var tdata = [];

        var ht = "#h_" + hzd + " ";
        var hz = $("#h_" + hzd + " .cdmHazardDescription").html();
        var rs = $("#h_" + hzd + " .cdmRiskDescription").html();
        var risks = $(ht + ".cdmRR").html();
        var dasite = $(ht + ".cdmSite").data("siteid");
        var trisks = risks.split("-");
        var riskscoreval = trisks[0];
        var rscv = parseInt(riskscoreval, 10);

        var title1 = new Date();
        //var title2=uid();
        var title10 =
            title1.getTime() +
            "^" +
            title1.getDate() +
            "^" +
            title1.getMonth() +
            1 +
            "^" +
            title1.getFullYear();
        var title = title10.toString() + "^" + uid();
        var ms = "Awaiting mitigation";
        var stmsugg = $(
            ht + ".cdmStageMitigationSuggestion"
        ).html();
        var stg = $(ht + ".cdmStageExtra").html();
        var stgi = 1;
        if (stg != "Construction") {
            stgi = 2;
        }
        var hzt = $(ht + ".cdmType").html();
        var hzti = 2;
        if (hzt == "Health") {
            hzti = 1;
        }
        // base array for any new rams hazard

        tdata.push("Title|" + title);
        tdata.push("cdmSiblings|" + title);
        tdata.push("cdmParent|" + hzd);
        tdata.push("cdmHazardDescription|" + hz);
        tdata.push("cdmRiskDescription|" + rs);
        tdata.push("cdmMitigationDescription|" + ms);
        tdata.push("cdmSite|" + dasite);
        tdata.push("cdmInitialRisk|" + risks);
        tdata.push("cdmResidualRisk|" + risks);
        tdata.push("cdmHazardType|" + hzti);
        tdata.push("cdmInitialRiskScore|" + rscv);
        tdata.push("cdmResidualRiskScore|" + rscv);
        tdata.push("cdmStageExtra|" + stgi);
        // tdata.push('cdmIniRisk|'+$('#inirisk').prop('outerHTML'));
        // tdata.push('cdmResRisk|'+$('#inirisk').prop('outerHTML'));
        tdata.push("cdmStageMitigationSuggestion|" + stmsugg);

        $('#tpos-main').html('');
        // $('.dataset').removeClass('active');
        $('#stats').remove();
        $('#systemstats').remove();
        $('#userstats').remove();
        // var newmain='<div class="tpos-main" id="tpos-main"></div>';
        // $('.tpos-body').prepend(newmain);

        $('#tpos-main').html('<div class="tpos-area-title">RAMS results for hazard: ' + hzd + '</div><div id="ramsresults" class="tpos-area-content"></div>');
        var utbl = '<div class="row"><div id="hazardstable"></div></div>';
        var ramsfrm = '<div class="row"><div id="ramsfrm"></div></div>';
        $('#ramsresults').html(ramsfrm + utbl);
        if (a === 'mkrams') {
            $('#ramsfrm').load('../3.0/html/rams.adder.html', function() {
                // $("#addramsbtn").hide();
                jsonRAMS.get("rams", vn, "sel_rams");
            });
        }
        // cdmdata.getQuickCount('cdmHazards',1,'cdmParent eq '+hzd,'Associated RAMS hazards','parentmatch','blue',null);
        cdmdata.get(
            "cdmHazards",
            'cdmParent eq ' + hzd,
            "Modified desc",
            "hazards-table",
            "hazardstable",null,[]
        );



        // new form and new 

    });
}

// function activateCoordinatesActions(){
//     coordinates=[];
//     $('.tpos-delbtn').off('click').on('click',function(){
//         // var na=[];

//         var rid=$(this).attr('id').substring(5);
//         var delrow=$('#ctagrow_'+rid);
//         delrow.remove();
//         var keeprow=$('.tpos-delbtn');
//         keeprow.each(function(){
//             coordinates.push($(this).data('ctag'));
//         });
//         // //console.log(coordinates);
//     });
//     $('.tpos-addbtn').off('click').on('click',function(){
//         var x=$('#nx').val();
//         var y=$('#ny').val();
//         var z=$('#nz').val();
//         var xyz=x+','+y+','+z;
//         coordinates.push(xyz);
//         var dd='';
//         // //console.log(coordinates);
//         for(var cc=0;cc<coordinates.length;cc++){
//             dd+=decCTag(cc,coordinates[cc]);
//         }

//         var cdtbl='<table id="newcoordinates" class="width-350">'+dd+'<tr class="ctagnew"><td><input style="color:rgb(0,0,0)" type="number" id="nx" placeholder="x" ></td><td><input style="color:rgb(0,0,0)" type="number" id="ny" placeholder="y" ></td><td><input style="color:rgb(0,0,0)" type="number" id="nz" placeholder="z" ></td><td><div class="tpos-addbtn">+</div></td></tr><tr><td colspan="4"><div class="tpos-svbtn">Save and Close</div></td></tr></table>';
//         $('#newcoordinates').replaceWith(cdtbl);
//         // savecoordinates();
//     });
//     $('.tpos-svbtn').off('click').on('click',function(){
//         var savecoordinates='';
//         for(var ff=0;ff<coordinates.length;ff++){
//             if(ff==0){
//                 savecoordinates=coordinates[ff];
//             }else{
//                 savecoordinates+='^'+coordinates[ff];
//             }
//         }
//         var tdata=[];
//         tdata.push('cdmHazardCoordinates|'+savecoordinates);
//         cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
//         $('#pops').remove();

//     });

// }

function decCTag(ai, str) {
    var st = str.split(",");
    var t =
        '<tr id="ctagrow_' +
        ai +
        '" class="ctagd"><td>' +
        st[0] +
        "</td><td>" +
        st[1] +
        "</td><td>" +
        st[2] +
        '</td><td><div id="ctag_' +
        ai +
        '" data-ctag="' +
        str +
        '" class="tpos-delbtn">-</div></td></tr>';
    return t;
}

function decHTag(ai, str) {
    var st = str.split(",");
    var t =
        '<tr id="htagrow_' +
        ai +
        '" class="htagd"><td>' +
        st[0] +
        "</td><td>" +
        st[1] +
        "</td><td>" +
        st[2] +
        '</td><td><div id="htag_' +
        ai +
        '" data-htag="' +
        str +
        '" class="tpos-delbtn">-</div></td></tr>';
    return t;
}

// function savecoordinates(){
//     $('.tpos-svbtn').off('click').on('click',function(){
//         var savecoordinates='';
//         for(var ff=0;ff<coordinates.length;ff++){
//             if(ff==0){
//                 savecoordinates=coordinates[ff];
//             }else{
//                 savecoordinates+='^'+coordinates[ff];
//             }
//         }
//         var tdata=[];
//         tdata.push('cdmHazardCoordinates|'+savecoordinates);
//         cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
//         $('#pops').remove();

//     });

// }

function activateCoordinatesSave() {
    $(".tpos-svbtn")
        .off("click")
        .on("click", function() {
            var x = $("#x").val();
            var y = $("#y").val();
            var z = $("#z").val();
            var newstring = "";
            var oldstring = $("#h_" + hzd + "_fullcoor").html();

            if (!x || !y || !z) {
                toastr.error(
                    "Please enter all three numbers or press cancel (X) to close the pop up"
                );
            }

            if (x && y && z) {
                if (oldstring) {
                    newstring = oldstring + "^" + x + "," + y + "," + z;
                } else {
                    newstring = x + "," + y + "," + z;
                }
            }
            $("#h_" + hzd + "_fullcoor").html(newstring);
            var ctags = getctags(newstring);
            $("#mngCoo").replaceWith(ctags);
            activateCoordinatesSave();
        });
    $(".tpos-svcbtn")
        .off("click")
        .on("click", function() {
            var tdata = [];
            var nd = $("#h_" + hzd + "_fullcoor").html();
            var x = $("#x").val();
            var y = $("#y").val();
            var z = $("#z").val();

            if (x && y && z) {
                nd = nd + "^" + x + "," + y + "," + z;
            }

            if (nd) {
                tdata.push("cdmHazardCoordinates|" + nd);
                cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                $("#pops").remove();
            } else {
                tdata.push("cdmHazardCoordinates|" + "");
                cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                $("#pops").remove();
            }
        });
    $(".ctagd")
        .off("click")
        .on("click", function() {
            var delline = $(this).data("numero");
            var fline = $("#h_" + hzd + "_fullco").html();
            var newtags = deletectag(delline, fline);
            var ctags = getctags(newtags);
            $("#mngCoo").replaceWith(ctags);
            activateCoordinatesSave();
            // toastr.error('deleting row');
        });
}

function deletectag(delline, old) {
    var strings = [];
    strings = old.split("^");
    newline = "";
    for (var i = 0; i < strings.length; i++) {
        var t = strings[i];
        if (delline == t) {
            t = "";
        }
        newline += t;
    }
    return newline;
}

function getctags(str) {
    var ippanel =
        '<div><input style="color:rgb(0,0,0)" type="number" placeholder="x" id="x" ><input style="color:rgb(0,0,0)" type="number" placeholder="y" id="y" ><input style="color:rgb(0,0,0)" type="number" placeholder="z" id="z" ></div>';
    var svbtn =
        '<div class="tpos-svbtn">+</div><div class="tpos-svcbtn">Save & Close</div>';
    var ctags = "";
    if (str) {
        var strings = [];
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
                    '<tr class="ctagd" data-numero="' +
                    i +
                    '"><td>' +
                    x +
                    "</td><td>" +
                    y +
                    "</td><td>" +
                    z +
                    "</td></tr>";
            }
        }
        ctags =
            '<div id="mngCoo"><table class="coordinatesTBL" style="width:45%;">' +
            t +
            '</table><div class="" id="h_' +
            hzd +
            '_fullcoor">' +
            str +
            "</div>" +
            ippanel +
            svbtn +
            "</div>";
    } else {
        ctags = ippanel + svbtn;
    }
    return ctags;
}

function savetxt(fld) {
    var tdata = [];
    var txt = $("#txtform").val();
    // toastr.success(txt);
    tdata.push(fld + "|" + txt);
    tdata.push("cdmCurrentStatus|Assessment in progress");
    cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
    $("#pops").remove();
}

function tposSelectOwner(lst, data, hzdt, trg) {
    var tlist = data.d.results;
    var options =
        '<tr><td class="hide" id="val_' +
        lst +
        '">0</td><td><input class="tpos-' +
        lst +
        '-select-input dvi" id="sel_' +
        lst +
        '" autofill="false" placeholder="Select a design house ..."></td></tr>';
    if (hzdt == "RAMS hazard") {
        options =
            '<tr><td class="hide" id="val_' +
            lst +
            '">0</td><td><input class="tpos-' +
            lst +
            '-select-input dvi" id="sel_' +
            lst +
            '" autofill="false" placeholder="Select a sub contractor ..."></td></tr>';
    }
    for (var cc = 0; cc < tlist.length; cc++) {
        var it = tlist[cc];
        var itid = it.ID;
        var ittitle = it.Title;
        options +=
            '<tr style="display:none;" class="tpos-' +
            lst +
            '-select-value dvs" data-list="' +
            lst +
            '" data-value="' +
            itid +
            '"><td id="dv_' +
            lst +
            "_" +
            itid +
            '">' +
            ittitle +
            "</td></tr>";
    }
    $("#popscontentarea").html(
        '<table class="tpos-select-table">' + options + "</table>"
    );
    // $('#sel_' + lst).blur(function(){
    //     $('.dvs').hide();
    // });

    $("#sel_" + lst).bind("keyup change", function(ev) {
        var st = $(this).val();
        $("#val_" + lst).html("0");
        if (st) {
            $("tr:not(:Contains(" + st + "))").each(function() {
                var t = $(this).html();
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).hide();
                }
            });
            $("tr:Contains(" + st + ")").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    $("#sel_" + lst).click(function() {
        var st = $(this).val();
        toastr.success(st);
        if (!st || st == "") {
            $("tr").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    var stopblur = 0;
    $(".tpos-" + lst + "-select-value").mousedown(function() {
        stopblur = 1;
    });

    $(".tpos-" + lst + "-select-value").click(function() {
        var dvid = $(this).data("value");
        var dv = $("#dv_" + lst + "_" + dvid).html();
        $("#sel_" + lst).val(dv);
        $("#val_" + lst).html(dvid);
        $("#h_" + hzd + "_cdmHazardOwnerTitle").html(dv);
        $("#h_" + hzd + "_cdmHazardOwner").val(dvid);
        var tdata = [];
        tdata.push("cdmHazardOwner|" + dvid);
        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
        $("#pops").hide();
    });
    $("#sel_" + lst).blur(function() {
        if (stopblur == 1) {
            stopblur = 0;
        } else {
            $(".dvs").hide();
        }
    });
    $("#sel_" + lst).focus(function() {
        if (stopblur == 1) {
            stopblur = 0;
            $(".dvs").show();
        } else {
            $(".dvs").show();
        }
    });

    $(".btn-cancel").click(function() {
        $(".pops-title").html("");
        $(".pops-content").html("");
        $("#pops").hide();
    });
}
function getDistResults(items,propertyName){
    var result = [];
	var distResult=[];
    //console.log(items);
    $.each(items, function(index, item) {
       if ($.inArray(item[propertyName], result)==-1) {
          result.push(item[propertyName]);
		  distResult.push(item);
       }
    });
    return distResult;
}
function tposSelectElement(lst, data, trg) {
    var tlist = data.d.results;
    var options =
        '<tr><td class="hide" id="val_' +
        lst +
        '">0</td><td><input class="tpos-' +
        lst +
        '-select-input dvi" id="sel_' +
        lst +
        '" autofill="false" placeholder="Select an element ..."></td></tr>';
    for (var cc = 0; cc < tlist.length; cc++) {
        var it = tlist[cc];
        var itid = it.ID;
        var ittitle = it.Title;
        options +=
            '<tr style="display:none;" class="tpos-' +
            lst +
            '-select-value dvs" data-list="' +
            lst +
            '" data-value="' +
            itid +
            '"><td id="dv_' +
            lst +
            "_" +
            itid +
            '">' +
            ittitle +
            "</td></tr>";
    }
    $("#popscontentarea").html(
        '<table class="tpos-select-table">' + options + "</table>"
    );
    // $('#sel_' + lst).blur(function(){
    //     $('.dvs').hide();
    // });

    $("#sel_" + lst).bind("keyup change", function(ev) {
        var st = $(this).val();
        $("#val_" + lst).html("0");
        if (st) {
            $("tr:not(:Contains(" + st + "))").each(function() {
                var t = $(this).html();
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).hide();
                }
            });
            $("tr:Contains(" + st + ")").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    $("#sel_" + lst).click(function() {
        var st = $(this).val();
        toastr.success(st);
        if (!st || st == "") {
            $("tr").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    var stopblur = 0;
    $(".tpos-" + lst + "-select-value").mousedown(function() {
        stopblur = 1;
    });

    $(".tpos-" + lst + "-select-value").click(function() {
        var dvid = $(this).data("value");
        var dv = $("#dv_" + lst + "_" + dvid).html();
        $("#sel_" + lst).val(dv);
        $("#val_" + lst).html(dvid);
        // $('#h_'+hzd+'_cdmHazardOwnerTitle').html(dv);
        // $('#h_'+hzd+'_cdmHazardOwner').val(dvid);
        var tdata = [];
        tdata.push("cdmPWElement|" + dvid);
        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
        $("#pops").remove();
    });
    $("#sel_" + lst).blur(function() {
        if (stopblur == 1) {
            stopblur = 0;
        } else {
            $(".dvs").hide();
        }
    });
    $("#sel_" + lst).focus(function() {
        if (stopblur == 1) {
            stopblur = 0;
            $(".dvs").show();
        } else {
            $(".dvs").show();
        }
    });

    $(".btn-cancel").click(function() {
        $(".pops-title").html("");
        $(".pops-content").html("");
        $("#pops").remove();
    });
}

function tposSelectTag(lst, data, trg) {
    var tlist = data.d.results;
    var options =
        '<tr><td class="hide" id="val_' +
        lst +
        '">0</td><td><input class="tpos-' +
        lst +
        '-select-input dvi" id="sel_' +
        lst +
        '" autofill="false" placeholder="Select a tag ..."></td></tr>';
    for (var cc = 0; cc < tlist.length; cc++) {
        var it = tlist[cc];
        var itid = it.ID;
        var ittitle = it.Title;
        options +=
            '<tr style="display:none;" class="tpos-' +
            lst +
            '-select-value dvs" data-list="' +
            lst +
            '" data-value="' +
            itid +
            '"><td id="dv_' +
            lst +
            "_" +
            itid +
            '">' +
            ittitle +
            "</td></tr>";
    }
    $("#popscontentarea").html(
        '<table class="tpos-select-table">' + options + "</table>"
    );
    // $('#sel_' + lst).blur(function(){
    //     $('.dvs').hide();
    // });

    $("#sel_" + lst).bind("keyup change", function(ev) {
        var st = $(this).val();
        $("#val_" + lst).html("0");
        if (st) {
            $("tr:not(:Contains(" + st + "))").each(function() {
                var t = $(this).html();
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).hide();
                }
            });
            $("tr:Contains(" + st + ")").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    $("#sel_" + lst).click(function() {
        var st = $(this).val();
        toastr.success(st);
        if (!st || st == "") {
            $("tr").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    var stopblur = 0;
    $(".tpos-" + lst + "-select-value").mousedown(function() {
        stopblur = 1;
    });

    $(".tpos-" + lst + "-select-value").click(function() {
        var dvid = $(this).data("value");
        var dv = $("#dv_" + lst + "_" + dvid).html();
        $("#sel_" + lst).val(dv);
        $("#val_" + lst).html(dvid);
        // $('#h_'+hzd+'_cdmHazardOwnerTitle').html(dv);
        // $('#h_'+hzd+'_cdmHazardOwner').val(dvid);
        var tdata = [];
        tdata.push("cdmHazardTags|" + dv);
        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
        $("#pops").remove();
    });
    $("#sel_" + lst).blur(function() {
        if (stopblur == 1) {
            stopblur = 0;
        } else {
            $(".dvs").hide();
        }
    });
    $("#sel_" + lst).focus(function() {
        if (stopblur == 1) {
            stopblur = 0;
            $(".dvs").show();
        } else {
            $(".dvs").show();
        }
    });

    $(".btn-cancel").click(function() {
        $(".pops-title").html("");
        $(".pops-content").html("");
        $("#pops").remove();
    });
}

function tposSelectUniclass(lst, data, trg) {
    var tlist = data.d.results;
    //console.log("LOOK BELOW");
    //console.log(tlist);
    var options =
        '<tr><td class="hide" id="val_' +
        lst +
        '">0</td><td><input class="tpos-' +
        lst +
        '-select-input dvi" id="sel_' +
        lst +
        '" autofill="false" placeholder="Select a status ..."></td></tr>';
    for (var cc = 0; cc < tlist.length; cc++) {
        var it = tlist[cc];
        var itid = it.ID;
        var ittitle = it.Title;
        options +=
            '<tr style="display:none;" class="tpos-' +
            lst +
            '-select-value dvs" data-list="' +
            lst +
            '" data-value="' +
            itid +
            '"><td id="dv_' +
            lst +
            "_" +
            itid +
            '">' +
            ittitle +
            "</td></tr>";
    }
    $("#popscontentarea").html(
        '<table class="tpos-select-table">' + options + "</table>"
    );
    // $('#sel_' + lst).blur(function(){
    //     $('.dvs').hide();
    // });

    $("#sel_" + lst).bind("keyup change", function(ev) {
        var st = $(this).val();
        $("#val_" + lst).html("0");
        if (st) {
            $("tr:not(:Contains(" + st + "))").each(function() {
                var t = $(this).html();
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).hide();
                }
            });
            $("tr:Contains(" + st + ")").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    $("#sel_" + lst).click(function() {
        var st = $(this).val();
        toastr.success(st);
        if (!st || st == "") {
            $("tr").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    var stopblur = 0;
    $(".tpos-" + lst + "-select-value").mousedown(function() {
        stopblur = 1;
    });

    $(".tpos-" + lst + "-select-value").click(function() {
        var dvid = $(this).data("value");
        var dv = $("#dv_" + lst + "_" + dvid).html();
        $("#sel_" + lst).val(dv);
        $("#val_" + lst).html(dvid);
        // $('#h_'+hzd+'_cdmHazardOwnerTitle').html(dv);
        // $('#h_'+hzd+'_cdmHazardOwner').val(dvid);
        var tdata = [];
        tdata.push("cdmUniclass|" + dv);
        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
        $("#pops").remove();
    });
    $("#sel_" + lst).blur(function() {
        if (stopblur == 1) {
            stopblur = 0;
        } else {
            $(".dvs").hide();
        }
    });
    $("#sel_" + lst).focus(function() {
        if (stopblur == 1) {
            stopblur = 0;
            $(".dvs").show();
        } else {
            $(".dvs").show();
        }
    });

    $(".btn-cancel").click(function() {
        $(".pops-title").html("");
        $(".pops-content").html("");
        $("#pops").remove();
    });
}
function tposSelectdropdown(lst, data, trg, col) {
    var tlist = data.d.results;
    var options =
      '<tr><td class="hide" id="val_' +
      lst +
      '">0</td><td><input class="tpos-' +
      lst +
      '-select-input dvi" id="sel_' +
      lst +
      '" autofill="false" placeholder="Select a value ..."></td></tr>';
    for (var cc = 0; cc < tlist.length; cc++) {
      var it = tlist[cc];
      var itid = it.ID;
      var ittitle = it.Title;
      options +=
        '<tr style="display:none;" class="tpos-' +
        lst +
        '-select-value dvs" data-list="' +
        lst +
        '" data-value="' +
        itid +
        '"><td id="dv_' +
        lst +
        "_" +
        itid +
        '">' +
        ittitle +
        "</td></tr>";
    }
    $("#popscontentarea").html(
      '<table class="tpos-select-table">' + options + "</table>"
    );
    // $('#sel_' + lst).blur(function(){
    //     $('.dvs').hide();
    // });
  
    $("#sel_" + lst).bind("keyup change", function (ev) {
      var st = $(this).val();
      $("#val_" + lst).html("0");
      if (st) {
        $("tr:not(:Contains(" + st + "))").each(function () {
          var t = $(this).html();
          if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
            $(this).hide();
          }
        });
        $("tr:Contains(" + st + ")").each(function () {
          if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
            $(this).show();
          }
        });
      }
    });
    $("#sel_" + lst).click(function () {
      var st = $(this).val();
      toastr.success(st);
      if (!st || st == "") {
        $("tr").each(function () {
          if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
            $(this).show();
          }
        });
      }
    });
    var stopblur = 0;
    $(".tpos-" + lst + "-select-value").mousedown(function () {
      stopblur = 1;
    });
  
    $(".tpos-" + lst + "-select-value").click(function () {
      var dvid = $(this).data("value");
      var dv = $("#dv_" + lst + "_" + dvid).html();
      $("#sel_" + lst).val(dv);
      $("#val_" + lst).html(dvid);
      // $('#h_'+hzd+'_cdmHazardOwnerTitle').html(dv);
      // $('#h_'+hzd+'_cdmHazardOwner').val(dvid);
      var tdata = [];
      tdata.push(col + "|" + dv);
      cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
      $("#pops").remove();
    });
    $("#sel_" + lst).blur(function () {
      if (stopblur == 1) {
        stopblur = 0;
      } else {
        $(".dvs").hide();
      }
    });
    $("#sel_" + lst).focus(function () {
      if (stopblur == 1) {
        stopblur = 0;
        $(".dvs").show();
      } else {
        $(".dvs").show();
      }
    });
  
    $(".btn-cancel").click(function () {
      $(".pops-title").html("");
      $(".pops-content").html("");
      $("#pops").remove(); 
    });
  }
function tposcustomfilters( data) {
    // var tlist=[];
    // //console.log('maindata',maindata.length);
    // if (maindata.length = 0 ) {
    //     tlist = data.d.results;
    // }
    // else {
    //     tlist = maindata;
    // }
    var tlist = data;
 
      var distlistcdmStageExtra=[];
      var distlistcdmpwstructure =[];
      var distlistcdmCurrentStatus=[];
      var distlistcdmResidualRiskOwner = [];// ['HS2 Infrastructure Management SME​​','HS2 Rail Systems Interface Engineer'];
      var selectcdmStageExtra = '';
      var selectcdmpwstructure ='';
      var selectcdmCurrentStatus ='';
      var selectcdmResidualRiskOwner ='';
   

    for (var cc = 0; cc < tlist.length; cc++) {
      var it = tlist[cc];
      var itid = it.cdmStageExtra.ID;
      var ittitle = it.cdmStageExtra.Title;
      var itcdmpwstructureid = it.cdmPWStructure.ID;
      var itcdmpwstructuretitle = it.cdmPWStructure.Title;
      var itcdmCurrentStatus = it.cdmCurrentStatus;
      var itcdmResidualRiskOwner = it.cdmResidualRiskOwner; 

      if (!distlistcdmStageExtra.includes(ittitle)){
        distlistcdmStageExtra.push(ittitle);
        selectcdmStageExtra += '<option value='+ittitle+'>'+ittitle+'</option>'
      }
      if (!distlistcdmpwstructure.includes(itcdmpwstructureid)){
        distlistcdmpwstructure.push(itcdmpwstructureid);
        selectcdmpwstructure += '<option value='+itcdmpwstructuretitle+'>'+itcdmpwstructuretitle+'</option>'
      }
     

      if (!distlistcdmCurrentStatus.includes(itcdmCurrentStatus)){
        distlistcdmCurrentStatus.push(itcdmCurrentStatus);
        selectcdmCurrentStatus += '<option value='+itcdmCurrentStatus+'>'+itcdmCurrentStatus+'</option>'
      }
      if (!distlistcdmResidualRiskOwner.includes(itcdmResidualRiskOwner)){
        distlistcdmResidualRiskOwner.push(itcdmResidualRiskOwner);
       
        selectcdmResidualRiskOwner += '<option value='+itcdmResidualRiskOwner+'>'+itcdmResidualRiskOwner+'</option>'
        // selectcdmResidualRiskOwner = "<option value= 'HS2 Infrastructure Management SME' >HS2 Infrastructure Management SME</option>"+
        // "<option value= 'HS2 Rail Systems Interface Engineer'>HS2 Rail Systems Interface Engineer</option>"
      }

     
      //console.log('distlistcdmCurrentStatus',distlistcdmCurrentStatus);
      
    }
    $("#popscontentarea").html('');
    $(".pops-content").append(
        '<button id="applyfilters" style="float:right">apply filters</button>'+
        '<div class ="customfiltersection" id="popscontentarea1"> <select name="cdmpwstructurefilter[]" multiple id="cdmpwstructurefilter">' +  selectcdmpwstructure
      +"</select><br> </div>"+
      '<div class ="customfiltersection" id="popscontentarea2"> <select name="cdmStageExtrafilter[]" multiple id="cdmStageExtrafilter">' +  selectcdmStageExtra
      +"</select><br> </div>"+
      '<div class ="customfiltersection" id="popscontentarea3"> <select name="cdmCurrentStatusfilter[]" multiple id="cdmCurrentStatusfilter">' +  selectcdmCurrentStatus
      +"</select><br> </div>"+
      '<div class ="customfiltersection" id="popscontentarea4"> <select name="cdmResidualRiskOwnerfilter[]" multiple id="cdmResidualRiskOwnerfilter">' +  selectcdmResidualRiskOwner
      +"</select><br> </div>"
      
      
    );
    $('#cdmStageExtrafilter').multiselect({
        columns: 1,
        placeholder: 'Select Stage :',
        search: true,
        selectAll: true
    });
    $('#cdmpwstructurefilter').multiselect({
        columns: 1,
        placeholder: 'Select Asset :',
        search: true,
        selectAll: true
    });
    $('#cdmResidualRiskOwnerfilter').multiselect({
        columns: 1,
        placeholder: 'Select Residual Risk Owner :',
        search: true,
        selectAll: true
    });
    $('#cdmCurrentStatusfilter').multiselect({
        columns: 1,
        placeholder: 'Select Status :',
        search: true,
        selectAll: true
    });

    $('#applyfilters').click(function () {
        //alert('hi');
        var fcdmStageExtra = [];
        var fcdmStageExtraselected =[];
        fcdmStageExtra=$('#cdmStageExtrafilter').find(':selected');
        for( a=0; a<fcdmStageExtra.length;a++){
            //console.log(fcdmStageExtra[a].innerText);
            fcdmStageExtraselected.push(fcdmStageExtra[a].innerText);
        }
        //console.log(fcdmStageExtraselected);
        flst['cdmStageExtra'] = fcdmStageExtraselected;

        var fcdmpwstructure = [];
        var fcdmpwstructureselected =[];
        fcdmpwstructure=$('#cdmpwstructurefilter').find(':selected');
        for( b=0; b<fcdmpwstructure.length;b++){
            //console.log(fcdmpwstructure,"cdmpwst");
            fcdmpwstructureselected.push(fcdmpwstructure[b].innerText);
        }
        //console.log(fcdmpwstructureselected);
        flst['cdmPWStructure'] = fcdmpwstructureselected;

        var fcdmCurrentStatus = [];
        var fcdmCurrentStatusselected =[];
        fcdmCurrentStatus= $('#cdmCurrentStatusfilter').find(':selected');
        for( c=0; c<fcdmCurrentStatus.length;c++){
            //console.log("fcdmCurrentStatus",fcdmCurrentStatus[c].innerText);
            fcdmCurrentStatusselected.push(fcdmCurrentStatus[c].innerText.replace('"',''));
        }
        
        flst['cdmCurrentStatus'] = fcdmCurrentStatusselected;

        var fcdmResidualRiskOwner = [];
        var fcdmResidualRiskOwnerselected =[];
        fcdmResidualRiskOwner= $('#cdmResidualRiskOwnerfilter').find(':selected');
        //console.log("fcdmResidualRiskOwner",fcdmResidualRiskOwner);
        for( c=0; c<fcdmResidualRiskOwner.length;c++){
            console.log("fcdmResidualRiskOwner",fcdmResidualRiskOwner[c].innerText);
            fcdmResidualRiskOwnerselected.push(fcdmResidualRiskOwner[c].innerText);
        }
        //console.log(fcdmCurrentStatusselected);
        flst['cdmResidualRiskOwner'] = fcdmResidualRiskOwnerselected;

 cdmdata.get('cdmSites', null, 'Title asc', 'stats-table-row', 'statstbl',flst);
      

      //alert("stop");
      $("#pops").remove();
});

  
   
    $(".btn-cancel").click(function () {
      $(".pops-title").html("");
      $(".pops-content").html("");
      $("#pops").remove();
    });
  }

// function tposSelectcdmPWStructurefilter(lst, data, trg, col) {
//     var tlist = data.d.results;
//     lstcdmpwstructure = lst + "cdmpwstructure"
//     alert("hi");
//     var options =
//       '<tr><td class="hide" id="val_' +
//       lstcdmpwstructure +
//       '">0</td><td> Asset : </td><td><input class="tpos-' +
//       lstcdmpwstructure +
//       '-select-input dvi" id="sel_' +
//       lstcdmpwstructure +
//       '" autofill="false" placeholder="Select a value ..."></td></tr>';
//       var distlist=[];
//     for (var cc = 0; cc < tlist.length; cc++) {
//       var it = tlist[cc];
//       var itid = it.cdmPWStructure.ID;
//       var ittitle = it.cdmPWStructure.Title;
//       if (!distlist.includes(ittitle)){
//         distlist.push(ittitle);
//         options +=
//         '<tr style="display:none;" class="tpos-' +
//         lstcdmpwstructure +
//         '-select-value dvs" data-list="' +
//         lstcdmpwstructure +
//         '" data-value="' +
//         itid +
//         '"><td id="dv_' +
//         lstcdmpwstructure +
//         "_" +
//         itid +
//         '">' +
//         ittitle +
//         "</td></tr>";
//       }
      
//     }
//     $("#popscontentarea").html(
//       '<table class="tpos-select-table assetfilter">' + options + "</table>"
//     );
//     $('#sel_' + lstcdmpwstructure).blur(function(){
//         $('.dvs').hide();
//     });
  
//     $("#sel_" + lstcdmpwstructure).bind("keyup change", function (ev) {
//       var st = $(this).val();
//       //console.log("key up",st);
//       $("#val_" + lstcdmpwstructure).html("0");
//       if (st) {
//         $("tr:not(:Contains(" + st + "))").each(function () {
//           var t = $(this).html();
//           if ($(this).hasClass("tpos-" + lstcdmpwstructure + "-select-value") == 1) {
//             $(this).hide();
//           }
//         });
//         $("tr:Contains(" + st + ")").each(function () {
//           if ($(this).hasClass("tpos-" + lstcdmpwstructure + "-select-value") == 1) {
//             $(this).show();
//           }
//         });
//       }
//     });
//     $("#sel_" + lstcdmpwstructure).click(function () {
//       var st = $(this).val();
//       toastr.success(st);
//       //console.log("click",st);
//       if (!st || st == "") {
//         $("tr").each(function () {
//           if ($(this).hasClass("tpos-" + lstcdmpwstructure + "-select-value") == 1) {
//             $(".tpos-" + lstcdmpwstructure + "-select-value").show();
//           }
//         });
//       }
//     });
//     var stopblur = 0;
//     $(".tpos-" + lstcdmpwstructure + "-select-value").mousedown(function () {
//       stopblur = 1;
//     });
  
//     $(".tpos-" + lstcdmpwstructure + "-select-value").click(function () {
//       var dvid = $(this).data("value");
//       var dv = $("#dv_" + lstcdmpwstructure + "_" + dvid).html();
//       $("#sel_" + lstcdmpwstructure).val(dv);
//       $("#val_" + lstcdmpwstructure).html(dvid);
//       $('#h_'+hzd+'_cdmHazardOwnerTitle').html(dv);
//       $('#h_'+hzd+'_cdmHazardOwner').val(dvid);
//       var tdata = [];
//       tdata.push(col + "|" + dv);
//       cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
      
//       flst['cdmPWStructure'] = dv;
      
//       //console.log(flst , "flst");
//       formatdatato.statstablerows()
//       cdmdata.get('cdmSites', null, 'Title asc', 'stats-table-row', 'statstbl',flst);
//       $("#pops").remove();
//     });
//     $("#sel_" + lstcdmpwstructure).blur(function () {
//       if (stopblur == 1) {
//         stopblur = 0;
//       } else {
//         $(".dvs").hide();
//       }
//     });
//     $("#sel_" + lstcdmpwstructure).focus(function () {
//       if (stopblur == 1) {
//         stopblur = 0;
//         $(".dvs").show();
//       } else {
//         $(".dvs").show();
//       }
//     });
  
//     $(".btn-cancel").click(function () {
//       $(".pops-title").html("");
//       $(".pops-content").html("");
//       $("#pops").remove();
//     });
//   }
function tposSelectPeer(lst, data, trg) {
    var tlist = data.d.results;
    var options =
        '<tr><td class="hide" id="val_' +
        lst +
        '">0</td><td><input class="tpos-' +
        lst +
        '-select-input dvi" id="sel_' +
        lst +
        '" autocomplete="false" placeholder="Select a peer ... (optional)"></td></tr>';
    for (var cc = 0; cc < tlist.length; cc++) {
        var it = tlist[cc];
        var itid = it.cdmUser.ID;
        var ittitle = it.cdmUser.Title;
        options +=
            '<tr style="display:none;" class="tpos-' +
            lst +
            '-select-value dvs" data-list="' +
            lst +
            '" data-value="' +
            itid +
            '"><td id="dv_' +
            lst +
            "_" +
            itid +
            '">' +
            ittitle +
            "</td></tr>";
    }
    $("#popscontentarea").html(
        '<table class="tpos-select-table">' + options + "</table>"
    );
    $("#sel_" + lst).bind("keyup change", function(ev) {
        var st = $(this).val();
        $("#val_" + lst).html("0");
        if (st) {
            $("tr:not(:Contains(" + st + "))").each(function() {
                var t = $(this).html();
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).hide();
                }
            });
            $("tr:Contains(" + st + ")").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    $("#sel_" + lst).click(function() {
        var st = $(this).val();
        toastr.success(st);
        if (!st || st == "") {
            $("tr").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    var stopblur = 0;
    $(".tpos-" + lst + "-select-value").mousedown(function() {
        stopblur = 1;
    });
    $(".tpos-" + lst + "-select-value").click(function() {
        var dvid = $(this).data("value");
        // toastr.success(dvid);
        var dv = $("#dv_" + lst + "_" + dvid).html();
        $("#sel_" + lst).val(dv);
        $("#val_" + lst).html(dvid);
        // $('#result').html(dv);
        $(".dvs").hide();
        // $('#h_'+hzd+'_cdmHazardOwnerTitle').html(dv);
        // $('#h_'+hzd+'_cdmHazardOwner').val(dvid);

        // var tdata=[];
        // var nd=new Date;
        // nd=ukdate(nd);
        // tdata.push();
        // tdata.push('cdmReviews|'+nd+ ' - '+unm()+' requested peer review');
        // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
        // $('#pops').remove();
    });
    $("#sel_" + lst).blur(function() {
        if (stopblur == 1) {
            stopblur = 0;
        } else {
            $(".dvs").hide();
        }
    });
    $("#sel_" + lst).focus(function() {
        if (stopblur == 1) {
            stopblur = 0;
            $(".dvs").show();
        } else {
            $(".dvs").show();
        }
    });

    $(".btn-cancel").click(function() {
        $(".pops-title").html("");
        $(".pops-content").html("");
        $("#pops").remove();
    });
}

// function hazardreviewbuttonaction() {
//     $(".tpos-rvbtn")
//         .off("click")
//         .on("click", function() {
//             //   toastr.success("what???");
//             var a = $(this).data("action");
//             var hi = $(this)
//                 .parents(".row-hazard")
//                 .attr("id");
//             var hia = hi.split("_");
//             var id = hia[1];
//             //   toastr.success("what???: " + id);
//             hzd = id;
//             var hist = "";
//             var nd = new Date();
//             var nnd = ukdate(nd);
//             var ind = isodate(nd);
//             //   toastr.success(nnd);
//             var user = unm();
//             var nl = "";
//             var vn = $("#h_" + hzd + " .cdmSite").html();
//             // //console.log(vn);

//             if (a == "initiatereview") {
//                 // var q='cdmCompany/ID eq \''+c+'\' and cdmUser/ID ne \''+uid()+'\' and cdmUserRole/Title eq \''+ur+'\'';
//                 var vcheck = $('#h_' + hzd + ' .cdmStageMitigationSuggestion').html();
//                 //console.log(vcheck);
//                 if (vcheck === null || vcheck === 'undefined' || vcheck === 'Awaiting assessment') {
//                     toastr.error('Please provide a mitigation suggestion before initiating the review');
//                 } else {
//                     gimmepops("Initiate the review process", "");
//                     $(".pops-content").load(
//                         "../3.0/html/review.initiation.form.html",
//                         function() {
//                             // cdmdata.get('cdmUsers',q,null,'frmsel_peer',null);
//                             $(".tpos-svbtn")
//                                 .off("click")
//                                 .on("click", function() {
//                                     var cmt = $("#cmt").val();
//                                     if (!cmt) {
//                                         cmt = "no comment";
//                                     }
//                                     var tdata = [];
//                                     nl =
//                                         nnd + "]" + user + "]" + "requested peer review]" + cmt + "^";
//                                     hist = $("#h_" + hzd + "_cdmReviews").html();
//                                     // var regex = new RegExp("^[a-zA-Z\s]+$");
//                                     if (hist.length > 12) {
//                                         // toastr.success('something there');
//                                         nl = nl + hist;
//                                     } else {
//                                         nl = nl;
//                                     }
//                                     // if(hist==''||!hist||hist==undefined){
//                                     //     hist='';
//                                     // }
//                                     // //console.log(hist);

//                                     // //console.log(nl+hist);
//                                     tdata.push("cdmReviews|" + nl);
//                                     tdata.push("cdmCurrentStatus|Under peer review");
//                                     tdata.push("cdmLastReviewDate|" + ind);
//                                     tdata.push("cdmLastReviewStatus|Review initiated");
//                                     tdata.push("cdmLastReviewer|" + unm());
//                                     tdata.push("CurrentMitigationOwner|" + uid());
//                                     cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                     $("#pops").remove();
//                                 });
//                         }
//                     );
//                 }

//             } else {
//                 if (a == "peerreview") {
//                     gimmepops("Undertake the peer review", "");
//                     $(".pops-content").load(
//                         "../3.0/html/internal.design.review.form.html",
//                         function() {
//                             $(".tpos-svbtn")
//                                 .off("click")
//                                 .on("click", function() {
//                                     var act = $(this).data("action");
//                                     var cmt = $("#cmt").val();
//                                     // hist = $('#h_'+hzd+'_cdmReviews').html();
//                                     // if(hist==''||!hist||hist==undefined){
//                                     //     hist='';
//                                     // }
//                                     // //console.log(hist);

//                                     var tdata = [];
//                                     if (act == "change") {
//                                         if (cmt == "" || !cmt || cmt == undefined) {
//                                             toastr.error(
//                                                 "Please use the comment box to explain your decision and outline the required changes."
//                                             );
//                                         }
//                                         if (cmt) {
//                                             nl =
//                                                 nnd +
//                                                 "]" +
//                                                 user +
//                                                 "]" +
//                                                 "requested change]" +
//                                                 cmt +
//                                                 "^";
//                                             hist = $("#h_" + hzd + "_cdmReviews").html();
//                                             // if(hist==''||!hist||hist==undefined){
//                                             //     hist='';
//                                             // }
//                                             if (hist) {
//                                                 nl = nl + hist;
//                                             }

//                                             tdata.push("cdmReviews|" + nl);
//                                             tdata.push("cdmCurrentStatus|Assessment in progress");
//                                             tdata.push("cdmLastReviewDate|" + ind);
//                                             tdata.push("cdmLastReviewStatus|Change request issued");
//                                             tdata.push("cdmLastReviewer|" + unm());
//                                             cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                             $("#pops").remove();
//                                         }
//                                     } else {
//                                         if (!cmt) {
//                                             cmt = "no comment";
//                                         }
//                                         nl =
//                                             nnd +
//                                             "]" +
//                                             user +
//                                             "]" +
//                                             "completed peer review]" +
//                                             cmt +
//                                             "^";
//                                         hist = $("#h_" + hzd + "_cdmReviews").html();
//                                         // if(hist==''||!hist||hist==undefined){
//                                         //     hist='';
//                                         // }
//                                         if (hist) {
//                                             nl = nl + hist;
//                                         }
//                                         var ns = $("#h_" + hzd + " .rucs").hasClass("_2");

//                                         tdata.push("cdmReviews|" + nl);
//                                         if (ns == 1) {
//                                             tdata.push("cdmCurrentStatus|Under Construction Manager review");
//                                         } else {
//                                             tdata.push(
//                                                 "cdmCurrentStatus|Under design manager review"
//                                             );
//                                         }

//                                         tdata.push("cdmLastReviewDate|" + ind);
//                                         tdata.push("cdmLastReviewStatus|Peer review - approved");
//                                         tdata.push("cdmLastReviewer|" + unm());
//                                         cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                         $("#pops").remove();
//                                     }
//                                 });
//                         }
//                     );
//                 }
//                 if (a == "dmreview") {
//                     gimmepops("Undertake the design manager review", "");
//                     $(".pops-content").load(
//                         "../3.0/html/internal.design.review.form.html",
//                         function() {
//                             $(".tpos-svbtn")
//                                 .off("click")
//                                 .on("click", function() {
//                                     var act = $(this).data("action");
//                                     var cmt = $("#cmt").val();
//                                     // hist = $('#h_'+hzd+'_cdmReviews').html();
//                                     // if(hist==''||!hist||hist==undefined){
//                                     //     hist='';
//                                     // }
//                                     // //console.log(hist);

//                                     var tdata = [];
//                                     if (act == "change") {
//                                         if (cmt == "" || !cmt || cmt == undefined) {
//                                             toastr.error(
//                                                 "Please use the comment box to explain your decision and outline the required changes."
//                                             );
//                                         }
//                                         if (cmt) {
//                                             nl =
//                                                 nnd +
//                                                 "]" +
//                                                 user +
//                                                 "]" +
//                                                 "requested change]" +
//                                                 cmt +
//                                                 "^";
//                                             hist = $("#h_" + hzd + "_cdmReviews").html();
//                                             // if(hist==''||!hist||hist==undefined){
//                                             //     hist='';
//                                             // }
//                                             if (hist) {
//                                                 nl = nl + hist;
//                                             }

//                                             tdata.push("cdmReviews|" + nl);
//                                             tdata.push("cdmCurrentStatus|Assessment in progress");
//                                             tdata.push("cdmLastReviewDate|" + ind);
//                                             tdata.push("cdmLastReviewStatus|Change request issued");
//                                             tdata.push("cdmLastReviewer|" + unm());
//                                             cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                             $("#pops").remove();
//                                         }
//                                     } else {
//                                         if (!cmt) {
//                                             cmt = "no comment";
//                                         }
//                                         nl =
//                                             nnd +
//                                             "]" +
//                                             user +
//                                             "]" +
//                                             "completed design manager review]" +
//                                             cmt +
//                                             "^";
//                                         hist = $("#h_" + hzd + "_cdmReviews").html();
//                                         // if(hist==''||!hist||hist==undefined){
//                                         //     hist='';
//                                         // }
//                                         if (hist) {
//                                             nl = nl + hist;
//                                         }

//                                         var ns = $("#h_" + hzd + " .rucpc").hasClass("_2");
//                                         //console.log(ns);
//                                         if (ns === true) {
//                                             tdata.push("cdmReviews|" + nl);
//                                             tdata.push(
//                                                 "cdmCurrentStatus|Under pre-construction review"
//                                             );
//                                             tdata.push("cdmLastReviewDate|" + ind);
//                                             tdata.push(
//                                                 "cdmLastReviewStatus|Design manager review - approved"
//                                             );
//                                             tdata.push("cdmLastReviewer|" + unm());
//                                         } else {
//                                             tdata.push("cdmCurrentStatus|Accepted");
//                                             tdata.push("cdmReviews|" + nl);
//                                             tdata.push("cdmLastReviewDate|" + ind);
//                                             tdata.push(
//                                                 "cdmLastReviewStatus|Design manager review - approved"
//                                             );
//                                             tdata.push("cdmLastReviewer|" + unm());
//                                         }
//                                         cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                         $("#pops").remove();
//                                     }
//                                     // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
//                                     // $('#pops').remove();
//                                 });
//                         }
//                     );
//                 }
//                 if (a == "pcreview") {
//                     gimmepops("Undertake the pre-construction review", "", "bigger");

//                     $(".pops-content").load(
//                         "../3.0/html/internal.design.review.form.1.html",
//                         function() {
//                             // $("#addramsbtn").hide();
//                             // jsonRAMS.get("rams", vn, "sel_rams");
//                             $(".tpos-svbtn")
//                                 .off("click")
//                                 .on("click", function() {
//                                     var act = $(this).data("action");
//                                     var cmt = $("#cmt").val();
//                                     // hist = $('#h_'+hzd+'_cdmReviews').html();
//                                     // if(hist==''||!hist||hist==undefined){
//                                     //     hist='';
//                                     // }
//                                     // //console.log(hist);

//                                     var tdata = [];
//                                     if (act == "change") {
//                                         if (cmt == "" || !cmt || cmt == undefined) {
//                                             toastr.error(
//                                                 "Please use the comment box to explain your decision and outline the required changes."
//                                             );
//                                         }
//                                         if (cmt) {
//                                             nl =
//                                                 nnd +
//                                                 "]" +
//                                                 user +
//                                                 "]" +
//                                                 "requested change]" +
//                                                 cmt +
//                                                 "^";
//                                             hist = $("#h_" + hzd + "_cdmReviews").html();
//                                             // if(hist==''||!hist||hist==undefined){
//                                             //     hist='';
//                                             // }
//                                             if (hist) {
//                                                 nl = nl + hist;
//                                             }

//                                             tdata.push("cdmReviews|" + nl);
//                                             tdata.push("cdmCurrentStatus|Assessment in progress");
//                                             tdata.push("cdmLastReviewDate|" + ind);
//                                             tdata.push("cdmLastReviewStatus|Change request issued");
//                                             tdata.push("cdmLastReviewer|" + unm());
//                                             cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                             $("#pops").remove();
//                                         }
//                                     }
//                                     if (act === "accept") {
//                                         if (!cmt) {
//                                             cmt = "no comment";
//                                         }
//                                         nl =
//                                             nnd +
//                                             "]" +
//                                             user +
//                                             "]" +
//                                             "completed pre-construction review]" +
//                                             cmt +
//                                             "^";
//                                         hist = $("#h_" + hzd + "_cdmReviews").html();
//                                         // if(hist==''||!hist||hist==undefined){
//                                         //     hist='';
//                                         // }
//                                         if (hist) {
//                                             nl = nl + hist;
//                                         }
//                                         tdata.push("cdmReviews|" + nl);
//                                         tdata.push("cdmCurrentStatus|Under principal designer review");
//                                         tdata.push("cdmLastReviewDate|" + ind);
//                                         tdata.push(
//                                             "cdmLastReviewStatus|Pre-construction review completed"
//                                         );
//                                         tdata.push("cdmLastReviewer|" + unm());
//                                         cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                         $("#pops").remove();
//                                     }
//                                     // if (act === "addrams") {
//                                     //   var mits = $("#smmsgg").val();
//                                     //   if (!mits) {
//                                     //     toastr.error(
//                                     //       "Please enter a mitigation suggestion first"
//                                     //     );
//                                     //   } else {
//                                     //     var ht = "#h_" + hzd + " ";
//                                     //     var hz = $("#h_" + hzd + " .cdmHazardDescription").html();
//                                     //     var rs = $("#h_" + hzd + " .cdmRiskDescription").html();
//                                     //     var risks = $(ht + ".cdmRR").html();
//                                     //     var dasite = $(ht + ".cdmSite").data("siteid");
//                                     //     var trisks = risks.split("-");
//                                     //     var riskscoreval = trisks[0];
//                                     //     var rscv = parseInt(riskscoreval, 10);

//                                     //     var title1 = new Date();
//                                     //     //var title2=uid();
//                                     //     var title10 =
//                                     //       title1.getTime() +
//                                     //       "^" +
//                                     //       title1.getDate() +
//                                     //       "^" +
//                                     //       title1.getMonth() +
//                                     //       1 +
//                                     //       "^" +
//                                     //       title1.getFullYear();
//                                     //     var title = title10.toString() + "^" + uid();
//                                     //     var ms = "Awaiting mitigation";
//                                     //     var stmsugg = $(
//                                     //       ht + ".cdmStageMitigationSuggestion"
//                                     //     ).html();
//                                     //     var raid = $("#val_rams").html();
//                                     //     var ratx = $("#sel_rams").val();
//                                     //     var stg = $(ht + ".cdmStageExtra").html();
//                                     //     var stgi = 1;
//                                     //     if (stg != "Construction") {
//                                     //       stgi = 2;
//                                     //     }
//                                     //     var hzt = $(ht + ".cdmType").html();
//                                     //     var hzti = 2;
//                                     //     if (hzt == "Health") {
//                                     //       hzti = 1;
//                                     //     }
//                                     //     //   //console.log(raid);

//                                     //     tdata = [];
//                                     //     // toastr.success(site);
//                                     //     tdata.push("Title|" + title);
//                                     //     tdata.push("cdmSiblings|" + title);
//                                     //     tdata.push("cdmParent|" + hzd);
//                                     //     tdata.push("cdmHazardDescription|" + hz);
//                                     //     tdata.push("cdmRiskDescription|" + rs);
//                                     //     tdata.push("cdmMitigationDescription|" + ms);
//                                     //     tdata.push("cdmSite|" + dasite);
//                                     //     tdata.push("cdmInitialRisk|" + risks);
//                                     //     tdata.push("cdmResidualRisk|" + risks);
//                                     //     tdata.push("cdmHazardType|" + hzti);
//                                     //     tdata.push("cdmInitialRiskScore|" + rscv);
//                                     //     tdata.push("cdmResidualRiskScore|" + rscv);
//                                     //     // tdata.push('cdmIniRisk|'+$('#inirisk').prop('outerHTML'));
//                                     //     // tdata.push('cdmResRisk|'+$('#inirisk').prop('outerHTML'));
//                                     //     tdata.push("cdmStageMitigationSuggestion|" + stmsugg);
//                                     //     tdata.push("cdmSMMitigationSuggestion|" + mits);
//                                     //     tdata.push("cdmRAMS|" + raid);
//                                     //     tdata.push("cdmEntityTitle|" + ratx);
//                                     //     tdata.push("cdmStageExtra|" + stgi);
//                                     //     //console.log(tdata);
//                                     //     var udata = [];
//                                     //     udata.push("cdmSMMitigationSuggestion|This hazard is further mitigated via one or several RAMS hazards with the following mitigation suggestion by the Construction Manager: " + mits + " Please click 'View linked / related hazards' for further details.");

//                                     //     tposdata.setRAMS("cdmHazards", tdata, "qmsg");
//                                     //   }
//                                     // }
//                                     // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
//                                     // $('#pops').remove();
//                                 });
//                         }
//                     );
//                 }

//                 if (a == "ldreview") {
//                     gimmepops("Undertake the principal designer review", "");
//                     $(".pops-content").load(
//                         "../3.0/html/internal.design.review.form.html",
//                         function() {
//                             $(".tpos-svbtn")
//                                 .off("click")
//                                 .on("click", function() {
//                                     var act = $(this).data("action");
//                                     var cmt = $("#cmt").val();
//                                     // hist = $('#h_'+hzd+'_cdmReviews').html();
//                                     // if(hist==''||!hist||hist==undefined){
//                                     //     hist='';
//                                     // }
//                                     // //console.log(hist);

//                                     var tdata = [];
//                                     if (act == "change") {
//                                         if (cmt == "" || !cmt || cmt == undefined) {
//                                             toastr.error(
//                                                 "Please use the comment box to explain your decision and outline the required changes."
//                                             );
//                                         }
//                                         if (cmt) {
//                                             nl =
//                                                 nnd +
//                                                 "]" +
//                                                 user +
//                                                 "]" +
//                                                 "requested change]" +
//                                                 cmt +
//                                                 "^";
//                                             hist = $("#h_" + hzd + "_cdmReviews").html();
//                                             // if(hist==''||!hist||hist==undefined){
//                                             //     hist='';
//                                             // }
//                                             if (hist) {
//                                                 nl = nl + hist;
//                                             }

//                                             tdata.push("cdmReviews|" + nl);
//                                             tdata.push("cdmCurrentStatus|Assessment in progress");
//                                             tdata.push("cdmLastReviewDate|" + ind);
//                                             tdata.push("cdmLastReviewStatus|Change request issued");
//                                             tdata.push("cdmLastReviewer|" + unm());
//                                             cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                             $("#pops").remove();
//                                         }
//                                     } else {
//                                         if (!cmt) {
//                                             cmt = "no comment";
//                                         }
//                                         nl =
//                                             nnd +
//                                             "]" +
//                                             user +
//                                             "]" +
//                                             "completed principal designer review]" +
//                                             cmt +
//                                             "^";
//                                         hist = $("#h_" + hzd + "_cdmReviews").html();
//                                         // if(hist==''||!hist||hist==undefined){
//                                         //     hist='';
//                                         // }
//                                         if (hist) {
//                                             nl = nl + hist;
//                                         }
//                                         tdata.push("cdmCurrentStatus|Accepted");
//                                         tdata.push("cdmReviews|" + nl);
//                                         tdata.push("cdmLastReviewDate|" + ind);
//                                         tdata.push(
//                                             "cdmLastReviewStatus|Principal designer review completed"
//                                         );
//                                         tdata.push("cdmLastReviewer|" + unm());
//                                         cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                         $("#pops").remove();

//                                         // var ns=$('#h_'+hzd+' .rucpc').hasClass('_2');
//                                     }
//                                     // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
//                                     // $('#pops').remove();
//                                 });
//                         }
//                     );
//                 }
//                 if (a == "smreview") {
//                     gimmepops("Undertake the Construction Manager review", "");
//                     $(".pops-content").load(
//                         "../3.0/html/internal.design.review.form.html",
//                         function() {
//                             $(".tpos-svbtn")
//                                 .off("click")
//                                 .on("click", function() {
//                                     var act = $(this).data("action");
//                                     var cmt = $("#cmt").val();
//                                     // hist = $('#h_'+hzd+'_cdmReviews').html();
//                                     // if(hist==''||!hist||hist==undefined){
//                                     //     hist='';
//                                     // }
//                                     // //console.log(hist);

//                                     var tdata = [];
//                                     if (act == "change") {
//                                         if (cmt == "" || !cmt || cmt == undefined) {
//                                             toastr.error(
//                                                 "Please use the comment box to explain your decision and outline the required changes."
//                                             );
//                                         }
//                                         if (cmt) {
//                                             nl =
//                                                 nnd +
//                                                 "]" +
//                                                 user +
//                                                 "]" +
//                                                 "requested change]" +
//                                                 cmt +
//                                                 "^";
//                                             hist = $("#h_" + hzd + "_cdmReviews").html();
//                                             // if(hist==''||!hist||hist==undefined){
//                                             //     hist='';
//                                             // }
//                                             if (hist) {
//                                                 nl = nl + hist;
//                                             }

//                                             tdata.push("cdmReviews|" + nl);
//                                             tdata.push("cdmCurrentStatus|Assessment in progress");
//                                             tdata.push("cdmLastReviewDate|" + ind);
//                                             tdata.push("cdmLastReviewStatus|Change request issued");
//                                             tdata.push("cdmLastReviewer|" + unm());
//                                             cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                             $("#pops").remove();
//                                         }
//                                     } else {
//                                         if (!cmt) {
//                                             cmt = "no comment";
//                                         }
//                                         nl =
//                                             nnd +
//                                             "]" +
//                                             user +
//                                             "]" +
//                                             "completed Construction Manager review]" +
//                                             cmt +
//                                             "^";
//                                         hist = $("#h_" + hzd + "_cdmReviews").html();
//                                         // if(hist==''||!hist||hist==undefined){
//                                         //     hist='';
//                                         // }
//                                         if (hist) {
//                                             nl = nl + hist;
//                                         }
//                                         tdata.push("cdmCurrentStatus|Accepted");
//                                         tdata.push("cdmReviews|" + nl);
//                                         tdata.push("cdmLastReviewDate|" + ind);
//                                         tdata.push(
//                                             "cdmLastReviewStatus|Construction Manager review completed"
//                                         );
//                                         tdata.push("cdmLastReviewer|" + unm());
//                                         cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                         $("#pops").remove();

//                                         // var ns=$('#h_'+hzd+' .rucpc').hasClass('_2');
//                                     }
//                                     // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
//                                     // $('#pops').remove();
//                                 });
//                         }
//                     );
//                 }
//             }
//         });
// }


function hazardreviewbuttonaction() {
    $(".tpos-rvbtn")
        .off("click")
        .on("click", function() {
            //   toastr.success("what???");
            var a = $(this).data("action");
            var hi = $(this)
                .parents(".row-hazard")
                .attr("id");
            var hia = hi.split("_");
            var id = hia[1];
            //   toastr.success("what???: " + id);
            hzd = id;
            var hist = "";
            var nd = new Date();
            var nnd = ukdate(nd);
            var ind = isodate(nd);
            //   toastr.success(nnd);
            var user = unm();
            var nl = "";
            var vn = $("#h_" + hzd + " .cdmSite").html();
            //   var curstatus='';
            //   hist = $("#h_" + hzd + "_cdmReviews").html();
            // //console.log(vn);

            if (a == "initiatereview") {
                // var q='cdmCompany/ID eq \''+c+'\' and cdmUser/ID ne \''+uid()+'\' and cdmUserRole/Title eq \''+ur+'\'';
                var vcheck = $('#h_' + hzd + ' .cdmStageMitigationSuggestion').html();
                //console.log(vcheck);
                if (vcheck === null || vcheck === 'undefined' || vcheck === 'Awaiting assessment') {
                    toastr.error('Please provide a mitigation suggestion before initiating the review');
                } else {
                    gimmepops("Initiate the review process", "");
                    $(".pops-content").load(
                        "../3.0/html/review.initiation.form.html",
                        function() {
                            // cdmdata.get('cdmUsers',q,null,'frmsel_peer',null);
                            $(".tpos-svbtn")
                                .off("click")
                                .on("click", function() {
                                    var cmt = $("#cmt").val();
                                    if (!cmt) {
                                        cmt = "no comment";
                                    }
                                    var tdata = [];
                                    nl =
                                        nnd + "]" + user + "]" + "requested peer review]" + cmt + "^";
                                    hist = $("#h_" + hzd + "_cdmReviews").html();
                                    // var regex = new RegExp("^[a-zA-Z\s]+$");
                                    if (hist.length > 12) {
                                        // toastr.success('something there');
                                        nl = nl + hist;
                                    } else {
                                        nl = nl;
                                    }
                                    // if(hist==''||!hist||hist==undefined){
                                    //     hist='';
                                    // }
                                    // //console.log(hist);

                                    // //console.log(nl+hist);
                                    tdata.push("cdmReviews|" + nl);
                                    tdata.push("cdmCurrentStatus|Under peer review");
                                    tdata.push("cdmLastReviewDate|" + ind);
                                    tdata.push("cdmLastReviewStatus|Review initiated");
                                    tdata.push("cdmLastReviewer|" + unm());
                                    tdata.push("CurrentMitigationOwner|" + uid());
                                    cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                    $("#pops").remove();
                                });
                        }
                    );
                }

            } else {
                if (a == "peerreview") {
                    gimmepops("Undertake the peer review", "");
                    $(".pops-content").load(
                        "../3.0/html/internal.design.review.form.html",
                        function() {
                            $(".tpos-svbtn")
                                .off("click")
                                .on("click", function() {
                                    var act = $(this).data("action");
                                    var cmt = $("#cmt").val();
                                    // hist = $('#h_'+hzd+'_cdmReviews').html();
                                    // if(hist==''||!hist||hist==undefined){
                                    //     hist='';
                                    // }
                                    // //console.log(hist);

                                    var tdata = [];
                                    if (act == "change") {
                                        if (cmt == "" || !cmt || cmt == undefined) {
                                            toastr.error(
                                                "Please use the comment box to explain your decision and outline the required changes."
                                            );
                                        }
                                        if (cmt) {
                                            nl =
                                                nnd +
                                                "]" +
                                                user +
                                                "]" +
                                                "requested change]" +
                                                cmt +
                                                "^";
                                            hist = $("#h_" + hzd + "_cdmReviews").html();
                                            // if(hist==''||!hist||hist==undefined){
                                            //     hist='';
                                            // }
                                            if (hist) {
                                                nl = nl + hist;
                                            }

                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push("cdmCurrentStatus|Assessment in progress");
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push("cdmLastReviewStatus|Change request issued");
                                            tdata.push("cdmLastReviewer|" + unm());
                                            cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                            $("#pops").remove();
                                        }
                                    } else {
                                        if (!cmt) {
                                            cmt = "no comment";
                                        }
                                        nl =
                                            nnd +
                                            "]" +
                                            user +
                                            "]" +
                                            "completed peer review]" +
                                            cmt +
                                            "^";
                                        hist = $("#h_" + hzd + "_cdmReviews").html();
                                        // if(hist==''||!hist||hist==undefined){
                                        //     hist='';
                                        // }
                                        if (hist) {
                                            nl = nl + hist;
                                        }
                                        var ns = $("#h_" + hzd + " .rucs").hasClass("_2");

                                        tdata.push("cdmReviews|" + nl);

                                        //console.log("Hazard Number:  " + hzd);

                                        getListItemsByListName({
                                                listName: `cdmHazards`,
                                                select: null,
                                                expansion: null,
                                                order: null,
                                                filter: `Id eq ${hzd}`
                                            }).done(r => {
                                                let item = ((r.d.results[0].cdmRAMS != null));
                                                if (item) {
                                                    tdata.push("cdmCurrentStatus|Under Construction Manager review");
                                                } else {
                                                    tdata.push(
                                                        "cdmCurrentStatus|Under design manager review"
                                                    );
                                                }

                                                tdata.push("cdmLastReviewDate|" + ind);
                                                tdata.push("cdmLastReviewStatus|Peer review - approved");
                                                tdata.push("cdmLastReviewer|" + unm());
                                                cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                                $("#pops").remove();
                                            })
                                            // let item = await getListItemsByListName({
                                            //     listName: `cdmHazards`,
                                            //     select: null,
                                            //     expansion: null, 
                                            //     order: null, 
                                            //     filter: `Id eq ${hzd}`
                                            // }).done(r => {
                                            //     return (r.d.results[0].cdmRAMS != null);
                                            // }).fail(jq => console.error('Could not get the damn thing'))


                                        // if (item) {
                                        //     tdata.push("cdmCurrentStatus|Under Construction Manager review");
                                        // } else {
                                        //     tdata.push(
                                        //         "cdmCurrentStatus|Under design manager review"
                                        //     );
                                        // }

                                        // tdata.push("cdmLastReviewDate|" + ind);
                                        // tdata.push("cdmLastReviewStatus|Peer review - approved");
                                        // tdata.push("cdmLastReviewer|" + unm());
                                        // cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                        // $("#pops").remove();
                                    }
                                });
                        }
                    );
                }
                if (a == "dmreview") {
                    gimmepops("Undertake the design manager review", "");
                    $(".pops-content").load(
                        "../3.0/html/internal.design.review.form.html",
                        function() {
                            $(".tpos-svbtn")
                                .off("click")
                                .on("click", function() {
                                    var act = $(this).data("action");
                                    var cmt = $("#cmt").val();
                                    // hist = $('#h_'+hzd+'_cdmReviews').html();
                                    // if(hist==''||!hist||hist==undefined){
                                    //     hist='';
                                    // }
                                    // //console.log(hist);

                                    var tdata = [];
                                    if (act == "change") {
                                        if (cmt == "" || !cmt || cmt == undefined) {
                                            toastr.error(
                                                "Please use the comment box to explain your decision and outline the required changes."
                                            );
                                        }
                                        if (cmt) {
                                            nl =
                                                nnd +
                                                "]" +
                                                user +
                                                "]" +
                                                "requested change]" +
                                                cmt +
                                                "^";
                                            hist = $("#h_" + hzd + "_cdmReviews").html();
                                            // if(hist==''||!hist||hist==undefined){
                                            //     hist='';
                                            // }
                                            if (hist) {
                                                nl = nl + hist;
                                            }

                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push("cdmCurrentStatus|Assessment in progress");
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push("cdmLastReviewStatus|Change request issued");
                                            tdata.push("cdmLastReviewer|" + unm());
                                            cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                            $("#pops").remove();
                                        }
                                    } else {
                                        if (!cmt) {
                                            cmt = "no comment";
                                        }
                                        nl =
                                            nnd +
                                            "]" +
                                            user +
                                            "]" +
                                            "completed design manager review]" +
                                            cmt +
                                            "^";
                                        hist = $("#h_" + hzd + "_cdmReviews").html();
                                        // if(hist==''||!hist||hist==undefined){
                                        //     hist='';
                                        // }
                                        if (hist) {
                                            nl = nl + hist;
                                        }

                                        // //console.log(ns);
                                        tdata.push("cdmReviews|" + nl);
                                        tdata.push(
                                            "cdmCurrentStatus|Under pre-construction review"
                                        );
                                        tdata.push("cdmLastReviewDate|" + ind);
                                        tdata.push(
                                            "cdmLastReviewStatus|Design manager review - approved"
                                        );
                                        tdata.push("cdmLastReviewer|" + unm());
                                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                        $("#pops").remove();
                                    }
                                    // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
                                    // $('#pops').remove();
                                });
                        }
                    );
                }
                if (a == "pcreview") {
                    gimmepops("Undertake the pre-construction review", "", "bigger");

                    $(".pops-content").load(
                        "../3.0/html/internal.design.review.form.1.html",
                        function() {
                            // $("#addramsbtn").hide();
                            // jsonRAMS.get("rams", vn, "sel_rams");
                            $(".tpos-svbtn")
                                .off("click")
                                .on("click", function() {
                                    var act = $(this).data("action");
                                    var cmt = $("#cmt").val();
                                    // hist = $('#h_'+hzd+'_cdmReviews').html();
                                    // if(hist==''||!hist||hist==undefined){
                                    //     hist='';
                                    // }
                                    // //console.log(hist);

                                    var tdata = [];
                                    if (act == "change") {
                                        if (cmt == "" || !cmt || cmt == undefined) {
                                            toastr.error(
                                                "Please use the comment box to explain your decision and outline the required changes."
                                            );
                                        }
                                        if (cmt) {
                                            nl =
                                                nnd +
                                                "]" +
                                                user +
                                                "]" +
                                                "requested change]" +
                                                cmt +
                                                "^";
                                            hist = $("#h_" + hzd + "_cdmReviews").html();
                                            // if(hist==''||!hist||hist==undefined){
                                            //     hist='';
                                            // }
                                            if (hist) {
                                                nl = nl + hist;
                                            }

                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push("cdmCurrentStatus|Assessment in progress");
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push("cdmLastReviewStatus|Change request issued");
                                            tdata.push("cdmLastReviewer|" + unm());
                                            cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                            $("#pops").remove();
                                        }
                                    }
                                    if (act === "accept") {
                                        if (!cmt) {
                                            cmt = "no comment";
                                        }
                                        nl =
                                            nnd +
                                            "]" +
                                            user +
                                            "]" +
                                            "completed pre-construction review]" +
                                            cmt +
                                            "^";
                                        hist = $("#h_" + hzd + "_cdmReviews").html();
                                        // if(hist==''||!hist||hist==undefined){
                                        //     hist='';
                                        // }
                                        if (hist) {
                                            nl = nl + hist;
                                        }
                                        // tdata.push("cdmReviews|" + nl);
                                        // tdata.push("cdmCurrentStatus|Under principal designer review");
                                        // tdata.push("cdmLastReviewDate|" + ind);
                                        // tdata.push(
                                        //     "cdmLastReviewStatus|Pre-construction review completed"
                                        // );
                                        // tdata.push("cdmLastReviewer|" + unm());



                                        var ns = $("#h_" + hzd + " .rucl").hasClass("_2");
                                        // //console.log(ns);
                                        if (ns === true) {
                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push(
                                                "cdmCurrentStatus|Under principal designer review"
                                            );
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push(
                                                "cdmLastReviewStatus|Pre-construction review completed"
                                            );
                                            tdata.push("cdmLastReviewer|" + unm());
                                        } else {
                                            tdata.push("cdmCurrentStatus|Accepted");
                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push(
                                                "cdmLastReviewStatus|Pre-construction review completed"
                                            );
                                            tdata.push("cdmLastReviewer|" + unm());
                                        }



                                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                        $("#pops").remove();
                                    }
                                    // if (act === "addrams") {
                                    //   var mits = $("#smmsgg").val();
                                    //   if (!mits) {
                                    //     toastr.error(
                                    //       "Please enter a mitigation suggestion first"
                                    //     );
                                    //   } else {
                                    //     var ht = "#h_" + hzd + " ";
                                    //     var hz = $("#h_" + hzd + " .cdmHazardDescription").html();
                                    //     var rs = $("#h_" + hzd + " .cdmRiskDescription").html();
                                    //     var risks = $(ht + ".cdmRR").html();
                                    //     var dasite = $(ht + ".cdmSite").data("siteid");
                                    //     var trisks = risks.split("-");
                                    //     var riskscoreval = trisks[0];
                                    //     var rscv = parseInt(riskscoreval, 10);

                                    //     var title1 = new Date();
                                    //     //var title2=uid();
                                    //     var title10 =
                                    //       title1.getTime() +
                                    //       "^" +
                                    //       title1.getDate() +
                                    //       "^" +
                                    //       title1.getMonth() +
                                    //       1 +
                                    //       "^" +
                                    //       title1.getFullYear();
                                    //     var title = title10.toString() + "^" + uid();
                                    //     var ms = "Awaiting mitigation";
                                    //     var stmsugg = $(
                                    //       ht + ".cdmStageMitigationSuggestion"
                                    //     ).html();
                                    //     var raid = $("#val_rams").html();
                                    //     var ratx = $("#sel_rams").val();
                                    //     var stg = $(ht + ".cdmStageExtra").html();
                                    //     var stgi = 1;
                                    //     if (stg != "Construction") {
                                    //       stgi = 2;
                                    //     }
                                    //     var hzt = $(ht + ".cdmType").html();
                                    //     var hzti = 2;
                                    //     if (hzt == "Health") {
                                    //       hzti = 1;
                                    //     }
                                    //     //   //console.log(raid);

                                    //     tdata = [];
                                    //     // toastr.success(site);
                                    //     tdata.push("Title|" + title);
                                    //     tdata.push("cdmSiblings|" + title);
                                    //     tdata.push("cdmParent|" + hzd);
                                    //     tdata.push("cdmHazardDescription|" + hz);
                                    //     tdata.push("cdmRiskDescription|" + rs);
                                    //     tdata.push("cdmMitigationDescription|" + ms);
                                    //     tdata.push("cdmSite|" + dasite);
                                    //     tdata.push("cdmInitialRisk|" + risks);
                                    //     tdata.push("cdmResidualRisk|" + risks);
                                    //     tdata.push("cdmHazardType|" + hzti);
                                    //     tdata.push("cdmInitialRiskScore|" + rscv);
                                    //     tdata.push("cdmResidualRiskScore|" + rscv);
                                    //     // tdata.push('cdmIniRisk|'+$('#inirisk').prop('outerHTML'));
                                    //     // tdata.push('cdmResRisk|'+$('#inirisk').prop('outerHTML'));
                                    //     tdata.push("cdmStageMitigationSuggestion|" + stmsugg);
                                    //     tdata.push("cdmSMMitigationSuggestion|" + mits);
                                    //     tdata.push("cdmRAMS|" + raid);
                                    //     tdata.push("cdmEntityTitle|" + ratx);
                                    //     tdata.push("cdmStageExtra|" + stgi);
                                    //     //console.log(tdata);
                                    //     var udata = [];
                                    //     udata.push("cdmSMMitigationSuggestion|This hazard is further mitigated via one or several RAMS hazards with the following mitigation suggestion by the Construction Manager: " + mits + " Please click 'View linked / related hazards' for further details.");

                                    //     tposdata.setRAMS("cdmHazards", tdata, "qmsg");
                                    //   }
                                    // }
                                    // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
                                    // $('#pops').remove();
                                });
                        }
                    );
                }

                if (a == "ldreview") {
                    gimmepops("Undertake the principal designer review", "");
                    $(".pops-content").load(
                        "../3.0/html/internal.design.review.form.html",
                        function() {
                            $(".tpos-svbtn")
                                .off("click")
                                .on("click", function() {
                                    var act = $(this).data("action");
                                    var cmt = $("#cmt").val();
                                    // hist = $('#h_'+hzd+'_cdmReviews').html();
                                    // if(hist==''||!hist||hist==undefined){
                                    //     hist='';
                                    // }
                                    // //console.log(hist);

                                    var tdata = [];
                                    if (act == "change") {
                                        if (cmt == "" || !cmt || cmt == undefined) {
                                            toastr.error(
                                                "Please use the comment box to explain your decision and outline the required changes."
                                            );
                                        }
                                        if (cmt) {
                                            nl =
                                                nnd +
                                                "]" +
                                                user +
                                                "]" +
                                                "requested change]" +
                                                cmt +
                                                "^";
                                            hist = $("#h_" + hzd + "_cdmReviews").html();
                                            // if(hist==''||!hist||hist==undefined){
                                            //     hist='';
                                            // }
                                            if (hist) {
                                                nl = nl + hist;
                                            }

                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push("cdmCurrentStatus|Assessment in progress");
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push("cdmLastReviewStatus|Change request issued");
                                            tdata.push("cdmLastReviewer|" + unm());
                                            cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                            $("#pops").remove();
                                        }
                                    } else {
                                        if (!cmt) {
                                            cmt = "no comment";
                                        }
                                        nl =
                                            nnd +
                                            "]" +
                                            user +
                                            "]" +
                                            "completed principal designer review]" +
                                            cmt +
                                            "^";
                                        hist = $("#h_" + hzd + "_cdmReviews").html();
                                        // if(hist==''||!hist||hist==undefined){
                                        //     hist='';
                                        // }
                                        if (hist) {
                                            nl = nl + hist;
                                        }
                                        tdata.push("cdmCurrentStatus|Under site manager review");
                                        tdata.push("cdmReviews|" + nl);
                                        tdata.push("cdmLastReviewDate|" + ind);
                                        tdata.push(
                                            "cdmLastReviewStatus|Principal designer review completed"
                                        );
                                        tdata.push("cdmLastReviewer|" + unm());
                                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                        $("#pops").remove();

                                        // var ns=$('#h_'+hzd+' .rucpc').hasClass('_2');
                                    }
                                    // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
                                    // $('#pops').remove();
                                });
                        }
                    );
                }
                if (a == "smreview") {
                    gimmepops("Undertake the Construction Manager review", "");
                    $(".pops-content").load(
                        "../3.0/html/internal.design.review.form.html",
                        function() {
                            $(".tpos-svbtn")
                                .off("click")
                                .on("click", function() {
                                    var act = $(this).data("action");
                                    var cmt = $("#cmt").val();
                                    // hist = $('#h_'+hzd+'_cdmReviews').html();
                                    // if(hist==''||!hist||hist==undefined){
                                    //     hist='';
                                    // }
                                    // //console.log(hist);

                                    var tdata = [];
                                    if (act == "change") {
                                        if (cmt == "" || !cmt || cmt == undefined) {
                                            toastr.error(
                                                "Please use the comment box to explain your decision and outline the required changes."
                                            );
                                        }
                                        if (cmt) {
                                            nl =
                                                nnd +
                                                "]" +
                                                user +
                                                "]" +
                                                "requested change]" +
                                                cmt +
                                                "^";
                                            hist = $("#h_" + hzd + "_cdmReviews").html();
                                            // if(hist==''||!hist||hist==undefined){
                                            //     hist='';
                                            // }
                                            if (hist) {
                                                nl = nl + hist;
                                            }

                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push("cdmCurrentStatus|Assessment in progress");
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push("cdmLastReviewStatus|Change request issued");
                                            tdata.push("cdmLastReviewer|" + unm());
                                            cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                            $("#pops").remove();
                                        }
                                    } else {
                                        if (!cmt) {
                                            cmt = "no comment";
                                        }
                                        nl =
                                            nnd +
                                            "]" +
                                            user +
                                            "]" +
                                            "completed Construction Manager review]" +
                                            cmt +
                                            "^";
                                        hist = $("#h_" + hzd + "_cdmReviews").html();
                                        // if(hist==''||!hist||hist==undefined){
                                        //     hist='';
                                        // }
                                        if (hist) {
                                            nl = nl + hist;
                                        }
                                        tdata.push("cdmCurrentStatus|Accepted");
                                        tdata.push("cdmReviews|" + nl);
                                        tdata.push("cdmLastReviewDate|" + ind);
                                        tdata.push(
                                            "cdmLastReviewStatus|Construction Manager review completed"
                                        );
                                        tdata.push("cdmLastReviewer|" + unm());
                                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                        $("#pops").remove();

                                        // var ns=$('#h_'+hzd+' .rucpc').hasClass('_2');
                                    }
                                    // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
                                    // $('#pops').remove();
                                });
                        }
                    );
                }
                if (a == "clientreview") {
                    //console.log("Client Review Button Pressed")
                    var vcheck = $('#h_' + hzd + ' .cdmResidualRiskOwner').html();
                    //console.log(vcheck);
                    if (vcheck === null || vcheck === 'undefined' || vcheck === '') {
                        toastr.error(`Please provide a Residual Risk Owner before submitting to ${configData['Client Name']}`);
                    } else {
                        var tdata = [];
                        nl =
                            nnd +
                            "]" +
                            user +
                            "]" +
                            "submitted for client review]" +
                            "^";
                        hist = $("#h_" + hzd + "_cdmReviews").html();

                        if (hist) {
                            nl = nl + hist;
                        }

                        tdata.push("cdmReviews|" + nl);
                        tdata.push(`cdmCurrentStatus|Ready for Review by ${configData['Client Name']}`);
                        tdata.push("cdmLastReviewDate|" + ind);
                        tdata.push(`cdmLastReviewStatus|Ready for Review by ${configData['Client Name']}`);
                        tdata.push("cdmLastReviewer|" + unm());
                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                        //console.log("Updated Client Review")
                    }
                }
            }
        });

}































































function toggleCollapse() {
    $(".vwshow")
        .off("click")
        .on("click", function() {
            $(".vwdefault").show();
            $(".vwhover").hide();
            // $('.vwhover').removeClass('animated');
            // $('.vwhover').removeClass('fadeInTop');
            $(".row-hazard").removeClass("addmargin");
            $(".row-hazard").removeClass("animated");
            $(".row-hazard").removeClass("fadeIn");

            var e = $(this).attr("id");
            e = e.substring(0, e.length - 4);
            toastr.success(e);
            $("#" + e + " .vwdefault").hide();
            $("#" + e + " .vwhover").show();
            $("#" + e).addClass("animated");
            $("#" + e).addClass("fadeIn");
            $("#" + e).addClass("addmargin");
            // var is=e.split('_');
            // var i=is[1];
            // data.hazardgetitem(i);
            // page.scroll('#'+e);
        });
    $(".vwhide").click(function() {
        // var e = $(this).attr('id');
        // e = e.substring(0, e.length - 3);
        $(".row-hazard").removeClass("addmargin");
        $(".row-hazard").removeClass("animated");
        $(".row-hazard").removeClass("fadeIn");
        $(".vwdefault").show();
        $(".vwhover").hide();
        // $('.vwhover').removeClass('animated');
        // $('.vwhover').removeClass('fadeInTop');
    });
}

function toggleInfoPanel() {
    $(".revhis")
        .off("click")
        .on("click", function() {
            // toastr.success('listening-rev');
            var hi = $(this)
                .parents(".row-hazard")
                .attr("id");
            var hia = hi.split("_");
            var id = hia[1];
            hzd = id;

            if ($("#h_" + hzd + "_reviewhistory").hasClass("hide") == 1) {
                $("#h_" + hzd + "_reviewhistory").removeClass("hide");
                $("#h_" + hzd + " .revhis").addClass("highlight");
            } else {
                $("#h_" + hzd + "_reviewhistory").addClass("hide");
                $("#h_" + hzd + " .revhis").removeClass("highlight");
            }
        });
    $(".hazhis")
        .off("click")
        .on("click", function() {
            // toastr.success('listening-haz');
            var hi = $(this)
                .parents(".row-hazard")
                .attr("id");
            var hia = hi.split("_");
            var id = hia[1];
            hzd = id;

            if ($("#h_" + hzd + "_changehistory").hasClass("hide") == 1) {
                $("#h_" + hzd + "_changehistory").removeClass("hide");
                $("#h_" + hzd + " .hazhis").addClass("highlight");
                cdmdata.get(
                    "cdmHazardHistory",
                    "cdmHazard eq '" + id + "'",
                    "Modified desc",
                    "hazhistory",
                    "h_" + id + "_changehistory"
                );
            } else {
                $("#h_" + hzd + "_changehistory").addClass("hide");
                $("#h_" + hzd + " .hazhis").removeClass("highlight");
            }
        });
}

function updateHazardListItemView(lst, data) {
    var d = data.d.results;
    var h = d[0];
    var row = printHazardRow(h);

    var dc = 0;
    if ($("#h_" + hzd).hasClass("addmargin") == true) {
        dc = 1;
    }
    $("#h_" + hzd).replaceWith(row);
    // if (h.cdmHazardType.Title == "Safety") {
    //     $("#h_" + h.ID + " .safetyhide").hide();
    // }

    // toggleCollapse();
    // $('#h' + hzd + ' .vwdefault').hide();
    // $('#h' + hzd + ' .vwhover').show();
    // $('#h'+hzd).addClass('addmargin');
    activateHazardEdits();
    hazardreviewbuttonaction();
    activateRAMSBtn();
    toggleCollapse();
    toggleInfoPanel();
    if (dc == 1) {
        deCollapse("h_" + hzd);
    }
}

function deCollapse(e) {
    $(".vwdefault").show();
    $(".vwhover").hide();
    // $('.vwhover').removeClass('animated');
    // $('.vwhover').removeClass('fadeInTop');
    $(".row-hazard").removeClass("addmargin");
    $(".row-hazard").removeClass("animated");
    $(".row-hazard").removeClass("fadeIn");

    // var e = $(this).attr('id');
    // e = e.substring(0, e.length - 3);
    $("#" + e + " .vwdefault").hide();
    $("#" + e + " .vwhover").show();
    $("#" + e).addClass("animated");
    $("#" + e).addClass("fadeIn");
    $("#" + e).addClass("addmargin");
    //   toastr.success("back to normal?");
    toggleCollapse();
}