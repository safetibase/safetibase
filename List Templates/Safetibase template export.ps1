$SPsite = "https://mottmac.sharepoint.com/teams/pj-a814/ps-mastertest"

Try{
    $connect = Connect-PnPOnline -Url $SPsite -UseWebLogin -ReturnConnection -ErrorAction Stop
} Catch{
    $connect = Connect-PnPOnline -Url $SPsite -ReturnConnection
}

#$lists = Get-PnPList -Includes Fields

$getAllList = Get-PnPList | Where-Object {($_.RootFolder.ServerRelativeUrl -like "*/lists/*")}



foreach($listName in $getAllList){


$fileName = "C:\Users\HOL95993\SafetIbase list templates\" +$listName.title+ ".xml"

Export-PnPListToSiteTemplate -Out $fileName -List $listName.title

}
