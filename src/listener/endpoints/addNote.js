module.exports = (params, callBack) => {
  let pipedrive = params.pipedrive;
  params.data.pinned_to_person_flag = 1;
  pipedrive([['notes', 'POST', params.data]], r => {
    callBack(r[0].data)
  }, params);
}