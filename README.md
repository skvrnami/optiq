# TODO:

## Build
```
docker build --no-cache -t optiq .
docker run -p 3838:3838 optiq
```
nebo
```
docker stop $(docker ps -q --filter ancestor=optiq) 2>/dev/null
docker rmi optiq
docker build -t optiq .
docker run -p 3838:3838 optiq
```