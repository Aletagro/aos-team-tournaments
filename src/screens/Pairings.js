import React, {useState, useReducer, useCallback} from 'react'
import {players as _players, player, teams, meta} from '../utilities/appState'

import map from 'lodash/map'
import get from 'lodash/get'
import find from 'lodash/find'
import filter from 'lodash/filter'

import Styles from './styles/Pairings.module.css'

const battleplansForRounds = [
    ['Passing Seasons', 'Roiling Roots', 'Cyclic Shifts'],
    ['Surge of Slaughter', 'Linked Ley Lines', 'Noxious Nexus'],
    ['The Liferoots', 'Bountiful Equinox', 'Lifecycle'],
    ['Creeping Corruption', 'Grasp of Thorns', 'Linked Ley Lines']
]

const getPlayer = (p, i) => {
    const allegiance = JSON.parse(p.roster_stat)?.allegiance
    return {
        id: p.tgId,
        name: `${p.surname} ${p.name}`,
        allegiance,
        opp: get(p, `game_${meta.round}_opp`),
        index: i
    }
}

const Pairings = () => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const [checkedPlayer, setCheckedPlayer] = useState(undefined)
    const [checkedOpp, setCheckedOpp] = useState(undefined)
    const team = find(teams.data, ['id', player.info?.teamId])
    const oppTeamId = get(team, `game_${meta.round}_opp`)
    const oppTeam = find(teams.data, ['id', oppTeamId])
    const players = filter(_players.data, ['teamId', team?.id])
    const opponents = filter(_players.data, ['teamId', oppTeamId])
    // eslint-disable-next-line
    const [shortPlayers, setShortPlayers] = useState(map(players, getPlayer))
    // eslint-disable-next-line
    const [shortOpponents, setOpponents] = useState(map(opponents, getPlayer))
    const battleplans = battleplansForRounds[meta.round ? meta.round - 1 : 0]

    const handleCreatePairing = useCallback(async () => {
        const column = `game_${meta.round}_opp`
        await fetch(`https://aoscom.online/teams/something_team_player/?id=${checkedPlayer.id}&column=${column}&value=${checkedOpp.id}`, {
            method: 'PUT'
        })
        shortPlayers[checkedPlayer.index].opp = checkedOpp.id
        shortOpponents[checkedOpp.index].opp = checkedPlayer.id
        setCheckedPlayer(undefined)
        setCheckedOpp(undefined)
    // eslint-disable-next-line
    }, [checkedPlayer, checkedOpp])

    const handleClickPlayer = (p, isOpp) => () => {
        if (isOpp) {
            setCheckedOpp(p)
        } else {
            setCheckedPlayer(p)
        }
    }

    const renderBattleplan = (battleplan, index) => <div
        key={index}
        id={Styles.battleplan}
    >
        {index + 1}. {battleplan}
    </div>

    const renderPlayer = (p, i) => {
        const checked = p.id === checkedPlayer?.id
        return <button
            key={i}
            id={checked ? Styles.checkedPlayer : Styles.player}
            onClick={handleClickPlayer(p)}
        >
            <p id={checked ? Styles.checkedButtonTitle : Styles.buttonTitle}>{p.name}</p>
            <p id={checked ? Styles.checkedButtonSubtitle : Styles.buttonSubtitle}>{p.allegiance}</p>
        </button>
    }

    const renderOpp = (p, i) => {
        const checked = p.id === checkedOpp?.id
        return <button
            key={i}
            id={checked ? Styles.checkedPlayer : Styles.player}
            onClick={handleClickPlayer(p, true)}
        >
            <p id={checked ? Styles.checkedButtonTitle : Styles.buttonTitle}>{p.name}</p>
            <p id={checked ? Styles.checkedButtonSubtitle : Styles.buttonSubtitle}>{p.allegiance}</p>
        </button>
    }

    const renderPair = (p, i) => p.opp
        ? <div key={i}>
            <p>{i + 1}. {p.name} - {find(shortOpponents, ['id', p.opp])?.name}</p>
        </div>
        : null

    return <div id='column' className='Chapter'>
        <div id={Styles.checkedPlayersContainer}>
            <div id={Styles.checkedPlayersTeam}>
                <p id={Styles.teamName}>{team?.name}</p>
                <p>{checkedPlayer?.name || 'Игрок не выбран'}</p>
            </div>
            <div id={Styles.checkedPlayersTeam}>
                <p id={Styles.teamName}>{oppTeam?.name}</p>
                <p>{checkedOpp?.name || 'Игрок не выбран'}</p>
            </div>
        </div>
        <button id={Styles.createPairButton} onClick={handleCreatePairing}>Подтвердить паринг</button>
        <b>Ваши игроки</b>
        <div id={Styles.playersContainer}>
            {map(shortPlayers, renderPlayer)}
        </div>
        <b>Игроки оппонента</b>
        <div id={Styles.playersContainer}>
            {map(shortOpponents, renderOpp)}
        </div>
        <b>Уже созданные пары</b>
        <div id={Styles.pairsContainer}>
            {map(filter(shortPlayers, 'opp'), renderPair)}
        </div>
        <b>Миссии</b>
        {map(battleplans, renderBattleplan)}
    </div>
}

export default Pairings
