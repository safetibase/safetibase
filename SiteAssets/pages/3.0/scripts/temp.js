function hzdreviewbuttonaction() {
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

            if (a == "initiatereview") {
                // var q='cdmCompany/ID eq \''+c+'\' and cdmUser/ID ne \''+uid()+'\' and cdmUserRole/Title eq \''+ur+'\'';
                var vcheck = $('#h_' + hzd + ' .cdmStageMitigationSuggestion').html();
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
                                        if (ns == 1) {
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
                                        tdata.push("cdmReviews|" + nl);
                                        tdata.push(
                                            "cdmCurrentStatus|Under Methods & Constructability Review"
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
                    gimmepops("Undertake the Methods & Constructability Review", "", "bigger");

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
                                            "completed Methods & Constructability Review]" +
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
                                        //     "cdmLastReviewStatus|Methods & Constructability Review completed"
                                        // );
                                        // tdata.push("cdmLastReviewer|" + unm());



                                        var ns = $("#h_" + hzd + " .rucl").hasClass("_2");
                                        if (ns === true) {
                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push(
                                                "cdmCurrentStatus|Under principal designer review"
                                            );
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push(
                                                "cdmLastReviewStatus|Methods & Constructability Review completed"
                                            );
                                            tdata.push("cdmLastReviewer|" + unm());
                                        } else {
                                            tdata.push("cdmCurrentStatus|Accepted");
                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push(
                                                "cdmLastReviewStatus|Methods & Constructability Review completed"
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
            }
        });

}