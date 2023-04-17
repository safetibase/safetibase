function editme(){
    $('.cell-e').off('click').on('click',function(){
        var e=$(this).data('item');
        var i=$(this).data('itemid');
        var t=$(this).data('itemtitle');
        var hi=$(this).data('hazard');

        if(e=='cdmHazardType'){
            toggleType(hi,e,i);
        }
        if(e=='cdmHazardOwner'){

        }


    });
}

function toggleType(hi,field,value){

}