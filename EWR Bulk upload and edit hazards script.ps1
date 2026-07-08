$SPsite = "https://mottmac.sharepoint.com/teams/pj-a814/ps-ewr-test"
$ExcelListPath = "C:\Users\HOL95993\Downloads\Upload.xlsx" # CHANGE THIS TO YOUR LOCAL FILE PATH

# Connect to SP site
Try {
    $connect = Connect-PnPOnline -Url $SPsite -UseWebLogin -ReturnConnection -ErrorAction Stop
}
Catch {
    $connect = Connect-PnPOnline -Url $SPsite -ReturnConnection
}

Import-Module "C:\Users\HSU108323\OneDrive - Mott MacDonald\EWR Safetibase\ewr-safetibase-2026\safetibase\SafetIbaseFunctions.psm1" # CHANGE THIS TO YOUR LOCAL FILE PATH

#---------------------------------------
# Get lists from Excel sheet names
#---------------------------------------

$Sheets = Get-ExcelSheetInfo -Path $ExcelListPath

# Add dependency property
$Sheets | Add-Member -MemberType NoteProperty -Name "Dependencies" -Value @()

#---------------------------------------
# Determine list dependencies
#---------------------------------------

foreach ($lst in $Sheets) {

    $cdmLookupFields = Get-PnPField -List $lst.Name |
        Where-Object {
            $_.Title -like 'cdm*' -and $_.FieldTypeKind -eq 'Lookup'
        }

    foreach ($fld in $cdmLookupFields) {

        $depList = Get-PnPList -Identity $fld.LookupList

        if ($lst.Dependencies -notcontains $depList.Title) {
            $lst.Dependencies += $depList.Title
        }
    }
}

#---------------------------------------
# Convert dependencies to hashtable
#---------------------------------------

$ListHash = @{}

foreach ($l in $Sheets) {
    $ListHash[$l.Name] = $l.Dependencies
}

#---------------------------------------
# Sort lists according to dependencies
#---------------------------------------

$SortedList = Get-TopologicalSort $ListHash

# Remove sheets not in Excel file

$SortedList2 = @()

foreach ($ts in $SortedList) {
    if ($Sheets.Name -contains $ts) {
        $SortedList2 += $ts
    }
}

#---------------------------------------
# Populate Lists
#---------------------------------------

foreach ($sheet in $SortedList2) {

    Write-Host ""
    Write-Host "Processing list: $sheet" -ForegroundColor Cyan

    # Import worksheet
    $ImportedSheet = Import-Excel `
        -Path $ExcelListPath `
        -DataOnly `
        -WorksheetName $sheet `
        -ErrorAction SilentlyContinue

    if (!$ImportedSheet) {
        Write-Host "No rows found in $sheet" -ForegroundColor Yellow
        continue
    }

    #---------------------------------------
    # Resolve Lookup Fields
    #---------------------------------------

    $LookupFields = Get-PnPField -List $sheet |
        Where-Object {
            $_.Title -like 'cdm*' -and $_.FieldTypeKind -eq 'Lookup'
        }

    foreach ($lkp in $LookupFields) {

        $list = Get-PnPList -Identity $lkp.LookupList
        $Lookups = Get-PnPListItem $list

        foreach ($r in $ImportedSheet) {

            if ($r.PSObject.Properties.Name -contains $lkp.InternalName) {

                $MatchedItem = $Lookups |
                    Where-Object {
                        $_.FieldValues.Title -eq $r."$($lkp.InternalName)"
                    } |
                    Select-Object -First 1

                if ($MatchedItem) {
                    $r."$($lkp.InternalName)" = $MatchedItem.Id
                }
            }
        }
    }

    #---------------------------------------
    # Create / Update Items
    #---------------------------------------

    foreach ($row in $ImportedSheet) {

        $ItemHash = $row | ConvertTo-HashtableFromPsCustomObject

        $ExcelID = $null

        if ($ItemHash.ContainsKey("ID")) {
            $ExcelID = $ItemHash["ID"]
            $ItemHash.Remove("ID")
        }

        $ExistingItem = $null

        if ($ExcelID) {

            try {
                $ExistingItem = Get-PnPListItem `
                    -List $sheet `
                    -Id $ExcelID `
                    -ErrorAction Stop
            }
            catch {
                $ExistingItem = $null
            }
        }

        if ($ExistingItem) {

            Write-Host "Updating [$sheet] Item ID: $ExcelID" -ForegroundColor Yellow

            Set-PnPListItem `
                -List $sheet `
                -Identity $ExcelID `
                -Values $ItemHash `
                -UpdateType Update

        }
        else {

            Write-Host "Creating new item in [$sheet]" -ForegroundColor Green

            Add-PnPListItem `
                -List $sheet `
                -ContentType 'Item' `
                -Values $ItemHash `
                -Verbose
        }
    }

    Write-Host ""
    Write-Host "$sheet List processed successfully" -ForegroundColor Green
}