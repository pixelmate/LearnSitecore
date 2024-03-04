[CmdletBinding(DefaultParameterSetName = "no-arguments")]
Param (
    [Parameter(Mandatory = $true)]
    [string]$CM_Role_URL,

    [Parameter(Mandatory = $true)]
    [string]$IDENTITYSERVER_Role_URL
)

dotnet sitecore login --cm $CM_Role_URL --auth $IDENTITYSERVER_Role_URL --allow-write true --client-credentials true --client-id CGP_Automation --client-secret cb6642bc88ae638399c36cbf2e292c3f090ee218ec01a9699712edd0f6a992d0

Write-Host "Opening site..." -ForegroundColor Green

Start-Process $CM_Role_URL/sitecore
Start-Process $CM_Role_URL