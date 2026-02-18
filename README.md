Invoke-RestMethod -Uri http://localhost:5000/messages -Method Get

Invoke-RestMethod `
  -Uri "http://localhost:5000/messages/{int:id}/votes" `
  -Method Post `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"votes":{int:int}}'

https://karstentsnapa.github.io/vote/

