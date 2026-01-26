import React, {useState, useEffect, useReducer, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import useDebounce from '../utilities/useDebounce'
import {players, search, player, meta, teams} from '../utilities/appState'
import General from '../icons/blackGeneral.svg'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'
import sortBy from 'lodash/sortBy'
import reverse from 'lodash/reverse'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

import Styles from './styles/Players.module.css'

const Players = () => {
    const navigate = useNavigate()
    const [searchValue, setSearchValue] = useState(search.playersValue)
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)

    const sortPlayers = useCallback((array) => meta.round || meta.isRostersShow
        ? reverse(sortBy(array, ['win', 'draw', 'tp_sum', 'opp_p']))
        : array
    , [])

    useDebounce(() => {
        if (searchValue) {
            const _players = filter(players.data, (player) => {
                const rosterInfo = JSON.parse(player.roster_stat) || {}
                return includes(lowerCase(`${player.surname} ${player.name}`), lowerCase(searchValue)) ||
                    includes(lowerCase(rosterInfo?.allegiance), lowerCase(searchValue)) ||
                    includes(lowerCase(rosterInfo.grandAlliance), lowerCase(searchValue))
            })
            search.players = sortPlayers(_players)
        } else {
            search.players = sortPlayers(players.data)
        }
        forceUpdate()
      }, [searchValue], 300
    )

    useEffect(() => {
        fetch('https://aoscom.online/teams/all_teams_players/')
            .then(response => response.json())
            .then(data => {
                players.data = data
                forceUpdate()
            })
            .catch(error => console.error(error))
    }, [])

    const handleClickPlayer = (_player) => () => {
        if (meta.round || meta.isRostersShow || player.isJudge) {
            navigate('/playerInfo', {state: {player: _player, title: `${_player.surname} ${_player.name}`}})
        }
    }

    const handleSearch = (e) => {
        search.playersValue = e.target.value
        setSearchValue(e.target.value)
    }

    const renderRow = (place, player, team, army, w, d, tp, last, isOddRow, withRoster) => <div id={Styles.row} style={{'background': `${isOddRow ? '#ECECEC' : ''}`}}>
        <p id={Styles.smallColumn}>{place}</p>
        <div id={Styles.playerInfo}>
            <p id={Styles.сolumn}>{player}</p>
            {team ? <p id={Styles.subtitle}>{team}</p> : null}
        </div>
        {meta.round || meta.isRostersShow
            ? <>
                <p id={Styles.сolumn}>{army}</p>
                <p id={Styles.extraSmallColumn}>{w || 0}</p>
                <p id={Styles.extraSmallColumn}>{d || 0}</p>
                <p id={Styles.smallColumn}>{tp || 0}</p>
                <p id={Styles.smallColumn}>{last || 0}</p>
            </>
            : withRoster
                ? <img id={Styles.rosterIcon} src={General} alt="" />
                : null
        }
    </div>

    const renderPlayer = (player, index) => {
        const allegiance = JSON.parse(player.roster_stat)?.allegiance
        const team = find(teams.data, ['id', player.team_id])?.name
        return <button key={index} id={Styles.playerContainer} onClick={handleClickPlayer(player)}>
            {renderRow(index + 1, `${player.surname} ${player.name}`, team, allegiance, player.win, player.draw, player.tp_sum, player.opp_p, index % 2, player.roster)}
        </button>
    }

    return <>
        <div id={Styles.searchContainer}>
            <input id={Styles.input} onChange={handleSearch} placeholder='Поиск' type='search' name='search' />
        </div>
        <div id='column' className='Chapter'>
            <div>
                {renderRow('№', 'Игрок', undefined, 'Армия', 'W', 'D', 'TO', 'CO', true)}
                {map(search.players, renderPlayer)}
            </div>
        </div>
    </>
}

export default Players
