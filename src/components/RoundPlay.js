import React from 'react'
import {useNavigate} from 'react-router-dom'
import RoundPlayersPlay from './RoundPlayersPlay'
import {rounds, teams} from '../utilities/appState'

import get from 'lodash/get'
import map from 'lodash/map'
import find from 'lodash/find'

import Styles from './styles/RoundPlay.module.css'

const RoundPlay = ({play, round, onOpenModal, onCloseModal}) => {
    const navigate = useNavigate()
    const teamOne = find(teams.data, ['id', play.team1_id])
    const teamTwo = find(teams.data, ['id', play.team2_id])
    const firstTeamScore = get(teamOne, `game_${rounds.selected}_tp`) || 0
    const secondTeamScore = get(teamTwo, `game_${rounds.selected}_tp`) || 0

    const handleClickTeam = (_team) => () => {
        navigate('/team', {state: {team: _team, title: _team?.name}})
    }

    const renderPlayer = (pair, index) => <RoundPlayersPlay
        key={index}
        pair={pair}
        round={round}
        onOpenModal={onOpenModal}
        onCloseModal={onCloseModal}
    />

    return <div style={{'background': `${play.line_number % 2 ? '' : '#ECECEC'}`}}>
        <div key={play.line_number} id={Styles.row}>
            <p id={Styles.smallColumn}>{play.line_number}</p>
            <div id={Styles.сolumn}>
                <button id={Styles.сolumn} onClick={handleClickTeam(teamOne)}>
                    <b>{teamOne?.name}</b>
                </button>
                <p id={Styles.smallColumn}>
                    {firstTeamScore} - {secondTeamScore}
                </p>
                <button id={Styles.сolumn} onClick={handleClickTeam(teamTwo)}>
                    <b>{teamTwo?.name}</b>
                </button>
            </div>
        </div>
        {map(play.player_pairs, renderPlayer)}
    </div>
}


export default RoundPlay