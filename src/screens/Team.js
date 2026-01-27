import React, {useReducer, useState, useCallback, useEffect} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Constants from '../Constants'
import Modal from '../components/Modal'
import FloatingLabelInput from '../components/FloatingLabelInput'
import {players as _players, player as _player, meta} from '../utilities/appState'
import Close from '../icons/close.svg'

import map from 'lodash/map'
import get from 'lodash/get'
import find from 'lodash/find'
import size from 'lodash/size'
import filter from 'lodash/filter'
import isArray from 'lodash/isArray'

import Styles from './styles/Team.module.css'

const Team = () => {
    const navigate = useNavigate()
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const {team} = useLocation().state
    const [modalData, setModalData] = useState({visible: false, title: ''})
    const [isTeamDrop, setIsTeamDrop] = useState(false)
    const [isTeamActive, setIsTeamActive] = useState(Boolean(team?.status))
    const [message, setMessage] = useState('')
    const [players, setPlayers] = useState([])

    useEffect(() => {
        fetch(`https://aoscom.online/teams/all_players_from_team/?team_id=${team?.id}`)
            .then(response => response.json())
            .then(data => {
                if (isArray(data)) {
                    setPlayers(data)
                }
            })
            .catch(error => console.error(error))
    }, [team?.id])

    const handleClickTeam = (opponent) => () => {
        navigate('/team', {state: {team: opponent, title: opponent.name}})
    }

    const handleClickPlayer = (player) => () => {
        const isYourTeam = _player?.info?.team_id === team.id
        if (isYourTeam || meta.round || meta.isRostersShow || _player.isJudge) {
            navigate('/playerInfo', {state: {player, title: `${player.surname} ${player.name}`}})
        }
    }

    const handleCloseModal = () => {
        setModalData({visible: false, title: '', text: ''})
    }

    const handleOpenDropModal = () => {
        setModalData({visible: true, title: 'Вы уверен, что хотите удалить команду с турнира?', Content: renderDropModalConent})
    }

    const handleOpenStatusModal = () => {
        setModalData({visible: true, title: `Вы уверен, что изменить статус команды на ${isTeamActive ? '"Не активна"' : '"Активна"'}`, Content: renderStatusModalConent})
    }

    const handleOpenDropPlayerModal = (name, playerId) => (e) => {
        e.stopPropagation()
        setModalData({visible: true, title: `Вы уверен, что хотити убрать ${name} из команды?`, Content: renderDropPlayerModalConent(playerId)})
    }

    const handleDropTeam = useCallback(async () => {
        handleCloseModal()
        await fetch(`https://aoscom.online/teams/delete_team/?id=${team?.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                setIsTeamDrop(true)
                forceUpdate()
            })
            .catch(error => console.error(error))
      }, [team?.id])

    const handlChangeStatus = useCallback(async () => {
        handleCloseModal()
        await fetch(`https://aoscom.online/teams/something_team/?id=${team?.id}&column=status&value=${!team.status}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                setIsTeamActive(!isTeamActive)
                forceUpdate()
            })
            .catch(error => console.error(error))
      }, [team, isTeamActive])

    const handleSendMessage = useCallback(async () => {
        await fetch(`https://aoscom.online/messages/send_personal_message/?tg_id=${team?.captain_id}&message=${message}`)
            .then(() => {
                toast.success('Сообщение капитану команды отправлено', Constants.toastParams)
                forceUpdate()
            })
            .catch(error => console.error(error))
        setMessage('')
      }, [team?.captain_id, message])

    const handleChangeMessage = (e) => {
        setMessage(e.target.value)
    }

    const handleSendMessageToDropedPlayer = useCallback(async (playerId) => {
        const message = 'Вас удалили из команды'
        const playerTgId = find(_players, ['id', playerId])?.tgId
        await fetch(`https://aoscom.online/messages/send_personal_message/?tg_id=${playerTgId}&message=${message}`)
            .catch(error => console.error(error))
      }, [])

    const handleDropPlayerRequest = useCallback(async (playerId) => {
        await fetch(`https://aoscom.online/teams/something_team_player/?id=${playerId}&column=team_id&value=none`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                toast.success('Вы удалили игрока из команды', Constants.toastParams)
                handleSendMessageToDropedPlayer(playerId)
                forceUpdate()
            })
            .catch(error => {
                console.error(error)
                toast.success('Возникла ошибка', Constants.toastParams)
            })
      }, [handleSendMessageToDropedPlayer])

    const handleDropPlayer = (playerId) => () => {
        handleCloseModal()
        setPlayers(filter(players, p => p.id !== playerId))
        handleDropPlayerRequest(playerId)
    }

    const renderDropModalConent = () => <div id={Styles.modal}>
        <button id={Styles.modalButton} onClick={handleCloseModal}>Нет</button>
        <button id={Styles.modalButton} onClick={handleDropTeam}>Да, удалить</button>
    </div>

    const renderDropPlayerModalConent = (playerId) => () => <div id={Styles.modal}>
        <button id={Styles.modalButton} onClick={handleCloseModal}>Нет</button>
        <button id={Styles.modalButton} onClick={handleDropPlayer(playerId)}>Да</button>
    </div>

    const renderStatusModalConent = () => <div id={Styles.modal}>
        <button id={Styles.modalButton} onClick={handleCloseModal}>Нет</button>
        <button id={Styles.modalButton} onClick={handlChangeStatus}>Да, изменить</button>
    </div>

    const renderSendMessage = () => <div id={Styles.sendMessageContainer}>
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleChangeMessage}
            label='Cообщение капитану (от бота)'
            value={message}
        />
        <button id={Styles.sendMessageButton} onClick={handleSendMessage}>Отправить</button>
    </div>

    const renderPlayRow = (number, player, result, to, isOddRow) => <div id={Styles.row} style={{'background': `${isOddRow ? '#ECECEC' : ''}`}}>
        <p id={Styles.extraSmallColumn}>{number}</p>
        <p id={Styles.сolumn}>{player}</p>
        <p id={Styles.smallColumn}>{result}</p>
        <p id={Styles.smallColumn}>{to || 0}</p>
    </div>

    const renderPlay = (playIndex, index) => {
        const oppId = get(team, `game_${playIndex}_opp`)
        const opponent = find(_players.data, ['id', oppId])
        const tp = get(team, `game_${playIndex}_tp`)
        const gameResult = tp > 61 ? 'Win' : tp === 60 ? 'Draw' : tp === null ? '' : 'Lose'
        return opponent
            ? <button key={index} id={Styles.playContainer} onClick={handleClickTeam(opponent)}>
                {renderPlayRow(playIndex, opponent.name, gameResult, tp, index % 2)}
            </button>
            : null
    }

    const renderPlayerRow = (number, player, army, isOddRow, playerId, isTitle) => <div id={Styles.row} style={{'background': `${isOddRow ? '#ECECEC' : ''}`}}>
        <p id={Styles.extraSmallColumn}>{number}</p>
        <p id={Styles.сolumn}>{player}</p>
        <p id={Styles.smallColumn}>{army}</p>
        {(_player.isJudge || _player.tgId === team.captain_id) && !isTitle
            ? <img id={Styles.closeIcon} src={Close} alt="" onClick={handleOpenDropPlayerModal(player, playerId)} />
            : null
        }
    </div>

    const renderPlayer = (player, index) => <button key={index} id={Styles.playContainer} onClick={handleClickPlayer(player)}>
        {renderPlayerRow(index + 1, `${player.surname} ${player.name}`, player.army, index % 2, player.id)}
    </button>
    
    return <div id='column' className='Chapter'>
        {isTeamDrop ? <p id={Styles.isTeamDrop}>Команда удалёна с турнира</p> : null}
        {_player.isJudge
            ? <p id={Styles.title}>Статус команды: <b>{isTeamActive ? 'Активна' : 'Не активна'}</b></p>
            : null
        }
        {size(players)
            ? <>
                <b id={Styles.title}>Состав команды</b>
                <div id={Styles.tableContainer}>
                    {renderPlayerRow('№', 'Игрок', 'Армия', true, undefined, true)}
                    {map(players, renderPlayer)}
                </div>
            </>
            : null
        }
        {team?.game_1_opp
            ? <>
                <b id={Styles.title}>Игры</b>
                <div id={Styles.tableContainer}>
                    {renderPlayRow('№', 'Оппонент', 'Результат', 'ТО', true)}
                    {map([1, 2, 3, 4], renderPlay)}
                </div>
            </>
            : null
        }
        {_player.isJudge
            ? <> 
                <button id={Styles.rulesButton} onClick={handleOpenStatusModal}>Изменить статус команды на {isTeamActive ? '"Не активна"' : '"Активна"'}</button>
                <button id={Styles.rulesButton} onClick={handleOpenDropModal}>Удалить команду с турнира</button>
                {renderSendMessage()}
            </>
            : null
        }
        <Modal {...modalData} onClose={handleCloseModal} />
        <ToastContainer />
    </div>
}

export default Team

const inputStyle = {
    '--Input-minHeight': '48px',
    'width': '100%',
    'borderRadius': '4px',
    'borderColor': '#B4B4B4',
    'boxShadow': 'none',
    'fontFamily': 'Minion Pro Regular'
}