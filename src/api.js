import axios from 'axios'
import { gql } from '@apollo/client'
import { print } from 'graphql'

const ADD_FARM = gql`
  mutation AddFarm(
    $id: ID!
    $size: String!
    $soil: String!
    $imageHash: String!
    $season: String!
    $owner: String!
  ) {
    addFarm(input: {
      id: $id
      size: $size
      soil: $soil
      imageHash: $imageHash
      season: $season
      owner: $owner
    }) {
      id
    }
  }
`

const UPDATE_SEASON = gql`
  mutation UpdateFarmSeason(
    $token: Int!
    $season: String!
  ) {
    updateFarmSeason(input: {
      token: $token
      season: $season
    }) {
     updatedAt 
    }
  }
`

const UPDATE_PLANTINGS = gql`
  mutation UpdateFarmPlantings(
    $seedUsed: String!
    $expectedYield: String!
    $seasonNumber: Int!
    $token: Int!
    $seedSupplier: String!
  ) {
    updateFarmPlantings(input: {
      seedUsed: $seedUsed
      expectedYield: $expectedYield
      seasonNumber: $seasonNumber
      token: $token
      seedSupplier: $seedSupplier
    }) {
      token
    }
  }
`

const UPDATE_PREPARATIONS = gql`
  mutation UpdateFarmPreparations(
    $token: Int!
    $seasonNumber: Int!
    $crop: String!
    $fertilizer: String!
  ) {
    updateFarmPreparations(input: {
      token: $token
      seasonNumber: $seasonNumber
      crop: $crop
      fertilizer: $fertilizer
    }) {
      updatedAt
    }
  }
`

const UPDATE_HARVESTS = gql`
  mutation UpdateFarmHarvests(
    $seasonNumber: Int!
    $token: Int!
    $totalSupply: Int!
    $supplyUnit: String!
    $price: String!
  ) {
    updateFarmHarvests(input: {
      seasonNumber: $seasonNumber
      token: $token
      totalSupply: $totalSupply
      supplyUnit: $supplyUnit
      price: $price
    }) {
      updatedAt
    }
  }
`

const ADD_BOOKINGS = gql`
  mutation AddBooking(
    $token: Int!
    $volume: Int!
    $booker: String!
    $deposit: String!
    $delivered: Boolean!
  ) {
    addBooking(input: {
      token: $token
      volume: $volume
      booker: $booker
      deposit: $deposit
      delivered: $delivered
    }) {
      updatedAt
    }
  }
`

const UPDATE_HARVEST_SUPPLY = gql`
  mutation UpdateFarmHarvestSupply(
    $token: Int!
    $seasonNumber: Int!
    $newSupply: Int!
  ) {
    updateFarmHarvestSupply(input: {
      token: $token
      seasonNumber: $seasonNumber
      newSupply: $newSupply
    }) {
      updatedAt
    }
  }
`

const UPDATE_AFTER_CANCELLATION = gql`
  mutation UpdateAfterCancellation(
    $bookingId: ID!
    $seasonNumber: Int!
    $token: Int!
    $newSupply: Int!
    $newVolume: Int!
    $newDeposit: String!
  ) {
    updateAfterCancellation(input: {
      bookingId: $bookingId
      seasonNumber: $seasonNumber
      token: $token
      newSupply: $newSupply
      newVolume: $newVolume
      newDeposit: $newDeposit
    })
  }
`

const UPDATE_AFTER_RECEIVERSHIP = gql`
  mutation UpdateAfterReceivership(
    $bookingId: ID!
    $newBookerVolume: Int!
    $newBookerDeposit: String!
    $delivered: Boolean!
  ) {
    updateAfterReceivership(input: {
      bookingId: $bookingId
      newBookerVolume: $newBookerVolume
      newBookerDeposit: $newBookerDeposit
      delivered: $delivered
    })
  }
`

const UPDATE_HARVEST_BOOKERS = gql`
  mutation UpdateHarvestBookers(
    $token: Int!
    $seasonNumber: Int!
    $noOfBookers: Int!
  ) {
    updateHarvestBookers(input: {
      token: $token
      seasonNumber: $seasonNumber
      noOfBookers: $noOfBookers
    }) {
      updatedAt
    }
  }
`

const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus(
    $id: ID!
    $delivered: Boolean!
  ) {
    updateBookingStatus(input: {
      id: $id
      delivered: $delivered
    }) {
      updatedAt
    }
  }
