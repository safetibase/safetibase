
# Form Pages:

# 1. Welcome
# 2. Windows 10
# 3. Configuring [install modules]
# 4. SharePoint site adress
# 5. Populate Lists
# 6. Install progress
# 7. Finish Screen with link to SafetIbase dashboard page

#write-output

# Static Input

$Template = "$($PSScriptRoot)\SafetIbaseTemplate.xml"
$SiteAssets = "$($PSScriptRoot)\SiteAssets"
$ExcelListPath = "$($PSScriptRoot)\SafetIbaseListsContent.xlsx"
$LogoImage = "$($PSScriptRoot)\logo.png"
$LogoIcon = "$($PSScriptRoot)\logo2.ico"

function WelcomeForm {
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.Application]::EnableVisualStyles()

######
# Common Form Elements
######

$SafetIbase                      = New-Object system.Windows.Forms.Form
$SafetIbase.ClientSize           = '600,500'
$SafetIbase.text                 = "SafetIbase Installer"
$SafetIbase.TopMost              = $false
$SafetIbase.Icon                 = $LogoIcon
$SafetIbase.AutoSize = $True
$SafetIbase.AutoSizeMode = "GrowOnly"
$SafetIbase.StartPosition = "CenterScreen"

$Logo                            = New-Object system.Windows.Forms.PictureBox
$Logo.width                      = 292
$Logo.height                     = 144
$Logo.Anchor = 'top'
$Logo.Left = ($SafetIbase.Width /2) - ($Logo.Width /2)
$Logo.imageLocation              = $LogoImage 
$Logo.SizeMode                   = [System.Windows.Forms.PictureBoxSizeMode]::zoom

#######
# Welcome Page
#######

$WelcomeText                          = New-Object system.Windows.Forms.Label
$WelcomeText.text                     = "Welcome to the SafetIbase Installer!`n`nTo deploy SafetIbase on your SharePoint site, you will need:`n`n- Windows 10 (see readme.txt for requirements with an older OS)`n- Local Administrator rights`n- Administrator rights on your SharePoint Site"
$WelcomeText.AutoSize                 = $true
$WelcomeText.width                    = 40
$WelcomeText.height                   = 50
$WelcomeText.location                 = New-Object System.Drawing.Point(50,175)
$WelcomeText.Font                     = 'Seroge UI,10'

$WelcomeButton                         = New-Object system.Windows.Forms.Button
$WelcomeButton.text                    = "Start"
$WelcomeButton.AutoSize                = $True
$WelcomeButton.width                   = 100
$WelcomeButton.height                  = 30
$WelcomeButton.location                = New-Object System.Drawing.Point((($SafetIbase.Width /2) - ($WelcomeButton.Width /2)),417)
$WelcomeButton.Font                    = 'Segoe UI,10'
$WelcomeButton.Add_Click({
    $SafetIbase.Controls.Remove($WelcomeText)
    $SafetIbase.Controls.Remove($WelcomeButton)
    if(!(Check-Windows10)){
    $SafetIbase.controls.AddRange(@($W10Text,$W10ContinueButton,$W10ExitButton))
    $W10ContinueButton.Focus()    
    } else{
    $SafetIbase.controls.AddRange(@($UrlText,$UrlInput,$UrlButton))
    $UrlInput.Focus()
    $UrlInput.SelectAll()
    }
})

#####
# Not running Windows 10 page
#####

$W10Text                          = New-Object system.Windows.Forms.Label
$W10Text.text                     = "Windows 10 is not running!`n`nAdditional configuration might be required. See readme.txt`n`nDo you whish to continue?"
$W10Text.AutoSize                 = $true
$W10Text.width                    = 40
$W10Text.height                   = 20
$W10Text.location                 = New-Object System.Drawing.Point(50,175)
$W10Text.Font                     = 'Seroge UI,10'

$W10ContinueButton                         = New-Object system.Windows.Forms.Button
$W10ContinueButton.text                    = "Continue"
$W10ContinueButton.AutoSize                = $True
$W10ContinueButton.width                   = 100
$W10ContinueButton.height                  = 30
$W10ContinueButton.location                = New-Object System.Drawing.Point((($SafetIbase.Width *3/4) - ($W10ContinueButton.Width /2)),417)
$W10ContinueButton.Font                    = 'Segoe UI,10'

$W10ContinueButton.Add_Click({
    $SafetIbase.Controls.Remove($W10Text)
    $SafetIbase.Controls.Remove($W10ContinueButton)
    $SafetIbase.Controls.Remove($W10ExitButton)
    $SafetIbase.controls.AddRange(@($UrlText,$UrlInput,$UrlButton))
    $UrlInput.SelectAll()
    $UrlInput.Focus()
})

