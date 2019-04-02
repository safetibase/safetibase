function writeHazard(h){
    var hi=h.ID;
    var ref='<div class="cell-ne cell-hazref lg" data-itemid="'+hi+'" data-itemtitle="'+h.Title+'">Ref: '+hi+'</div>';
    var stagedefault='<div class="cell-ne cell-hazstage" data-item="cdmStage" data-itemid="'+h.cdmStage.ID+'" data-itemtitle="'+h.cdmStage.Title+'"><img style="width:16px;height:16px;" src="../../pages/2.0/img/stages/'+h.cdmStage.ID+'.svg" alt="'+h.cdmStage.Title+'"></div>';
    var stagehover='<div class="cell-ne cell-hazstage center" data-item="cdmStage" data-itemid="'+h.cdmStage.ID+'" data-itemtitle="'+h.cdmStage.Title+'"><img style="width:16px;height:16px;" src="../../pages/2.0/img/stages/'+h.cdmStage.ID+'.svg" alt="'+h.cdmStage.Title+'"><div>'+h.cdmStage.Title+'</div></div>';
    var typedefault='<div class="cell-e cell-haztype" data-hazard="'+hi+'" data-item="cdmHazardType" data-itemid="'+h.cdmHazardType.ID+'" data-itemtitle="'+h.cdmHazardType.Title+'"><img style="width:16px;height:16px;" src="../../pages/2.0/img/types/'+h.cdmHazardType.ID+'.svg" alt="'+h.cdmHazardType.Title+'"></div>';
    var typehover='<div class="cell-e cell-haztype center" data-hazard="'+hi+'" data-item="cdmHazardType" data-itemid="'+h.cdmHazardType.ID+'" data-itemtitle="'+h.cdmHazardType.Title+'"><img style="width:16px;height:16px;" src="../../pages/2.0/img/types/'+h.cdmHazardType.ID+'.svg" alt="'+h.cdmHazardType.Title+'"><div>'+h.cdmHazardType.Title+'</div></div>';
    var owner=writeOwner(h);
    var entity=writeEntity(h);
    var site='<div class="cell-ne cell-hazsite" data-hazard="'+hi+'" data-item="cdmSite" data-itemid="'+h.cdmSite.ID+'" data-itemtitle="'+h.cdmSite.Title+'">'+h.cdmSite.Title+'</div>';
    var hazarddefault='<div class="cell-ne cell-hazard" data-hazard="'+hi+'" data-item="cdmHazardDescription" data-itemid="na" data-itemtitle="'+h.cdmHazardDescription+'">'+shortText(h.cdmHazardDescription)+'</div>';
    var hazardhover='<div class="cell-e cell-hazard" data-hazard="'+hi+'" data-item="cdmHazardDescription" data-itemid="na" data-itemtitle="'+h.cdmHazardDescription+'">'+h.cdmHazardDescription+'</div>';
    var riskdefault='<div class="cell-ne cell-hazrisk" data-hazard="'+hi+'" data-item="cdmRiskDescription" data-itemid="na" data-itemtitle="'+h.cdmRiskDescription+'">'+shortText(h.cdmRiskDescription)+'</div>';
    var riskhover='<div class="cell-e cell-hazrisk" data-hazard="'+hi+'" data-item="cdmRiskDescription" data-itemid="na" data-itemtitle="'+h.cdmRiskDescription+'">'+h.cdmRiskDescription+'</div>';
    var mitsdefault='<div class="cell-ne cell-hazmits" data-hazard="'+hi+'" data-item="cdmMitigationDescription" data-itemid="na" data-itemtitle="'+h.cdmMitigationDescription+'">'+shortText(h.cdmMitigationDescription)+'</div>';
    var mitshover='<div class="cell-e cell-hazmits" data-hazard="'+hi+'" data-item="cdmMitigationDescription" data-itemid="na" data-itemtitle="'+h.cdmMitigationDescription+'">'+h.cdmMitigationDescription+'</div>';




    var h_='<div id="h_'+hi+'"><div class="row row-hazard"></div></div>';
    editme();
}
// write editable field
function we(trm,v,hi){
    var t='<div class="cell-e" data-hazard="'+hi+'" data-item="'+trm+'" data-itemid="na" data-itemtitle="'+v+'">'+v+'</div>';
}
// write editable lookup field
function welu(trm,v,hi){
    var t='<div class="cell-e" data-hazard="'+hi+'" data-item="'+trm+'" data-itemid="'+v.ID+'" data-itemtitle="'+v.Title+'">'+v.Title+'</div>';
}
// write non-editable field
// full write field
function printfld(canedit){

}

function writeOwner(h){
    var o=h.cdmHazardOwner;
    var hi=h.ID;
    if(!o){
        o='<div class="cell-e cell-hazowner clr_5" data-hazard="'+hi+'" data-item="cdmHazardOwner" data-itemid="0" data-itemtitle="Unassigned" >Unassigned</div>';
    }
    if(o){
        o='<div class="cell-e cell-hazowner" data-hazard="'+hi+'" data-item="cdmHazardOwner" data-itemid="'+h.cdmHazardOwner.ID+'" data-itemtitle="'+h.cdmHazardOwner.Title+'" >'+h.cdmHazardOwner.Title+'</div>';
    }
    return o;
}
function writeEntity(h){
    var ent='';
    var hi=h.ID;
    var p=h.cdmPWStructure.Title;
    var t=h.cdmTW;
    var r=h.cdmRAMS;
    var e=h.cdmPWElement.Title;
    var et=h.cdmEntityTitle;
    if(p){
        if(e){
            ent='<div class="cell-ne cell-hazstructure" data-hazard="'+hi+'" data-item="cdmPWStructure" data-itemid="'+h.cdmPWStructure.ID+'" data-itemtitle="'+h.cdmPWStructure.Title+'"></div>'+
            '<div class="cell-e cell-hazelement" data-hazard="'+hi+'" data-item="cdmPWElement" data-itemid="'+h.cdmPWElement.ID+'" data-itemtitle="'+h.cdmPWElement.Title+'">'+h.cdmPWElement.Title+'</div>';
        }
        if(!e){
            ent='<div class="cell-ne cell-hazstructure" data-hazard="'+hi+'" data-item="cdmPWStructure" data-itemid="'+h.cdmPWStructure.ID+'" data-itemtitle="'+h.cdmPWStructure.Title+'"></div>'+
            '<div class="cell-e cell-hazelement clr_5" data-hazard="'+hi+'" data-item="cdmPWElement" data-itemid="0" data-itemtitle="No element">No element</div>';
        }
    }
    if(t){
        ent='<div class="cell-ne cell-haztw" data-hazard="'+hi+'" data-item="cdmTW" data-itemid="'+t+'" data-itemtitle="'+et+'">'+et+'</div>';
    }
    if(r){
        ent='<div class="cell-ne cell-hazrams" data-hazard="'+hi+'" data-item="cdmRAMS" data-itemid="'+r+'" data-itemtitle="'+et+'">'+et+'</div>';
    }
    return ent;
}


