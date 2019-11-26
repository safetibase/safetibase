# SafetIbase
SafetIbase is an award winning system to improve the identification, management and communication of health and safety hazards for construction projects. Funded by i3P, it is an open source solution for the industry.

#####################################################

Deploy Safetibase on a SharePoint Site
-----------------------------------------------------
Requirements:
- Windows 10
- Administrator rights on your computer
- Owner rights on your SharePoint site
-----------------------------------------------------
To install SafetIbase on a SharePoint, follow the steps below:
- Download these files to your C drive
- Open PowerShell as administrator
- Open 'Manual Instal.ps1'
- In the User input section, change the Url to the url of your SharePoint site
- Go to your SharePoint site > 'Site Contents' > 'Site Assets'
- Drag and drop the content of the 'Site Asset' folder from the install files
- Run the script
- [Optional] Fill in the 'SafetIbaseListsContent - UserInput Template.xlsx' spreadsheet with your project specifc data. Delete tabs your are not updating
- [Optional] In PowerShell open 'Add User Inputs.ps1' and in the 'User Input' section, input the url of your site
- [Optional] Run the script
- To find your SafetIbase page, go to 'Site Contents' > 'Site Assets' > 'pages' > '3.0' > 'dashboard.aspx'
-----------------------------------------------------
CHANGE LOG:

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
