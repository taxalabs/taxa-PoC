import PropTypes from 'prop-types'
import React, { useState } from 'react'
import Farm from '../../build/Farm.json'
import { connect } from 'react-redux'
import makeBlockie from 'ethereum-blockies-base64'
import {
  Header,
  Segment,
  Label,
  Image,
  Button,
  Grid,
  Table,
  Popup,
} from 'semantic-ui-react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { truncateAddress } from '../../utils'
import {
  HeaderPlaceholder,
  LabelPlaceholder,
  ImagePlaceholder,
} from './HeaderPlaceholder'
import { store } from '../../store'
import { openSeason, confirmedTx } from '../../actions'
import { ConfirmingTx, ConfirmedTx } from '../notifications'
import PreparationModal from './PreparationModal'
import PlantingModal from './PlantingModal'
import HarvestModal from './HarvestModal'
import { initContract } from '../../utils'
import api from '../../api'


function FarmHeader({ farm, loaded, netId, tokenId, account, txConfirmed }) {

  const [copying, setCopying] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [openPlantingModal, setOpenPlantingModal] = useState(false)
  const [openHarvestModal, setOpenHarvestModal] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [confirmingTransaction, setConfirmingTransaction] = useState(false)
  
  async function handleOpenSeason() {
    try {
      setButtonLoading(true)
      setButtonDisabled(true)
      const txStatus = {}
      const farmContract = initContract(Farm, netId)
      await farmContract.methods.openSeason(tokenId).send({from: account.address[0]})
        .on('transactionHash', () => {
          setButtonLoading(false)
          setConfirmingTransaction(true)
        })
        .on('confirmation', async(confirmationNumber, receipt) => {
          if (confirmationNumber === 1) {
            const resp = {}
            resp.season = await farmContract.methods.getTokenSeason(tokenId).call()
            resp.presentSeason = await farmContract.methods.currentSeason(tokenId).call()
            store.dispatch(openSeason({ ...resp }))
            setButtonDisabled(false)
            setConfirmingTransaction(false)
            txStatus.confirmed = true
            store.dispatch(confirmedTx({ ...txStatus }))
            await api.farm.updateSeason(tokenId, resp.season)
          }
        })
        .on('error', error => {
          console.log(error)
        })
    } catch(error) {
      setButtonLoading(false)
      console.log(error)
    }
  }

  function handleFarmPreparation() {
    setIsModalVisible(true)
  }

  function handleFarmPlanting() {
    setOpenPlantingModal(true)
  }

  function handleFarmHarvesting() {
    setOpenHarvestModal(true)
  }

  async function handleCloseSeason() {
    try {
      setButtonDisabled(true)
      const txStatus = {}
      const farmContract = initContract(Farm, netId)
      await farmContract.methods.closeSeason(tokenId).send({from: account.address[0]})
        .on('transactionHash', () => {
          setConfirmingTransaction(true)
        })
        .on('confirmation', async(confirmationNumber, receipt) => {
          if (confirmationNumber === 1) {
            const { _tokenState, _completeSeason } = receipt.events.SeasonClosing.returnValues
            const updatedFarm = {}
            updatedFarm.completeSeasons = _completeSeason
            updatedFarm.season = _tokenState
            txStatus.confirmed = true
            store.dispatch(confirmedTx({ ...txStatus }))
            store.dispatch(openSeason({ ...updatedFarm }))
            setButtonDisabled(false)
            setConfirmingTransaction(true)
            await api.farm.updateSeason(tokenId, _tokenState)
          }
        })
    } catch(error) {
      console.log(error)
    }
  }

  return (
    <Grid stackable columns={2}>
      <Grid.Row>
        <Grid.Column floated='right'>
          {confirmingTransaction && <ConfirmingTx />}
          {txConfirmed && <ConfirmedTx />}
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Segment placeholder>
            <Segment basic>
              {farm.season === undefined ? (
                <LabelPlaceholder />
              ) : (
                <Label
                  content={farm.season}
                  color={farm.season === 'Dormant' ? 'grey'
                    : farm.season === 'Preparation' ? 'blue'
                    : farm.season === 'Planting' ? 'brown'
                    : farm.season === 'Crop Growth' ? 'red'
                    : farm.season === 'Harvesting' ? 'green'
                    : null}
                  size='tiny'
                  horizontal
                />
              )} 
              {farm.imageHash === undefined ? (<ImagePlaceholder />) : (
                <Image
                  style={{ marginTop: '1em' }}
                  src={
                    farm.imageHash === undefined ?
                    'https://react.semantic-ui.com/images/wireframe/square-image.png' :
                    `https://ipfs.io/ipfs/${farm.imageHash}`
                  }
                  rounded
                  fluid
                />
              )} 
              {account.address === undefined ? null :
                  farm.season === undefined ? <LabelPlaceholder /> :
                  farm.season === 'Dormant' && String(account.address[0]) === String(farm.owner).toLowerCase() ? (
                    <Button
                      color='grey'
                      loading={buttonLoading}
                      floated='left'
                      onClick={loaded ? () => handleOpenSeason() : null}
                      disabled={buttonDisabled}
                      style={{ marginTop: '1em' }}
                    >
                      Open Season
                    </Button>
                  ) :
                  farm.season === 'Preparation' && String(account.address[0]) === String(farm.owner).toLowerCase() ? (
                    <Button
                      color='blue'
                      loading={buttonLoading}
                      floated='left'
                      onClick={loaded ? () => handleFarmPreparation() : null}
                      style={{ marginTop: '1em' }}
                    >
                      Confirm Preparations
                    </Button>
                  ) :
                  farm.season === 'Planting' && String(account.address[0]) === String(farm.owner).toLowerCase() ? (
                    <Button
                      color='brown'
                      floated='left'
                      loading={buttonLoading}
                      style={{ marginTop: '1em' }}
                      onClick={loaded ? () => handleFarmPlanting() : null}
                    >
                      Confirm Planting
                    </Button>
                  ) :
                  farm.season === 'Crop Growth' && String(account.address[0]) === String(farm.owner).toLowerCase() ? (
                    <Button
                      color='red'
                      floated='left'
                      loading={buttonLoading}
                      style={{ marginTop: '1em' }}
                      onClick={loaded ? () => handleFarmHarvesting() : null}
                    >
                      Confirm Harvest 
                    </Button>
                  ) :
                  farm.season === 'Harvesting' && String(account.address[0]) === String(farm.owner).toLowerCase() ? (
                    <Button
                      color='red'
                      floated='left'
                      disabled={buttonDisabled}
                      loading={buttonDisabled}
                      style={{ marginTop: '1em' }}
                      onClick={loaded ? () => handleCloseSeason() : null}
                    >
                      Close Season
                    </Button>
                  ) :
                  null} 
              <PreparationModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} /> 
              <PlantingModal openPlantingModal={openPlantingModal} setOpenPlantingModal={setOpenPlantingModal} />
              <HarvestModal openHarvestModal={openHarvestModal} setOpenHarvestModal={setOpenHarvestModal} />
            </Segment>
          </Segment>
        </Grid.Column>
        <Grid.Column>
          {farm.name === undefined ? (
            <>
              <HeaderPlaceholder />
            </>
          ) : (
            <Header as='h1'>{farm.name}</Header>
          )}
            <Table definition>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell width={2}>
                      Owner
                    </Table.Cell>
                    <Table.Cell>
                      {farm.owner === undefined ? (
                        <LabelPlaceholder />
                      ) : (
                        <>
                          <Image style={{ width: 30, height: 30 }} src={makeBlockie(String(farm.owner))} size="tiny" rounded avatar />
                          <Popup
                            trigger={
                              <Label
                                as='a'
                                target='blank'
                                color='violet'
                                href={`https://etherscan.io/address/${farm.owner}`}
                              >
                                {farm.owner === undefined ? null : truncateAddress(farm.owner, 25)}
                              </Label>
                            }
                            content='View address on etherscan'
                            inverted
                          />
                        <span>
                          <CopyToClipboard
                            text={farm.owner}
                            onCopy={() => setTimeout(() => {
                                setCopying(false)
                                setCopied(true)

                                setTimeout(() => {
                                setCopying(true)
                                setCopied(false)
                              }, 3000)
                            }, 500)}
                          >
                            <span>
                              {copied &&
                                <Label
                                  as={Button}
                                  horizontal
                                  size='medium'
                                  color='violet'
                                >
                                  Copied
                                </Label>}
                              {copying &&
                                <Label
                                  as={Button}
                                  horizontal
                                  size='medium'
                                  color='violet'
                                >
                                  Copy
                                </Label>}
                            </span>
                          </CopyToClipboard>
                        </span>
                      </>
                     )} 
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Size</Table.Cell>
                    <Table.Cell>{farm.size === undefined ? <LabelPlaceholder /> : farm.size}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Soil</Table.Cell>
                    <Table.Cell>{farm.soil === undefined ? <LabelPlaceholder /> : farm.soil}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Location</Table.Cell>
                    <Table.Cell>{farm.location !== undefined ? (
                      <>
                       {farm.location.formatted_address}
                        <a
                          style={{
                            marginLeft: '0.5em',
                            color: '#7f00ff',
                            textDecoration: 'underline'
                          }}
                          href={`https://www.google.com/maps/search/?api=1&query=${farm.lat},${farm.lon}`}
                          target='blank'
                        >
                          View access roads
                        </a>
                      </>
                    ) : <span style={{ fontStyle: 'italic' }}>null</span>}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>#tokenId</Table.Cell>
                    <Table.Cell>{farm.token === undefined ? <LabelPlaceholder /> : farm.token}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>State</Table.Cell>
                    <Table.Cell>
                      {farm.season === undefined ? <LabelPlaceholder /> : (
                        <Label
                          content={farm.season}
                          color={farm.season === 'Dormant' ? 'grey'
                            : farm.season === 'Preparation' ? 'blue'
                            : farm.season === 'Planting' ? 'brown'
                            : farm.season === 'Crop Growth' ? 'red'
                            : farm.season === 'Harvesting' ? 'green'
                            : null}
                          size='tiny'
                          horizontal
                        />
                      )} 
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Completed Seasons</Table.Cell>
                    <Table.Cell>{farm.completeSeasons === undefined ? <LabelPlaceholder /> : farm.completeSeasons}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

FarmHeader.propTypes = {
  farm: PropTypes.object.isRequired,
  loaded: PropTypes.bool.isRequired,
  netId: PropTypes.number.isRequired,
  tokenId: PropTypes.number.isRequired,
  account: PropTypes.object.isRequired,
  txConfirmed: PropTypes.bool.isRequired,
}

function mapStateToProps(state) {
  return {
    loaded: state.wallet.loaded,
    netId: state.network.netId,
    tokenId: Number(state.farm.token),
    account: state.wallet,
    farm: state.farm,
    txConfirmed: state.loading.confirmed,
  }
}

export default connect(mapStateToProps)(FarmHeader)