`

export default {
  wallet: {
    addFarm: (_tokenId, _size, _soilType, _owner, _fileHash, _season) => axios.post(`${process.env.REACT_APP_GRAPHQL_API}`, {
      query: print(ADD_FARM),
      variables: {
        id: String(_tokenId),
        size: String(_size),
        soil: String(_soilType),
        imageHash: String(_fileHash),
        season: String(_season),
        owner: String(_owner),
      }
    })
    .then(res => console.log('Success'))
  },
  farm: {
    updateSeason: (_token, _season) => axios.post(`${process.env.REACT_APP_GRAPHQL_API}`, {
      query: print(UPDATE_SEASON),
      variables: {
        token: Number(_token),
        season: String(_season),
      }
    })
    .then(res => console.log('Success')),
    updatePreparations: (_token, _currentSeason, _crop, _fertilizer) => axios.post(`${process.env.REACT_APP_GRAPHQL_API}`, {
      query: print(UPDATE_PREPARATIONS),
      variables: {
        token: Number(_token),
        seasonNumber: Number(_currentSeason),
        crop: String(_crop),
        fertilizer: String(_fertilizer),
      }
    })
    .then(res => console.log('Success')),
    updatePlantings: (_seedUsed, _expectedYield, _currentSeason, _tokenId, _seedSupplier) => axios.post(`${process.env.REACT_APP_GRAPHQL_API}`, {
      query: print(UPDATE_PLANTINGS),
      variables: {
        seedUsed: String(_seedUsed),
        expectedYield: String(_expectedYield),
        seasonNumber: Number(_currentSeason),
        token: Number(_tokenId),
        seedSupplier: String(_seedSupplier),
      }
    })
    .then(res => console.log('Success')),
    updateHarvests: (_seasonNumber, _token, _supply, _unit, _price) => axios.post(`${process.env.REACT_APP_GRAPHQL_API}`, {
      query: print(UPDATE_HARVESTS),
      variables: {
        seasonNumber: Number(_seasonNumber),
        token: Number(_token),
        totalSupply: Number(_supply),
        supplyUnit: String(_unit),
        price: String(_price),
      }
    })
    .then(res => console.log('Success')),
    addBooking: (_token, _volume, _booker, _deposit, _delivered) => axios.post(`${process.env.REACT_APP_GRAPHQL_API}`, {
      query: print(ADD_BOOKINGS),
      variables: {
        token: Number(_token),
        volume: Number(_volume),
        booker: String(_booker).toLowerCase(),
        deposit: String(_deposit),
        delivered: Boolean(_delivered),
      }
    }).then(res => console.log('Success')),
    updateFarmHarvestSupply: (_seasonNumber, _token, _newSupply) => axios.post(`${process.env.REACT_APP_GRAPHQL_API}`, {
      query: print(UPDATE_HARVEST_SUPPLY),
      variables: {
        seasonNumber: Number(_seasonNumber),
        token: Number(_token),
        newSupply: Number(_newSupply),
      }
    }).then(res => console.log('Success')),
    updateAfterCancellation: (_bookingId, _seasonNumber, _token, _newSupply, _newVolume, _newDeposit) => axios.post(`${process.env.REACT_APP_GRAPHQL_API}`, {
      query: print(UPDATE_AFTER_CANCELLATION),
      variables: {
        bookingId: _bookingId,
        seasonNumber: Number(_seasonNumber),
        token: Number(_token),
        newSupply: Number(_newSupply),
        newVolume: Number(_newVolume),
        newDeposit: String(_newDeposit),
      }
    }).then(res => console.log('Success')),
    updateAfterReceivership: (_bookingId, _newVolume, _newDeposit, _delivered) => axios.post(`${process.env.REACT_APP_GRAPHQL_API}`, {
      query: print(UPDATE_AFTER_RECEIVERSHIP),
      variables: {
        bookingId: _bookingId,
        newBookerVolume: Number(_newVolume),
        newBookerDeposit: String(_newDeposit),
        delivered: Boolean(_delivered),
      }
    }).then(res => console.log('Success')),
    updateHarvestBookers: (_token, _seasonNumber, _noOfBookers) => axios.post(`${process.env.REACT_APP_GRAPHQL_API}`, {
      query: print(UPDATE_HARVEST_BOOKERS),
      variables: {
        token: Number(_token),
        seasonNumber: Number(_seasonNumber),
        noOfBookers: Number(_noOfBookers),
      }
    }).then(res => console.log('Success')),
    updateBookingStatus: (_id, _delivered) => axios.post(`${process.env.REACT_APP_GRAPHQL_API}`, {
      query: print(UPDATE_BOOKING_STATUS),
      variables: {
        id: _id,
        delivered: Boolean(_delivered),
      }
    }).then(res => console.log('Success')),
  }
}