$W10ExitButton                         = New-Object system.Windows.Forms.Button
$W10ExitButton.text                    = "Exit"
$W10ExitButton.AutoSize                = $True
$W10ExitButton.width                   = 100
$W10ExitButton.height                  = 30
$W10ExitButton.location                = New-Object System.Drawing.Point((($SafetIbase.Width /4) - ($W10ExitButton.Width /2)),417)
$W10ExitButton.Font                    = 'Segoe UI,10'
$W10ExitButton.Add_Click({$SafetIbase.Close();exit})

#####
# Get SharePoint Site URL page
#####

$UrlText                          = New-Object system.Windows.Forms.Label
$UrlText.text                     = "Enter the URL to the SharePoint site:"
$UrlText.AutoSize                 = $true
$UrlText.width                    = 40
$UrlText.height                   = 20
$UrlText.location                 = New-Object System.Drawing.Point(20,175)
$UrlText.Font                     = 'Seroge UI,10'

$UrlInput                        = New-Object system.Windows.Forms.TextBox
$UrlInput.multiline              = $false
$UrlInput.text                   = "https://mycompany.sharepoint.com/teams/pj-b1234/"
$UrlInput.width                  = 600

$UrlInput.height                 = 30
#$UrlInput.Anchor                 = ''
$UrlInput.location               = New-Object System.Drawing.Point(10,210)
$UrlInput.Font                   = 'Segoe UI,14'

$UrlButton                         = New-Object system.Windows.Forms.Button
$UrlButton.text                    = "Next"
$UrlButton.AutoSize                = $True
$UrlButton.width                   = 100
$UrlButton.height                  = 30
$UrlButton.location                = New-Object System.Drawing.Point((($SafetIbase.Width /2) - ($UrlButton.Width /2)),417)
$UrlButton.Font                    = 'Segoe UI,10'
$UrlButton.Add_Click({
    $Script:SPsite = $UrlInput.Text
 #Connect SharePoint Site
        Disconnect-PnPOnline
        Try{
           $connect = Connect-PnPOnline -Url $SPsite -UseWebLogin -ReturnConnection -ErrorAction Stop
        } Catch{
           $connect = Connect-PnPOnline -Url $SPsite -ReturnConnection
        }
    if($connect -ne $null){
        $SafetIbase.Controls.Remove($UrlText)
        $SafetIbase.Controls.Remove($UrlInput)
        $SafetIbase.Controls.Remove($UrlButton)
        $SafetIbase.controls.AddRange(@($ListText,$ListContinueButton,$ListOpenExcelButton))
        $ListOpenExcelButton.Focus()
    }else{
        $wshell = New-Object -ComObject Wscript.Shell
        $wshell.Popup("Couldn't connect to SharePoint site.`nPlease check URL and credentials",0,"Connection Eroor",0x0 + 0x10)
    }
    })

######
# Prompt User to fill in list
######

$ListText                          = New-Object system.Windows.Forms.Label
$ListText.text                     = "Do you want to customise your SaftiBase now?`n`n You can configure your project's:`n- Companies`n- Sites`n- Structures?`n`nTo configure this now, click 'Configure', fill in the Excel tabs,`nsave and close, then click 'Continue'`nTo configure later, click 'Continue'"
$ListText.AutoSize                 = $true
#$ListText.width                    = 40
#$ListText.height                   = 20
$ListText.location                 = New-Object System.Drawing.Point(50,175)
$ListText.Font                     = 'Seroge UI,10'

$ListOpenExcelButton                         = New-Object system.Windows.Forms.Button
$ListOpenExcelButton.text                    = "Configure"
$ListOpenExcelButton.AutoSize                = $True
$ListOpenExcelButton.width                   = 100
$ListOpenExcelButton.height                  = 30
$ListOpenExcelButton.location                = New-Object System.Drawing.Point((($SafetIbase.Width /4) - ($ListOpenExcelButton.Width /2)),417)
$ListOpenExcelButton.Font                    = 'Segoe UI,10'
$ListOpenExcelButton.Add_Click({
    
    Start-Process -FilePath $ExcelListPath
})

