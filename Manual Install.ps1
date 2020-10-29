########################################
#
# SafetIbase Installer - Simple version
#
########################################

#---------------------------------------
# INSTRUCTIONS - READ BEFORE RUNNING SCRIPT
#---------------------------------------

# 1) Using Windows 10 is recommended
#  - If not running Windows 10: install the PowerShell Gallery. Refer to: https://docs.microsoft.com/en-gb/powershell/gallery/overview
# 2) Authorised scripts to be run by PowerShell by changing the 'Execution policy' to remote signed. Refer to https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy?view=powershell-6
# 3) Open as Powershell as administrator
# 4) Complete the 'User input' section of this script
# 5) Fill in the excel spreadsheet 'SafetIbaseListsContent - NoUserInput.xlsx' (included in with the install files) for your project.
# 5) Go to 'Site Contents' > 'Site Assets' and drag and drop the folders contained in the 'Site Asset' folder of the install files.
# 7) Run the script in one go (f5)
# 6) once done, your SafetIbase homepage will be available under 'Site Contents' > 'Site Assets' Library > 'pages' > '3.0' > 'dashboard.aspx'

#---------------------------------------
#  Un-comment next line and run this for those who haven't used PowerShell before
#---------------------------------------

#set-executionpolicy remotesigned -Scope CurrentUser

#---------------------------------------
# INPUTS
#---------------------------------------

#---------------------------------------
# User inputs
#---------------------------------------

# enter url to SharePoint site where SafetIbase is to be deployed.

$SPsite = "https://teanent.sharepoint.com/teams/pj-b1234"

#---------------------------------------
# Fixed inputs
#---------------------------------------

# If running script by section update the paths to full paths.

$TemplatePath = "$($PSScriptRoot)\List Templates\"

$ExcelListPath = "$($PSScriptRoot)\SafetIbaseListsContent - NoUserInput.xlsx"


#---------------------------------------
# SET UP
#---------------------------------------

#---------------------------------------
# Import required functions
#---------------------------------------

Import-Module "$($PSScriptRoot)\SafetIbaseFunctions.psm1"

<# Used functions
#Install-RequiredModules - Check is ImportExcel and SharePointPnP modules are installed
#Convert object to hashtable
ConvertTo-HashtableFromPsCustomObject
#Do a topological sort
Get-TopologicalSort
#Function required by topological sort function
Get-ClonedObject
#>

#---------------------------------------
# Install required modules
#---------------------------------------

Install-RequiredModules

#---------------------------------------
# Connect to SharePoint site
#---------------------------------------

Try{
    $connect = Connect-PnPOnline -Url $SPsite -UseWebLogin -ReturnConnection -ErrorAction Stop
} Catch{
    $connect = Connect-PnPOnline -Url $SPsite -ReturnConnection
}

#---------------------------------------
# CREATE LISTS (USING THE PROVISIONING TEMPLATE)
#---------------------------------------

#---------------------------------------
# Sort lists based on lookup dependencies
#---------------------------------------

#Get hashtable with all lists and their dependencies
$Regex = [Regex]::new("(?<={listid:)(.*)(?=})")  #expression to extract cdmSites from {listid:cdmSites}
$ListsToCreate =  @{}

Get-ChildItem -Path $TemplatePath | ForEach-Object{
    [XML]$Template = Get-Content -Path $_.PSPath
    $BaseList = $Template.Provisioning.Templates.ProvisioningTemplate.Lists.ListInstance
    $DependentList = ($BaseList.Fields.Field | Where-Object {$_.Type -eq 'Lookup'}).List
    if ($DependentList -eq $null){ $ListsToCreate[$BaseList.Title] = @()}
    $ListsToCreate[$BaseList.Title] = @($DependentList | ForEach-Object {$Regex.Match($_).Value})
}

#Created a sorted list of lists to create
$ListsInOrder = Get-TopologicalSort $ListsToCreate
$ListOrder = $ListsInOrder | Where-Object {$_} #remove empty strings

