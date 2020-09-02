var apis = {
  deals: 'deals',
  org: 'organizations',
  people: 'persons',
  products: 'products',
  activity: 'activities'
}

module.exports = (params, callBack) => {
  let pipedrive = params.pipedrive;
  if (params.data[0]) {
    if (params.data[1]) {
      pipedrive([
        [apis[params.data[0].type] + '?filter_id=' + params.data[0].id + '&user_id=' + params.user_id],
        [apis[params.data[1].type] + '?filter_id=' + params.data[1].id + '&user_id=' + params.user_id]
      ], r => {
        callBack({ goals: [r[0].data, r[1].data] }, { save: 1 })
      }, params)
    } else {
      pipedrive([[apis[params.data[0].type] + '?filter_id=' + params.data[0].id + '&user_id=' + params.user_id]],
      r => {
        callBack({ goals: [r[0].data] },{ save: 1 })
      }, params)
    }
  }
}