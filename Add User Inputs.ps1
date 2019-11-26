########################################
#
# SafetIbase Installer - Populate Lists with user inputs
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
# 5) Fill in the excel spreadsheet 'SafetIbaseListsContent - UserInput Template.xlsx' (included in with the install files) for your project. Delete any tabs you are not filling in.
# 5) Run the whole script

#---------------------------------------
#  Run this for those who haven't used PowerShell before
#---------------------------------------

#set-executionpolicy remotesigned 

#---------------------------------------
# USER INPUTS
#---------------------------------------

$SPsite = "https://teanent.sharepoint.com/teams/pj-b1234" # Change this to match site

#---------------------------------------
# FIXED INPUTS
#---------------------------------------

# If running script by section Update the $ExcelLsitPath value to the path to your input spreadseet
$ExcelListPath = "$($PSScriptRoot)\SafetIbaseListsContent - UserInput Template.xlsx"


#---------------------------------------
# INSTALL REQUIRED MODULES
#---------------------------------------
#Un-comment this section if you have not installed SafetIbase from this computer before
<#
function Install-RequiredModules {
    # Check if required modules are installed. Otherwise install them.
    Write-Host "`nChecking Dependant Modules...`n"

    $RequiredModules = "ImportExcel","SharePointPnPPowerShellOnline"
    $output = "ok"

    foreach ($mod in $RequiredModules){

        Try{
            Get-InstalledModule -Name $mod -ErrorAction Stop | Out-Null
        } Catch {
            Write-Host "module $($mod) not installed, installing..."
            Try{ Install-Module $mod -Force -ErrorAction Stop | Out-Null}
            Catch {
                $output = $mod
            }
        }
    }

    $output
    Write-Host "`nDependant Modules installed`n" -ForegroundColor Green

}

Install-RequiredModules
#>

#---------------------------------------
# CONNECT TO SHAREPOINT SITE
#---------------------------------------

Try{
    $connect = Connect-PnPOnline -Url $SPsite -UseWebLogin -ReturnConnection -ErrorAction Stop
} Catch{
    $connect = Connect-PnPOnline -Url $SPsite -ReturnConnection
}

#---------------------------------------
# IMPORT REQUIRED FUNCTIONS
#---------------------------------------

Import-Module "$($PSScriptRoot)\SafetIbaseFunctions.psm1"

<# Used functions
#Convert object to hashtable
ConvertTo-HashtableFromPsCustomObject

#Do a topological sort
Get-TopologicalSort

#Function required by topological sort function
Get-ClonedObject

#>

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

#remove lists not present in Excel sheet

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

#>
#---------------------------------------
# END OF SCRIPT
#---------------------------------------

#>