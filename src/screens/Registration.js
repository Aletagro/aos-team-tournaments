import React, {useEffect, useReducer, useState, useCallback} from 'react'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CircularProgress from '@mui/joy/CircularProgress'
import Constants from '../Constants'
import {player, players, fetching, meta, teams} from '../utilities/appState'
import FloatingLabelInput from '../components/FloatingLabelInput'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import Modal from '../components/Modal'
import Checkbox from '../components/Checkbox'
import Image from '../images/DicePod.jpg'

import get from 'lodash/get'
import size from 'lodash/size'
import find from 'lodash/find'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import includes from 'lodash/includes'

import Styles from './styles/Registration.module.css'

const tg = window.Telegram.WebApp

const inputStyle = {
    '--Input-minHeight': '48px',
    'borderRadius': '4px',
    'margin': '16px',
    'borderColor': '#B4B4B4',
    'boxShadow': 'none',
    'fontFamily': 'Minion Pro Regular'
}

const PLAYERS_LIMIT = 300

const Registration = () => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const user = tg.initDataUnsafe?.user
    const [name, setName] = useState(user?.first_name || '')
    const [surname, setSurname] = useState(user?.last_name || '')
    const [teamName, setTeamName] = useState('')
    const [isCapitan, setIsCapitan] = useState(false)
    const [modalData, setModalData] = useState({visible: false, title: ''})
    const [playerId, setPlayerId] = useState(undefined)
    const [teamId, setTeamId] = useState(undefined)

    const isDisableButton = !name || !surname || (isCapitan ? !teamName : false)
    if (includes(Constants.judgesIds, user?.id)) {
        player.isJudge = true
    }

    const handleChangeTeamToCaptain = useCallback(async (playerId, teamId) => {
        await fetch(`https://aoscom.online/teams/something_team_player/?id=${playerId}&column=team_id&value=${teamId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
    }, [])

    useEffect(() => {
        if (playerId && teamId) {
            handleChangeTeamToCaptain(playerId, teamId)
        }
    }, [playerId, teamId, handleChangeTeamToCaptain])

    const handleRegUser = useCallback(async () => {
        await fetch('https://aoscom.online/teams/add_team_player', {
            method: 'POST',
            body: JSON.stringify({tgId: user?.id, name, surname}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(response => response.json())
            .then(data => {
                player.info = data.player_info
                setPlayerId(get(data, 'player_info.id'))
            })
            .catch(error => console.error(error))
        if (isCapitan && teamName) {
            await fetch('https://aoscom.online/teams/reg_team', {
                method: 'POST',
                body: JSON.stringify({captain_id: user?.id, name: teamName}),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': "application/json, text/javascript, /; q=0.01"
                }
            })
                .then(response => response.json())
                .then(data => {
                    setTeamId(get(data, 'player_info.id'))
                })
                .catch(error => console.error(error))
        }
      }, [name, surname, user?.id, teamName, isCapitan])

    const handleGetPlayers = useCallback(async (withReg) => {
        await fetch('https://aoscom.online/teams/all_teams_players/')
            .then(response => response.json())
            .then(data => {
                players.data = data
                if (withReg) {
                    if (size(players.data) < PLAYERS_LIMIT) {
                        handleRegUser()
                        player.reg = true
                    }
                    forceUpdate()
                }
            })
            .catch(error => console.error(error))
      }, [handleRegUser])

    const handleSendMessage = useCallback(async () => {
        const message = `${player.info.surname} ${player.info.name} отказался от участия в турнире`
        await fetch(`https://aoscom.online/messages/send_personal_message/?tg_id=${306287992}&message=${message}`)
            .catch(error => console.error(error))
      }, [])

    const handleDrop = useCallback(async () => {
        handleCloseModal()
        await fetch(`https://aoscom.online/teams/delete_team_player/?id=${player?.info?.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                player.isDrop = true
                player.reg = false
                forceUpdate()
                handleSendMessage()
            })
            .catch(error => console.error(error))
      }, [handleSendMessage])

    useEffect(() => {
        if (!player.isRequested) {
            player.isRequested = true
            // fetch(`https://aoscom.online/teams/team_player/?tg_id=${530569849}`)
            fetch(`https://aoscom.online/teams/team_player/?tg_id=${user?.id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.tgId) {
                        player.reg = true
                        player.roster = data.roster
                        player.roster_stat = data.roster_stat
                        player.allegianceId = JSON.parse(data.roster_stat)?.allegianceId
                        player.allegiance = JSON.parse(data.roster_stat)?.allegiance
                        player.info = data
                    } else {
                        player.reg = false
                    }
                    fetching.main = false
                    forceUpdate()
                })
                .catch(error => console.error(error))
            // запрос ростеров юзера из основного приложения
            fetch(`https://aoscom.online/rosters_db/rosters_by_user?tg_id=${user?.id}`)
                .then(response => response.json())
                .then(data => {
                    player.mainRosters = data?.rosters
                })
                .catch(error => console.error(error))
        }
    }, [user?.id])

    useEffect(() => {
        if (!players.data.length) {
            handleGetPlayers()
        }
    }, [handleGetPlayers])

    useEffect(() => {
        fetch('https://aoscom.online/tournament-meta/teams')
            .then(response => response.json())
            .then(data => {
                meta.round = data.round
                meta.isRoundActive = data.isRoundActive
                meta.rostersBeingAccepted = data.rostersBeingAccepted
                meta.isRostersShow = data.isRostersShow
                meta.isTournamentRulesShow = data.isTournamentRulesShow
                meta.isPlayersListShow = data.isPlayersListShow
                meta.isRegOpen = data.isRegOpen
                forceUpdate()
            })
            .catch(error => console.error(error))
    }, [])

    useEffect(() => {
        if (isEmpty(teams.data)) {
            fetch('https://aoscom.online/teams/all_teams')
                .then(response => response.json())
                .then(data => {
                    if (isArray(data)) {
                        teams.data = data
                        forceUpdate()
                    }
                })
                .catch(error => console.error(error))
        }
    }, [])

    const handleCloseModal = () => {
        setModalData({visible: false, title: ''})
    }

    const handleOpenDropModal = () => {
        setModalData({visible: true, title: 'Вы уверен, что хотите отказаться от участия на турнире?', Content: renderModalConent})
    }

    const handleChangeName = (e) => {
        setName(e.target.value)
    }

    const handleChangeSurname = (e) => {
        setSurname(e.target.value)
    }

    const handleChangeTeamName = (e, value) => {
        setTeamName(value || e.target.value)
    }

    const handleChangeIsCapitan = () => {
        setIsCapitan(!isCapitan)
    }

    const handleClickButton = () => {
        handleGetPlayers(true)
    }

    const handleJudgeCall = () => {
        fetch(`https://aoscom.online/messages/judges_call?tg_id=${user?.id}`)
            .then(response => response.json())
            .catch(error => console.error(error))
        toast.success('Судья спешит на помощь!', Constants.toastParams)
    }

    const handleRetry = () => {
        player.isDrop = false
        forceUpdate()
    }

    const handleClickGuest = () => {
        player.isGuest = true
        forceUpdate()
    }

    const renderModalConent = () => <div id={Styles.modal}>
        <button id={Styles.modalButton} onClick={handleCloseModal}>Нет</button>
        <button id={Styles.modalButton} onClick={handleDrop}>Да</button>
    </div>

    const renderRegForm = () => <div>
        <h2 id={Styles.title}>Регистрация на DicePod Team Tournament 2026</h2>
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleChangeName}
            label='Ваше имя'
            value={name}
        />
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleChangeSurname}
            label='Ваша фамилия'
            value={surname}
        />
        <div id={Styles.teamRegContainer}>
            <b id={Styles.teamRegTitle}>Регистрация команды</b>
            <div id={Styles.isCapitanContainer} onClick={handleChangeIsCapitan}>
                <p id={Styles.isCapitanTitle}>Вы капитан команды?</p>
                <Checkbox onClick={handleChangeIsCapitan} checked={isCapitan} />
            </div>
            {isCapitan && <p>Пожалуйста, будьте внимательны, команду регистрирует только капитан, остальные игроки оставляют это поле пустым</p>}
        </div>
        {isCapitan
            ? <FloatingLabelInput
                style={inputStyle}
                onChange={handleChangeTeamName}
                label='Название команды'
                value={teamName}
            />
            : null
        }
        <div id={Styles.buttonContainer}>
            <button
                id={isDisableButton ? Styles.disableRegButton : Styles.regButton}
                onClick={handleClickButton}
                disabled={isDisableButton}
            >
                Зарегистрироваться
            </button>
        </div>
        <div id={Styles.buttonContainer}>
            <button id={Styles.regButton} onClick={handleClickGuest}>
                Войти как гость
            </button>
        </div>
    </div>

    const renderPlayersLimitStub = () => <div>
        <h2 id={Styles.title}>К сожалению, все места на турнире уже заняты</h2>
        <h2 id={Styles.title}>Пожалуйста, напишите организаторам, чтобы они добавили вас в лист ожидания</h2>
    </div>

    if (player.isDrop) {
        return <>
            <HeaderImage src={Image} alt='Core Documents' isUral />
            <h2 id={Styles.title}>Вы были удалены из списка участников турнира</h2>
            <h2 id={Styles.title}>Вы сможете в любой момент подать регистрацию снова</h2>
            <button id={Styles.regButton} onClick={handleRetry}>Зарегистрироваться</button>
        </>
    }

    return <>
        <HeaderImage src={Image} alt='Core Documents' isUral />
        {fetching.main && meta.isRegOpen
            ? <div id={Styles.loaderContainer}>
                <CircularProgress variant="soft"/>
            </div>
            : player.reg || player.isJudge || !meta.isRegOpen || player.isGuest
                ? <div id='column' className='Chapter'>
                    {player.isJudge ? <Row title='Кабинет Организатора' navigateTo='admin' /> : null}
                    {player.reg && meta.isRoundActive ? <Row title='Ваша Игра' navigateTo='Play' /> : null}
                    {(player.isJudge || player.isCapitan) && meta.isRoundActive ? <Row title='Ваши Паринги' navigateTo='pairings' /> : null}
                    {player.reg && player.roster
                        ? <Row title='Ваш ростер' navigateTo='roster' state={{isInfo: true}} />
                        : null
                    }
                    {player?.info?.team_id ? <Row title='Ваша команда' navigateTo='team' state={{team: find(teams.data, ['id', player?.info?.team_id])}} /> : null}
                    {meta.rostersBeingAccepted && player.reg
                        ? <Row title={player.roster ? 'Поменять ростер' : 'Подать ростер'} navigateTo='chooseGrandAlliance' />
                        : null
                    }
                    {/* TODO: поправить, чтобы по командам разбито было */}
                    {meta.isRostersShow || player.isJudge ? <Row title='Ростера' navigateTo='rosters' /> : null}
                    {/* TODO: поправить, чтобы по командам разбито было */}
                    {meta.round ? <Row title='Раунды' navigateTo='rounds' state={{title: 'DicePod Team Tournament 2026', round: meta.round}} /> : null}
                    {player.isJudge || meta.isPlayersListShow ? <Row title={meta.round ? 'Турнирная Таблица' : 'Список Команд'} navigateTo='teams' /> : null}
                    {player.isJudge || meta.isPlayersListShow ? <Row title={meta.round ? 'Турнирная Таблица Игроков' : 'Список Игроков'} navigateTo='players' /> : null}
                    <Row title='Правила' navigateTo='mainRules' />
                    <Row title='Калькулятор Урона' navigateTo='calculator' />
                    {player.isJudge || meta.isTournamentRulesShow ? <Row title='Регламент DicePod Team Tournament 2026' navigateTo='tournamentRules' /> : null}
                    {player.isJudge || !player.team_id ? <Row title='Как вступить в команду?' navigateTo='infoAboutTeam' /> : null}
                    <Row title='Подсказка во время игры' navigateTo='help' />
                    {meta.isRoundActive && player.reg ? <button id={Styles.button} onClick={handleJudgeCall}>Вызвать Судью</button> : null}
                    {meta.round || !player.reg ? null : <button id={Styles.button} onClick={handleOpenDropModal}>Отказаться от участия на турнире</button>}
                    <ToastContainer />
                </div>
                : size(players.data) >= PLAYERS_LIMIT
                    ? renderPlayersLimitStub()
                    : renderRegForm()
        }
        <Modal {...modalData} onClose={handleCloseModal} />
    </>
}

export default Registration
