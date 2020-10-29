#################################

# SafetIbase
# Update SafetIbase with lates install

#################################

# This will update the relevant site assets, and add indices to the lists as required



# Change the url to your site then run

$SPsite = "https://teanent.sharepoint.com/teams/pj-b1234"



$connect = Connect-PnPOnline -Url $SPsite -UseWebLogin -ReturnConnection

# Upload new site assets
# adapted from https://github.com/MSAdministrator/GetGithubRepository


$filesToUpdate = @('SiteAssets/pages/3.0/dashboard.aspx', 'SiteAssets/pages/3.0/scripts/CDM.DATA.CONTROLLER.js', 'SiteAssets/pages/3.0/scripts/DATA.FORMAT.CONTROLLER.js', 'SiteAssets/pages/3.0/scripts/INIT.PAGE.js')
$TempFolder = 'C:\temp\SafeIbaseUpdate'
$Owner = 'safetibase'
$Repository = 'safetibase'
$Branch = 'master'

foreach ($item in $filesToUpdate){

    Write-Debug -Message "Attempting to create $TempFolder\$item"

    New-Item -ItemType File -Force -Path "$TempFolder\$item" | Out-Null

    $url = "https://raw.githubusercontent.com/$Owner/$Repository/$Branch/$item"

    Write-Debug -Message "Attempting to download from $url"

    ($wc.DownloadString("$url")) | Out-File "$TempFolder\$item"

    Add-PnPFile -Folder $item.Substring(0,$item.LastIndexOf('/')) -Path "$TempFolder\$item" -Verbose

}


#Delete temp folder
Get-ChildItem -Path $TempFolder -recurse | foreach {Remove-Item $_.FullName -Force -Recurse}
Remove-Item -Path $TempFolder -Force -Recurse


# Add indices to: cdmHazards list '& cdmStages list 'Title' field

$fieldsToIndex = 'cdmCurrentStatus','cdmHazardOwner','cdmResidualRiskScore','cdmSite','Created By','Modified','Modified By','cdmStage'
$fieldsToIndex | ForEach-Object {Set-PnPField -List 'cdmHazards' -Identity $_ -Values @{Indexed=$true}}

Set-PnPField -List 'cdmStages' -Identity 'Title' -Values @{Indexed=$true}
