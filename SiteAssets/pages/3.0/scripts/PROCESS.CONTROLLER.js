function activateDatasets() {
  $(".dataset")
    .off("click")
    .on("click", function () {
      var hc = $(this).hasClass("active");
      $(".dataset").removeClass("active");
      $(".tpos-btn").removeClass("tpos-btn-active");
      // $('.add').addClass('tpos-btn-active');

      if (hc == 0) {
        var rid = $(this).attr("id");
        var trid = rid.split("_");
        var i = trid[1];
        // console.log('ds test id: '+i);
        // console.log(rid);
        $(this).addClass("active");
        var role = $("#" + rid + "_cdmUserRole").data("elementname");
        var comp = $("#" + rid + "_cdmCompany").data("elementname");
        var site = $("#" + rid + "_cdmSite").data("elementname");
        // toastr.success('getting user data');
        // console.log('ds test role: '+role);
        setupuserstats(role, comp, site);
        // main.setup_user(role,comp,site);
      }
      if (hc == 1) {
        // main.setup_welcome();
        setupmainareastats();
        // toastr.success('back home');
      }
    });
  $(".add")
    .off("click")
    .on("click", function () {
      var hc = $(this).hasClass("tpos-btn-active");
      $(".dataset").removeClass("active");
      $(".tpos-btn").removeClass("tpos-btn-active");
      if (hc == 0) {
        $(".add").addClass("tpos-btn-active");
        setupnewhazard();
      }
      if (hc == 1) {
        $(this).removeClass("tpos-btn-active");
        setupmainareastats();
      }
    });
    $(".xtrabtn")
    .off("click")
    .on("click", function () {
      var ulink=$(this).data('action');
      // window.location.href = 'https://tidewayeastlondon.sharepoint.com/sites/powerbi/SitePages/CDM-Risk-Register.aspx';
      // window.location.href = ulink;
      window.open(ulink,'_blank');
        });

  $(".edit")
    .off("click")
    .on("click", function () {
      var hc = $(this).hasClass("tpos-btn-active");
      $(".dataset").removeClass("active");
      $(".tpos-btn").removeClass("tpos-btn-active");
      if (hc == 0) {
        $(".edit").addClass("tpos-btn-active");
        setupEditableHazards();
      }
      if (hc == 1) {
        $(this).removeClass("tpos-btn-active");
        setupmainareastats();
      }
    });
  $(".review")
    .off("click")
    .on("click", function () {
      var hc = $(this).hasClass("tpos-btn-active");
      $(".dataset").removeClass("active");
      var action = $(this).data("action");
      toastr.success(action);
      $(".tpos-btn").removeClass("tpos-btn-active");
      if (hc == 0) {
        $(this).addClass("tpos-btn-active");
        setupReviewableHazards(action);
      }
      if (hc == 1) {
        $(this).removeClass("tpos-btn-active");
        setupmainareastats();
      }
    });
}

