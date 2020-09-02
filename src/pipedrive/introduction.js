module.exports = (params, callBack) => {
  let pipedrive = params.pipedrive;
  pipedrive([
    ['users/me']
  ], newUser => {
    pipedrive([
      ['activityTypes'],
      ['stages'],
      ['pipelines'],
      ['deals?user_id='+ newUser[0].data.id],
      ['activities?user_id=' + newUser[0].data.id],
      ['personFields'],
      ['users'],
      ['https://api.exchangeratesapi.io/latest?base=USD']
      // ['users/self']
      // ['https://api.stripe.com/v1/search?query='+d.data.email,'GET', [], [['Authorization', 'Basic c2tfdGVzdF9UUmJJRjBZaEJCbHo3VkxGeHEyWEwyb3c6']]]
    ], response => {
      let result = {
        user: newUser[0].data,
        activities: response[0].data,
        stages: response[1].data,
        pipelines: response[2].data,
        token: params.token.refresh_token,
        persons: { label: response[5].data[1].options, visible: response[5].data[9].options },
        allUsers: response[6].data,
        personFields: response[5].data,
        currencies: response[7]
        // self: response[5].data
        // FCMToken: connectedPhones[user.email]
      }
      result.user.deals = response[3].data;
      result.user.activities = response[4].data;
      // result.user.persons = response[5].data;

      // emailToId[user.email] = params.socket.id;

      callBack(result, {save: 1, emailToId: result.user.email, id: result.user.id, token: params.token})
    }, params)
  }, params)
}