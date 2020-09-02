module.exports = (params, callback) => {
  let pipedrive = params.pipedrive;
  pipedrive([
    ['filters'],
    ['dealFields'],
    ['organizationFields'],
    ['personFields'],
    ['productFields'],
    ['activityFields']
  ], r => {
    var filters = [];

    r[0].data.forEach(filter => {
      filters.push(['filters/' + filter.id])
    });

    var fields = {
      "deals": r[1].data,
      "org": r[2].data,
      "people": r[3].data,
      "products": r[4].data,
      "activity": r[5].data
    }

    pipedrive(filters, s => {
      var condi = {
        'this_quarter': 3,
        'this_month': 2,
        'this_week': 1
      };
      var types = {};
      var data = { fields: {}, filters: {} };
      s.forEach(f => {
        if (f.data.active_flag) {
          for (i of f.data.conditions.conditions) {
            for (c of i.conditions) {
              if (condi[c.value]) {
                if (!data.filters[f.data.id]) {
                  types[f.data.type] = 1;
                  data.filters[f.data.id] = f.data
                }
                if (!data.filters[f.data.id].period ||
                  condi[data.filters[f.data.id].period] < condi[c.value]) {
                  data.filters[f.data.id].period = c.value
                }
              }
            }
          }
        }
      })

      var isFieldNameExcluded = { 'ID': 1, 'Probability': 1, 'Pipeline': 1 };
      var isFieldTypeIncluded = { 'int': 1, 'double': 1, 'monetary': 1 };
      (Object.keys(types)).forEach(type => {
        data.fields[type] = [];
        fields[type].forEach(z => {
          if (isFieldTypeIncluded[z.field_type] && !isFieldNameExcluded[z.name]) {
            data.fields[type].push(z)
          }
        })
      })
      if (params == 'loggedIn') {
        type = 'login';
      }

      callback(data, { save: 1 })
    }, params)
  }, params)

}