const fetch = require('node-fetch');
const merge = require('deepmerge')
const deepKeys = require('deep-keys')
// Big thanks to DavDavDavid for the fetch error handler and JSON parser
const benignErrorCodes = [
    'warming_up'
  ]
const makeFetchUsers = (fetcher) => {
    const fetchUsers = async (onFailWait=5000) => {
      let data = await fetcher()
      if (data.error_code) {
        console.error(data.error_message)
        if (benignErrorCodes.includes(data.error_code)) {
          await Promise.delay(onFailWait)
          return fetchUsers(onFailWait * 2)
        }
    }
    return data
    }
    return fetchUsers
}

const getKeys = async () => {
    const fetchUsers = makeFetchUsers(async () =>
    await (await fetch('https://ffforumautomator.herokuapp.com/hackable-data')).json()
    )

    const data = await fetchUsers()
    const parsedObj = data.map(user => {
        return parseHackableJSON(user.hackable_json)
    })
    // Some user managed to stringify his json so that it retained type === string after JSON parsing
    const objects = parsedObj.filter(item => {
        return typeof(item) === "object"
    })
    // Merge objects into one
    const merged = merge.all(objects)
    // Get just the keys
    const keys = deepKeys(merged)
    return keys
}
const parseHackableJSON = (hackableJSON) => {
    try {
      return JSON.parse(hackableJSON)
    } catch (err) {
      return undefined
    }
  }
getKeys().then(console.log)

