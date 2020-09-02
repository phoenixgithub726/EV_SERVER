module.exports = (params, callBack) => {
  params.pipedrive([['deals', 'POST', params.data]], r=> callBack(r[0].data), params)
}