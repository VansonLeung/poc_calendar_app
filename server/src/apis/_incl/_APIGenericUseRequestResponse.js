export const _APIGenericUseRequestResponse = {
    apply: () => {

        return (req, res, next) => {

            res.sendResponse = ({status, data, message}) => {
                res.status(status || 200).json({
                    status: status || 200,
                    success: true,
                    data,
                    message,
                });
            };

            res.sendError = ({status, error, message}) => {
                res.status(status || 500).json({
                    status: status || 500,
                    success: false,
                    message: message || error.message,
                    stack: (error && error.stack) ? error.stack : undefined,
                });
            };

            next();

        };
    },
}

