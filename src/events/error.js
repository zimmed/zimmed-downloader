const create = module.exports = (code, data=null) => {
    return {
        status: code,
        message: create.Errors[code] || 'Unknown',
        data
    };
};

create.Errors = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error'
};
