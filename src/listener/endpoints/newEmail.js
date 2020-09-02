module.exports = (params, callBack) => {
  let pipedrive = params.pipedrive;
  pipedrive([['persons/find?term=' + params.data + '&start=0&search_by_email=1']], d => {
    d = d[0];
    if (d.data) {
      // need to fix preload
      // callBack({type:'preload',data:d.data[0]})
      pipedrive([
        ['persons/'+d.data[0].id],
        ['persons/'+d.data[0].id+'/deals'],
        ['persons/' + d.data[0].id + '/activities?done=0'],
        ['notes?person_id='+ d.data[0].id +'&pinned_to_person_flag=1']
      ], e => {
        var response = {};
        e[0].data.for = params.data;
        response[params.data] = {
          person: e[0].data,
          deals: e[1].data,
          activities: e[2].data,
          notes: e[3].data
        };
        callBack(response, {save: 1, for: params.data})
      }, params)
    } else {
      var response = {};
      response[params.data] = 0;
      callBack(response)
    }
  }, params)
}