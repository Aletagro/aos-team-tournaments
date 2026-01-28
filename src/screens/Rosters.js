import React, {useEffect, useState, useReducer} from 'react'
import useDebounce from '../utilities/useDebounce'
import {useNavigate} from 'react-router-dom'
import {players, search, teams} from '../utilities/appState'
import {sortByName} from '../utilities/utils'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

import Styles from './styles/Rosters.module.css'

const Rosters = () => {
    const navigate = useNavigate()
    const [searchValue, setSearchValue] = useState(search.rostersValue)
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)

    useDebounce(() => {
        if (searchValue) {
            const _rosters = filter(players.rosters, (player) => {
                const rosterInfo = JSON.parse(player.roster_stat) || {}
                const teamId = find(players.data, ['id', player.id])?.team_id
                const playerTeam = find(teams.data, ['id', teamId])?.name
                return includes(lowerCase(`${player.surname} ${player.name}`), lowerCase(searchValue)) ||
                    includes(lowerCase(rosterInfo?.allegiance), lowerCase(searchValue)) ||
                    includes(lowerCase(rosterInfo.grandAlliance), lowerCase(searchValue)) ||
                    includes(lowerCase(playerTeam), lowerCase(searchValue))
            })
            search.rosters = sortByName(_rosters)

        } else {
            search.rosters = sortByName(players.rosters, 'surname')
        }
        forceUpdate()
      }, [searchValue], 300
    )

    useEffect(() => {
        if (!players.rosters.length) {
            fetch('https://aoscom.online/teams/get_all_teampl_rosters/')
                .then(response => response.json())
                .then(data => {
                    players.rosters = data
                    setSearchValue('')
                })
                .catch(error => console.error(error))
        }
    }, [])

    const handleClickPlayer = (player, index) => () => {
        navigate('/roster', {state: {title: `${player.surname} ${player.name}`, playerId: player.id, playerIndex: index}})
    }

    const handleSearch = (e) => {
        search.rostersValue = e.target.value
        setSearchValue(e.target.value)
    }

    const renderRow = (number, player, army, team, isOddRow) => <div id={Styles.row} style={{'background': `${isOddRow ? '#ECECEC' : ''}`}}>
        <p id={Styles.smallColumn}>{number}</p>
        <div id={Styles.playerInfo}>
            <p id={Styles.сolumn}>{player}</p>
            {team ? <p id={Styles.subtitle}>{team}</p> : null}
        </div>
        <p id={Styles.сolumn}>{army}</p>
    </div>

    const renderRoster = (player, index) => {
        const allegiance = JSON.parse(player.roster_stat)?.allegiance
        const teamId = find(players.data, ['id', player.id])?.team_id
        const team = find(teams.data, ['id', teamId])?.name
        return <button key={player.id} id={Styles.playerContainer} onClick={handleClickPlayer(player, index)}>
            {renderRow(index + 1, `${player.surname} ${player.name}`, allegiance, team, index % 2)}
        </button>
    }
    
    return <>
        <div id={Styles.searchContainer}>
            <input id={Styles.input} onChange={handleSearch} placeholder='Поиск' autoFocus type='search' name='search' />
        </div>
        <div id='column' className='Chapter'>
            <div>
                {renderRow('№', 'Игрок', 'Армия', '', true)}
                {map(search.rosters, renderRoster)}
            </div>
        </div>
    </>
}

export default Rosters
