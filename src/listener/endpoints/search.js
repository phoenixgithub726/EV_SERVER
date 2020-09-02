// todo find a way to terminate searches that no longer relevant
module.exports = (params, callBack) => {
  params.pipedrive([['persons/find?term=' + params.data]],
    r => callBack({results: r[0].data, term: params.data}), params )
}