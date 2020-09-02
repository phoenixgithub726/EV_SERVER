module.exports = (params, callBack) => {
  let pipedrive = params.pipedrive;
console.log(params, params.org_id == 'new')
  if (params.data.org_id == 'new') {
    pipedrive([['organizations', 'POST', { name: params.data.org_name }]], z => {
      console.log(z);
      params.data.org_id = z[0].data.id;
      delete params.data.org_name;
      pipedrive([['persons', 'POST', params.data, [['Content-Type', 'application/json']]]], r => {
        var data = {}
        let email = r[0].data.email[0].value;
        data[email] = { person: r[0].data, deals: null, activities: null };
        callBack(data, { save: 1, for: email })
      }, params);
    }, params)
  } else {
    pipedrive([['persons', 'POST', params.data, [['Content-Type', 'application/json']]]], r => {
      var data = {}
      let email = r[0].data.email[0].value;
      data[email] = { person: r[0].data, deals: null, activities: null };
      callBack(data, { save: 1, for: email })
    }, params);
  }
}