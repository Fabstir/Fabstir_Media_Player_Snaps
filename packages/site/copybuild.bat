del contracts\*.*

set dSource=..\..\..\media-player-smart-contracts\artifacts\contracts\
set dTarget=contracts
set fType=*.json
for /f "delims=" %%f in ('dir /a-d /b /s "%dSource%\%fType%"') do (
    copy /V "%%f" "%dTarget%\" 2>nul
)