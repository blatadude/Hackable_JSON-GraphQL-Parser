const fetch = require('node-fetch');
const merge = require('deep-extend')
const deepKeys = require('deep-keys')
const deepFind = require('get-deep')
const detectType = require('type-detect')
const _ = require('lodash')
// Credit to DavDavDavid for the fetch error handler and JSON parser
const benignErrorCodes = [
    'warming_up'
  ]
const makeFetchUsers = (fetcher) => {
    const fetchUsers = async (onFailWait=5000) => {
      const data = await fetcher()
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

const getUsers = async () => {
    const fetchUsers = makeFetchUsers(async () =>
    await (await fetch('https://ffforumautomator.herokuapp.com/hackable-data')).json()
    )

    const data = await fetchUsers()
    const parsedObj = data.map(user => {
        return parseHackableJSON(user.hackable_json)
    })
    // Some user thought they needed to use JSON string instead of a POJO
    return parsedObj.filter(item => {
        return typeof(item) === "object"
    })
  }

const findKeyType = (users) => {
  // Merge users into one object for easier handling
  const merged = merge(...users)
  // Key Array
  const keys = deepKeys(merged)

  // recursively check all the keys for each user, return if value is truthy
  const pairs = users.map(user => {  
    const deep = keys.map(key => {
      const found = deepFind(user, key)
      // not sure if should be obj or arr hmmm
      if (found) return {
        key,
        value: found,
        type: detectType(found)
      }
    })
      // map returns undefined if no return, so they get removed here
      return deep.filter(item => (item))    
  })
  return pairs
}

const parseHackableJSON = (hackableJSON) => {
  try {
    return JSON.parse(hackableJSON)
  } catch (err) {
    return undefined
  }
}

getUsers().then(users => {
  console.log(findKeyType(users))
})
