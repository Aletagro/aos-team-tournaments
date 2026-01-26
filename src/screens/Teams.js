import React, {useState, useEffect, useReducer, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useDebounce from '../utilities/useDebounce'
import Constants from '../Constants'
import {teams, search, player, meta} from '../utilities/appState'
import Modal from '../components/Modal'

import map from 'lodash/map'
import filter from 'lodash/filter'
import sortBy from 'lodash/sortBy'
import isArray from 'lodash/isArray'
import reverse from 'lodash/reverse'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

import Styles from './styles/Teams.module.css'

const Teams = () => {
    const navigate = useNavigate()
    const [searchValue, setSearchValue] = useState(search.playersValue)
    const [modalData, setModalData] = useState({visible: false, title: ''})
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const playerInfo = player?.info

    const sortTeams = useCallback((array) => meta.round || meta.isRostersShow
        ? reverse(sortBy(array, ['win', 'draw', 'tp_with_cap', 'tp']))
        : array
    , [])

    useDebounce(() => {
        if (searchValue) {
            const _teams = filter(teams.data, (team) => {
                return includes(lowerCase(team.name), lowerCase(searchValue))
            })
            search.teams = sortTeams(_teams)
        } else {
            search.teams = sortTeams(teams.data)
        }
        forceUpdate()
      }, [searchValue], 300
    )

    useEffect(() => {
        fetch('https://aoscom.online/teams/all_teams')
            .then(response => response.json())
            .then(data => {
                if (isArray(data)) {
                    teams.data = data
                    forceUpdate()
                }
            })
            .catch(error => console.error(error))
    }, [])

    const handleClickTeam = (_team) => () => {
        if (player.reg && !playerInfo?.team_id && !player.isJudge) {
            handleOpenModal(_team)
        } else if (meta.round || meta.isRostersShow || player.isJudge) {
            navigate('/team', {state: {team: _team, title: _team.name}})
        }
    }

    const handleSearch = (e) => {
        search.playersValue = e.target.value
        setSearchValue(e.target.value)
    }

    const handleCloseModal = () => {
        setModalData({visible: false, title: '', text: ''})
    }

    const handleOpenModal = (team) => {
        setModalData({visible: true, title: `Вы уверен, что хотите вступить в команду: ${team.name}?`, Content: renderModalConent(team)})
    }

    const handlePressYes = (team) => () => {
        handleCloseModal()
        handleChangeTeam(team)
    }

    const handleSendMessageToCaptain = useCallback(async (captainId) => {
        const message = `${playerInfo?.surname} ${playerInfo?.name} вступил в вашу команду`
        await fetch(`https://aoscom.online/messages/send_personal_message/?tg_id=${captainId}&message=${message}`)
            .catch(error => console.error(error))
      }, [playerInfo])

    const handleChangeTeam = useCallback(async (team) => {
        await fetch(`https://aoscom.online/teams/something_team_player/?id=${playerInfo?.id}&column=team_id&value=${team.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                toast.success(`Вы вступили в команду ${team.name}`, Constants.toastParams)
                handleSendMessageToCaptain(team.captain_id)
                forceUpdate()
            })
            .catch(error => {
                console.error(error)
                toast.success('Возникла ошибка', Constants.toastParams)
            })
      }, [handleSendMessageToCaptain, playerInfo?.id])

    const renderModalConent = (team) => () => <div id={Styles.modal}>
        <button id={Styles.modalButton} onClick={handleCloseModal}>Нет</button>
        <button id={Styles.modalButton} onClick={handlePressYes(team)}>Да, это мои львы!</button>
    </div>

    const renderRow = (place, team, w, d, tp, tpWithoutCap, isOddRow) => <div id={Styles.row} style={{'background': `${isOddRow ? '#ECECEC' : ''}`}}>
        <p id={Styles.smallColumn}>{place}</p>
        <div id={Styles.playerInfo}>
            <p id={Styles.сolumn}>{team}</p>
        </div>
        {meta.round || meta.isRostersShow
            ? <>
                <p id={Styles.extraSmallColumn}>{w || 0}</p>
                <p id={Styles.extraSmallColumn}>{d || 0}</p>
                <p id={Styles.smallColumn}>{tp || 0}</p>
                <p id={Styles.smallColumn}>{tpWithoutCap || 0}</p>
            </>
            : null
        }
    </div>

    const renderTeam = (team, index) => 
        <button key={index} id={Styles.playerContainer} onClick={handleClickTeam(team)}>
            {renderRow(index + 1, team.name, team.win, team.draw, team.tp_with_cap, team.tp, index % 2)}
        </button>

    return <>
        <div id={Styles.searchContainer}>
            <input id={Styles.input} onChange={handleSearch} placeholder='Поиск' type='search' name='search' />
        </div>
        <div id='column' className='Chapter'>
            <div>
                {renderRow('№', 'Команда', 'W', 'D', 'TO', 'БК', true)}
                {map(search.teams, renderTeam)}
            </div>
        </div>
        <Modal {...modalData} onClose={handleCloseModal} />
        <ToastContainer />
    </>
}

export default Teams
