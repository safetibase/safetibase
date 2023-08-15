var flst = {};
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
                                    const csvObject = {};
                                    for (let i=0; i<rows.length; i++) {
                                        row = rows[i].split(',');
                                        for (let j=0; j<row.length; j++) {
                                            if (i == 0) { // get the column names
                                                var headers = row.map(x => x.trim('\r'));
                                                csvObject[row[j].trim('\r')] = [];
                                            } else {
                                                csvObject[headers[j]].push(row[j].trim('\r'));
                                            }
                                        }
                                    }

                                    if (csvObject.hasOwnProperty('Status') && csvObject.hasOwnProperty('ID') && csvObject.hasOwnProperty('Review Timestamp')) { // Make sure the right file format is being used
                                        // Keep a record of the hazards that are successfully and unsuccessfully synced. Syncing is asynchronous wheras failing a sync is synchronous. To simplify recording the audit
                                        // information we will iterate over all the provided hazards, find the ones that fail and then attempt the sync ones that pass the validation tests (asynchronous). At the end of
                                        // this we will record the audit information.
                                        var successfulSyncs = [];
                                        var unsuccessfulSyncs = [];
                                        const hazardsToSync = [];
                                        
                                        let apiIdQueryStr = '(';
                                        const timestamps = [];
                                        for (let i=0; i<csvObject['Status'].length; i++) {
                                            if (csvObject['ID'][i] && i == csvObject['Status'].length-1) {
                                                apiIdQueryStr += `ID eq ${csvObject['ID'][i]})`;
                                            }
                                            else if (csvObject['ID'][i]) {
                                                apiIdQueryStr += `ID eq ${csvObject['ID'][i]} or `;
                                            }

                                            if (csvObject['Review Timestamp'][i]) {
                                                timestamps.push(csvObject['Review Timestamp'][i]);
                                            }
                                        }
                                        const url = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmHazards%27)/items?$filter=${apiIdQueryStr}`;

                                        $.ajax({
                                            url: url,
                                            method: 'GET',
                                            headers: {
                                                "Accept": "application/json; odata=verbose"
                                            },
                                            success: async (data) => {
                                                const date = new Date();
                                                const dateNow = ukdate(date);

                                                for (let i=0; i<data.d.results.length; i++) {
                                                    // First, check that the hazard has not been modified after the review timestamp - this would suggest an error
                                                    const id = data.d.results[i]['ID'];
                                                    const csvObjectIndex = csvObject['ID'].indexOf(id.toString());

                                                    // There's an edge case where sync files are missed and then executed in order. If a hazard is in consecutive files then the second sync might be rejected
                                                    // because its modified date > review timestamp. To mitigate this we will verify the last review is a sync and the last modified date = last sync date.
                                                    const lastReview = data.d.results[i]['cdmReviews']?.split('^')[0];
                                                    const lastReviewType = lastReview?.split(']')[2];
                                                    const lastReviewDateSplit = lastReview?.split(']')[0].split('/');
                                                    const lastReviewMonth = lastReviewDateSplit[1].length == 1 ? '0' + lastReviewDateSplit[1] : lastReviewDateSplit[1];
                                                    const lastReviewDate = `${lastReviewDateSplit[2]}/${lastReviewMonth}/${lastReviewDateSplit[0]}`;
                                                    const lateOrderSync = (lastReviewType == `Accepted by ${configData['Client Name']}` || lastReviewType.includes(`Reopened by ${configData['Client Name']}`) || 
                                                        lastReviewType.includes(`Rejected by ${configData['Client Name']}`)) && data.d.results[i]['Modified'].split('T')[0].replaceAll('-', '/') == lastReviewDate &&
                                                        csvObject['Review Timestamp'][csvObjectIndex].split('T')[0].replaceAll('-', '/') > lastReviewDate;
                                                    if (csvObject['Review Timestamp'][csvObjectIndex] > data.d.results[i]['Modified'] || (csvObject['Review Timestamp'][csvObjectIndex] < data.d.results[i]['Modified'] && lateOrderSync)) {    
                                                        const status = csvObject['Status'][csvObjectIndex];
                                                        let history = data.d.results[i]['cdmReviews'];
                                                        let auditTrailLine;
                                                        let tdata;
                                                        let error = false;

                                                        if (status.includes('Accepted')) {
                                                            if (data.d.results[i]['cdmCurrentStatus'] == `Ready for review by ${configData['Client Name']}`) { // Check the hazard is in the correct state
                                                                tdata = ['cdmCurrentStatus|' + `Accepted by ${configData['Client Name']}`, 'cdmHazardOwner|' + Company_ID, 'cdmLastReviewStatus|Accepted'];
                                                                auditTrailLine = dateNow + ']' + unm() + ']' + `Accepted by ${configData['Client Name']}]` + 'No comment' + '^';
                                                            } else {
                                                                toastr.error(`Could not sync hazard with id ${id} because it is in the wrong workflow state. For more details please check the cdmHazardHistory list and filter the Title by "synced".`)
                                                                unsuccessfulSyncs.push(`Hazard ${id}: could not be synced because it is in the incorrect workflow state. Expected state: Ready for review by ${configData['Client Name']}, actual state: ${data.d.results[i]['cdmCurrentStatus']}. Confirm with ${configData['Client Name']} it is in the correct state.\n`);
                                                                error = true;
                                                            }

                                                        } else if (status.includes('Ready for review')) {
                                                            if (data.d.results[i]['cdmCurrentStatus'] == `Accepted by ${configData['Client Name']}`) { // Check the hazard is in the correct state
                                                                tdata = ['cdmCurrentStatus|' + `Ready for review by ${configData['Client Name']}`, `cdmLastReviewStatus|Ready for review by ${configData['Client Name']}`];
                                                                // Update the audit trail with the reopen reason
                                                                let comment = '';
                                                                if (csvObject.hasOwnProperty('Reopen Reason') && csvObject['Reopen Reason'][csvObjectIndex]) {
                                                                    comment = csvObject['Reopen Reason'][csvObjectIndex];
                                                                }
                                                                auditTrailLine = dateNow + ']' + unm() + ']' + `Reopened by ${configData['Client Name']}]` + `Reopen Reason: ${comment}` + '^';
                                                            } else {
                                                                toastr.error(`Could not sync hazard with id ${id} because it is in the wrong workflow state. For more details please check the cdmHazardHistory list and filter the Title by "synced".`)
                                                                unsuccessfulSyncs.push(`Hazard ${id}: could not be synced because it is in the incorrect workflow state. Expected state: Accepted by ${configData['Client Name']}, actual state: ${data.d.results[i]['cdmCurrentStatus']}. Confirm with ${configData['Client Name']} it is in the correct state.\n`);
                                                                error = true;
                                                            }

                                                        } else if (status.includes('Rejected')) {
                                                            if (data.d.results[i]['cdmCurrentStatus'] == `Ready for review by ${configData['Client Name']}`) { // Check the hazard is in the correct state
                                                                tdata = ["cdmCurrentStatus|" + "Requires Mitigation", 'cdmLastReviewStatus|Not Started'];
                                                                // Update the audit trail with the reason and feedback
                                                                let comment = '';
                                                                if (csvObject.hasOwnProperty('Rejection Reason') && csvObject['Rejection Reason'][csvObjectIndex]) {
                                                                    comment += `Rejection Reason: ${csvObject['Rejection Reason'][csvObjectIndex]}`;
                                                                }
                                                                if (csvObject.hasOwnProperty('Rejection Feedback') && csvObject['Rejection Feedback'][csvObjectIndex]) {
                                                                    comment += ` & Rejection Feedback: ${csvObject['Rejection Feedback'][csvObjectIndex]}`;
                                                                }
                                                                auditTrailLine = dateNow + ']' + unm() + ']' + `Rejected by ${configData['Client Name']}]` + comment + '^';
                                                            } else {
                                                                toastr.error(`Could not sync hazard with id ${id} because it is in the wrong workflow state. For more details please check the cdmHazardHistory list and filter the Title by "synced".`)
                                                                unsuccessfulSyncs.push(`Hazard ${id}: could not be synced because it is in the incorrect workflow state. Expected state: Ready for review by ${configData['Client Name']}, actual state: ${data.d.results[i]['cdmCurrentStatus']}. Confirm with ${configData['Client Name']} it is in the correct state.\n`);
                                                                error = true;
                                                            }
                                                        }

                                                        if (!error) {
                                                            history = auditTrailLine + history;
                                                            tdata.push(`cdmReviews|${history}`);
                                                            hazardsToSync.push({
                                                                id: id,
                                                                tdata: tdata
                                                            });
                                                        }
                                                    } else {
                                                        toastr.error(`Could not sync hazard with id ${id} because it has been modified after the review by ${configData['Client Name']}. For more details please check the cdmHazardHistory list and filter the Title by "synced".`);
                                                        unsuccessfulSyncs.push(`Hazard ${id}: could not be synced because it has been modified after the review by ${configData['Client Name']}. Confirm with ${configData['Client Name']} it is in the correct state.\n`);
                                                    }
                                                    if (i == data.d.results.length-1) {
                                                        // We'll keep an array of deferred promises which each resolve to true when the hazard is successfully or unsuccessfully written to sharepoint.
                                                        // When all promises are resolved we can then safely write the audit information
                                                        const promises = [];
                                                        for (let j=0; j<hazardsToSync.length; j++) {
                                                            const deffered = new $.Deferred();
                                                            promises.push(deffered);
                                                            await cdmdata.update('cdmHazards', hazardsToSync[j].tdata, 'clientSync', hazardsToSync[j].id,
                                                            () => {
                                                                successfulSyncs.push(id)
                                                                deffered.resolve(true);
                                                            },
                                                            () => {
                                                                unsuccessfulSyncs.push(`Hazard ${id}: could not be syned due to any internal SharePoint error. Please review the sync file and try again.`);
                                                                deffered.resolve(true);
                                                            })
                                                        }

                                                        if (hazardsToSync.length == 0) {
                                                            recordSyncAudit(successfulSyncs, unsuccessfulSyncs, csvFile.files[0].name);
                                                        } else {
                                                            $.when(...promises).then(() => {
                                                                recordSyncAudit(successfulSyncs, unsuccessfulSyncs, csvFile.files[0].name);
                                                            })
                                                        }
                                                    }
                                                }
                                            }
                                        })
                                    } else {
                                        toastr.error('Invalid file format')
                                    }
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

                async function recordSyncAudit(successfulSyncList, unsuccessfulSyncList, filename) {
                    // Function to record the audit information of the hazard sync to the cdmHazardHistory list
                    const cdmHazardHistory = list('cdmHazardHistory');
                    const itemCreateInfo = new SP.ListItemCreationInformation();
                    const oListItem = cdmHazardHistory.addItem(itemCreateInfo);
                    oListItem.set_item('Title', 'synced');
                    if (successfulSyncList.length > 0 && unsuccessfulSyncList.length > 0) {
                        oListItem.set_item('cdmAction', `File name: ${filename}\nSuccessful syncs: ${successfulSyncList}\n Unsuccessful syncs:\n${unsuccessfulSyncList}`);
                    } else if (successfulSyncList.length == 0) {
                        oListItem.set_item('cdmAction', `File name: ${filename}\nSuccessful syncs: N/A\n Unsuccessful syncs:\n${unsuccessfulSyncList}`);
                    } else if (unsuccessfulSyncList.length == 0) {
                        oListItem.set_item('cdmAction', `File name: ${filename}\nSuccessful syncs: ${successfulSyncList}\n Unsuccessful syncs: N/A`);
                    }
                    oListItem.update();
                    ctx().load(oListItem);
                    await ctx().executeQueryAsync(onSuccess());

                    function onSuccess() {
                        toastr.success('<br/>Successfully recorded audit information for this sync. To review this information access the cdmHazardHistory list and filter the Title by "synced", or follow this <a href="https://mottmac.sharepoint.com/teams/pj-a814/ps-master/Lists/cdmHazardHistory/AllItems.aspx?isAscending=false&FilterField1=LinkTitle&FilterValue1=synced" target="_blank"><u>link</u></a>.', 'Sync Audit Information', { timeOut: 0, extendedTimeOut: 0, closeButton: true });
                    }

                    function onFailure() {
                        toastr.error('Failed to record audit information for this sync');
                    }
                }
            }
            if (ulink == 'archivehazards') {
                // First get the user roles and verify that they are allowed to archive hazards
                const userId = _spPageContextInfo.userId;
                const usersListUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUsers%27)/items?$filter=cdmUser%20eq%20${userId}`;
                $.ajax({
                    url: usersListUrl,
                    method: 'GET',
                    headers: {
                        "Accept": "application/json; odata=verbose"
                    },
                    success: (userData) => {
                        if (userData.d.results.length == 0) {
                            toastr.error('You do not have any user roles assigned. Please ask your system administrator to add you to the system.')
                        } else {
                            // Now we need to get the user roles data and match the id from the user data
                            const userRolesUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUserRoles%27)/items`;

                            $.ajax({
                                url: userRolesUrl,
                                method: 'GET',
                                headers: {
                                    "Accept": "application/json; odata=verbose"
                                },
                                success: (userRoleData) => {
                                    const authorisedRoles = userRoleData.d.results.filter((x) => { return configData['Archive hazards permissions'].includes(x.Title) })

                                    const userRolesParsed = userData.d.results.map(x => x.cdmUserRoleId)
                                    const authorisedRolesParsed = authorisedRoles.map(x => x.ID)
                                    if (userRolesParsed.some(x => authorisedRolesParsed.includes(x))) {
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
                                        toastr.error('You do not have the required permissions to archive hazards. Ask your system administrator to grant you further user roles.')
                                    }
                                },
                                error: {
                                    function(error) {}
                                }
                            })
                        }
                        // You ned to get the cdmUserRoles data as well and map the user role id to the role name
                    },
                    error: {
                        function(error) {}
                    }
                })

                // Get all the list items and then filter for the ones thhat are cancelled. We have to it this way round (even though it makes no sense) because you can't filter by the required column
                // We request the data again instead of using allHazardsData because the allHazardsData is the result of a request that is limitted to 5000 items. The below request searches the entire
                // dataset.
                let url = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmHazards%27)/items`;
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
                                getCdmHazardsListItemsAndArchive()
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
                            if (cdmHazardData[i].cdmLastReviewSnapshot) hazardData.push(`cdmLastReviewSnapshot|${cdmHazardData[i].cdmLastReviewSnapshot}`);
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
                            if (cdmHazardData[i].cdmPASRiskClassification) hazardData.push(`cdmPASRiskClassification|${cdmHazardData[i].cdmPASRiskClassification}`);
                            if (cdmHazardData[i].cdmStageExtraId) hazardData.push(`cdmStageExtra|${cdmHazardData[i].cdmStageExtraId}`);
                            if (cdmHazardData[i].cdmResidualRiskOwner) hazardData.push(`cdmResidualRiskOwner|${cdmHazardData[i].cdmResidualRiskOwner}`);
                            if (cdmHazardData[i].cdmContract) hazardData.push(`cdmContract|${cdmHazardData[i].cdmContract}`);
                            if (cdmHazardData[i].ID) hazardData.push(`cdmHazardId|${cdmHazardData[i].ID}`);
                            if (cdmHazardData[i].Title) hazardData.push(`Title|${cdmHazardData[i].Title}`);

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
                                deferred.resolve(true);
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

            if (ulink == 'exportbulkupload') {
                // First lets check that the current user is authorised to do this.
                const userId = _spPageContextInfo.userId;
                const usersListUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUsers%27)/items?$filter=cdmUser%20eq%20${userId}`;
                $.ajax({
                    url: usersListUrl,
                    method: 'GET',
                    headers: {
                        "Accept": "application/json; odata=verbose"
                    },
                    success: (userData) => {
                        if (userData.d.results.length == 0) {
                            toastr.error('You do not have any user roles assigned. Please ask your system administrator to add you to the system.')
                        } else {
                            // Now we need to get the user roles data and match the id from the user data
                            const userRolesUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUserRoles%27)/items`;

                            $.ajax({
                                url: userRolesUrl,
                                method: 'GET',
                                headers: {
                                    "Accept": "application/json; odata=verbose"
                                },
                                success: (userRoleData) => {
                                    const authorisedRoles = userRoleData.d.results.filter((x) => { return 'Design Manager' === x.Title }) // We can change this to config data later

                                    const userRolesParsed = userData.d.results.map(x => x.cdmUserRoleId)
                                    const authorisedRolesParsed = authorisedRoles.map(x => x.ID)
                                    if (userRolesParsed.some(x => authorisedRolesParsed.includes(x))) {
                                        filterExportData()
                                    } else {
                                        toastr.error('You do not have the required permissions to export data for bulk uploads. Ask your system administrator to grant you further user roles.');
                                    }
                                },
                                error: {
                                    function(error) {}
                                }
                            })
                        }
                        // You ned to get the cdmUserRoles data as well and map the user role id to the role name
                    },
                    error: {
                        function(error) {}
                    }
                })

                // To save effort we can reuse the code for the extra button for the filters. The outcome of what we want is largely the same except we don't want to filter the data on screen, we
                // want to filter the export data. We can just change what the apply filters button does to do achieve this. This is done in the tposcustomfilters function.
                function filterExportData() {
                    gimmepops("Filter Export Data",
          
                    '<p style="color:white">Please select the filters to apply to the export.<p>' +
                    '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>');
                    $('#langOpt').multiselect({
                        columns: 1,
                        placeholder: 'Select Languages',
                        search: true,
                        selectAll: true
                    });
                    
                    cdmdata.get("cdmhazards","",null,"frmsel_customfilters",null,null,[], 'export');
                }
            }

            if (ulink == 'importbulkupload') {
                // First lets check that the current user is authorised to do this.
                const userId = _spPageContextInfo.userId;
                const usersListUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUsers%27)/items?$filter=cdmUser%20eq%20${userId}`;
                $.ajax({
                    url: usersListUrl,
                    method: 'GET',
                    headers: {
                        "Accept": "application/json; odata=verbose"
                    },
                    success: (userData) => {
                        if (userData.d.results.length == 0) {
                            toastr.error('You do not have any user roles assigned. Please ask your system administrator to add you to the system.')
                        } else {
                            // Now we need to get the user roles data and match the id from the user data
                            const userRolesUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUserRoles%27)/items`;

                            $.ajax({
                                url: userRolesUrl,
                                method: 'GET',
                                headers: {
                                    "Accept": "application/json; odata=verbose"
                                },
                                success: (userRoleData) => {
                                    const authorisedRoles = userRoleData.d.results.filter((x) => { return 'Design Manager' === x.Title }) // We can change this to config data later

                                    const userRolesParsed = userData.d.results.map(x => x.cdmUserRoleId)
                                    const authorisedRolesParsed = authorisedRoles.map(x => x.ID)
                                    if (userRolesParsed.some(x => authorisedRolesParsed.includes(x))) {
                                        importData()
                                    } else {
                                        toastr.error('You do not have the required permissions to export data for bulk uploads. Ask your system administrator to grant you further user roles.');
                                    }
                                },
                                error: {
                                    function(error) {}
                                }
                            })
                        }
                        // You ned to get the cdmUserRoles data as well and map the user role id to the role name
                    },
                    error: {
                        function(error) {}
                    }
                })

                /**
                * Imports data from a CSV file into SharePoint lists.
                * Handles parsing CSV data, converting to JSON, and updating list items.
                */
                function importData() {
                    // Display a popup for importing CSV data.
                    gimmepops(`Import bulk edit CSV`,
                    `<div id="popscontentarea">
                        <input id="csvFileInput" type="file" accept=".csv"/><input id="bulk-upload-button" type="button" value="Upload changes"/>
                    </div>`);

                    // Upload the CSV file to SharePoint when the button is clicked.
                    $("#bulk-upload-button").on("click", () => {

                        const csvFile = document.getElementById("csvFileInput");
                        const fileName = csvFile.files[0].name;

                        if (fileName.split('.')[1] !== 'csv') {
                            toastr.error('Invalid file format. Please convert the file to a csv before uploading.')
                        } else {
                            processCSVFile(csvFile);
                        }
                    })

                    /**
                    * Parses a CSV string into a two-dimensional array of rows and columns.
                    *
                    * @param {string} strData - The CSV string to be parsed.
                    * @param {string} strDelimiter - The delimiter used to separate fields in the CSV.
                    * @returns {string[][]} - A two-dimensional array containing the parsed CSV data.
                    */
                    function CSVToArray(strData, strDelimiter) {
                        // Create a regular expression to parse the CSV values.
                        var objPattern = new RegExp(
                            (
                                // Delimiters, newline characters, and start of line.
                                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                                // Quoted fields.
                                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                                // Non-quoted fields.
                                "([^\"\\" + strDelimiter + "\\r\\n]*))"
                            ),
                            "gi"
                        );

                        // Initialize an array to hold the parsed data, starting with an empty row.
                        var arrData = [[]];

                        // An array to store matched groups from the pattern.
                        var arrMatches = null;

                        // Loop through the CSV string, matching the pattern.
                        while ((arrMatches = objPattern.exec(strData))) {
                            // Get the delimiter that was found.
                            var strMatchedDelimiter = arrMatches[1];

                            // If delimiter is not the field delimiter, add a new row.
                            if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
                                arrData.push([]); // Start a new row.
                            }

                            // Determine the matched value, either quoted or unquoted.
                            var strMatchedValue;

                            if (arrMatches[2]) {
                                // Quoted value found; unescape double quotes if present.
                                strMatchedValue = arrMatches[2].replace(
                                    new RegExp("\"\"", "g"),
                                    "\""
                                );
                            } else {
                                // Non-quoted value found.
                                strMatchedValue = arrMatches[3];
                            }

                            // Add the value to the current row in the array.
                            arrData[arrData.length - 1].push(strMatchedValue);
                        }

                        // Return the parsed data as a two-dimensional array.
                        return arrData;
                    }


                    /**
                    * Converts a nested array, where index 0 represents the header row, into an array of objects.
                    *
                    * @param {Array} csv_array - The nested array where index 0 is the header row.
                    * @returns {Array<Object>} - An array of objects with keys derived from the header row.
                    */
                    function convertCSVArrayToJSON(csv_array) {
                        csv_header = csv_array[0]
                        csv_data = csv_array.slice(1)
                        const csv_objects = csv_data.map(row => row.reduce((result, field, index) => ({...result, [csv_header[index]]: field}), {}))
                        return csv_objects
                    }


                    /**
                    * Retrieves data from a collection of SharePoint lists.
                    *
                    * @param {Array<string>} listNames - An array of SharePoint list names.
                    * @returns {Promise<Array>} - A promise that resolves with an array of data from all requested lists.
                    */
                    function getMultipleLists(listNames) {
                        const listDataPromises = listNames.map(listName => getList(listName))
                        return Promise.all(listDataPromises)
                    }

                    /**
                    * Retrieves data from a specified SharePoint list using an AJAX request.
                    *
                    * @param {string} listName - The name of the SharePoint list.
                    * @returns {Promise<Object>} - A promise that resolves with data from the specified list.
                    */
                    function getList(listName) {
                        const listUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27${listName}%27)/items`;
                        return $.ajax({
                            url: listUrl,
                            method: 'GET',
                            headers: {
                                "Accept": "application/json; odata=verbose"
                            }
                        });
                    }

                    /**
                    * Process a CSV file, convert its contents to JSON, and update SharePoint list items.
                    * @param {File} file - The CSV file to process.
                    */
                    async function processCSVFile(file) {
                        try {
                            const csvData = await readCSVFile(file);
                            const csvObjects = convertCSVArrayToJSON(csvData);
                            const listNames = ["cdmSites", "cdmStages", "cdmPWStructures", "cdmStagesExtra", "cdmHazardTypes", "cdmUsers"];
                            const lookupData = await getListDataForLookupColumns(listNames);

                            await updateListItems(csvObjects, lookupData);

                            toastr.success("Finished bulk update");
                        } catch (error) {
                            handleProcessingError(error);
                        }
                    }

                    /**
                    * Read the contents of a CSV file and parse it into an array of rows.
                    * 
                    * @param {File} file - The CSV file to read.
                    * @returns {string[][]} - Array of rows from the CSV file.
                    */
                    async function readCSVFile(file) {
                        return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                const csvData = CSVToArray(reader.result, ",");
                                resolve(csvData);
                            };
                            reader.onerror = (error) => reject(error);
                            reader.readAsText(file.files[0]);
                        });
                    }

                    /**
                    * Get data from SharePoint lists for lookup columns.
                    * 
                    * @param {string[]} listNames - Names of lists to retrieve data from.
                    * @returns {object} - Lookup data from SharePoint lists.
                    */
                    async function getListDataForLookupColumns(listNames) {
                        const arrayOfListData = await getMultipleLists(listNames);
                        return arrayOfListData.reduce((result, field, index) => ({
                            ...result,
                            [listNames[index]]: field.d.results
                        }), {});
                    }

                    /**
                    * Finds ID for Title values which are used in Lookup Columns.
                    * 
                    * @param {string[]} lookupList - List of all IDs and Titles in SharePoint List used for Lookup.
                    * @param {string[]} titleValue - Title value which needs to be matched to find ID.
                    * @returns {string} - ID of value.
                    */
                    function getIDofLookupItem(lookupList, titleValue) {
                        console.log(lookupList)
                        return lookupList.filter((lookupItem) => titleValue == lookupItem.Title)[0]?.ID
                    }

                    /**
                    * Update SharePoint list items with CSV data.
                    * 
                    * @param {object[]} csvObjects - Array of JSON objects from the CSV data.
                    * @param {object} lookupData - Lookup data from SharePoint lists.
                    */
                    async function updateListItems(csvObjects, lookupData) {
                        const promises = csvObjects.map(async (csvObject) => {
                            const hazardID = csvObject.ID;
                            if (hazardID) {
                                const oListItem = list("cdmHazards").getItemById(hazardID);
                                oListItem.set_item("cdmSite", getIDofLookupItem(lookupData.cdmSites, csvObject.Site))
                                oListItem.set_item("cdmPWStructure", getIDofLookupItem(lookupData.cdmPWStructures, csvObject["PW Structure"]))
                                oListItem.set_item("cdmHazardType", getIDofLookupItem(lookupData.cdmHazardTypes, csvObject["Hazard Type"]))
                                oListItem.set_item("cdmHazardOwner", getIDofLookupItem(lookupData.cdmUsers, csvObject["Hazard Owner"]))
                                oListItem.set_item("cdmHazardTags", csvObject["Hazard Tags"])
                                oListItem.set_item("cdmHazardDescription", csvObject["Hazard Description"]);
                                oListItem.set_item("cdmRiskDescription", csvObject["Risk Description"]);
                                oListItem.set_item("cdmMitigationDescription", csvObject["Mitigation Description"]);
                                // TODO: The cdmInitialRisk and cdmResidualRisk fields need to be updated based on the "Initial Risk Score", "Initial Severity Score",
                                // "Initial Likelihood Score", "Residual Risk Score", "Residual Severity Score", "Residual Likelihood Score".
                                // oListItem.set_item("cdmInitialRisk", csvObject["Initial Risk"]);
                                // oListItem.set_item("cdmResidualRisk", csvObject["Residual Risk"]);
                                oListItem.set_item("cdmStageMitigationSuggestion", csvObject["Mitigation Suggestions"]);
                                oListItem.set_item("cdmUniclass", csvObject.Status)
                                oListItem.set_item("cdmLastReviewStatus", csvObject["Last Review Status"])
                                oListItem.set_item("cdmLastReviewer", csvObject["Last Reviewer"])
                                // TODO: Need to ensure that review data is a valid datetime string
                                // oListItem.set_item("cdmLastReviewDate", csvObject["Last Review Date"])
                                oListItem.set_item("cdmCurrentStatus", csvObject["Workflow Status"])
                                // TODO: "Peer Reviewer" and "Design Manager" field missing - both of these will update the "cdmReviews" field below
                                // oListItem.set_item("cdmReviews", csvObject.cdmReviews)
                                oListItem.set_item("cdmHazardCoordinates", csvObject.Coordinates)
                                oListItem.set_item("cdmResidualRiskOwner", csvObject["Residual Risk Owner"])
                                oListItem.set_item("CurrentMitigationOwner", getIDofLookupItem(lookupData.cdmUsers, csvObject["Current Mitigation Owner"]))
                                oListItem.set_item("CurrentReviewOwner", getIDofLookupItem(lookupData.cdmUsers, csvObject["Current Review Owner"]))
                                oListItem.set_item("cdmLinks", csvObject["PW Links"])
                                oListItem.update();
                                ctx().load(oListItem);

                                return new Promise((resolve, reject) => {
                                    ctx().executeQueryAsync(
                                        () => {
                                            handleSuccess(hazardID);
                                            resolve(true);
                                        },
                                        (sender, args) => {
                                            handleFailure(hazardID, args);
                                            reject(args);
                                        }
                                    );
                                });
                            }
                        });

                        await Promise.all(promises);
                    }

                    /**
                    * Handle a successful update.
                    * 
                    * @param {string} hazardID - ID of the updated hazard.
                    */
                    function handleSuccess(hazardID) {
                        toastr.success(`Updated hazard with ID ${hazardID}`);
                    }

                    /**
                    * Handle a failure during update.
                    * 
                    * @param {string} hazardID - ID of the hazard that failed to update.
                    * @param {object} args - Arguments containing error details.
                    */
                    function handleFailure(hazardID, args) {
                        toastr.error(`Failed to update hazard with ID ${hazardID}`);
                    }

                    /**
                    * Handle errors that occur during processing.
                    * 
                    * @param {Error} error - The error that occurred.
                    */
                    function handleProcessingError(error) {
                        console.error("An error occurred:", error);
                        toastr.error("An error occurred");
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
    $(".home-button")
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
                    const url = `${_spPageContextInfo.webServerRelativeUrl}/_api/web/lists/getByTitle(%27cdmHazards%27)/items?$select=cdmCurrentStatus&$filter=ID%20eq%20${hzd}`;
                    $.ajax({
                        url: url,
                        method: 'GET',
                        headers: {
                            "Accept": "application/json; odata=verbose"
                        },
                        success: (data) => {
                            const cdmCurrentStatus = data.d.results[0].cdmCurrentStatus;
                            if (!['Accepted', `Accepted by ${configData['Client Name']}`, `Ready for review by ${configData['Client Name']}`].includes(cdmCurrentStatus)) {
                                gimmepops(
                                    "Assigning a Residual Risk Owner",
                                    '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                                );
                                cdmdata.get("cdmResidualRiskOwners", "", null, "frmsel_ResidualRiskOwner", hc,null,[]);
                            } else {
                                toastr.error(`You cannot update the residual risk owner because the hazard has a current status of "${cdmCurrentStatus}"`);
                            }
                        }
                    });
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
                            toastr.error(`This hazard is under peer review so is locked for editing. Please review this hazard and submit a change request if it requires editing. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        } else if (configData['Peer review editable workflow state']) {
                            toastr.error(`This hazard is under peer review so is locked for editing for all users except designers. Contact a designer to complete the review or make an edit. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`)
                        } else {
                            toastr.error(`This hazard is under peer review so is locked for editing. Contact a designer to complete the review. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        }
                    } else if (designManagerReviewStage) {
                        const canDesignManagerReview = $("#" + hi + " .ucd").hasClass("_1");
                        if (canDesignManagerReview) {
                            toastr.error(`This hazard is under design manager review so is locked for editing. Please review this hazard and submit a change request if it requires editing. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        } else if (configData['Design manager review editable workflow state']) {
                            toastr.error(`This hazard is under design manager review so is locked for editing for all users except designers. Contact a design manager to complete the review or make an edit. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`)
                        } else {
                            toastr.error(`This hazard is under design manager review so is locked for editing. Contact a designer manager to complete the review. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        }
                    } else if (preconstructionReviewStage) {
                        const canPreconstructionReview = $("#" + hi + " .ucpc").hasClass("_1");
                        if (canPreconstructionReview) {
                            toastr.error(`This hazard is under pre-construction review so is locked for editing. Please review this hazard and submit a change request if it requires editing. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        } else if (configData['Pre-construction review editable workflow state']) {
                            toastr.error(`This hazard is under pre-construction review so is locked for editing for all users except construction managers. Contact a construction manager to complete the review or make an edit. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`)
                        } else {
                            toastr.error(`This hazard is under pre-construction review so is locked for editing. Contact a construction manager to complete the review. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        }
                    } else if (principleDesignerReviewStage) {
                        const canPrincipleDesignerReview = $("#" + hi + " .ucl").hasClass("_1");
                        if (canPrincipleDesignerReview) {
                            toastr.error(`This hazard is under principal designer review so is locked for editing. Please review this hazard and submit a change request if it requires editing. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        } else if (configData['Principal designer review editable workflow state']) {
                            toastr.error(`This hazard is under principal designer review so is locked for editing for all users except principal designers. Contact a principal designer to complete the review or make an edit. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`)
                        } else {
                            toastr.error(`This hazard is under principal designer review so is locked for editing. Contact a principal designer to complete the review. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        }
                    } else if (constructionManagerReviewStage) {
                        const canConstructionManagerReview = $("#" + hi + " .ucs").hasClass("_1");
                        if (canConstructionManagerReview) {
                            toastr.error(`This hazard is under construction manager review so is locked for editing. Please review this hazard and submit a change request if it requires editing. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        } else if (configData['Construction manager review editable workflow state']) {
                            toastr.error(`This hazard is under construction manager review so is locked for editing for all users except construction managers. Contact a construction manager to complete the review or make an edit. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`)
                        } else {
                            toastr.error(`This hazard is under construction manager review so is locked for editing. Contact a construction manager to complete the review. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        }
                    } else if (revstatus == 'Accepted') {
                        if (configData['Client Review']) {
                            toastr.error('This hazard has been accepted so is locked for editing. If necessary you can submit this hazard for client review.');
                        } else {
                            toastr.error('This hazard has been accepted so is locked for editing.');
                        }
                    } else if (revstatus == 'Ready for review by Client') {
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
                                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                        $("#pops").remove();
                                    }
                                });
                            });
                        });

                        // $('#pops').css('min-height','250px');
                    }
                    if (fld == "cdmInitialRisk") {
                        gimmepops("Setting the risk score", '<div id="rsselector"></div>');
                        $("#rsselector").load(
                            "../3.0/html/risk.initial.selection.panel.html",
                            function() {
                                $("#inirisk").append(
                                    '<div class="tpos-left-btn sv-hazard" onclick="saversk(\'' +
                                    fld +
                                    "');\">Save</div>"
                                );
                            }
                        );
                    }
                    if (fld == "cdmResidualRisk") {
                        gimmepops("Setting the risk score", '<div id="rsselector"></div>');
                        $("#rsselector").load(
                            "../3.0/html/risk.residual.selection.panel.html",
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

                    if (fld == 'cdmSMMitigationSuggestion') {
                        let canSiteManagerEdit = false;
                        let systemAdmin = false;
                        for (let i=0; i<userRolesSites.length; i++) {
                            if (userRolesSites[i][0] == 'Construction Manager' && userRolesSites[i][1] == s) {
                                canSiteManagerEdit = true;
                            }
                            if (userRolesSites[i][0] == 'System admin') {
                                systemAdmin = true;
                            }
                        }
                        if ((fld == "cdmSMMitigationSuggestion" && canSiteManagerEdit) || systemAdmin) {
                            if (!configData['Construction manager approval comment populates cdmSMMitigationSuggestion'] || systemAdmin) { // If this is the case you should only be able to edit this field through the approval comment
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
                            } else {
                                toastr.error('This field can only be edited through the site managers approval comment at the pre-construction review workflow stage');
                            }
                        } else {
                            toastr.error("You cannot provide a construction manager's mitigation suggestion because you are not a construction manager for the site where this hazard is located");
                        }
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
                    } else if (!raid && !ratx) {
                        toastr.error('Please ask the system admin to add RAMS data to the system')
                    } else if (!ratx) {
                        toastr.error('The selected RAMS is incorrectly formatted. Please ask the system admin to correct the format, removing all whitespace from the RAMS title.')
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
function tposcustomfilters( data, forExport) {
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

        if (ittitle !== undefined && !distlistcdmStageExtra.includes(ittitle)){
            distlistcdmStageExtra.push(ittitle);
            selectcdmStageExtra += '<option value="'+ittitle+'">'+ittitle+'</option>'
        }

        if (itcdmpwstructureid !== undefined && !distlistcdmpwstructure.includes(itcdmpwstructureid)){
            distlistcdmpwstructure.push(itcdmpwstructureid);
            selectcdmpwstructure += '<option value="'+itcdmpwstructuretitle+'">'+itcdmpwstructuretitle+'</option>'
        }

        if (itcdmCurrentStatus !== undefined && !distlistcdmCurrentStatus.includes(itcdmCurrentStatus) && (forExport && configData['Exportable workflow states'].includes(itcdmCurrentStatus))){
            distlistcdmCurrentStatus.push(itcdmCurrentStatus);
            selectcdmCurrentStatus += '<option value="'+itcdmCurrentStatus+'">'+itcdmCurrentStatus+'</option>'
        }

        if (itcdmResidualRiskOwner !== undefined && !distlistcdmResidualRiskOwner.includes(itcdmResidualRiskOwner)){
            distlistcdmResidualRiskOwner.push(itcdmResidualRiskOwner);
            selectcdmResidualRiskOwner += '<option value="'+itcdmResidualRiskOwner+'">'+itcdmResidualRiskOwner+'</option>'
            // selectcdmResidualRiskOwner = "<option value= 'HS2 Infrastructure Management SME' >HS2 Infrastructure Management SME</option>"+
            // "<option value= 'HS2 Rail Systems Interface Engineer'>HS2 Rail Systems Interface Engineer</option>"
        }

     
      //console.log('distlistcdmCurrentStatus',distlistcdmCurrentStatus);
      
    }
    $("#popscontentarea").html('');
    $(".pops-content").append(
        forExport === undefined ? '<button id="applyfilters" style="float:right">apply filters</button>' : '<button id="applyfiltersforexport" style="float:right">export</button>'+
        '<div class ="customfiltersection" id="popscontentarea1"> <select name="cdmpwstructurefilter[]" multiple id="cdmpwstructurefilter">' +  selectcdmpwstructure
        +"</select><br> </div>"+
        '<div class ="customfiltersection" id="popscontentarea2"> <select name="cdmStageExtrafilter[]" multiple id="cdmStageExtrafilter">' +  selectcdmStageExtra
        +"</select><br> </div>"+
        '<div class ="customfiltersection" id="popscontentarea3"> <select name="cdmCurrentStatusfilter[]" multiple id="cdmCurrentStatusfilter">' +  selectcdmCurrentStatus
        +"</select><br> </div>"+
        (forExport === undefined ? '<div class ="customfiltersection" id="popscontentarea4"> <select name="cdmResidualRiskOwnerfilter[]" multiple id="cdmResidualRiskOwnerfilter">' +  selectcdmResidualRiskOwner : '')
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

    $('#applyfiltersforexport').click(() => {

        /*
        Maps hazard info to column names used in the Export Excel file. It also sanitises
        the hazard information. This sanitisation will need to be reversed when the
        CSV is reimported once changes have been made by the user. */
        const mappingObj = (obj) => {
            var result = {};
            result.ID = sanitiseInput(obj.ID);
            result.Site = sanitiseInput(obj.cdmSite.Title);
            result["PW Structure"] = sanitiseInput(obj.cdmPWStructure.Title);
            result.Stage = sanitiseInput(obj.cdmStageExtra.Title);
            result["Hazard Type"] = sanitiseInput(obj.cdmHazardType.Title);
            result["Hazard Owner"] = sanitiseInput(obj.cdmHazardOwner.Title);
            result["Hazard Tags"] = sanitiseInput(obj.cdmHazardTags);
            result.Entity = sanitiseInput(obj.cdmEntityTitle);
            result["Hazard Description"] = sanitiseInput(obj.cdmHazardDescription);
            result["Risk Description"] = sanitiseInput(obj.cdmRiskDescription);
            result["Mitigation Description"] = sanitiseInput(obj.cdmMitigationDescription);
            result["Initial Risk"] = sanitiseInput(obj.cdmInitialRisk);
            result["Residual Risk"] = sanitiseInput(obj.cdmResidualRisk);
            result["Mitigation Suggestions"] = sanitiseInput(obj.cdmStageMitigationSuggestion);
            result.Status = sanitiseInput(obj.cdmUniclass);
            result.RAMS = sanitiseInput(obj.cdmRAMS);
            result["Last Review Status"] = sanitiseInput(obj.cdmLastReviewStatus);
            result["Last Reviewer"] = sanitiseInput(obj.cdmLastReviewer);
            result["Last Review Type"] = sanitiseInput(obj.cdmLastReviewType);
            result["Last Review Date"] = sanitiseInput(obj.cdmLastReviewDate);
            result["Workflow Status"] = sanitiseInput(obj.cdmCurrentStatus);
            result.Coordinates = sanitiseInput(obj.cdmHazardCoordinates);
            result.Geometry = sanitiseInput(obj.cdmGeometry);
            result.TW = sanitiseInput(obj.cdmTW);
            result["Residual Risk Owner"] = sanitiseInput(obj.cdmResidualRiskOwner);
            result["Current Mitigation Owner"] = sanitiseInput(obj.CurrentMitigationOwner.Title);
            result["Current Review Owner"] = sanitiseInput(obj.CurrentReviewOwner.Title);
            result["PW Links"] = sanitiseInput(obj.cdmLinks);
            result.Title = sanitiseInput(obj.Title);
            result.Created = sanitiseInput(obj.Created);
            result["Created By"] = sanitiseInput(obj.Author.Title);
            result.Modified = sanitiseInput(obj.Modified);
            result["Modified By"] = sanitiseInput(obj.Editor.Title);
            result.cdmReviews = sanitiseInput(obj.cdmReviews);

            return result
        }

        /*
        Returns a boolean based on whether a given hazard complies with the filters selected by
        the user in the filter pane on export. If no filters are selected for a given filter, it
        skips the compliance check as otherwise it would exclude everything. */
        const filterHazards = (hazard, filterParam) => {
            var flag = true;
            if (filterParam.cdmPWStructure.length && flag) {
                flag = filterParam.cdmPWStructure.includes(hazard.cdmPWStructure.Title);
            }

            if (filterParam.cdmStageExtra.length && flag) {
                flag = filterParam.cdmStageExtra.includes(hazard.cdmStageExtra.Title);
            }

            if (filterParam.cdmCurrentStatus.length && flag) {
                flag = filterParam.cdmCurrentStatus.includes(hazard.cdmCurrentStatus);
            }

            return flag;
        }

        /*
        Download function for CSV file. Needs to convert to Blob to ensure full dataset is downloaded.
        If this is not done, the data will be truncated on download. */
        var downloadCSV = (data, fileName) => {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            var blob = new Blob([data], {type: "text/csv;charset=utf-8"})
            var url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        };

        /*
        Sanitises values for CSV by wrapping values in quotes and ensuring that existing
        quotation marks don't cause issues by replacing them with double quotes. Null values
        should not be wrapped in quotes as this causes them to be entered into the CSV as text. */
        const sanitiseInput = (value) => {
            if (typeof value === "string") {
                sanitisedString = `"${value.replace(/\"/g, '""')}"`;
                return sanitisedString;
            } else if (value) {
                return `"${value}"`;
            } else {
                return null;
            }
        }


        /**
         * Step 1:
         * filterParam is populated with the values selected by the user for each filter dropdown.
         * This is used on export to ensure that only hazards meeting the filter requirements
         * are exported
         */ 
        let filterParam = {
            cdmPWStructure: [],
            cdmStageExtra: [],
            cdmCurrentStatus: []
        };

        const assetFilterSelected = $('#cdmpwstructurefilter').find(':selected');
        for (i=0; i<assetFilterSelected.length; i++) {
            filterParam.cdmPWStructure.push(assetFilterSelected[i].innerText);
        }

        const stageFilterSelected = $('#cdmStageExtrafilter').find(':selected');
        for (i=0; i<stageFilterSelected.length; i++) {
            filterParam.cdmStageExtra.push(stageFilterSelected[i].innerText);
        }

        const statusFilterSelected = $('#cdmCurrentStatusfilter').find(':selected');
        for (i=0; i<statusFilterSelected.length; i++) {
            filterParam.cdmCurrentStatus.push(statusFilterSelected[i].innerText);
        }

        /**
         * Step 2:
         * Create CSV file.
         */
        let csvContent = "";
        let csvHeader = Object.keys(mappingObj(tlist[0])).join(',');
        let csvValues = tlist.filter(element => filterHazards(element, filterParam))
                            .map(element => Object.values(mappingObj(element)).join(','))
                            .join('\n');
        csvContent += csvHeader + '\n' + csvValues;

        /**
         * Step 3:
         * Download CSV file.
         */
        downloadCSV(csvContent, `safetibase_export_${Date.now()}.csv`)

        $(".pops-title").html("");
        $(".pops-content").html("");
        $("#pops").remove();
    })

  
   
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
                            if (configData['Construction manager approval comment populates cdmSMMitigationSuggestion']) {
                                document.getElementById('approval-explainer').innerHTML = 'Please carefully review the hazard, the risk, and the mitigation method(s) before accepting or acknowledging the \
                                residual risk. Should you feel that changes are required, please use the comment box and press the change request button. If you wish to approve the hazard please use the \
                                comment box to enter your mitigation suggestion (if necessary) and press the approve button.';

                                document.getElementById('cmt').placeholder = 'Enter change requests or your mitigation suggestion here';
                            }
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
                                        if (configData['Construction manager approval comment populates cdmSMMitigationSuggestion']) { // For the case where the client want their approval comment to populate the mitigation suggestion
                                            if (cmt) {
                                                tdata.push(`cdmSMMitigationSuggestion|${cmt}`);
                                            }
                                            cmt = '';
                                        }
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
                        tdata.push(`cdmCurrentStatus|Ready for review by ${configData['Client Name']}`);
                        tdata.push("cdmLastReviewDate|" + ind);
                        tdata.push(`cdmLastReviewStatus|Ready for review by ${configData['Client Name']}`);
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