$ListContinueButton                         = New-Object system.Windows.Forms.Button
$ListContinueButton.text                    = "Continue"
$ListContinueButton.AutoSize                = $true
$ListContinueButton.width                   = 100
$ListContinueButton.height                  = 30
$ListContinueButton.location                = New-Object System.Drawing.Point((($SafetIbase.Width *3/4) - ($ListContinueButton.Width /2)),417)
$ListContinueButton.Font                    = 'Segoe UI,10'
$ListContinueButton.Add_Click({
    if(Test-IsFileLocked -Path $ExcelListPath){
        [System.Windows.MessageBox]::Show('Close SafetIbaseListsContent.xlsx file to continue','Excel file not closed','Ok','Error') | Out-Null
    }else{
    $SafetIbase.Controls.Remove($ListText)
    $SafetIbase.Controls.Remove($ListContinueButton)
    $SafetIbase.Controls.Remove($ListOpenExcelButton)
    $SafetIbase.controls.AddRange(@($ProgressText,$InstallingText,$progressBar1))
    $Result = $false
    $Result = Install-Safetibase -ProvisionningTemplate $Template -SiteAssets $SiteAssets -SPLists $ExcelListPath -SPsite $SPsite
    if ($Result){
        $SafetIbase.Controls.Add($InstallButton)
        
    }
    #$SafetIbase.Close()
    }
})

##############
#Show progress
##############

$ProgressText                          = New-Object system.Windows.Forms.Label
$ProgressText.text                     = "Installation in progress:"
$ProgressText.AutoSize                 = $true
#$ProgressText.width                    = 40
#$ProgressText.height                   = 20
$ProgressText.location                 = New-Object System.Drawing.Point(50,175)
$ProgressText.Font                     = 'Seroge UI,10'

$InstallingText                          = New-Object system.Windows.Forms.Label
$InstallingText.text                     = "Creating Lists..."
$InstallingText.AutoSize                 = $true
#$InstallingText.width                    = 40
#$InstallingText.height                   = 20
$InstallingText.location                 = New-Object System.Drawing.Point(50,250)
$InstallingText.Font                     = 'Seroge UI,10'

$progressBar1 = New-Object System.Windows.Forms.ProgressBar
$progressBar1.Name = 'progressBar1'
$progressBar1.Minimum = 0
$progressBar1.Maximum = 1
$progressBar1.Value = 0
$progressBar1.Style="Continuous"

$System_Drawing_Size = New-Object System.Drawing.Size
$System_Drawing_Size.Width = $SafetIbase.Width - 40
$System_Drawing_Size.Height = 20
$progressBar1.Size = $System_Drawing_Size
$progressBar1.Location = New-Object System.Drawing.Point(50,300)

$InstallButton                         = New-Object system.Windows.Forms.Button
$InstallButton.text                    = "Next"
$InstallButton.AutoSize                = $True
$InstallButton.width                   = 100
$InstallButton.height                  = 30
$InstallButton.location                = New-Object System.Drawing.Point((($SafetIbase.Width /2) - ($InstallButton.Width /2)),417)
$InstallButton.Font                    = 'Segoe UI,10'
$InstallButton.Add_Click({
    $SafetIbase.Controls.Remove($ProgressText)
    $SafetIbase.Controls.Remove($InstallingText)
    $SafetIbase.Controls.Remove($progressBar1)
    $SafetIbase.Controls.Remove($InstallButton)
    $SiteRoot = (Get-PnPSite).Url
    $SafetIbaseURL = "$($SiteRoot)/SiteAssets/pages/3.0/dashboard.aspx"
    $FinshOutput.text = $SafetIbaseURL
    $SafetIbase.Controls.AddRange(@($FinishText,$FinshOutput,$FinishButton))
    Start-Process $SafetIbaseURL

})

############
# Installation Completed
############

$FinishText                          = New-Object system.Windows.Forms.Label
$FinishText.text                     = "Installation of SafetIbase complete"
$FinishText.AutoSize                 = $true
#$FinishText.width                    = 40
#$FinishText.height                   = 20
$FinishText.location                 = New-Object System.Drawing.Point(50,175)
$FinishText.Font                     = 'Seroge UI,10'

$SiteRoot = (Get-PnPSite).Url
$SafetIbaseURL = "$($SiteRoot)/SiteAssets/pages/3.0/dashboard.aspx"

$FinshOutput                        = New-Object system.Windows.Forms.TextBox
$FinshOutput.multiline              = $false
$FinshOutput.ReadOnly               = $True
$FinshOutput.width                  = 600

$FinshOutput.height                 = 30
#$FinshOutput.Anchor                 = ''
$FinshOutput.location               = New-Object System.Drawing.Point(10,210)
$FinshOutput.Font                   = 'Segoe UI,14'

$FinishButton                         = New-Object system.Windows.Forms.Button
$FinishButton.text                    = "Close"
$FinishButton.AutoSize                = $True
$FinishButton.width                   = 100
$FinishButton.height                  = 30
$FinishButton.location                = New-Object System.Drawing.Point((($SafetIbase.Width /2) - ($FinishButton.Width /2)),417)
$FinishButton.Font                    = 'Segoe UI,10'
$FinishButton.Add_Click({
    $SafetIbase.Close()
})

