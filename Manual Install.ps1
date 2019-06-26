########################################
#
# SafetIbase Installer - Simple version (if the installer does not work, try running this script
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
# 5) Fill in the excel spreadsheet 'SafetIbaseListsContent.xlsx' (included in with the install files) for your project.
# 5) Run the script section by section
# 6) once done, your SafetIbase homepage will be available under 'Site Contents' > 'Site Assets' Library > 'pages' > '3.0' > 'dashboard.aspx'

#######-------------
#  Run this for those who haven't used PowerShell before
######-------------------

set-executionpolicy remotesigned 

#---------------------------------------
# USER INPUTS
#---------------------------------------

$SPsite = "https://mottmac.sharepoint.com/teams/pj-d2108/"

#---------------------------------------
# FIXED INPUTS
#---------------------------------------

# If running script by section Update the 

$Template = "$($PSScriptRoot)\SafetIbaseTemplate.xml"
$SiteAssets = "$($PSScriptRoot)\SiteAssets"
$ExcelListPath = "$($PSScriptRoot)\SafetIbaseListsContent.xlsx"
$Library = "Site Assets"

#---------------------------------------
# INSTALL REQUIRED MODULES
#---------------------------------------

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

#---------------------------------------
# CONNECT TO SHAREPOINT SITE
#---------------------------------------

Try{
    $connect = Connect-PnPOnline -Url $SPsite -UseWebLogin -ReturnConnection -ErrorAction Stop
} Catch{
    $connect = Connect-PnPOnline -Url $SPsite -ReturnConnection
}

#---------------------------------------
# CREATE LISTS (USING THE PROVISIONING TEMPLATE)
#---------------------------------------

#Apply-PnPProvisioningTemplate -Path $Template -ErrorAction Continue -Verbose

#---------------------------------------
# UPLOAD SITE ASSETS
#---------------------------------------
 
#If this section fails, you can do this maually by drag and dropping the contents of the 'Site Assets' folder, included with the install files, into your SharePoint site's 'Site Assets' library.
Function UploadFolder {
  
    Param(
        [Parameter(Mandatory=$True)]
        [String]$targetWeb,
 
        [Parameter(Mandatory=$True)]
        [String]$targetDir,
 
        [Parameter(Mandatory=$True)]
        [String]$path,
        
        [Parameter(Mandatory=$False)]
        [Switch]$CreateLibrary
 
    )

    #Check if Library exists
    $LibraryCheck = Get-PnPList -Identity $targetDir

    if(!$LibraryCheck -and !$CreateLibrary)
    {
        Write-Host "The $($Library) does not exist. Use -CreateLibrary to create library if it does not exist"   -ForegroundColor Red
    } else
    {
        if (!$LibraryCheck)
        {
            if ($CreateLibrary)
                {
                Write-Host "The $($Library) does not exist. Creating Library..." -ForegroundColor Yellow
                $NewList = New-PnPList -Title $Library -Template DocumentLibrary
            }

        }
        # If $targetdir is 'Site Assets' remove blank space
        if ($targetDir -eq "Site Assets"){$targetDir = "SiteAssets"}
        ## get the full path to the source folder
        $fullPath = (Get-Item $path).FullName
        ## recursively get all files in the directory
        $files = Get-ChildItem -Path $path -Recurse -File
        ## upload each file to the directory specified before
        foreach($currentFile in $files)
        {
            ## get relative path of documents
            $relativeDirectory = $currentFile.DirectoryName.Replace($fullPath, "").Replace("\","/")
            $uploadDirectory = $targetDir + $relativeDirectory
            #Write-Host "Uploading" $currentFile.Name "to" $uploadDirectory "..." -ForegroundColor Yellow
            ## Upload the document
            $NewFile = Add-PnPFile -Path $currentFile.FullName -Folder $uploadDirectory -Verbose
                    

            #Write-Host "Uploaded" $currentFile.Name "to" $uploadDirectory -ForegroundColor Green
        }
}
}

UploadFolder -targetWeb $SPsite -targetDir $Library -path $SiteAssets -CreateLibrary

#---------------------------------------
# POPULATE LISTS FROM EXCEL SPREDASHEET
#---------------------------------------

# Optional - Can be done in SharePoint

#define required function
Function ConvertTo-HashtableFromPsCustomObject { 
        param ( 
            [Parameter(  
                Position = 0,   
                Mandatory = $true,   
                ValueFromPipeline = $true,  
                ValueFromPipelineByPropertyName = $true  
            )] [object[]]$psCustomObject 
        ); 
     
        process { 
            foreach ($myPsObject in $psCustomObject ) { 
                $output = @{}; 
                $myPsObject | Get-Member -MemberType *Property | % { 
                    $output.($_.name) = $myPsObject.($_.name); 
                } 
                $output; 
            } 
        } 
} 


$Sheets = Get-ExcelSheetInfo -Path $ExcelListPath
              
# Loop through Sheets
        
foreach ($sheet in $Sheets){
    
    #Import Sheet
    $ImportedSheet = Import-Excel -Path $ExcelListPath -DataOnly -WorksheetName $sheet.Name
    
    #for lookup fields, only keeps the lookup values
    $ImportSheet = $ImportedSheet | Select-Object -Property * -ExcludeProperty '*zz'

    $i=0
            
    #Loop through Rows
    foreach ($row in $ImportSheet){
    #Add list item


    $hash = $row | ConvertTo-HashtableFromPsCustomObject
    $NewItem = Add-PnPListItem -List "$($sheet.Name)" -ContentType 'Item' -Values $hash -Verbose
    }
    if($ImportSheet.Count -gt 0){
        Write-Host "`n $($Sheet.Name) List populated`n" -ForegroundColor Green
    }
}

#---------------------------------------
# END OF SCRIPT
#---------------------------------------