function activateGlobalNav() {
  $(".tgn-btn")
    .off("click")
    .on("click", function () {
      var action = $(this).data("action");
      $(".dataset").removeClass("active");
      if (action == "init") {
        setupmainareastats();
      }
      if (action == "systemstats") {
        setupsystemstats();
      }
    });
  $(".tgn-btn-xtra").mouseover(function () {
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
    .on("click", function () {
      var ii = $(this).attr("id");
      var ia = ii.split("_");
      var id = ia[1];
      var is = ia[2];
    });
}
var hzd = 0;

function activateHazardEdits() {
  console.log('edits activated');
  $(".cell")
    .off("click")
    .on("click", function () {
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
      var stage = $("#" + hi + " .cdmStage").html();
      var lastrevstatus = $("#" + hi + " .cdmLastReviewStatus").html();
      var revstatus = $("#" + hi + " .cdmCurrentStatus").html();
      // var mitigationowner=$('#'+hi+' .CurrentMitigationOwner').html();
      // var reviewowner=$('#'+hi+' .CurrentReviewOwner').html();
      var flds;
      var fld = "";

      var uce = $("#" + hi + " .uce").hasClass("_1");

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
            hc
          );
        } else {
          cdmdata.get(
            "cdmCompanies",
            "cdmCompanyRole/Title eq 'Design house'",
            null,
            "frmsel_owner",
            hc
          );
        }
      } else {
        if (!uce) {
          toastr.error("Not permitted");
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
          if (fld == "cdmPWElement") {
            gimmepops(
              "Assigning an element",
              '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
            );
            cdmdata.get("cdmPWElementTerms", "", null, "frmsel_element", hc);
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
            $("#rags").load("../3.0/html/rag.tables.html", function () {
              getJsonFromTxt("rag.txt").done(function (data) {
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
                $(".rag").click(function () {
                  var v = $(this).data("v");
                  //console.log(v);
                  var trm = btns[v];
                  var val = trm[0] + "^" + trm[2] + "^" + trm[1];
                  var tdata = [];
                  tdata.push(fld + "|" + val);
                  cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                  $("#pops").remove();
                });
                $(".svrag").click(function () {
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
              function () {
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
              .on("click", function () {
                // var na=[];
                coordinates = [];
                var rid = $(this)
                  .attr("id")
                  .substring(5);
                var delrow = $("#ctagrow_" + rid);
                delrow.remove();
                var keeprow = $(".tpos-delbtn");
                keeprow.each(function () {
                  coordinates.push($(this).data("ctag"));
                });
                // console.log(coordinates);
              });
            $(".tpos-addbtn")
              .off("click")
              .on("click", function () {
                var x = $("#nx").val();
                var y = $("#ny").val();
                var z = $("#nz").val();
                var xyz = x + "," + y + "," + z;
                coordinates.push(xyz);
                var dd = "";
                // console.log(coordinates);
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
                  .on("click", function () {
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
              });
            $(".tpos-svbtn")
              .off("click")
              .on("click", function () {
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
            cdmdata.get("cdmTags", "", null, "frmsel_htag", hc);
          }
          if (fld == "cdmUniclass") {
            gimmepops(
              "Assigning an uniclass",
              '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
            );
            cdmdata.get("cdmUniclassTags", "", null, "frmsel_utag", hc);
          }
        }
      }

      // if(is='cdmHazardOwner'){
      //     gimmepops('Assigning an owner');
      // }else{

      // }
    });

}

function activateRAMSBtn(){
  console.log('rams button activated');
  // toastr.error('what is this?');
  // $('.mkramsbtn').off('click').on('click',function(){
  $('.mkramsbtn').on('click',function(){
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
    toastr.success('action: '+a+' id: '+hzd);
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
    var stg = $(ht + ".cdmStage").html();
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
    tdata.push("cdmStage|" + stgi);
    // tdata.push('cdmIniRisk|'+$('#inirisk').prop('outerHTML'));
    // tdata.push('cdmResRisk|'+$('#inirisk').prop('outerHTML'));
    tdata.push("cdmStageMitigationSuggestion|" + stmsugg);
    var screen=$('#tpos-main').html();
    $('#tpos-main').html('');
    // $('.dataset').removeClass('active');
    $('#stats').remove();
    $('#systemstats').remove();
    $('#userstats').remove();
    // var newmain='<div class="tpos-main" id="tpos-main"></div>';
    // $('.tpos-body').prepend(newmain);
  
    $('#tpos-main').html('<div class="tpos-area-title">RAMS results for hazard: '+hzd+'</div><div id="ramsresults" class="tpos-area-content"></div><div class="clsbtn">Close</div>');
    var utbl='<div class="row"><div id="hazardstable"></div></div>';
    var ramsfrm='<div class="row"><div id="ramsfrm"></div></div>';
    var datapack='<div id="parentdata" data-parent="'+tdata+'"></div>';
    $('#ramsresults').html(ramsfrm+utbl+datapack);
    cdmdata.get(
      "cdmHazards",
      'cdmParent eq '+hzd,
      "Modified desc",
      "hazards-table-rams",
      "hazardstable"
    );

    $('.clsbtn').click(function(){
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
    

    
    if(a==='mkrams'){
      // $('#ramsfrm').load('../3.0/html/rams.adder.html',function(){
        // $("#addramsbtn").hide();
        $('#ramsfrm').html(
          '<div><p>As the site manager undertaking the Pre-Construction Review, you can linkthis hazard to RAMS documents. The system then generates RAMS hazards whichcan be independently reviewed and mitigated by the construction team.</p><p>Note that you can add several RAMS hazards; just select another hazard after clicking the Add button.</p></div>'+
          '<div><textarea id="smmsgg" rows="3" cols="35" placeholder="Enter site manager mitigation suggestion?"></textarea></div>'+
          '<div class="select-panel" id="rams"><div class="tpos-lbl">Search for a RAMS</div><div class="tpos-select" id="div_sel_rams"></div></div><div id="rmsbutton" class="row content"><div id="addramsbtn" class="tpos-svramsbtn">Create RAMS Hazard</div></div>'
        );
        jsonRAMS.get("rams", vn, "sel_rams");
        $('#addramsbtn').click(function(){
          var nrdata=[];
          // var tdata=$('#parentdata').data('parent');
          for(var cc=0;cc<tdata.length;cc++){
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
          if(raid&&ratx){
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
function activateADDRAMSBTN(){
  // $('#rmsbutton').html('<div id="addramsbtn" class="tpos-svramsbtn">Create RAMS Hazard</div>');
  $('#addramsbtn').click(function(){
    var nrdata=[];
    // var tdata=$('#parentdata').data('parent');
    for(var cc=0;cc<tdata.length;cc++){
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
    if(raid&&ratx){
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

function activateRAMSActions(){
  console.log('rams actions activated');
  $('.mkramsbtn').click(function(){
    var a = $(this).data("action");
    var hi = $(this)
      // .parents(".row-hazard")
      .attr("id");
    var hia = hi.split("_");
    var id = hia[1];
    //   toastr.success("what???: " + id);

    hzd = id;
    console.log('rams actions activated for '+hzd);
    var hist = "";
    var nd = new Date();
    var nnd = ukdate(nd);
    var ind = isodate(nd);
    //   toastr.success(nnd);
    var user = unm();
    var nl = "";
    var vn = $("#h_" + hzd + " .cdmSite").html();
    toastr.success('action: '+a+' id: '+hzd);
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
    var stg = $(ht + ".cdmStage").html();
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
    tdata.push("cdmStage|" + stgi);
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

  $('#tpos-main').html('<div class="tpos-area-title">RAMS results for hazard: '+hzd+'</div><div id="ramsresults" class="tpos-area-content"></div>');
  var utbl='<div class="row"><div id="hazardstable"></div></div>';
  var ramsfrm='<div class="row"><div id="ramsfrm"></div></div>';
  $('#ramsresults').html(ramsfrm+utbl);
  if(a==='mkrams'){
    $('#ramsfrm').load('../3.0/html/rams.adder.html',function(){
      // $("#addramsbtn").hide();
      jsonRAMS.get("rams", vn, "sel_rams");
    });
  }
  // cdmdata.getQuickCount('cdmHazards',1,'cdmParent eq '+hzd,'Associated RAMS hazards','parentmatch','blue',null);
  cdmdata.get(
    "cdmHazards",
    'cdmParent eq '+hzd,
    "Modified desc",
    "hazards-table",
    "hazardstable"
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
//         // console.log(coordinates);
//     });
//     $('.tpos-addbtn').off('click').on('click',function(){
//         var x=$('#nx').val();
//         var y=$('#ny').val();
//         var z=$('#nz').val();
//         var xyz=x+','+y+','+z;
//         coordinates.push(xyz);
//         var dd='';
//         // console.log(coordinates);
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
    .on("click", function () {
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
    .on("click", function () {
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
    .on("click", function () {
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
    $("#h_" + hzd + "_cdmHazardOwnerTitle").html(dv);
    $("#h_" + hzd + "_cdmHazardOwner").val(dvid);
    var tdata = [];
    tdata.push("cdmHazardOwner|" + dvid);
    cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
    $("#pops").hide();
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
    $("#pops").hide();
  });
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
    tdata.push("cdmPWElement|" + dvid);
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
    tdata.push("cdmHazardTags|" + dv);
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

function tposSelectUniclass(lst, data, trg) {
  var tlist = data.d.results;
  var options =
    '<tr><td class="hide" id="val_' +
    lst +
    '">0</td><td><input class="tpos-' +
    lst +
    '-select-input dvi" id="sel_' +
    lst +
    '" autofill="false" placeholder="Select a uniclass ..."></td></tr>';
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
    tdata.push("cdmUniclass|" + dv);
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

function hazardreviewbuttonaction() {
  $(".tpos-rvbtn")
    .off("click")
    .on("click", function () {
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
      // console.log(vn);

      if (a == "initiatereview") {
        // var q='cdmCompany/ID eq \''+c+'\' and cdmUser/ID ne \''+uid()+'\' and cdmUserRole/Title eq \''+ur+'\'';
        var vcheck = $('#h_' + hzd + ' .cdmStageMitigationSuggestion').html();
        console.log(vcheck);
        if (vcheck === null || vcheck === 'undefined' || vcheck === 'Awaiting assessment') {
          toastr.error('Please provide a mitigation suggestion before initiating the review');
        } else {
          gimmepops("Initiate the review process", "");
          $(".pops-content").load(
            "../3.0/html/review.initiation.form.html",
            function () {
              // cdmdata.get('cdmUsers',q,null,'frmsel_peer',null);
              $(".tpos-svbtn")
                .off("click")
                .on("click", function () {
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
                  // console.log(hist);

                  // console.log(nl+hist);
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
            function () {
              $(".tpos-svbtn")
                .off("click")
                .on("click", function () {
                  var act = $(this).data("action");
                  var cmt = $("#cmt").val();
                  // hist = $('#h_'+hzd+'_cdmReviews').html();
                  // if(hist==''||!hist||hist==undefined){
                  //     hist='';
                  // }
                  // console.log(hist);

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
                      tdata.push("cdmCurrentStatus|Under site manager review");
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
            function () {
              $(".tpos-svbtn")
                .off("click")
                .on("click", function () {
                  var act = $(this).data("action");
                  var cmt = $("#cmt").val();
                  // hist = $('#h_'+hzd+'_cdmReviews').html();
                  // if(hist==''||!hist||hist==undefined){
                  //     hist='';
                  // }
                  // console.log(hist);

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

                    var ns = $("#h_" + hzd + " .rucpc").hasClass("_2");
                    console.log(ns);
                    if (ns === true) {
                      tdata.push("cdmReviews|" + nl);
                      tdata.push(
                        "cdmCurrentStatus|Under pre-construction review"
                      );
                      tdata.push("cdmLastReviewDate|" + ind);
                      tdata.push(
                        "cdmLastReviewStatus|Design manager review - approved"
                      );
                      tdata.push("cdmLastReviewer|" + unm());
                    } else {
                      tdata.push("cdmCurrentStatus|Accepted");
                      tdata.push("cdmReviews|" + nl);
                      tdata.push("cdmLastReviewDate|" + ind);
                      tdata.push(
                        "cdmLastReviewStatus|Design manager review - approved"
                      );
                      tdata.push("cdmLastReviewer|" + unm());
                    }
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
            function () {
              // $("#addramsbtn").hide();
              // jsonRAMS.get("rams", vn, "sel_rams");
              $(".tpos-svbtn")
                .off("click")
                .on("click", function () {
                  var act = $(this).data("action");
                  var cmt = $("#cmt").val();
                  // hist = $('#h_'+hzd+'_cdmReviews').html();
                  // if(hist==''||!hist||hist==undefined){
                  //     hist='';
                  // }
                  // console.log(hist);

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
                    tdata.push("cdmReviews|" + nl);
                    tdata.push("cdmCurrentStatus|Under lead designer review");
                    tdata.push("cdmLastReviewDate|" + ind);
                    tdata.push(
                      "cdmLastReviewStatus|Pre-construction review completed"
                    );
                    tdata.push("cdmLastReviewer|" + unm());
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
                  //     var stg = $(ht + ".cdmStage").html();
                  //     var stgi = 1;
                  //     if (stg != "Construction") {
                  //       stgi = 2;
                  //     }
                  //     var hzt = $(ht + ".cdmType").html();
                  //     var hzti = 2;
                  //     if (hzt == "Health") {
                  //       hzti = 1;
                  //     }
                  //     //   console.log(raid);

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
                  //     tdata.push("cdmStage|" + stgi);
                  //     console.log(tdata);
                  //     var udata = [];
                  //     udata.push("cdmSMMitigationSuggestion|This hazard is further mitigated via one or several RAMS hazards with the following mitigation suggestion by the site manager: " + mits + " Please click 'View linked / related hazards' for further details.");

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
          gimmepops("Undertake the lead designer review", "");
          $(".pops-content").load(
            "../3.0/html/internal.design.review.form.html",
            function () {
              $(".tpos-svbtn")
                .off("click")
                .on("click", function () {
                  var act = $(this).data("action");
                  var cmt = $("#cmt").val();
                  // hist = $('#h_'+hzd+'_cdmReviews').html();
                  // if(hist==''||!hist||hist==undefined){
                  //     hist='';
                  // }
                  // console.log(hist);

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
                      "completed lead designer review]" +
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
                      "cdmLastReviewStatus|Lead designer review completed"
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
          gimmepops("Undertake the site manager review", "");
          $(".pops-content").load(
            "../3.0/html/internal.design.review.form.html",
            function () {
              $(".tpos-svbtn")
                .off("click")
                .on("click", function () {
                  var act = $(this).data("action");
                  var cmt = $("#cmt").val();
                  // hist = $('#h_'+hzd+'_cdmReviews').html();
                  // if(hist==''||!hist||hist==undefined){
                  //     hist='';
                  // }
                  // console.log(hist);

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
                      "completed site manager review]" +
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
                      "cdmLastReviewStatus|Site manager review completed"
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

function toggleCollapse() {
  $(".vwshow")
    .off("click")
    .on("click", function () {
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
  $(".vwhide").click(function () {
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
    .on("click", function () {
      // toastr.success('listening');
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
    .on("click", function () {
      // toastr.success('listening');
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
  if (h.cdmHazardType.Title == "Safety") {
    $("#h_" + h.ID + " .safetyhide").hide();
  }

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