#Create all lists from templates
Foreach ($item in $ListOrder){
    
    $TempalteName = "$($TemplatePath)$($item)Template.xml"
    Write-Host "Creating $($item)..."
    Apply-PnPProvisioningTemplate -Path $TempalteName -ErrorAction Continue -Verbose
    Write-Host "Done`n"
} 

# Add indexes to: cdmHazards list '& cdmStages list 'Title' field

$fieldsToIndex = 'cdmCurrentStatus','cdmHazardOwner','cdmResidualRiskScore','cdmSite','Created By','Modified','Modified By','cdmStage'
$fieldsToIndex | ForEach-Object {Set-PnPField -List 'cdmHazards' -Identity $_ -Values @{Indexed=$true}}

Set-PnPField -List 'cdmStages' -Identity 'Title' -Values @{Indexed=$true}

#---------------------------------------
# POPULATE LISTS WITH DEFAULT VALUES FROM EXCEL SPREADSHEET
#---------------------------------------

# Optional - Can be done in SharePoint

#---------------------------------------
# Get Lists to populate and sort them
#---------------------------------------

#Get lists from Excel file tab names
$Sheets = Get-ExcelSheetInfo -Path $ExcelListPath
              
# Add a property to stor the lists which need to be populated before each list
$Sheets | Add-Member -MemberType NoteProperty -Name "Dependencies" -Value @()

#Get dependency list

foreach ($lst in $Sheets){
    
    #Write-Host "List $($lst.Name)\n"
    $cdmLookupFields = Get-PnPField -List $lst.Name | Where-Object {$_.Title -like 'cdm*' -and $_.FieldTypeKind -eq 'Lookup' }
    foreach ($fld in $cdmLookupFields){
        #Write-Host "Lookup field $($fld.Title)"
        $depList = Get-PnPList -Identity $fld.LookupList
        #Write-host "Dependant List $($depList.Title)"
        if($lst.Dependencies -notcontains $depList.Title){
            $lst.Dependencies += $depList.Title
        }
    }
}

#convert dependecy list to hashtable
$ListHash = @{}
foreach ($l in $Sheets){
    $ListHash["$($l.Name)"]=$l.Dependencies
}

#Sort list based on dependancies
$SortedList = Get-TopologicalSort $ListHash

$SortedList2 = @()
foreach ($ts in $SortedList){
    if($Sheets.Name -contains $ts){
        $SortedList2 += $ts
    }
}

#---------------------------------------
# Populate lists from Excel file
#---------------------------------------
        
foreach ($sheet in $SortedList2){
    
    #Import Sheet
    $ImportedSheet = Import-Excel -Path $ExcelListPath -DataOnly -WorksheetName $sheet -ErrorAction SilentlyContinue
    
    #Find lookup fields and replace values with ID of item looked up
    $LookupFields = Get-PnPField -List $sheet | Where-Object {$_.Title -like 'cdm*' -and $_.FieldTypeKind -eq 'Lookup' }
    foreach ($lkp in $LookupFields){
        $list = Get-PnPList -Identity $lkp.LookupList
        $Lookups = Get-PnPListItem $list
        # loop through imported row. Replace lookup value with item ID.
        foreach ($r in $ImportedSheet){
            $r."$($lkp.InternalName)"= ($Lookups | Where-Object {$_.FieldValues.Title -eq $r."$($lkp.InternalName)"}).Id
        }
    }

    #Import all rows
    
              
    #Loop through Rows
    foreach ($row in $ImportedSheet){     
       
        #Add list item
        
        $ItemHash = $row | ConvertTo-HashtableFromPsCustomObject
        $NewItem = Add-PnPListItem -List "$($sheet)" -ContentType 'Item' -Values $ItemHash -Verbose
        }
        if($ImportSheet.Count -gt 0){
            Write-Host "`n $($sheet) List populated`n" -ForegroundColor Green
        }
}

#---------------------------------------
# Add a link to the SafetIbase dashboard to the rhs navigation menu
#---------------------------------------

Add-PnPNavigationNode -Location QuickLaunch -Title 'SafetIbase' -Url 'SiteAssets/pages/3.0/dashboard.aspx' -ErrorAction Continue

#---------------------------------------
# END OF SCRIPT
#---------------------------------------
