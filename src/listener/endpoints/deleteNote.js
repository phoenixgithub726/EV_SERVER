module.exports = (params, callBack) => {
  let pipedrive = params.pipedrive;
  pipedrive([['notes/'+params.data.id, 'DELETE']], r => {
    callBack(r[0].data)
  }, params);
}