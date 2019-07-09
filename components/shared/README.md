# browserd/shared

Represents some functionality that is shared between the consumer and provider 🤕☁✨

[![Build Status](Build CI not yet added)]
[![Quality Gate Status](Unknown)]

## Testing

How to test shared functinoality. ⚙

### Docker

# build the container (and source)
```
docker build . -f packages/shared/DOCKERFILE -t browserd:local
```

### Locally
```
# install lerna
npm install lerna -g

# run lerna to bootstrap packages
lerna bootstrap --hoist

# navigate to module
cd packages/shared

# build and test
npm run build && npm run test
```

## Contributing

Coming soon. ✨

## License

MIT
