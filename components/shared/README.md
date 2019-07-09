# browserd/shared

Represents some functionality that is shared between the consumer and provider 🤕☁✨

[![Build Status](Build CI not yet added)]
[![Quality Gate Status](Unknown)]

## Testing

How to test shared functinoality. ⚙

### Docker

# build the container (and source)
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
