import { METHODS } from 'node:http';

export const _routerWithMeta = ({router, meta}) => {
    const routerWithMeta = {};

    for (var k in METHODS) {
        const method = METHODS[k].toLowerCase();
        routerWithMeta[method] = function() {
            const path = arguments[0];
            const metadata = Object.assign({}, arguments[1]);

            meta[`${method.toUpperCase()} ${path}`] = {...metadata};

            var routerArguments = [
                ...arguments,
            ];
            routerArguments.splice(1, 1);

            return router[method].apply(router, routerArguments);
        }
    }

    return routerWithMeta;
}
