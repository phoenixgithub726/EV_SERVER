module.exports = (params, callBack) => {
  params.pipedrive([['organizations/find?term=' + params.data]],
    r => callBack({results: r[0].data, term: params.data}), params )
}