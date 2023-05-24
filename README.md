# SafetIbase
SafetIbase is an award winning system to improve the identification, management and communication of health and safety hazards for construction projects. Funded by i3P, it is an open source solution for the industry.

#####################################################

Deploy Safetibase on a SharePoint Site
-----------------------------------------------------
Requirements:
- Windows 10
- SharePoint Project Site (sites from other templates might not work)
- Owner rights on your SharePoint site
-----------------------------------------------------
To install SafetIbase on a SharePoint, follow the steps below:
- Download these files to your C drive (downloading the whole repo from Github using the green 'Code' button on the top right, the select 'Download ZIP')
- Unblock the zip file (right click > properties > check the 'Unblock' checkbox)
- Open PowerShell (PowerShell ISE is the easiest option)
- Open 'Manual Install.ps1'
- In the User input section, change the Url to the url of your SharePoint site
- Go to your SharePoint site > 'Site Contents' > 'Site Assets'
- Drag and drop the content of the 'Site Asset' folder from the install files
- Run the script
- [Optional] Fill in the 'SafetIbaseListsContent - UserInput Template.xlsx' spreadsheet with your project specifc data. Delete tabs you are not updating
- [Optional] In PowerShell open 'Add User Inputs.ps1' and in the 'User Input' section, input the url of your site
- [Optional] Run the script. This will populate the SharePoint lists with the input you provide in the spreadsheet above
- [Optional] Edit the configData.js file ('Site Contents' > 'Site Assets' > 'pages' > '3.0' > 'scripts' > 'configData.js'). This contains a JSON variable with the following keys:
  - 'site' - Changes text for the word 'site' (e.g. could be changed to 'sublot')
  - 'Residual Risk Owner' - Changes text for the phrase 'Residual Risk Owner'
  - 'Contract' - Changes text for the word 'Contract'
  - 'Client Review' - This is a boolean which controls whether the workflow goes through client review - this functionality adds an extra couple of steps to the workflow:
    1. Submitted to client
    2. Accepted by client
  - 'Client Name' - Changes text for the client name
  - 'Archive hazards permissions' - list of the user roles that can archive hazards.
- To find your SafetIbase page, go to 'Site Contents' > 'Site Assets' > 'pages' > '3.0' > 'dashboard.aspx'
  - It is recommended to add a shortcut to 'dashboard.aspx' on the SharePoint site homepage for ease of access.
-----------------------------------------------------
CHANGE LOG:

19/05/2023
-	Tooltips have been added to clickable parts of the UI to improve user experience.
-	A popup explaining the hazard scoring system has been added to the add a hazard page.
-	A link to a SafetIbase guidance document has been added to the home screen. This can be reached by clicking the information icon next to the title.
-	A config file has been added to customise parts of the UI. This is a JavaScript file that contains a JSON object holding the key-value pairs of the configurable elements of the UI. Currently, the parts of the UI that can be configured are the name of sites (e.g., site or sublot), the name of residual risk owners (e.g., residual risk owner or future works owner), the name of future contracts, whether client review is built into the workflow as an additional stage, and the user roles that are authorised to archive hazards. The config file is located at SiteAssets/pages/3.0/scripts/configData.js.
-	Hazards that are marked as “Cancelled” can now be archived. This removes them from the dashboard to the list cdmHazardsArchived. To mark a hazard as “Cancelled”, expand the hazard, and then click the “Status” field. You will need to populate the cdmStatus list prior to this. We suggest populating it with the options “Open”, “Mitigated”, “Eliminated” and “Cancelled”. To archive the hazards marked as cancelled click the “Archived Cancelled Hazards” button. The set of user roles that are authorised to do this is controlled through the config file.
-	The construction manager’s mitigation suggestion can now be edited at any point in the workflow. Do so will return the hazard to the start of the workflow.
-	After filtering hazards and expanding hazards from a certain site, you can return to the filtered results by clicking on the home button.
-	A bug where the home button would not always load has been fixed. The location of the home button has been changed to the top left of the dashboard.
-	A bug where the read-only user role could add hazards has been fixed.
-	More useful error messages are provided when users attempt to use functionality that isn’t permitted.
-	The SafetIbase logo has been updated.
-	A bug where the user role “Principal Designer” was not recognised has been fixed.
-	A bug where some user roles would not be recognised if they were the only role assigned has been fixed.
- Some users reported the dashboard.aspx file downloaded instead of rendering the site when they clicked on it. This file has been modified to fix this.


06/10/20
  -Cleaned up tw.txt & rams.txt
  -Corrected the user roles being autoamticaly populated. Remove 'System admin', 'RAG admin', 'RAMS admin', 'TW admin' as they are not used.
  -Modified code to deal better with large number of hazards (up to 5000 hazards per tile in the SafetIbase dashboard). Includes adding extra indices to cdmHazards
  -Added home button and removed the link from the SafetIbase icon (unstable)
  -Removed requirement to run PowerShell as Administrator (install modules in user scope and change execution policy only in user scope).
  -Added Update_SafetIbase.ps1 This can be used to updae SafetIbase on a SP site where it is already isntalled. It will upload the latest relevant files from Github and add the required indices

15/11/19
  -Incorporated changes to new.hazard.form.html from evanpreslar-bentley

30/10/19
  -Added indexes to 'cdmStage' & 'Modified' fields (cdmHazards list) and 'Title' field (cdmStages)

07/10/19
  -Changed multiple files to integration with 'Bentley Design Review Risk Management'. At the moment requires manual indexing of the 'Modified' filed in cdmHazard

13/08/2019
  -Corrected typo in 'Manual Instal.ps1' l.110 variable $ListsToCreate

09/08/2019
  -Grouped all functions in SafetIbaseFunctions.psm1
  -Modified 'Manual Instal.ps1' to create a link to the SafetIbase dashboard in the SP site quick links
  -Modified 'Manual Instal.ps1'to automatically sort lists to create based on lookup column dependencies
  -Modified 'Manual Instal.ps1'& 'Add User Inputs.ps1' to correct a bug when adding items with lookup columns
  -Modified 'Manual Instal.ps1'& 'Add User Inputs.ps1' to sort lists to update based on lookup column dependencies

01/08/2019
  -Rationalised the 'Manual Instal.ps1' script
  -Modified 'user.dashboard.layout.1.css' to correct margins in hazard list on MM SP sites
  -Site Assets updated to version received from CVB in June 2019
