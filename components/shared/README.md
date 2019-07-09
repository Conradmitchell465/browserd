# browserd/shared

Represents some functionality that is shared between the consumer and provider 🤕☁✨

[![Build Status](https://dev.azure.com/bengreenier/browserd/_apis/build/status/shared?branchName=master)](https://dev.azure.com/bengreenier/browserd/_build/latest?definitionId=12&branchName=master)[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bengreenier_browserd&metric=alert_status)](https://sonarcloud.io/dashboard?id=bengreenier_browserd)

## Testing

How to test shared functinoality. ⚙

### Docker
> Note: Our [`Dockerfile`](./Dockerfile) has a defined display resolution of `1920x1080` - You may change this as needed.

build the container (and source)
```
docker build . -f components/shared/DOCKERFILE -t browserd:local
```

### Locally
```
# install lerna
npm install lerna -g

# use lerna to hoist dependencies and link local dependencies
lerna bootstrap --hoist

# navigate to component
cd components/shared

# build and test
npm run build && npm run test
```

## Contributing

Coming soon. ✨

## License

MIT
