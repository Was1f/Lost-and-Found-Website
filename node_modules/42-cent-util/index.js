function mapKeys(source, schema, target) {

    var obj = target || {};

    var schemaKeys = Object.keys(schema);
    schemaKeys.forEach(function (skey) {
        if (source[skey]) {
            obj[schema[skey]] = source[skey];
        }
    });

    return obj;
}


module.exports = {
    mapKeys: mapKeys
};