############
$SafetIbase.controls.AddRange(@($Logo,$WelcomeText,$WelcomeButton))
$SafetIbase.ShowDialog() |Out-Null


}


function Check-Windows10{
    $OSversion = [System.Environment]::OSVersion.Version.Major
    $output = $false
    if($OSversion -eq 10){
        $output = $true
    }
    $output
}
Function Test-IsFileLocked {
    [cmdletbinding()]
    Param (
        [parameter(Mandatory=$True,ValueFromPipeline=$True,ValueFromPipelineByPropertyName=$True)]
        [Alias('FullName','PSPath')]
        [string[]]$Path
    )
    Process {
        ForEach ($Item in $Path) {
            #Ensure this is a full path
            $Item = Convert-Path $Item
            #Verify that this is a file and not a directory
            If ([System.IO.File]::Exists($Item)) {
                Try {
                    $FileStream = [System.IO.File]::Open($Item,'Open','Write')
                    $FileStream.Close()
                    $FileStream.Dispose()
                    $IsLocked = $False
                } Catch [System.UnauthorizedAccessException] {
                    $IsLocked = 'AccessDenied'
                } Catch {
                    $IsLocked = $True
                }
                  $IsLocked
                
            }
        }
    }
}


function Install-Safetibase {
    [cmdletbinding()]
    Param (
        [parameter(Mandatory=$True,ValueFromPipeline=$False)]
        [string[]]$ProvisionningTemplate,

        [parameter(Mandatory=$True,ValueFromPipeline=$False)]
        [string[]]$SiteAssets,

        [parameter(Mandatory=$True,ValueFromPipeline=$False)]
        [string[]]$SPLists,

        [parameter(Mandatory=$True,ValueFromPipeline=$False)]
        [string[]]$SPsite
    )
    Process {
    
        $Tempalte = [string]$ProvisionningTemplate
        
        #Apply Provisionning Template
        Apply-PnPProvisioningTemplate -Path $Tempalte -ErrorAction Continue
    

        #Upload Site Assets
        
        $progressBar1.Increment(0.3)
        #Value = 0.30
        $InstallingText.text = 'Uploading site Assets...'
        $SafetIbase.Refresh()
        start-sleep -Seconds 2
        $Library = "Site Assets"
        $SiteSP = [string]$SPsite
        
        UploadFolder -targetWeb $SiteSP -targetDir $Library -path $SiteAssets -CreateLibrary

    
        # Populate Lists from Excel Tempalte
        $progressBar1.Increment(0.5)
        #$progressBar1.Value = 0.80
        $InstallingText.text = 'Populating Lists...'
        $SafetIbase.Refresh()
        #start-sleep -Seconds 5
        Write-Host "`nPopulate Lists`n"

        $Sheets = Get-ExcelSheetInfo -Path $SPLists

       
       
        # Loop through Sheets
        $ListPath = [string]$SPLists
        foreach ($sheet in $Sheets){
    
            #Import Sheet
            $ImportSheet = Import-Excel -Path $ListPath -DataOnly -WorksheetName $sheet.Name
            #Write-Host $ImportSheet
            #Loop through Rows
           foreach ($row in $ImportSheet){
            #Add list item
            $hash = $row | ConvertTo-HashtableFromPsCustomObject
            Add-PnPListItem -List "$($sheet.Name)" -Values $hash
            }
            if($ImportSheet.Count -gt 0){
                Write-Host "`n $($Sheet.Name) List populated`n" -ForegroundColor Green
            }
        }
        $progressBar1.Increment(0.2)
        $InstallingText.text = 'Installation Complete'
        $SafetIbase.Refresh()

        $finish = $True
        $finish

    }
}



Function UploadFolder {
# Function     
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
    ##check if Library exists
    $LibraryCheck = Get-PnPList -Identity $Library

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
                New-PnPList -Title $Library -Template DocumentLibrary
            }

        }
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
            Write-Host "Uploading" $currentFile.Name "to" $uploadDirectory "..." -ForegroundColor Yellow
            ## Upload the document
            Add-PnPFile -Path $currentFile.FullName -Folder $uploadDirectory
            #Add-SPOFile -Path $currentFile.FullName -Folder $uploadDirectory -Checkout
            Write-Host "Uploaded" $currentFile.Name "to" $uploadDirectory -ForegroundColor Green
        }
}
}

function ConvertTo-HashtableFromPsCustomObject { 
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

WelcomeForm
