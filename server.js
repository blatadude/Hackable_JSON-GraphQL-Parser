const fetch = require('node-fetch');
const merge = require('deep-extend')
const deepKeys = require('deep-keys')
const deepFind = require('deep-find')
const detectType = require('type-detect')
const _ = require('lodash')
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
    // console.log(objects)
    // Merge objects into one
    const merged = merge(...objects)
    // merged
    // Get just the keys
    const keys = deepKeys(merged)
    // console.log(keys)
    let objectCount = 0
    let stringCount= 0
    let arrayCount = 0
    let numberCount = 0
    let undefinedCount = 0
    let booleanCount = 0
    let otherTypes = []
    // for (let keyList of keys) {
    //   const keyNesting = keyList.split('.')


    //   // for all possible paths, go to one (level) log the type,(iterated is obj, then iterated[level] is next , log the type, repeat
    //   objects.map(obj => {
    //     // console.log(iterated)
    //     let iterated = obj
    //     for (let level of keyNesting) {
    //       iterated[level] ? iterated = iterated[level] : iterated = obj
    //       if (typeof(iterated) === 'string') {
    //         console.log(iterated)
    //         stringCount++
    //       }
    //       else if (Array.isArray(iterated)) {
    //         console.log(iterated)
    //         arrayCount++
    //       }
    //       else if (typeof(iterated) === 'object') objectCount++
    //       else if (typeof(iterated) === 'number') numberCount++
    //       else if (typeof(iterated) === 'undefined') undefinedCount++
    //       else if (typeof(iterated) === 'boolean') booleanCount++ 
    //     }
    //     console.log('deep? ', iterated)
    //   })
        
    //     // console.log(iterated)
      
    // }
    // const parsed = keys.map(key => key.split('.'))
    // console.log(keys)
    // console.log(parsed)
    
    
    
    // console.log(split)
    // console.log(merged)
    const p = objects.map(object => {
      // console.log(object)
      return keys.map(key => {
        try {
          return detectType(deepFind(object, key))
        } catch (err) {
        }  
      })
      
    })
    const little = p.map(p => {
      // const flat = _.flatten(p)
      // remove nonexistent things
      return p.filter(item => item != undefined && item != 'undefined')
    })
    console.log(little)
    
    // const types = _.compact(_.flattenDeep(p))
    // console.log(types)


}
const parseHackableJSON = (hackableJSON) => {
    try {
      return JSON.parse(hackableJSON)
    } catch (err) {
      return undefined
    }
  }
getKeys().then(console.log)

