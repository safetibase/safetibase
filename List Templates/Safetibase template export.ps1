$SPsite = "" # Fill in Sp site url

Try{
    $connect = Connect-PnPOnline -Url $SPsite -UseWebLogin -ReturnConnection -ErrorAction Stop
} Catch{
    $connect = Connect-PnPOnline -Url $SPsite -ReturnConnection
}

#$lists = Get-PnPList -Includes Fields

$getAllList = Get-PnPList | Where-Object {($_.RootFolder.ServerRelativeUrl -like "*/lists/*")}



foreach($listName in $getAllList){


$fileName = "" +$listName.title+ ".xml" # Fill in path here

Export-PnPListToSiteTemplate -Out $fileName -List $listName.title

}
