#------------------
# Function module containg all useful PowerShell functions for SafetIbase
#------------------

<# List of Functions

ConvertTo-HashtableFromPsCustomObject - Converts an object into a hashtable

Get-TopologicalSort - Sorts a hashtable containg items and their dependencies

Get-ClonedObject - Used by Get-TopologicalSort function

Install-RequiredModules - Check is ImportExcel and SharePointPnP modules are installed

#>

#Convert object to hashtable
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

#Do a topological sort
function Get-TopologicalSort {
  param(
      [Parameter(Mandatory = $true, Position = 0)]
      [hashtable] $edgeList
  )

  # Make sure we can use HashSet
  Add-Type -AssemblyName System.Core

  # Clone it so as to not alter original
  $currentEdgeList = [hashtable] (Get-ClonedObject $edgeList)

  # algorithm from http://en.wikipedia.org/wiki/Topological_sorting#Algorithms
  $topologicallySortedElements = New-Object System.Collections.ArrayList
  $setOfAllNodesWithNoIncomingEdges = New-Object System.Collections.Queue

  $fasterEdgeList = @{}

  # Keep track of all nodes in case they put it in as an edge destination but not source
  $allNodes = New-Object -TypeName System.Collections.Generic.HashSet[object] -ArgumentList (,[object[]] $currentEdgeList.Keys)

  foreach($currentNode in $currentEdgeList.Keys) {
      $currentDestinationNodes = [array] $currentEdgeList[$currentNode]
      if($currentDestinationNodes.Length -eq 0) {
          $setOfAllNodesWithNoIncomingEdges.Enqueue($currentNode)
      }

      foreach($currentDestinationNode in $currentDestinationNodes) {
          if(!$allNodes.Contains($currentDestinationNode)) {
              [void] $allNodes.Add($currentDestinationNode)
          }
      }

      # Take this time to convert them to a HashSet for faster operation
      $currentDestinationNodes = New-Object -TypeName System.Collections.Generic.HashSet[object] -ArgumentList (,[object[]] $currentDestinationNodes )
      [void] $fasterEdgeList.Add($currentNode, $currentDestinationNodes)        
  }

  # Now let's reconcile by adding empty dependencies for source nodes they didn't tell us about
  foreach($currentNode in $allNodes) {
      if(!$currentEdgeList.ContainsKey($currentNode)) {
          [void] $currentEdgeList.Add($currentNode, (New-Object -TypeName System.Collections.Generic.HashSet[object]))
          $setOfAllNodesWithNoIncomingEdges.Enqueue($currentNode)
      }
  }

  $currentEdgeList = $fasterEdgeList

  while($setOfAllNodesWithNoIncomingEdges.Count -gt 0) {        
      $currentNode = $setOfAllNodesWithNoIncomingEdges.Dequeue()
      [void] $currentEdgeList.Remove($currentNode)
      [void] $topologicallySortedElements.Add($currentNode)

      foreach($currentEdgeSourceNode in $currentEdgeList.Keys) {
          $currentNodeDestinations = $currentEdgeList[$currentEdgeSourceNode]
          if($currentNodeDestinations.Contains($currentNode)) {
              [void] $currentNodeDestinations.Remove($currentNode)

              if($currentNodeDestinations.Count -eq 0) {
                  [void] $setOfAllNodesWithNoIncomingEdges.Enqueue($currentEdgeSourceNode)
              }                
          }
      }
  }

  if($currentEdgeList.Count -gt 0) {
      throw "Graph has at least one cycle!"
  }

  return $topologicallySortedElements
}

#Function required by topological sort function
function Get-ClonedObject {
    param($DeepCopyObject)
    $memStream = new-object IO.MemoryStream
    $formatter = new-object Runtime.Serialization.Formatters.Binary.BinaryFormatter
    $formatter.Serialize($memStream,$DeepCopyObject)
    $memStream.Position=0
    $formatter.Deserialize($memStream)
}

#Function to check if ImportExcel and SharePointPowerShellOnline are imported
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
            Try{ Install-Module $mod -Scope CurrentUser -Force -ErrorAction Stop | Out-Null}
            Catch {
                $output = $mod
            }
        }
    }

    $output
    Write-Host "`nDependant Modules installed`n" -ForegroundColor Green

}
